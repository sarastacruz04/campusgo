import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';

type LoadingStateProps = {
  /** Qué se está cargando, en texto: "Cargando viajes…" (T-05). */
  message: string;
};

/**
 * Estado de carga: indicador + texto visible, un solo foco con estado busy y región
 * viva para que el lector anuncie la carga sin mover el foco (S-07, T-05).
 */
export function LoadingState({ message }: LoadingStateProps) {
  const { colors } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={message}
      accessibilityState={{ busy: true }}
      accessibilityLiveRegion="polite"
      style={styles.container}
    >
      <ActivityIndicator size="large" color={colors.text} />
      <AppText>{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
});
