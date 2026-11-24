export const validateFields = (requested: string[], allowed: string[]): string[] => {
  if (requested.some((field) => !allowed.includes(field) || !/^[a-zA-Z0-9_.-]+$/.test(field))) {
    throw new Error('Search field not permitted')
  }

  return [...new Set(requested)]
}
