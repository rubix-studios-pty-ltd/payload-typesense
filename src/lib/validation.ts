import { z } from 'zod'

export interface ValidationResult<T = unknown> {
  data?: T
  errors?: string[]
  success: boolean
}

const TypesenseNodeSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.union([
    z.number().int().min(1).max(65535),
    z
      .string()
      .regex(/^\d+$/, 'Port must be numeric')
      .refine((port) => Number(port) >= 1 && Number(port) <= 65535, {
        error: 'Port must be between 1 and 65535',
      }),
  ]),
  protocol: z.enum(['http', 'https']),
})

const CollectionConfigSchema = z.object({
  displayName: z.string().optional(),
  enabled: z.boolean(),
  facetFields: z.array(z.string()).optional(),
  icon: z.string().optional(),
  searchFields: z.array(z.string()).optional(),
  sortFields: z.array(z.string()).optional(),
  syncLimit: z.number().int().positive().optional(),
})

const SettingsConfigSchema = z.object({
  autoSync: z.boolean().optional(),
  batchSize: z.number().int().positive().optional(),
  categorized: z.boolean().optional(),
  searchEndpoint: z.string().optional(),
})

const VectorSearchSchema = z.object({
  embeddingModel: z.string().optional(),
  embedFrom: z.array(z.string()).optional(),
  enabled: z.boolean().optional(),
  modelConfig: z.record(z.string(), z.unknown()).optional(),
})

export const TypesenseConfigSchema = z.object({
  collections: z.record(z.string(), CollectionConfigSchema).optional(),
  disabled: z.boolean().optional(),
  settings: SettingsConfigSchema.optional(),
  typesense: z.object({
    apiKey: z.string().min(1, 'API key is required'),
    connectionTimeoutSeconds: z.number().positive().optional(),
    nodes: z.array(TypesenseNodeSchema).min(1, 'At least one Typesense node is required'),
  }),
  vectorSearch: VectorSearchSchema.optional(),
})

export type ValidatedTypesenseConfig = z.infer<typeof TypesenseConfigSchema>

export function validateConfig(config: unknown): ValidationResult<ValidatedTypesenseConfig> {
  const result = TypesenseConfigSchema.safeParse(config)

  if (!result.success) {
    return {
      errors: formatErrors(result.error),
      success: false,
    }
  }

  return { data: result.data, success: true }
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

export type ValidateResult = ValidationResult<ValidatedSearchParams>

export function validateSearchParams(params: unknown): ValidateResult {
  const result = SearchParamsSchema.safeParse(params)

  if (!result.success) {
    return {
      errors: formatErrors(result.error),
      success: false,
    }
  }

  return { data: result.data, success: true }
}

function formatErrors(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length ? `${issue.path.join('.')}: ` : ''
    return `${path}${issue.message}`
  })
}
