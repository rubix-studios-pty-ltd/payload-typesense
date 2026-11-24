import { type SearchParams, type TypesenseConfig } from '../types.js'
import { getMode } from '../utils/getMode.js'

type SearchConfiguration = Pick<TypesenseConfig, 'settings' | 'vectorSearch'>

export function buildParameters(
  config: SearchConfiguration,
  fields: string[],
  params: SearchParams
) {
  const mode = getMode(config, params)
  const tolerance = config.settings?.typoTolerance
  const vector = config.vectorSearch
  const keywordFields = fields.filter((field) => field !== 'embedding')

  const queryFields =
    mode === 'semantic'
      ? ['embedding']
      : mode === 'hybrid'
        ? [...keywordFields, 'embedding']
        : keywordFields

  const vectorOptions = [`k:${vector?.k ?? 200}`]

  if (mode === 'hybrid') vectorOptions.push(`alpha:${vector?.alpha ?? 0.3}`)

  if (vector?.distanceThreshold !== undefined) {
    vectorOptions.push(`distance_threshold:${vector.distanceThreshold}`)
  }

  return {
    q: params.q,
    query_by: queryFields.join(','),
    page: params.page ?? 1,
    per_page: params.per_page ?? 10,
    num_typos: params.num_typos ?? tolerance?.numTypos ?? 2,
    min_len_1typo: params.min_len_1typo ?? tolerance?.minLengthOneTypo ?? 4,
    min_len_2typo: params.min_len_2typo ?? tolerance?.minLengthTwoTypos ?? 7,
    typo_tokens_threshold: params.typo_threshold ?? tolerance?.typoTokensThreshold ?? 1,
    enable_typos_for_numerical_tokens: params.numerical ?? tolerance?.numericalTokens ?? true,
    enable_typos_for_alpha_numerical_tokens:
      params.alpha_numerical ?? tolerance?.alphaNumericalTokens ?? true,
    ...(keywordFields.length > 0 && {
      highlight_full_fields: (params.highlight_fields ?? keywordFields).join(','),
    }),
    snippet_threshold: params.snippet_threshold ?? 30,
    ...(params.sort_by ? { sort_by: params.sort_by } : {}),
    ...(mode !== 'keyword' && {
      vector_query: `embedding:([], ${vectorOptions.join(', ')})`,
      exclude_fields: 'embedding',
      search_cutoff_ms: 5000,
    }),
    ...(mode === 'hybrid' && { drop_tokens_threshold: 0 }),
  }
}
