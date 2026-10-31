import { type ThemeContextValue } from '../themes/types.js'
import { generateStyles } from '../themes/utils.js'

type Props = {
  themeConfig: ThemeContextValue
  scope: string
}

export function SearchStyles({ themeConfig, scope }: Props) {
  if (themeConfig.config.unstyled) return null

  const themeStyles = generateStyles(themeConfig.theme, themeConfig.config, scope)

  return <style>{themeStyles}</style>
}
