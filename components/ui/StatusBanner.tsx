import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAnnounce } from '@/hooks/useAnnounce';
import { useHaptics } from '@/hooks/useHaptics';
import type { ColorTokens } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

export type BannerTone = 'error' | 'success' | 'info' | 'offline';

type StatusBannerProps = {
  tone: BannerTone;
  message: string;
  /** Si se pasa, muestra el botón "Reintentar" (T-05). */
  onRetry?: () => void;
  /** Vibra al aparecer en errores y éxitos (T-04). Por defecto, sí. */
  haptic?: boolean;
};

const TONES: Record<BannerTone, { icon: IconName; color: keyof ColorTokens }> = {
  error: { icon: 'alert-circle', color: 'error' },
  success: { icon: 'check-circle', color: 'success' },
  info: { icon: 'information', color: 'text' },
  offline: { icon: 'wifi-off', color: 'text' },
};

/**
 * Mensaje de estado con ícono + texto + borde (V-05: no depende solo del color).
 * Se anuncia sin mover el foco con useAnnounce, en Android y en iOS (S-07, D-27).
 * Ejemplos: "Sin conexión: mostrando datos guardados", "No se pudo cargar. Reintentar".
 */
export function StatusBanner({ tone, message, onRetry, haptic = true }: StatusBannerProps) {
  const { colors, borders } = useTheme();
  const announce = useAnnounce();
  const haptics = useHaptics();
  const { icon, color } = TONES[tone];

  useEffect(() => {
    announce(message);
    if (!haptic) return;
    if (tone === 'error') haptics.error();
    if (tone === 'success') haptics.success();
  }, [message, tone, haptic, announce, haptics]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors[color], borderWidth: borders.focus },
      ]}
    >
      <View accessible accessibilityLabel={message} style={styles.messageRow}>
        <Icon name={icon} size={24} color={colors[color]} />
        <AppText color={color} style={styles.message}>
          {message}
        </AppText>
      </View>
      {onRetry ? <Button label="Reintentar" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  message: {
    flex: 1,
  },
});
