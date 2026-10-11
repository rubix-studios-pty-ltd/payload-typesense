export const extractText = (richText: unknown): string => {
  if (!richText || typeof richText !== 'object' || !('root' in richText)) {
    return ''
  }

  const extract = (node: unknown): string => {
    if (typeof node === 'string') return node
    if (!node || typeof node !== 'object') return ''

    if ('type' in node && node.type === 'linebreak') {
      return '\n'
    }

    if ('text' in node && typeof node.text === 'string') {
      return node.text
    }

    if ('children' in node && Array.isArray(node.children)) {
      const separator = 'type' in node && (node.type === 'root' || node.type === 'list') ? '\n' : ''

      return node.children.map(extract).filter(Boolean).join(separator)
    }

    return ''
  }

  return extract(richText.root).trim()
}
