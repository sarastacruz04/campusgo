import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { radius, spacing, TOUCH_MIN } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';

type SwitchRowProps = {
  label: string;
  /** Explicación visible bajo la etiqueta (también se lee como pista). */
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

/**
 * Fila de ajuste con interruptor. Toda la fila es un solo foco con rol switch y
 * estado checked, para que el lector no anuncie la etiqueta y el Switch por separado
 * (sección 7.3: agrupar contenedores táctiles). El Switch nativo queda solo visual.
 */
export function SwitchRow({ label, description, value, onValueChange }: SwitchRowProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.titleBand }]}
    >
      <View style={styles.texts}>
        <AppText variant="label">{label}</AppText>
        {description ? (
          <AppText variant="secondary" color="textMuted">
            {description}
          </AppText>
        ) : null}
      </View>
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ true: colors.primary, false: colors.border }}
          thumbColor={colors.surface}
          ios_backgroundColor={colors.border}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: TOUCH_MIN,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.control,
  },
  texts: {
    flex: 1,
    gap: spacing.xs,
  },
});
