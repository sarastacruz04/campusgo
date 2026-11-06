import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAnnounce } from '@/hooks/useAnnounce';
import { spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';

type LoadingStateProps = {
  /** Qué se está cargando, en texto: "Cargando viajes…" (T-05). */
  message: string;
};

/**
 * Estado de carga: indicador + texto visible, un solo foco con estado busy. El
 * mensaje se anuncia al aparecer, sin mover el foco (S-07, T-05, D-27).
 */
export function LoadingState({ message }: LoadingStateProps) {
  const { colors } = useTheme();
  const announce = useAnnounce();

  useEffect(() => {
    announce(message);
  }, [message, announce]);

  return (
    <View
      accessible
      accessibilityLabel={message}
      accessibilityState={{ busy: true }}
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
