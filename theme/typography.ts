import type { TextStyle } from 'react-native';

// Tipografía de CampusGo: Noto Sans (la fuente del Figma), cargada con
// @expo-google-fonts/noto-sans en app/_layout.tsx.
// Con fuentes personalizadas cada peso es una familia distinta: por eso no se usa
// fontWeight (en Android haría que el sistema reemplace la fuente).

export const fontFamilies = {
  regular: 'NotoSans_400Regular',
  semibold: 'NotoSans_600SemiBold',
  bold: 'NotoSans_700Bold',
} as const;

export type TypographyVariant =
  | 'title'
  | 'subtitle'
  | 'cardTitle'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'button'
  | 'secondary'
  | 'tab';

type VariantStyle = Required<
  Pick<TextStyle, 'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing'>
>;

/**
 * Escala base (factor 1). Reglas (V-06 y V-07):
 * - Títulos 24–28, subtítulos 18–20, cuerpo y campos 16, secundario 14, barra inferior 12.
 * - lineHeight de al menos 1,4 veces el tamaño, para no recortar tildes, Ñ, ¿ y ¡.
 * - letterSpacing 0: el Figma usa espaciado negativo en títulos y pega las palabras.
 */
export const baseTypography: Record<TypographyVariant, VariantStyle> = {
  title: { fontFamily: fontFamilies.bold, fontSize: 26, lineHeight: 38, letterSpacing: 0 },
  subtitle: { fontFamily: fontFamilies.semibold, fontSize: 19, lineHeight: 28, letterSpacing: 0 },
  cardTitle: { fontFamily: fontFamilies.bold, fontSize: 22, lineHeight: 32, letterSpacing: 0 },
  body: { fontFamily: fontFamilies.regular, fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  bodyStrong: { fontFamily: fontFamilies.bold, fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  label: { fontFamily: fontFamilies.semibold, fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  button: { fontFamily: fontFamilies.semibold, fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  secondary: { fontFamily: fontFamilies.regular, fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  tab: { fontFamily: fontFamilies.semibold, fontSize: 12, lineHeight: 18, letterSpacing: 0 },
};

/** Proporción mínima entre lineHeight y fontSize (V-07). */
export const MIN_LINE_HEIGHT_RATIO = 1.4;

/**
 * Límite de crecimiento del texto por el ajuste del sistema (V-06): hasta 200 %.
 * Más allá, el contenido deja de caber en una pantalla de teléfono.
 */
export const MAX_FONT_SIZE_MULTIPLIER = 2;

/** Tamaño de texto elegido en Ajustes, que se suma al ajuste del sistema. */
export type TextSizePreference = 'system' | 'large' | 'extraLarge';

export const TEXT_SIZE_FACTORS: Record<TextSizePreference, number> = {
  system: 1,
  large: 1.15,
  extraLarge: 1.3,
};

/**
 * Devuelve la escala multiplicada por el factor de Ajustes. lineHeight se redondea
 * hacia arriba para mantener siempre la proporción de 1,4 o más.
 */
export function scaleTypography(factor: number): Record<TypographyVariant, VariantStyle> {
  const entries = Object.entries(baseTypography).map(([variant, style]) => [
    variant,
    {
      ...style,
      fontSize: Math.round(style.fontSize * factor),
      lineHeight: Math.ceil(style.lineHeight * factor),
    },
  ]);
  return Object.fromEntries(entries) as Record<TypographyVariant, VariantStyle>;
}
