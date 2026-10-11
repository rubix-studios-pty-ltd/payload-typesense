export const buildError = (health: boolean, hasCollections: boolean) => {
  const errors: string[] = []

  if (!health) {
    errors.push('Typesense connection failed')
  }

  if (!hasCollections) {
    errors.push('No collections available')
  }

  return errors.length > 0 ? errors.join(', ') : undefined
}
