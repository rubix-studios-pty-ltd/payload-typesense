import { z } from 'zod'

export interface ValidateResult {
  data?: Record<string, z.infer<typeof CollectionConfigSchema>> | ValidatedSearchParams
  errors?: string[]
  success: boolean
}

const TypesenseNodeSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.number().int().min(1).max(65535, 'Port must be between 1 and 65535'),
  protocol: z.enum(['http', 'https']),
})

const CollectionConfigSchema = z.object({
  displayName: z.string().optional(),
  enabled: z.boolean().optional().default(true),
  facetFields: z.array(z.string()).optional().default([]),
  fieldMapping: z.record(z.string(), z.string()).optional(),
  icon: z.string().optional(),
  searchFields: z.array(z.string()).min(1, 'At least one search field is required'),
})

const CacheConfigSchema = z.object({
  maxSize: z.number().int().min(1, 'Max size must be at least 1').optional().default(1000),
  ttl: z.number().int().min(1000, 'TTL must be at least 1000ms').optional().default(300000),
})

const SettingsConfigSchema = z.object({
  cache: CacheConfigSchema.optional(),
  categorized: z.boolean().optional().default(false),
})

export const TypesenseSearchConfigSchema = z.object({
  collections: z.record(z.string(), CollectionConfigSchema),
  settings: SettingsConfigSchema.optional(),
  typesense: z.object({
    apiKey: z.string().min(1, 'API key is required'),
    connectionTimeoutSeconds: z.number().int().min(1).optional().default(10),
    nodes: z.array(TypesenseNodeSchema).min(1, 'At least one Typesense node is required'),
    numRetries: z.number().int().min(0).optional().default(3),
    retryIntervalSeconds: z.number().int().min(1).optional().default(1),
  }),
})

export type ValidatedTypesenseSearchConfig = z.infer<typeof TypesenseSearchConfigSchema>

export interface ValidationResult {
  data?: ValidatedTypesenseSearchConfig
  errors?: string[]
  success: boolean
}

export function validateConfig(config: unknown): ValidationResult {
  try {
    const validatedConfig = TypesenseSearchConfigSchema.parse(config)
    return { data: validatedConfig, success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((issue) => {
        const path = issue.path.length ? `${issue.path.join('.')}: ` : ''
        return `${path}${issue.message}`
      })

      return { errors, success: false }
    }

    return { errors: ['Invalid configuration format'], success: false }
  }
}

export function getValidationErrors(errors: string[]): string {
  return errors.map((error, index) => `${index + 1}. ${error}`).join('\n')
}

export const SearchParamsSchema = z.object({
  facets: z.array(z.string()).optional(),
  filters: z.record(z.string(), z.any()).optional(),
  highlight_fields: z.array(z.string()).optional(),
  num_typos: z.number().int().min(0).max(4).optional().default(0),
  page: z.number().int().min(1).optional().default(1),
  per_page: z.number().int().min(1).max(250).optional().default(10),
  q: z.string().min(1, 'Query parameter "q" is required'),
  snippet_threshold: z.number().int().min(0).max(100).optional().default(30),
  sort_by: z.string().optional(),
  typo_tokens_threshold: z.number().int().min(1).optional().default(1),
})

export type ValidatedSearchParams = z.infer<typeof SearchParamsSchema>

export function validateSearchParams(params: unknown): ValidateResult {
  try {
    const validatedParams = SearchParamsSchema.parse(params)
    return { data: validatedParams, success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((issue) => {
        const path = issue.path.length ? `${issue.path.join('.')}: ` : ''
        return `${path}${issue.message}`
      })

      return { errors, success: false }
    }

    return { errors: ['Invalid search parameters format'], success: false }
  }
}
