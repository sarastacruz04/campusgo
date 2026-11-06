// Cálculo de contraste según WCAG 2.x (luminancia relativa y razón de contraste).
// https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio

/** Convierte "#RRGGBB" en sus tres canales de 0 a 255. */
export function hexToRgb(hex: string): [number, number, number] {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) {
    throw new Error(`Color inválido: ${hex}. Usa el formato #RRGGBB.`);
  }
  const value = parseInt(match[1], 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

/** Luminancia relativa de un color (0 = negro, 1 = blanco). */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const c = channel / 255;
    // Corrección gamma de sRGB definida por WCAG.
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razón de contraste entre dos colores, de 1 a 21. El orden no importa. */
export function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Tipo de par y mínimo que exige WCAG AA:
 * - text: texto normal, 4,5:1 (1.4.3).
 * - largeText: texto de 18,66 px en negrita o 24 px o más, 3:1 (1.4.3).
 * - ui: bordes de controles, íconos y estados, 3:1 (1.4.11).
 */
export type ContrastKind = 'text' | 'largeText' | 'ui';

export const MIN_RATIO: Record<ContrastKind, number> = {
  text: 4.5,
  largeText: 3,
  ui: 3,
};

export function meetsContrast(foreground: string, background: string, kind: ContrastKind): boolean {
  return contrastRatio(foreground, background) >= MIN_RATIO[kind];
}
