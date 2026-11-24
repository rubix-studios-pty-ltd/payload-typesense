import { type AdvancedParams } from '../lib/validation.js'

const numericFields = new Set(['createdAt', 'updatedAt'])

export const getFilters = (filters: AdvancedParams['filters'], allowed: string[]): string => {
  const entries = Object.entries(filters ?? {})

  if (entries.length > 32) {
    throw new Error('Too many filters')
  }

  return entries
    .map(([field, value]) => {
      if (!allowed.includes(field) || !/^[a-zA-Z0-9_.-]+$/.test(field)) {
        throw new Error('Filter field not permitted')
      }

      const values = Array.isArray(value) ? value : [value]

      const literals = values.map((item) => {
        if (numericFields.has(field)) {
          if (typeof item !== 'number' || !Number.isSafeInteger(item)) {
            throw new Error('Invalid numeric filter')
          }

          return String(item)
        }

        return `\`${String(item)}\``
      })

      return `${field}:=${Array.isArray(value) ? `[${literals.join(',')}]` : literals[0]}`
    })
    .join(' && ')
}
