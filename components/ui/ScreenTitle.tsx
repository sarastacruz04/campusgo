import { StyleSheet } from 'react-native';

import { useScreenFocus } from '@/hooks/useScreenFocus';
import type { ColorTokens } from '@/theme/colors';
import type { TypographyVariant } from '@/theme/typography';

import { AppText } from './AppText';

type ScreenTitleProps = {
  children: string;
  /** Mover el foco del lector al título al entrar (T-03). Por defecto, sí. */
  autoFocus?: boolean;
  /** Si cambia (por ejemplo, el paso del registro), el foco vuelve al título. */
  focusKey?: string | number;
  variant?: Extract<TypographyVariant, 'title' | 'subtitle'>;
  color?: keyof ColorTokens;
};

/**
 * Título de pantalla con rol header (S-01). Cada pantalla tiene uno y recibe el
 * foco al entrar, así quien usa TalkBack sabe dónde está sin recorrer el encabezado.
 */
export function ScreenTitle({
  children,
  autoFocus = true,
  focusKey,
  variant = 'title',
  color = 'text',
}: ScreenTitleProps) {
  const ref = useScreenFocus(autoFocus, focusKey);
  return (
    <AppText
      ref={ref}
      accessibilityRole="header"
      accessible
      variant={variant}
      color={color}
      style={styles.title}
    >
      {children}
    </AppText>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
  },
});
