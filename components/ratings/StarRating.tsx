import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { radius, spacing, TOUCH_GAP, TOUCH_MIN } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

const STARS = [1, 2, 3, 4, 5] as const;

export type StarRatingProps = {
  /** Valor actual entre 0 (sin seleccionar) y 5. */
  value: number;
  /** Callback al seleccionar una estrella del 1 al 5. */
  onChange: (value: number) => void;
  /** Etiqueta visible del grupo de estrellas. */
  label?: string;
  /** Mensaje de error bajo las estrellas (V-05). */
  error?: string;
  /** Deshabilita cambios mientras se envía la calificación. */
  disabled?: boolean;
};

/**
 * Selector accesible de 1 a 5 estrellas (E7, S-01, S-06, V-05, T-01):
 * cada estrella es un botón de al menos 48 dp con etiqueta "N de 5 estrellas"
 * y accessibilityState.selected, diferenciando estado con ícono lleno/contorno,
 * borde y relleno de alto contraste.
 */
export function StarRating({
  value,
  onChange,
  label = 'Calificación en estrellas',
  error,
  disabled = false,
}: StarRatingProps) {
  const { colors, borders } = useTheme();
  const [focusedStar, setFocusedStar] = useState<number | null>(null);
  const hasError = Boolean(error);

  return (
    <View style={styles.container}>
      <AppText variant="label" color="text">
        {label}
      </AppText>

      <View style={styles.row}>
        {STARS.map((star) => {
          const selected = star <= value;
          const isFocused = focusedStar === star;

          return (
            <Pressable
              key={star}
              accessibilityRole="button"
              accessibilityLabel={`${star} de 5 estrellas`}
              accessibilityState={{ selected, disabled }}
              disabled={disabled}
              onPress={() => onChange(star)}
              onFocus={() => setFocusedStar(star)}
              onBlur={() => setFocusedStar((prev) => (prev === star ? null : prev))}
              style={({ pressed }) => [
                styles.starButton,
                {
                  backgroundColor: selected
                    ? pressed
                      ? colors.primaryPressed
                      : colors.primary
                    : colors.surface,
                  borderColor: isFocused
                    ? colors.focus
                    : hasError && !selected
                      ? colors.error
                      : colors.border,
                  borderWidth: isFocused ? borders.focus : borders.thin,
                  opacity: disabled ? 0.55 : pressed && !selected ? 0.85 : 1,
                },
              ]}
            >
              <Icon
                name={selected ? 'star' : 'star-outline'}
                size={22}
                color={selected ? colors.onPrimary : colors.primary}
              />
              <AppText variant="label" color={selected ? 'onPrimary' : 'primary'}>
                {star}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <AppText variant="secondary" color={value > 0 ? 'primary' : 'textMuted'}>
        {value > 0
          ? `Calificación seleccionada: ${value} de 5 estrellas`
          : 'Toca una estrella para asignar tu puntuación'}
      </AppText>

      {hasError ? (
        <View style={styles.errorRow} accessible>
          <Icon name="alert-circle" size={18} color={colors.error} />
          <AppText variant="secondary" color="error" style={styles.errorText}>
            {error}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TOUCH_GAP,
  },
  starButton: {
    minWidth: TOUCH_MIN,
    minHeight: TOUCH_MIN,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  errorText: {
    flexShrink: 1,
  },
});
