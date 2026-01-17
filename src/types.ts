export interface BaseDocument {
  [key: string]: unknown
  _status?: 'draft' | 'published'
  createdAt: Date | string
  id: number | string
  slug?: string
  updatedAt: Date | string
}

export interface RichTextNode {
  [key: string]: unknown
  children?: RichTextNode[]
  text?: string
}

export interface RichText {
  [key: string]: unknown
  root?: RichTextNode
}

export interface SearchResult<T = any> {
  collection?: string
  content?: string
  displayName?: string
  document: { id?: string } & T
  highlight?: {
    [field: string]: {
      matched_tokens: string[]
      snippet: string
      value: string
    }
  }
  highlights?: Array<{
    field: string
    matched_tokens: string[]
    snippet: string
    value: string
  }>
  icon?: string
  id: string
  text_match?: number
  text_match_info?: {
    best_field_score: string
    best_field_weight: number
    fields_matched: number
    score: string
    tokens_matched: number
  }
  title?: string
  updatedAt?: string
}

export interface SearchResponse<T = any> {
  collections?: Array<{
    collection: string
    displayName: string
    error?: string
    found: number
    icon: string
  }>
  found: number
  hits: SearchResult<T>[]
  page: number
  request_params: {
    page?: number
    per_page: number
    q: string
    sort_by?: string
  }
  search_cutoff: boolean
  search_time_ms: number
}

export interface SuggestResult<T = any> {
  collection?: string
  displayName?: string
  document: T
  highlight?: Record<string, string>
  icon?: string
  text_match?: number
}

export type SearchResultProps<T = any> = {
  onClick?: (result: SearchResult<T>) => void
  result: SearchResult<T>
}

export interface SuggestResponse<T = any> {
  found: number
  hits: SuggestResult<T>[]
  page: number
  request_params: {
    per_page: number
    q: string
  }
  search_cutoff: boolean
  search_time_ms: number
}

export interface CollectionConfig<T = any> {
  displayName?: string
  enabled?: boolean
  facetFields?: Array<keyof T | string>
  fieldMapping?: Record<string, string>
  icon?: string
  searchFields?: Array<keyof T | string>
}

export type TypesenseConfig = {
  collections?: Partial<
    Record<
      string,
      {
        displayName?: string
        enabled: boolean
        facetFields?: string[]
        icon?: string
        searchFields?: string[]
        sortFields?: string[]
        syncLimit?: number
      }
    >
  >

  disabled?: boolean

  settings?: {
    autoSync?: boolean
    batchSize?: number
    categorized?: boolean
    searchEndpoint?: string
  }

  typesense: {
    apiKey: string
    connectionTimeoutSeconds?: number
    nodes: Array<{
      host: string
      port: number | string
      protocol: 'http' | 'https'
    }>
  }
}

export interface TypesenseSearchConfig<T = Record<string, any>> {
  collections: Record<string, CollectionConfig<T>>
  settings?: {
    cache?: {
      maxSize?: number
      ttl?: number
    }
    categorized?: boolean
  }
  typesense: {
    apiKey: string
    connectionTimeoutSeconds?: number
    nodes: Array<{
      host: string
      port: number
      protocol: 'http' | 'https'
    }>
    numRetries?: number
    retryIntervalSeconds?: number
  }
}

export interface SearchParams {
  facets?: string[]
  filters?: Record<string, any>
  highlight_fields?: string[]
  num_typos?: number
  page?: number
  per_page?: number
  q: string
  snippet_threshold?: number
  sort_by?: string
  typo_tokens_threshold?: number
}

export interface BaseSearchInputProps<T = any> {
  baseUrl: string
  className?: string
  collections?: string[]
  debounceMs?: number
  enableSuggestions?: boolean
  errorClassName?: string
  inputClassName?: string
  inputWrapperClassName?: string
  loadingClassName?: string
  maxResults?: number
  minQueryLength?: number
  noResultsClassName?: string
  onError?: (error: string) => void
  onLoading?: (loading: boolean) => void
  onResultClick?: (result: SearchResult<T>) => void
  onResults?: (results: SearchResponse<T>) => void
  onSearch?: (query: string, results: SearchResponse<T>) => void
  placeholder?: string
  renderDate?: boolean
  resultsHeaderClassName?: string
  resultsListClassName?: string
}

export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
}

export interface CacheOptions {
  maxSize?: number
  ttl?: number
}

export interface CacheStats {
  hits: number
  misses: number
}

export interface HealthCheckResponse {
  cache?: {
    maxSize: number
    size: number
  }
  collections?: string[]
  error?: string
  lastSync?: number
  status: 'healthy' | 'unhealthy'
  typesense?: {
    ok: boolean
    version?: string
  }
}

export interface ErrorResponse {
  code?: string
  details?: string
  error: string
  timestamp?: string
}

export interface ImportError extends Error {
  importResults?: Array<{
    document?: Record<string, unknown>
    error?: string
    success: boolean
  }>
}

export interface ApiResponse<T = any> {
  data?: T
  error?: ErrorResponse
  meta?: {
    cached?: boolean
    requestId?: string
    timestamp: string
  }
  success: boolean
}

export type FieldType =
  | 'auto'
  | 'bool'
  | 'bool[]'
  | 'float'
  | 'float[]'
  | 'geopoint'
  | 'geopoint[]'
  | 'geopolygon'
  | 'image'
  | 'int32'
  | 'int32[]'
  | 'int64'
  | 'int64[]'
  | 'object'
  | 'object[]'
  | 'string'
  | 'string*'
  | 'string[]'

export interface CollectionFieldSchema {
  [t: string]: unknown
  facet?: boolean
  index?: boolean
  infix?: boolean
  locale?: string
  name: string
  num_dim?: number
  optional?: boolean
  range_index?: boolean
  sort?: boolean
  stem?: boolean
  store?: boolean
  type: FieldType
}

export type CollectionSchema = {
  default_sorting_field?: string
  enable_nested_fields?: boolean
  fields: CollectionFieldSchema[]
  metadata?: object
  name: string
  symbols_to_index?: string[]
  token_separators?: string[]
  voice_query_model?: {
    model_name?: string
  }
}
