import { z } from 'zod'

export interface ValidationResult<T = unknown> {
  data?: T
  errors?: string[]
  success: boolean
}

const NodeSchema = z.object({
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

const CollectionSchema = z.object({
  displayName: z.string().optional(),
  enabled: z.boolean(),
  facetFields: z.array(z.string()).optional(),
  icon: z.string().optional(),
  searchFields: z.array(z.string()).optional(),
  sortFields: z.array(z.string()).optional(),
  syncLimit: z.number().int().positive().optional(),
})

const SettingsSchema = z.object({
  autoSync: z.boolean().optional(),
  batchSize: z.number().int().positive().optional(),
  categorized: z.boolean().optional(),
  searchEndpoint: z.string().optional(),
  searchMode: z.enum(['keyword', 'semantic', 'hybrid']).optional(),
  typoTolerance: z
    .object({
      numTypos: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
      minLengthOneTypo: z.number().int().positive().optional(),
      minLengthTwoTypos: z.number().int().positive().optional(),
      typoTokensThreshold: z.number().int().nonnegative().optional(),
      numericalTokens: z.boolean().optional(),
      alphaNumericalTokens: z.boolean().optional(),
    })
    .optional(),
})

const VectorSchema = z.object({
  embeddingModel: z.string().optional(),
  embedFrom: z.array(z.string()).optional(),
  enabled: z.boolean().optional(),
  modelConfig: z.record(z.string(), z.unknown()).optional(),
  alpha: z.number().min(0).max(1).optional(),
  k: z.number().int().positive().optional(),
  distanceThreshold: z.number().min(0).max(2).optional(),
})

export const PluginSchema = z
  .object({
    collections: z.record(z.string(), CollectionSchema).optional(),
    disabled: z.boolean().optional(),
    settings: SettingsSchema.optional(),
    typesense: z.object({
      apiKey: z.string().min(1, 'API key is required'),
      connectionTimeoutSeconds: z.number().positive().optional(),
      nodes: z.array(NodeSchema).min(1, 'At least one Typesense node is required'),
    }),
    vectorSearch: VectorSchema.optional(),
  })
  .refine(
    (config) =>
      !config.settings?.searchMode ||
      config.settings.searchMode === 'keyword' ||
      config.vectorSearch?.enabled === true,
    {
      message: 'Semantic and hybrid search require vectorSearch.enabled',
      path: ['settings', 'searchMode'],
    }
  )

export type ValidatedConfig = z.infer<typeof PluginSchema>

export function validateConfig(config: unknown): ValidationResult<ValidatedConfig> {
  const result = PluginSchema.safeParse(config)

  if (!result.success) {
    return {
      errors: formatErrors(result.error),
      success: false,
    }
  }

  return { data: result.data, success: true }
}

export function getErrors(errors: string[]): string {
  return errors.map((error, index) => `${index + 1}. ${error}`).join('\n')
}

export const SearchSchema = z.object({
  facets: z.array(z.string()).optional(),
  filters: z.record(z.string(), z.any()).optional(),
  highlight_fields: z.array(z.string()).optional(),
  num_typos: z.number().int().min(0).max(2).optional(),
  min_len_1typo: z.number().int().positive().optional(),
  min_len_2typo: z.number().int().positive().optional(),
  page: z.number().int().min(1).optional().default(1),
  per_page: z.number().int().min(1).max(250).optional().default(10),
  q: z.string().min(1, 'Query parameter "q" is required'),
  snippet_threshold: z.number().int().min(0).max(100).optional().default(30),
  sort_by: z.string().optional(),
  search_mode: z.enum(['keyword', 'semantic', 'hybrid']).optional(),
  vector: z.boolean().optional(),
  typo_threshold: z.number().int().min(0).optional(),
  numerical: z.boolean().optional(),
  alpha_numerical: z.boolean().optional(),
})

export type ValidatedParams = z.infer<typeof SearchSchema>

export type ValidateResult = ValidationResult<ValidatedParams>

export function validateParams(params: unknown): ValidateResult {
  const result = SearchSchema.safeParse(params)

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
