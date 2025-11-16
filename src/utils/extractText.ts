export const extractText = (richText: any): string => {
  if (!richText || !richText.root) {
    return ''
  }

  const extract = (node: any): string => {
    if (typeof node === 'string') {
      return node
    }

    if (node && typeof node === 'object') {
      if (node.text) {
        return node.text
      }

      if (node.children && Array.isArray(node.children)) {
        return node.children.map(extract).join('')
      }
    }

    return ''
  }

  return extract(richText.root)
}
