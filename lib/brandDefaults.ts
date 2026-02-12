import type { BrandColors } from '@/types/audience';

export const DEFAULT_BRAND_COLORS: BrandColors = {
  primary: '#2768E3',
  secondary: '#1BD571',
  tertiary: '#E32768',
  quaternary: '#D5711B',
};

/** Returns array of brand hex colors in order, for indexed segment coloring */
export function getBrandColorArray(brandColors?: BrandColors): string[] {
  const c = brandColors ?? DEFAULT_BRAND_COLORS;
  return [c.primary, c.secondary, c.tertiary ?? '#E32768', c.quaternary ?? '#D5711B'];
}
