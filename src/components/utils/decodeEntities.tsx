export function decodeEntities(value: string): string {
  return value.replace(/&(amp|lt|gt|quot|apos|#39|#\d+|#x[\da-f]+);/gi, (entity, name: string) => {
    const named: Record<string, string> = {
      amp: '&',
      lt: '<',
      gt: '>',
      quot: '"',
      apos: "'",
      '#39': "'",
    }

    const decoded = named[name.toLowerCase()]

    if (decoded !== undefined) return decoded

    const point =
      name[1]?.toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10)

    return Number.isInteger(point) && point > 0 && point <= 0x10ffff
      ? String.fromCodePoint(point)
      : entity
  })
}
