import { StyleSheet, View } from 'react-native';

import { radius, spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';

type StepIndicatorProps = {
  current: number;
  total: number;
};

/**
 * "Paso x de y" del registro (T-08). El texto es lo que se lee; la barra es solo
 * visual y se oculta del lector para no anunciar el progreso dos veces.
 */
export function StepIndicator({ current, total }: StepIndicatorProps) {
  const { colors } = useTheme();
  const text = `Paso ${current} de ${total}`;
  return (
    <View style={styles.container}>
      <AppText variant="secondary">{text}</AppText>
      <View
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={[styles.track, { backgroundColor: colors.titleBand, borderColor: colors.border }]}
      >
        <View
          style={[
            styles.fill,
            { width: `${(current / total) * 100}%`, backgroundColor: colors.primary },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    alignItems: 'center',
  },
  track: {
    alignSelf: 'stretch',
    height: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
