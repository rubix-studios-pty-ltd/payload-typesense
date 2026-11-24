export function getCollection(url: URL): string | undefined {
  const parts = url.pathname.split('/')
  const index = parts.indexOf('search')
  const name = index >= 0 ? parts[index + 1] : undefined

  return name ? decodeURIComponent(name) : undefined
}
