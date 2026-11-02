const entities: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  '#39': "'",
}

const pattern = /&(amp|lt|gt|quot|apos|#39|#\d+|#x[\da-f]+);/gi

function decodeNumeric(name: string): string | undefined {
  const hex = name[1]?.toLowerCase() === 'x'
  const point = Number.parseInt(name.slice(hex ? 2 : 1), hex ? 16 : 10)

  if (!Number.isInteger(point) || point <= 0 || point > 0x10ffff) {
    return undefined
  }

  return String.fromCodePoint(point)
}

function decodeEntity(entity: string, name: string): string {
  return entities[name.toLowerCase()] ?? decodeNumeric(name) ?? entity
}

export function decodeEntities(value: string): string {
  return value.replace(pattern, decodeEntity)
}
