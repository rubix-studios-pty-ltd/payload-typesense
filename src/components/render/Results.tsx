import { type SearchResult } from '../../types.js'
import { type ThemeContextValue } from '../themes/types.js'

interface RenderedResultProps {
  index: number
  onResultClick: (result: SearchResult) => void
  renderDate?: boolean
  result: SearchResult
  resultItemClassName?: string
  resultsContainerClassName?: string
  themeConfig: ThemeContextValue
}

export function RenderedResult({
  index,
  onResultClick,
  renderDate = true,
  result,
  resultItemClassName = '',
  resultsContainerClassName = '',
  themeConfig,
}: RenderedResultProps) {
  return (
    <div
      className={resultsContainerClassName}
      style={{
        backgroundColor: themeConfig.theme.colors.resultBackground,
        borderBottom: `1px solid ${themeConfig.theme.colors.resultBorder}`,
        cursor: 'pointer',
        padding: themeConfig.theme.spacing.itemPadding,
        transition:
          themeConfig.config.enableAnimations !== false
            ? `all ${themeConfig.theme.animations.transitionFast} ${themeConfig.theme.animations.easeInOut}`
            : 'none',
      }}
    >
      <div
        className={`${themeConfig.classes.resultItem} ${resultItemClassName}`}
        data-result-item
        key={result.document?.id || result.id || index}
        onBlur={(e) => {
          e.currentTarget.style.backgroundColor = themeConfig.theme.colors.resultBackground
        }}
        onClick={() => onResultClick(result)}
        onFocus={(e) => {
          e.currentTarget.style.backgroundColor = themeConfig.theme.colors.resultBackgroundFocus
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onResultClick(result)
          }
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = themeConfig.theme.colors.resultBackgroundHover
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = themeConfig.theme.colors.resultBackground
        }}
        role="button"
        tabIndex={0}
      >
        <div style={{ alignItems: 'flex-start', display: 'flex', gap: '12px', padding: '6px' }}>
          <div style={{ flexShrink: 0 }}>
            <div
              style={{
                alignItems: 'center',
                backgroundColor: themeConfig.theme.colors.collectionBadge,
                borderRadius: themeConfig.theme.spacing.inputBorderRadius,
                color: themeConfig.theme.colors.collectionBadgeText,
                display: 'flex',
                fontSize: '14px',
                fontWeight: themeConfig.theme.typography.fontWeightMedium,
                height: '32px',
                justifyContent: 'center',
                width: '32px',
              }}
            >
              {result.collection?.charAt(0).toUpperCase() || '📄'}
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <h3
                style={{
                  color: themeConfig.theme.colors.titleText,
                  fontFamily: themeConfig.theme.typography.fontFamily,
                  fontSize: themeConfig.theme.typography.fontSizeBase,
                  fontWeight: themeConfig.theme.typography.fontWeightSemibold,
                  lineHeight: themeConfig.theme.typography.lineHeightTight,
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {result.document?.title || result.document?.name || result.title || 'Untitled'}
              </h3>
            </div>

            {(result.highlight?.title?.snippet || result.highlight?.content?.snippet) && (
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    result.highlight?.title?.snippet || result.highlight?.content?.snippet || '',
                }}
                style={{
                  color: themeConfig.theme.colors.descriptionText,
                  display: '-webkit-box',
                  fontSize: themeConfig.theme.typography.fontSizeSm,
                  fontWeight: themeConfig.theme.typography.fontWeightNormal,
                  lineHeight: themeConfig.theme.typography.lineHeightNormal,
                  marginTop: '4px',
                  overflow: 'hidden',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                }}
              />
            )}

            <div
              style={{
                alignItems: 'center',
                color: themeConfig.theme.colors.metaText,
                display: 'flex',
                fontSize: themeConfig.theme.typography.fontSizeXs,
                gap: '12px',
                marginTop: '8px',
              }}
            >
              {result.collection && (
                <span style={{ alignItems: 'center', display: 'inline-flex' }}>
                  <svg
                    fill="currentColor"
                    style={{ height: '12px', marginRight: '4px', width: '12px' }}
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      fillRule="evenodd"
                    />
                  </svg>
                  {result.collection}
                </span>
              )}
              {renderDate && (result.document?.updatedAt || result.updatedAt) && (
                <span style={{ alignItems: 'center', display: 'inline-flex' }}>
                  <svg
                    fill="currentColor"
                    style={{ height: '12px', marginRight: '4px', width: '12px' }}
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      fillRule="evenodd"
                    />
                  </svg>
                  {new Date(result.document?.updatedAt || result.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
