import { type Hit, type SearchMode, type Sort } from '../types.js'

export function getCompare(
  sortBy?: string,
  mode: SearchMode | boolean = 'keyword'
): (a: Hit, b: Hit) => number {
  const vector = mode === true || mode === 'semantic'
  const hybrid = mode === 'hybrid'
  const relevance = vector ? '_vector_distance' : '_text_match'
  const sorts: Sort[] = []

  if (sortBy?.trim()) {
    for (const part of sortBy.split(',')) {
      const match = part
        .trim()
        .match(/^([\w.]+)(?:\(missing_values:\s*(first|last)\))?\s*:\s*(asc|desc)$/)

      if (
        !match?.[1] ||
        (match[1].startsWith('_') && !['_text_match', '_vector_distance'].includes(match[1]))
      ) {
        throw new Error(
          'Multi-collection sorting supports field names, _text_match and _vector_distance'
        )
      }

      sorts.push({
        direction: match[3] === 'asc' ? 1 : -1,
        field: match[1],
        missing: match[2],
      })
    }

    if (sorts.length > 3) {
      throw new Error('A maximum of three sort fields is supported')
    }
  }

  if (!sorts.length) {
    sorts.push({ direction: vector ? 1 : -1, field: relevance })
  } else if (sorts.length < 3 && !sorts.some((sort) => sort.field === relevance)) {
    sorts.push({ direction: vector ? 1 : -1, field: relevance })
  }

  return (a: Hit, b: Hit): number => {
    for (const sort of sorts) {
      const left =
        hybrid && sort.field === '_text_match'
          ? (a.hybrid_search_info?.rank_fusion_score ?? 0)
          : getValue(a, sort.field)
      const right =
        hybrid && sort.field === '_text_match'
          ? (b.hybrid_search_info?.rank_fusion_score ?? 0)
          : getValue(b, sort.field)
      const leftMissing = left === undefined || left === null || left === ''
      const rightMissing = right === undefined || right === null || right === ''

      if (leftMissing || rightMissing) {
        if (leftMissing === rightMissing) continue

        const stringField =
          typeof (leftMissing ? right : left) === 'string' && sort.field !== '_text_match'
        const first =
          sort.missing === 'first' || (!sort.missing && stringField && sort.direction < 0)

        return leftMissing === first ? -1 : 1
      }

      let compared: number

      if (sort.field === '_text_match' && !hybrid) {
        const leftScore = BigInt(left as number | string)
        const rightScore = BigInt(right as number | string)

        compared = leftScore < rightScore ? -1 : leftScore > rightScore ? 1 : 0
      } else if (typeof left === 'number' && typeof right === 'number') {
        compared = left - right
      } else if (typeof left === 'boolean' && typeof right === 'boolean') {
        compared = Number(left) - Number(right)
      } else {
        const leftText = String(left)
        const rightText = String(right)

        compared = leftText < rightText ? -1 : leftText > rightText ? 1 : 0
      }

      if (compared) return compared * sort.direction
    }

    return 0
  }
}

function getValue(hit: Hit, field: string): unknown {
  if (field === '_text_match') return hit.text_match_info?.score ?? hit.text_match ?? 0
  if (field === '_vector_distance') return hit.vector_distance

  const document = hit.document as Record<string, unknown>

  if (Object.hasOwn(document, field)) return document[field]

  return field.split('.').reduce<unknown>((value, part) => {
    if (!value || typeof value !== 'object' || !Object.hasOwn(value, part)) return undefined

    return (value as Record<string, unknown>)[part]
  }, document)
}
