import { type ThemeContextValue } from '../themes/types.js'
import { generateThemeStyles } from '../themes/utils.js'

export function SearchStyles({
  themeConfig,
  scope,
}: {
  themeConfig: ThemeContextValue
  scope: string
}) {
  if (themeConfig.config.unstyled) return null
  return <style>{generateThemeStyles(themeConfig.theme, themeConfig.config, scope)}</style>
}
