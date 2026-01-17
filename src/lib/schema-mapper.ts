import { type BaseDocument, type CollectionFieldSchema, type TypesenseConfig } from '../types.js'
import { extractText } from '../utils/extractText.js'

export const mapCollectionToTypesense = (
  collectionSlug: string,
  config: NonNullable<TypesenseConfig['collections']>[string] | undefined,
  vector?: NonNullable<TypesenseConfig['vectorSearch']>
) => {
  const searchableFields = config?.searchFields || ['title', 'content', 'description']
  const facetFields = config?.facetFields || []

  const baseFields = [
    // DO NOT include 'id'
    { name: 'slug', type: 'string' },
    { name: 'createdAt', type: 'int64' },
    { name: 'updatedAt', type: 'int64' },
  ] as const

  const searchFields = searchableFields.map((field: string) => ({
    name: field,
    type: 'string' as const,
    facet: facetFields.includes(field),
  }))

  const facetOnlyFields = facetFields
    .filter((field: string) => !searchableFields.includes(field))
    .map((field: string) => ({
      name: field,
      type: 'string' as const,
      facet: true,
    }))

  const fields: CollectionFieldSchema[] = [...baseFields, ...searchFields, ...facetOnlyFields]

  if (vector?.enabled) {
    const embedFromFields = vector.embedFrom ?? searchableFields
    const embeddingModel = vector.embeddingModel ?? 'ts/all-MiniLM-L12-v2'

    fields.push({
      name: 'embedding',
      type: 'float[]',
      embed: {
        from: embedFromFields,
        model_config: {
          model_name: embeddingModel,
        },
      },
    })
  }

  const schema = {
    name: collectionSlug,
    fields,
  }

  return schema
}

export const mapToTypesense = (
  doc: BaseDocument,
  _collectionSlug: string,
  config: NonNullable<TypesenseConfig['collections']>[string] | undefined
) => {
  const searchableFields = config?.searchFields || ['title', 'content', 'description']
  const facetFields = config?.facetFields || []

  if (!doc.id) {
    throw new Error(`Document missing required 'id' field: ${JSON.stringify(doc)}`)
  }

  const createdAt = doc.createdAt ? new Date(doc.createdAt) : new Date()
  const updatedAt = doc.updatedAt ? new Date(doc.updatedAt) : new Date()

  const typesenseDoc: Record<string, number | string> = {
    id: String(doc.id),
    slug: String(doc.slug || ''),
    createdAt: createdAt.getTime(),
    updatedAt: updatedAt.getTime(),
  }

  for (const field of searchableFields) {
    if (field.includes('.')) {
      const [arrayField, subField] = field.split('.', 2)
      if (arrayField && subField && Array.isArray(doc[arrayField])) {
        const joined = (doc[arrayField] as unknown[])
          .map((item) => {
            if (!item || typeof item !== 'object' || !(subField in item)) return ''

            const raw = (item as Record<string, unknown>)[subField]
            if (raw == null) return ''

            if (typeof raw === 'string' || typeof raw === 'number') {
              return String(raw)
            }

            if (typeof raw === 'object' && 'root' in raw) {
              return extractText(raw as { root: unknown }) || ''
            }

            return ''
          })
          .filter(Boolean)
          .join(' ')

        typesenseDoc[field] = joined
      } else {
        typesenseDoc[field] = ''
      }
      continue
    }

    const value = doc[field]

    if (value == null) {
      typesenseDoc[field] = ''
      continue
    }

    if (
      (field === 'content' || field === 'description') &&
      typeof value === 'object' &&
      value !== null &&
      'root' in value
    ) {
      typesenseDoc[field] = extractText(value as { root: unknown }) || ''
    } else if (typeof value === 'string' || typeof value === 'number') {
      typesenseDoc[field] = String(value)
    } else {
      typesenseDoc[field] = ''
    }
  }

  for (const field of facetFields) {
    const value = doc[field]

    if (typeof value === 'string' || typeof value === 'number') {
      typesenseDoc[field] = String(value)
    } else {
      typesenseDoc[field] = 'unknown'
    }
  }

  const hasSearchableContent = searchableFields.some((field) => {
    const value = typesenseDoc[field]
    return typeof value === 'string' && value.trim().length > 0
  })

  if (!hasSearchableContent) {
    if (!typesenseDoc.title) {
      typesenseDoc.title = `Document ${doc.id}`
    }
  }

  return typesenseDoc
}
