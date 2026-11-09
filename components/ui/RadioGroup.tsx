import { Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing, TOUCH_GAP, TOUCH_MIN } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';
import { Icon } from './Icon';

export type RadioOption<T extends string> = {
  value: T;
  label: string;
};

type RadioGroupProps<T extends string> = {
  /** Pregunta o título del grupo, visible y leído por el lector. */
  label: string;
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  direction?: 'column' | 'row';
  /** true si el título ya está visible arriba (por ejemplo, en la lista de SelectField). */
  hideVisibleLabel?: boolean;
};

/**
 * Lista de opciones excluyentes (por ejemplo "¿Quieres registrar un carro?" o el
 * tema en Ajustes). Cada fila completa es el objetivo táctil (T-01), con rol radio y
 * estado checked (S-03, S-06). La selección se ve con el ícono relleno y la negrita.
 */
export function RadioGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  direction = 'column',
  hideVisibleLabel = false,
}: RadioGroupProps<T>) {
  const { colors } = useTheme();

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.container}>
      {hideVisibleLabel ? null : (
        <AppText variant="label" importantForAccessibility="no">
          {label}
        </AppText>
      )}
      <View style={[styles.options, direction === 'row' && styles.row]}>
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ checked }}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.option,
                pressed && { backgroundColor: colors.titleBand },
              ]}
            >
              <Icon
                name={checked ? 'radiobox-marked' : 'radiobox-blank'}
                size={24}
                color={colors.text}
              />
              <AppText variant={checked ? 'bodyStrong' : 'body'}>{option.label}</AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  options: {
    gap: TOUCH_GAP,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: TOUCH_MIN,
    minWidth: TOUCH_MIN,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.control,
  },
});
