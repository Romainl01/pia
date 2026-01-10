/**
 * Color tokens from Figma design system
 * @see https://www.figma.com/design/SUKow1jcAFeIcHODQcEy8n/Pia
 */

export const colors = {
  // Primary
  primary: '#F28C59',
  primary200: '#C9A961',

  // Neutral
  neutralDark: '#262629',
  neutralWhite: '#FFFFFF',
  neutralGray: '#6A7282',
  neutralGray200: '#D9DBE1',

  // Surface
  surfaceLight: '#F9FAFB',

  // Feedback
  feedbackSuccess: '#0E9F6E',
  feedbackError: '#E5484D',
} as const;

export type ColorToken = keyof typeof colors;
