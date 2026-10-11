import {
  type BaseDocument,
  type CollectionFieldSchema,
  type CollectionSchema,
  type TypesenseCollectionConfig,
  type TypesenseConfig,
} from '../types.js'
import { extractText } from '../utils/extractText.js'

const defaultSearchFields = ['title', 'content', 'description']

export const mapCollection = (
  slug: string,
  config: TypesenseCollectionConfig,
  vector?: NonNullable<TypesenseConfig['vectorSearch']>
): CollectionSchema => {
  const searchFields = config.searchFields ?? defaultSearchFields
  const facetFields = config.facetFields ?? []
  const sortFields = config.sortFields ?? []

  const fields: CollectionFieldSchema[] = [
    {
      name: 'slug',
      type: 'string',
      facet: facetFields.includes('slug'),
      sort: sortFields.includes('slug'),
    },
    {
      name: 'createdAt',
      type: 'int64',
      facet: facetFields.includes('createdAt'),
    },
    {
      name: 'updatedAt',
      type: 'int64',
      facet: facetFields.includes('updatedAt'),
    },
  ]

  const configuredFields = new Set([...searchFields, ...facetFields, ...sortFields])
  const existingFields = new Set(fields.map((field) => field.name))

  for (const field of configuredFields) {
    if (existingFields.has(field)) continue

    fields.push({
      name: field,
      type: 'string',
      facet: facetFields.includes(field),
      sort: sortFields.includes(field),
    })
  }

  if (vector?.enabled) {
    const embedFromFields = vector.embedFrom ?? searchFields
    const embeddingModel = vector.embeddingModel ?? 'ts/all-MiniLM-L12-v2'

    fields.push({
      name: 'embedding',
      type: 'float[]',
      embed: {
        from: embedFromFields,
        model_config: {
          model_name: embeddingModel,
          ...(vector.modelConfig ?? {}),
        },
      },
    })
  }

  return {
    name: slug,
    fields,
  }
}

export const mapDoc = (
  doc: BaseDocument,
  _slug: string,
  config: TypesenseCollectionConfig
): Record<string, number | string> | null => {
  if (doc.id === null || doc.id === undefined || doc.id === '') {
    throw new Error("Document missing required 'id' field")
  }

  const searchFields = config.searchFields ?? defaultSearchFields
  const facetFields = config.facetFields ?? []
  const sortFields = config.sortFields ?? []

  const createdAt = doc.createdAt ? new Date(doc.createdAt) : new Date()
  const updatedAt = doc.updatedAt ? new Date(doc.updatedAt) : new Date()

  const document: Record<string, number | string> = {
    id: String(doc.id),
    slug: String(doc.slug ?? ''),
    createdAt: createdAt.getTime(),
    updatedAt: updatedAt.getTime(),
  }

  const fields = new Set([...searchFields, ...facetFields, ...sortFields])
  let hasSearchableContent = false

  for (const field of fields) {
    if (field === 'slug' || field === 'createdAt' || field === 'updatedAt') {
      if (field === 'slug' && searchFields.includes(field) && document.slug) {
        hasSearchableContent = true
      }

      continue
    }

    const value = getFieldValue(doc, field)

    if (searchFields.includes(field) && value.trim().length > 0) {
      hasSearchableContent = true
    }

    document[field] = facetFields.includes(field) ? value || 'unknown' : value
  }

  return hasSearchableContent ? document : null
}

const getFieldValue = (doc: BaseDocument, field: string): string => {
  if (!field.includes('.')) {
    return getText(doc[field])
  }

  const [parent, child] = field.split('.', 2)
  if (!parent || !child) return ''

  const value = doc[parent]

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item || typeof item !== 'object' || !(child in item)) return ''

        return getText(item[child])
      })
      .filter(Boolean)
      .join(' ')
  }

  if (value && typeof value === 'object' && child in value) {
    return getText(value[child])
  }

  return ''
}

const getText = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (value && typeof value === 'object' && 'root' in value) {
    return extractText(value)
  }

  return ''
}
