export const buildError = (isTypesenseHealthy: boolean, hasCollections: boolean) => {
  const errors: string[] = []
  if (!isTypesenseHealthy) {
    errors.push('Typesense connection failed')
  }

  if (!hasCollections) {
    errors.push('No collections available')
  }
  return errors.length > 0 ? errors.join(', ') : undefined
}
