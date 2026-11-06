import { Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing, TOUCH_MIN } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export type SegmentOption<T extends string> = {
  value: T;
  /** Texto visible del segmento (V-03: el modo no se indica solo con un ícono). */
  label: string;
  /** Nombre accesible, por ejemplo "Modo pasajero". Por defecto, el label. */
  accessibilityLabel?: string;
  icon?: IconName;
};

type SegmentedToggleProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Nombre del grupo, por ejemplo "Modo de uso". */
  accessibilityLabel: string;
};

/**
 * Selector de opciones excluyentes en forma de píldora (selector Pasajero/Conductor
 * del Figma). Semántica de radiogroup con un radio por opción y estado checked (S-03).
 * El segmento activo es blanco con ícono azul y texto en negrita; el inactivo es azul
 * con ícono blanco (V-03 y V-05: la selección no depende solo del color).
 * TalkBack lee "Modo pasajero, botón de opción, marcado": el estado lo agrega el
 * lector a partir de accessibilityState, por eso no se repite en la etiqueta.
 */
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedToggleProps<T>) {
  const { colors, borders } = useTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.container,
        {
          borderColor: colors.border,
          borderWidth: borders.thin,
          backgroundColor: colors.brandSurface,
        },
      ]}
    >
      {options.map((option) => {
        const checked = option.value === value;
        const foreground = checked ? 'brandSurface' : 'onBrand';
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            accessibilityState={{ checked }}
            onPress={() => {
              if (!checked) onChange(option.value);
            }}
            style={({ pressed }) => [
              styles.segment,
              { backgroundColor: checked ? colors.onBrand : colors.brandSurface },
              pressed && !checked && { backgroundColor: colors.primaryPressed },
            ]}
          >
            {option.icon ? <Icon name={option.icon} size={20} color={colors[foreground]} /> : null}
            <AppText variant={checked ? 'bodyStrong' : 'body'} color={foreground}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'center',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: TOUCH_MIN,
    minWidth: TOUCH_MIN,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
});
