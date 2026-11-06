import { useState, type Ref } from 'react';
import { Pressable, StyleSheet, type HostInstance, type PressableProps } from 'react-native';

import { hitSlopFor, radius, TOUCH_MIN } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

import { Icon, type IconName } from './Icon';

/**
 * - plain: ícono del color del texto, sin fondo (lupa, papelera, lápiz).
 * - filled: círculo primary con ícono blanco (el "+" de las tarjetas).
 * - onBrand: ícono blanco sobre una tarjeta azul.
 * - avatar: círculo gris claro con ícono de persona (botón de perfil).
 */
export type IconButtonVariant = 'plain' | 'filled' | 'onBrand' | 'avatar';

export type IconButtonProps = Omit<
  PressableProps,
  'children' | 'style' | 'accessibilityRole' | 'accessibilityLabel'
> & {
  icon: IconName;
  /**
   * Obligatorio (S-02): un ícono sin texto no tiene nombre para el lector. En
   * español y sin repetir el rol: "Buscar viajes", no "Botón buscar".
   */
  accessibilityLabel: string;
  variant?: IconButtonVariant;
  iconSize?: number;
  /**
   * true conserva el tamaño visual pequeño del Figma (por ejemplo la lupa o la
   * papelera) y completa el área táctil con hitSlop hasta TOUCH_MIN (T-02).
   */
  compact?: boolean;
  accessibilityRole?: 'button' | 'link' | 'search';
  /** Referencia al botón, por ejemplo para devolverle el foco al cerrar un diálogo. */
  ref?: Ref<HostInstance>;
};

export function IconButton({
  icon,
  accessibilityLabel,
  variant = 'plain',
  iconSize = 24,
  compact = false,
  accessibilityRole = 'button',
  disabled = false,
  hitSlop,
  ref,
  ...rest
}: IconButtonProps) {
  const { colors, borders } = useTheme();
  const [focused, setFocused] = useState(false);

  const visualSize = compact ? iconSize + 8 : TOUCH_MIN;
  const iconColor = {
    plain: colors.text,
    filled: colors.onPrimary,
    onBrand: colors.onBrand,
    avatar: colors.avatarIcon,
  }[variant];

  return (
    <Pressable
      ref={ref}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={hitSlop ?? (compact ? hitSlopFor(visualSize) : undefined)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.base,
        { width: visualSize, height: visualSize },
        // Sin compact, el área visible ya cumple TOUCH_MIN. Con compact, el hitSlop la completa.
        !compact && { minWidth: TOUCH_MIN, minHeight: TOUCH_MIN },
        variant === 'filled' && {
          backgroundColor: pressed ? colors.primaryPressed : colors.primary,
        },
        variant === 'avatar' && { backgroundColor: colors.avatarBackground },
        variant !== 'filled' && pressed && { backgroundColor: colors.titleBand },
        focused && { borderWidth: borders.focus, borderColor: colors.focus },
        disabled && styles.disabled,
      ]}
      {...rest}
    >
      <Icon name={icon} size={iconSize} color={iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});
