import { useState, type Ref } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type HostInstance,
  type PressableProps,
} from 'react-native';

import type { ColorTokens } from '@/theme/colors';
import { radius, spacing, TOUCH_MIN } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

/**
 * - primary: relleno primary y texto blanco (acción principal).
 * - secondary: borde primary sobre blanco.
 * - onBrand: relleno blanco sobre una tarjeta azul (botón seguro de los diálogos).
 * - onBrandOutline: borde blanco sobre una tarjeta azul.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'onBrand' | 'onBrandOutline';

export type ButtonProps = Omit<PressableProps, 'children' | 'style' | 'accessibilityRole'> & {
  /** Texto visible y nombre accesible. TypeScript lo exige: no hay botón sin nombre. */
  label: string;
  variant?: ButtonVariant;
  /** Muestra un indicador con texto, anuncia "ocupado" y bloquea el doble toque (T-05). */
  loading?: boolean;
  /** Texto mientras carga, por ejemplo "Guardando…". Por defecto, el mismo label. */
  loadingLabel?: string;
  icon?: IconName;
  fullWidth?: boolean;
  /** Referencia al botón, para devolverle el foco al cerrar el diálogo que abrió (S-08). */
  ref?: Ref<HostInstance>;
};

type VariantColors = { background: string; text: keyof ColorTokens; border: string };

function variantColors(variant: ButtonVariant, colors: ColorTokens, pressed: boolean) {
  const map: Record<ButtonVariant, VariantColors> = {
    primary: {
      background: pressed ? colors.primaryPressed : colors.primary,
      text: 'onPrimary',
      border: pressed ? colors.primaryPressed : colors.primary,
    },
    secondary: {
      background: pressed ? colors.titleBand : colors.surface,
      text: 'primary',
      border: colors.primary,
    },
    onBrand: {
      background: pressed ? colors.onBrandMuted : colors.onBrand,
      text: 'brandSurface',
      border: colors.onBrand,
    },
    onBrandOutline: {
      background: pressed ? colors.primaryPressed : colors.brandSurface,
      text: 'onBrand',
      border: colors.onBrand,
    },
  };
  return map[variant];
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  loadingLabel,
  icon,
  fullWidth = false,
  disabled = false,
  accessibilityHint,
  onFocus,
  onBlur,
  ref,
  ...rest
}: ButtonProps) {
  const { colors, borders } = useTheme();
  // Foco con teclado externo (T-03): se dibuja un borde de 2 px adicional.
  const [focused, setFocused] = useState(false);
  const isDisabled = disabled || loading;
  const visibleLabel = loading && loadingLabel ? loadingLabel : label;

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={visibleLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={({ pressed }) => {
        const v = variantColors(variant, colors, pressed);
        return [
          styles.base,
          {
            backgroundColor: v.background,
            borderColor: focused ? colors.focus : v.border,
            borderWidth: focused ? borders.focus : borders.thin,
          },
          fullWidth && styles.fullWidth,
          // Deshabilitado: WCAG no exige contraste en controles inactivos, pero se
          // conserva legible y se anuncia con accessibilityState.disabled.
          isDisabled && styles.disabled,
        ];
      }}
      {...rest}
    >
      {({ pressed }) => {
        const v = variantColors(variant, colors, pressed);
        return (
          <View style={styles.content}>
            {loading ? (
              <ActivityIndicator color={colors[v.text]} accessibilityElementsHidden />
            ) : icon ? (
              <Icon name={icon} size={20} color={colors[v.text]} />
            ) : null}
            <AppText variant="button" color={v.text} style={styles.label}>
              {visibleLabel}
            </AppText>
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: TOUCH_MIN,
    minWidth: TOUCH_MIN,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.control,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  label: {
    textAlign: 'center',
    flexShrink: 1,
  },
});
