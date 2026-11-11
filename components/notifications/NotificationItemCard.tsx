import { memo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Icon, type IconName } from '@/components/ui/Icon';
import { formatDeparture } from '@/lib/format';
import { radius, spacing, TOUCH_MIN } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';
import type { Notificacion } from '@/types/database';

function iconForType(tipo: Notificacion['tipo']): IconName {
  switch (tipo) {
    case 'nueva_reserva':
      return 'account-clock';
    case 'reserva_aceptada':
      return 'check-circle';
    case 'reserva_rechazada':
      return 'close-circle';
    case 'viaje_iniciado':
      return 'car';
    case 'viaje_finalizado':
      return 'star-circle';
    case 'viaje_cancelado':
      return 'cancel';
    case 'mensaje_nuevo':
      return 'chat';
    default:
      return 'bell';
  }
}

export type NotificationItemCardProps = {
  notification: Notificacion;
  onPress: (notification: Notificacion) => void;
};

/**
 * Tarjeta accesible de notificación (E7, S-01, S-02, V-05, T-01):
 * agrupa estado (Leída / No leída), título, cuerpo y fecha en un único foco
 * interactivo y distingue notificaciones nuevas mediante borde grueso, ícono y etiqueta "Nueva".
 */
export const NotificationItemCard = memo(function NotificationItemCard({
  notification,
  onPress,
}: NotificationItemCardProps) {
  const { colors, borders } = useTheme();
  const [focused, setFocused] = useState(false);

  const unread = !notification.leida;
  const dateText = formatDeparture(notification.created_at);
  const statusLabel = unread ? 'No leída' : 'Leída';
  const accessibilityLabel = [statusLabel, notification.titulo, notification.cuerpo, dateText].join(
    '. ',
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress(notification)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: focused ? colors.focus : unread ? colors.primary : colors.border,
          borderWidth: focused || unread ? borders.focus : borders.thin,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Icon name={iconForType(notification.tipo)} size={20} color={colors.primary} />
          <AppText variant="subtitle" color="text" style={styles.title}>
            {notification.titulo}
          </AppText>
        </View>
        <View
          style={[styles.badge, { backgroundColor: unread ? colors.primary : colors.titleBand }]}
        >
          <AppText variant="label" color={unread ? 'onPrimary' : 'text'}>
            {unread ? 'Nueva' : 'Leída'}
          </AppText>
        </View>
      </View>

      <AppText variant="body" color="text">
        {notification.cuerpo}
      </AppText>

      <AppText variant="secondary" color="textMuted">
        {dateText}
      </AppText>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    minHeight: TOUCH_MIN,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  title: {
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
});
