/**
 * Color tokens from Figma design system
 * @see https://www.figma.com/design/SUKow1jcAFeIcHODQcEy8n/Memo
 */

/**
 * Light mode color palette
 */
export const lightColors = {
  // Primary
  primary: '#F28C59',
  primary200: '#C9A961',
  primaryLight: '#FDEBE3',
  primaryGradientStart: '#FFCAB0',
  primaryGradientEnd: '#F9F9F5',

  // Neutral
  neutralDark: '#262629',
  neutralWhite: '#FFFFFF',
  neutralGray: '#6A7282',
  neutralGray200: '#D9DBE1',
  neutralGray300: '#8A898E',

  // Surface
  surfaceLight: '#F9F9F5',
  surfaceCard: 'rgba(255, 255, 255, 0.5)',
  surfaceElevated: '#FFFFFF',

  // Feedback
  feedbackSuccess: '#0E9F6E',
  feedbackError: '#E5484D',

  // Toast
  toastFuseBorder: '#7DD3C0',

  // Component-specific
  menuItemBorder: 'rgba(0, 0, 0, 0.1)',
  menuItemPressed: 'rgba(0, 0, 0, 0.05)',
  shadowColor: '#000000',
  categoryPillBorder: 'rgba(242, 140, 89, 0.4)',
  pickerPanelBackground: 'rgba(255, 255, 255, 0.7)',
  notesBackground: 'rgba(255, 255, 255, 0.7)',
} as const;

/**
 * Dark mode color palette
 * Uses warm dark tones (#1A1918) to match brand warmth
 */
export const darkColors = {
  // Primary - unchanged to preserve brand identity
  primary: '#F28C59',
  primary200: '#C9A961',
  primaryLight: '#3D2820',
  primaryGradientStart: '#4A3328',  // Warmer terracotta brown for visible gradient
  primaryGradientEnd: '#1A1918',

  // Neutral - inverted for dark mode
  neutralDark: '#F5F5F5',
  neutralWhite: '#1A1918',
  neutralGray: '#9CA3AF',
  neutralGray200: '#3D3D3F',
  neutralGray300: '#6B7280',

  // Surface
  surfaceLight: '#1A1918',
  surfaceCard: 'rgba(40, 38, 36, 0.7)',
  surfaceElevated: '#252322',

  // Feedback - slightly brighter for dark backgrounds
  feedbackSuccess: '#10B981',
  feedbackError: '#F87171',

  // Toast
  toastFuseBorder: '#5EEAD4',

  // Component-specific
  menuItemBorder: 'rgba(255, 255, 255, 0.1)',
  menuItemPressed: 'rgba(255, 255, 255, 0.05)',
  shadowColor: '#000000',
  categoryPillBorder: 'rgba(242, 140, 89, 0.3)',
  pickerPanelBackground: 'rgba(40, 38, 36, 0.8)',
  notesBackground: 'rgba(40, 38, 36, 0.8)',
} as const;

/**
 * Theme colors type - allows both light and dark values
 */
export interface ThemeColors {
  primary: string;
  primary200: string;
  primaryLight: string;
  primaryGradientStart: string;
  primaryGradientEnd: string;
  neutralDark: string;
  neutralWhite: string;
  neutralGray: string;
  neutralGray200: string;
  neutralGray300: string;
  surfaceLight: string;
  surfaceCard: string;
  surfaceElevated: string;
  feedbackSuccess: string;
  feedbackError: string;
  toastFuseBorder: string;
  menuItemBorder: string;
  menuItemPressed: string;
  shadowColor: string;
  categoryPillBorder: string;
  pickerPanelBackground: string;
  notesBackground: string;
}

/**
 * Default colors export - alias to lightColors for backward compatibility
 * New code should use useTheme() hook instead
 */
export const colors = lightColors;

export type ColorToken = keyof typeof colors;

/**
 * Journal dot grid color scheme
 * Terra theme with light and dark variants
 */
export const journalColorScheme = {
  light: {
    filled: '#B84422',      // Deep Terracotta (saturated)
    pastEmpty: '#C9BDB0',   // Warm Clay (lighter for contrast)
    future: '#E8E2D9',      // Soft Sand
    todayRing: '#5B8A60',   // Sage Green (saturated)
  },
  dark: {
    filled: '#E06340',      // Brighter terracotta for dark bg
    pastEmpty: '#5C524A',   // Muted warm gray
    future: '#2D2926',      // Subtle dark
    todayRing: '#7BAF82',   // Brighter sage green
  },
} as const;

export type JournalSchemeVariant = keyof typeof journalColorScheme;

/**
 * Journal scheme colors type
 */
export interface JournalSchemeColors {
  filled: string;
  pastEmpty: string;
  future: string;
  todayRing: string;
}

/**
 * Style object for elevated card containers that adapt to dark mode.
 * In light mode: white background with subtle shadow.
 * In dark mode: elevated surface with subtle border for definition.
 */
export interface CardContainerStyle {
  backgroundColor: string;
  borderWidth: number;
  borderColor: string;
}

/**
 * Returns container styles for card-like UI elements that adapt to dark mode.
 * Centralizes the common pattern used across SettingsRow, FriendCard, GlassMenu, etc.
 */
export function getCardContainerStyle(colors: ThemeColors, isDark: boolean): CardContainerStyle {
  return {
    backgroundColor: isDark ? colors.surfaceElevated : colors.neutralWhite,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? colors.menuItemBorder : 'transparent',
  };
}
