import type { Ref } from 'react';
import { Text, type HostInstance, type TextProps } from 'react-native';

import type { ColorTokens } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';
import { MAX_FONT_SIZE_MULTIPLIER, type TypographyVariant } from '@/theme/typography';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  /** Token de color del tema; por defecto, el texto principal. */
  color?: keyof ColorTokens;
  /** Referencia al texto, por ejemplo para mover el foco del lector a un título. */
  ref?: Ref<HostInstance>;
};

/**
 * Texto base de la app. Garantiza en un solo lugar lo que pide la sección 7.3:
 * Noto Sans, lineHeight de 1,4 o más, letterSpacing 0, escalado con el sistema
 * (allowFontScaling) hasta 200 % (maxFontSizeMultiplier) y color del tema.
 * Ningún estilo aquí fija una altura: el texto crece con la fuente (V-06).
 */
export function AppText({
  variant = 'body',
  color = 'text',
  style,
  allowFontScaling = true,
  maxFontSizeMultiplier = MAX_FONT_SIZE_MULTIPLIER,
  ...rest
}: AppTextProps) {
  const { colors, typography } = useTheme();
  return (
    <Text
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[typography[variant], { color: colors[color] }, style]}
      {...rest}
    />
  );
}
