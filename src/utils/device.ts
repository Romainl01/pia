/**
 * Returns the appropriate sheet corner radius based on iPhone model.
 * Different iPhone generations have different screen corner radii:
 * - iPhone 14 Pro+, 15 series: 55px
 * - iPhone 12/13/14 standard: 47px
 * - iPhone 11/X era: 40-44px
 */
export function getDeviceCornerRadius(screenWidth: number, screenHeight: number): number {
  const height = Math.max(screenWidth, screenHeight);

  // iPhone 15 Pro Max, 15 Plus, 14 Pro Max (932pt height)
  if (height >= 930) return 55;

  // iPhone 14 Plus, 13 Pro Max, 12 Pro Max (926pt height)
  if (height >= 920) return 47;

  // iPhone 11 Pro Max, 11, XR, XS Max (896pt height)
  if (height >= 890) return 40;

  // iPhone 15 Pro, 15, 14 Pro (852pt height)
  if (height >= 850) return 55;

  // iPhone 14, 13, 12 series (844pt height)
  if (height >= 840) return 47;

  // iPhone 13 mini, X, XS, 11 Pro (812pt height)
  if (height >= 810) return 44;

  // Older/smaller devices
  return 38;
}

/**
 * Calculates the padding needed for an inner element to be concentric
 * with an outer rounded corner.
 *
 * Formula: Outer Radius = Inner Radius + Padding
 * Therefore: Padding = Outer Radius - Inner Radius
 */
export function getConcentricPadding(outerRadius: number, innerRadius: number): number {
  return outerRadius - innerRadius;
}
