/**
 * Color tokens from Figma design system
 * @see https://www.figma.com/design/SUKow1jcAFeIcHODQcEy8n/Pia
 */

export const colors = {
  // Primary
  primary: '#F28C59',
  primary200: '#C9A961',
  primaryLight: '#FDEBE3',
  primaryGradientStart: '#FFCAB0',

  // Neutral
  neutralDark: '#262629',
  neutralWhite: '#FFFFFF',
  neutralGray: '#6A7282',
  neutralGray200: '#D9DBE1',
  neutralGray300: '#8A898E',

  // Surface
  surfaceLight: '#F9F9F5',
  surfaceCard: 'rgba(255, 255, 255, 0.5)',

  // Feedback
  feedbackSuccess: '#0E9F6E',
  feedbackError: '#E5484D',

  // Toast
  toastFuseBorder: '#7DD3C0',
} as const;

export type ColorToken = keyof typeof colors;

/**
 * Journal dot grid color schemes
 * Each scheme provides distinct colors for all 4 dot states:
 * - filled: Days with entries (warm, positive)
 * - pastEmpty: Past days without entries (muted, not alarming)
 * - future: Future days (subtle, barely visible)
 * - todayRing: Ring around today's dot (contrasting accent)
 */
export const journalColorSchemes = {
  /** Terracotta & Sage - Rich, earthy, Mediterranean feel */
  A: {
    filled: '#C75B39',      // Deep Terracotta
    pastEmpty: '#C4B8A8',   // Warm Clay
    future: '#E8E2D9',      // Soft Sand
    todayRing: '#7A9E7E',   // Sage Green
  },
  /** Ocean & Amber - Coastal, warm sunset vibes */
  B: {
    filled: '#2A7B7B',      // Deep Teal
    pastEmpty: '#D4C4A8',   // Warm Sand
    future: '#EAE4D8',      // Pale Dune
    todayRing: '#D4943A',   // Amber Gold
  },
  /** Forest & Copper - Deep, rich, autumnal */
  C: {
    filled: '#3D6B4F',      // Forest Green
    pastEmpty: '#BFB5A3',   // Warm Stone
    future: '#E5E2D8',      // Pale Moss
    todayRing: '#B87333',   // Burnished Copper
  },
} as const;

export type JournalColorScheme = keyof typeof journalColorSchemes;
