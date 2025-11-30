import { type ThemeContextValue } from '../themes/types.js'

interface RenderedNoResultsProps {
  noResultsClassName?: string
  query: string
  themeConfig: ThemeContextValue
}

export const RenderedNoResults = ({
  noResultsClassName = '',
  query: _query,
  themeConfig,
}: RenderedNoResultsProps) => (
  <div
    className={noResultsClassName}
    style={{
      color: themeConfig.theme.colors.noResultsText,
      fontFamily: themeConfig.theme.typography.fontFamily,
      fontSize: themeConfig.theme.typography.fontSizeSm,
      padding: '40px 20px',
      textAlign: 'center',
    }}
  >
    <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
      <svg
        fill="none"
        stroke="currentColor"
        style={{
          color: themeConfig.theme.colors.metaText,
          height: '48px',
          marginBottom: '12px',
          width: '48px',
        }}
        viewBox="0 0 24 24"
      >
        <path
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
        />
      </svg>
      <h3
        style={{
          color: themeConfig.theme.colors.titleText,
          fontSize: themeConfig.theme.typography.fontSizeSm,
          fontWeight: themeConfig.theme.typography.fontWeightMedium,
          margin: 0,
          marginBottom: '4px',
        }}
      >
        No results found
      </h3>
      <p
        style={{
          color: themeConfig.theme.colors.descriptionText,
          fontSize: themeConfig.theme.typography.fontSizeSm,
          margin: 0,
        }}
      >
        Try searching for something else
      </p>
    </div>
  </div>
)
