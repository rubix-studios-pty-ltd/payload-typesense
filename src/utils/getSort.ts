export const getSort = (sort: string | undefined, allowed: string[]): string | undefined => {
  if (sort === undefined) return undefined

  const entries = sort.split(',').map((entry) => entry.trim())

  if (entries.length > 3) {
    throw new Error('Invalid sort_by parameter')
  }

  for (const entry of entries) {
    const match = /^([a-zA-Z0-9_.-]+):(asc|desc)$/.exec(entry)

    if (!match?.[1] || !allowed.includes(match[1])) {
      throw new Error('Invalid sort_by parameter')
    }
  }

  return entries.join(',')
}
