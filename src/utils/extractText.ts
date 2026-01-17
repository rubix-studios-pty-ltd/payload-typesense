export const extractText = (richText: unknown): string => {
  if (!richText || typeof richText !== 'object' || !('root' in richText)) {
    return ''
  }

  const extract = (node: unknown): string => {
    if (typeof node === 'string') return node

    if (node && typeof node === 'object') {
      if ('text' in node && typeof (node as { text?: unknown }).text === 'string') {
        return (node as { text: string }).text
      }

      if ('children' in node && Array.isArray((node as { children?: unknown }).children)) {
        return (node as { children: unknown[] }).children.map(extract).join('')
      }
    }

    return ''
  }

  return extract((richText as { root: unknown }).root)
}
