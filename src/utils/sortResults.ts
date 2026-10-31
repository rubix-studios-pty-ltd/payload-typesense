import { type Hit, type SearchMode, type Sort } from '../types.js'

const SORT_PATTERN = /^([\w.]+)(?:\(missing_values:\s*(first|last)\))?\s*:\s*(asc|desc)$/

const SCORE_FIELDS = new Set(['_text_match', '_vector_distance'])

function parseSorts(sortBy?: string): Sort[] {
  if (!sortBy?.trim()) return []

  const sorts: Sort[] = []

  for (const part of sortBy.split(',')) {
    const match = part.trim().match(SORT_PATTERN)
    const field = match?.[1]

    if (!field || (field.startsWith('_') && !SCORE_FIELDS.has(field))) {
      throw new Error(
        'Multi-collection sorting supports field names, _text_match and _vector_distance'
      )
    }

    sorts.push({
      direction: match[3] === 'asc' ? 1 : -1,
      field,
      missing: match[2],
    })
  }

  if (sorts.length > 3) {
    throw new Error('A maximum of three sort fields is supported')
  }

  return sorts
}

function getSorts(sortBy: string | undefined, vector: boolean): Sort[] {
  const sorts = parseSorts(sortBy)
  const field = vector ? '_vector_distance' : '_text_match'

  if (sorts.length < 3 && !sorts.some((sort) => sort.field === field)) {
    sorts.push({ direction: vector ? 1 : -1, field })
  }

  return sorts
}

function getValue(hit: Hit, field: string): unknown {
  if (field === '_text_match') {
    return hit.text_match_info?.score ?? hit.text_match ?? 0
  }

  if (field === '_vector_distance') return hit.vector_distance

  const document = hit.document as Record<string, unknown>

  if (Object.hasOwn(document, field)) return document[field]

  return field.split('.').reduce<unknown>((value, part) => {
    if (!value || typeof value !== 'object' || !Object.hasOwn(value, part)) {
      return undefined
    }

    return (value as Record<string, unknown>)[part]
  }, document)
}

function getSortValue(hit: Hit, field: string, hybrid: boolean): unknown {
  if (hybrid && field === '_text_match') {
    return hit.hybrid_search_info?.rank_fusion_score ?? 0
  }

  return getValue(hit, field)
}

function isMissing(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

function compareMissing(left: unknown, right: unknown, sort: Sort): number | undefined {
  const leftMissing = isMissing(left)
  const rightMissing = isMissing(right)

  if (!leftMissing && !rightMissing) return undefined
  if (leftMissing === rightMissing) return 0

  const stringField =
    typeof (leftMissing ? right : left) === 'string' && sort.field !== '_text_match'

  const first = sort.missing === 'first' || (!sort.missing && stringField && sort.direction < 0)

  return leftMissing === first ? -1 : 1
}

function compareValues(left: unknown, right: unknown, field: string, hybrid: boolean): number {
  if (field === '_text_match' && !hybrid) {
    const a = BigInt(left as number | string)
    const b = BigInt(right as number | string)

    return a < b ? -1 : a > b ? 1 : 0
  }

  if (typeof left === 'number' && typeof right === 'number') {
    return left - right
  }

  if (typeof left === 'boolean' && typeof right === 'boolean') {
    return Number(left) - Number(right)
  }

  const a = String(left)
  const b = String(right)

  return a < b ? -1 : a > b ? 1 : 0
}

function compareSort(a: Hit, b: Hit, sort: Sort, hybrid: boolean): number {
  const left = getSortValue(a, sort.field, hybrid)
  const right = getSortValue(b, sort.field, hybrid)
  const missing = compareMissing(left, right, sort)

  if (missing !== undefined) return missing

  return compareValues(left, right, sort.field, hybrid) * sort.direction
}

export function getCompare(
  sortBy?: string,
  mode: SearchMode | boolean = 'keyword'
): (a: Hit, b: Hit) => number {
  const vector = mode === true || mode === 'semantic'
  const hybrid = mode === 'hybrid'
  const sorts = getSorts(sortBy, vector)

  return (a: Hit, b: Hit): number => {
    for (const sort of sorts) {
      const result = compareSort(a, b, sort, hybrid)

      if (result !== 0) return result
    }

    return 0
  }
}
