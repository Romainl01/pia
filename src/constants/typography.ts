/**
 * Typography tokens from Figma design system
 * @see https://www.figma.com/design/SUKow1jcAFeIcHODQcEy8n/Pia
 *
 * Font families:
 * - Crimson Pro (headings)
 * - Inter (body)
 */

export const fontFamilies = {
  heading: 'CrimsonPro',
  headingMedium: 'CrimsonPro_500Medium',
  headingRegular: 'CrimsonPro_400Regular',
  body: 'Inter',
  bodyMedium: 'Inter_500Medium',
  bodyRegular: 'Inter_400Regular',
} as const;

export const typography = {
  // Headings - Crimson Pro
  titleH0: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: 44,
    fontWeight: '500' as const,
    lineHeight: 44, // 100%
    letterSpacing: 0,
  },
  titleH1: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: 32,
    fontWeight: '500' as const,
    lineHeight: 32, // 100%
    letterSpacing: 0,
  },
  titleH2: {
    fontFamily: fontFamilies.headingRegular,
    fontSize: 24,
    fontWeight: '400' as const,
    lineHeight: 24, // 100%
    letterSpacing: 0,
  },
  titleH3: {
    fontFamily: fontFamilies.headingRegular,
    fontSize: 20,
    fontWeight: '400' as const,
    lineHeight: 20, // 100%
    letterSpacing: 0,
  },

  // Body - Inter
  body1: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  body2: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 14, // 100%
    letterSpacing: 0,
  },
} as const;

export type TypographyToken = keyof typeof typography;
