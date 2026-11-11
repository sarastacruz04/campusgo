import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';

import { NotificationItemCard } from '@/components/notifications/NotificationItemCard';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { StatusBanner } from '@/components/ui/StatusBanner';
import {
  selectNotifications,
  selectNotificationsLoad,
  selectUnreadCount,
} from '@/features/notifications/selectors';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/features/notifications/thunks';
import { useAnnounce } from '@/hooks/useAnnounce';
import { useFocusCounter } from '@/hooks/useFocusCounter';
import { useHaptics } from '@/hooks/useHaptics';
import { toAppError, type AppError } from '@/services/errors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';
import type { Notificacion } from '@/types/database';

const keyExtractor = (item: Notificacion) => item.id;

function destinationForNotification(notification: Notificacion): string | null {
  const datos =
    notification.datos &&
    typeof notification.datos === 'object' &&
    !Array.isArray(notification.datos)
      ? notification.datos
      : null;
  const rawTripId = datos?.viaje_id;
  const tripId = typeof rawTripId === 'string' && rawTripId.length > 0 ? rawTripId : null;

  switch (notification.tipo) {
    case 'viaje_finalizado':
      return tripId ? `/trip/${tripId}/rate` : null;
    case 'nueva_reserva':
      return '/requests';
    case 'reserva_aceptada':
    case 'reserva_rechazada':
    case 'viaje_cancelado':
      return '/(tabs)/reservas';
    case 'viaje_iniciado':
      return '/(tabs)/curso';
    case 'mensaje_nuevo':
      return tripId ? `/trip/${tripId}/chat` : null;
    default:
      return null;
  }
}

/**
 * Bandeja de notificaciones internas (pantalla 20, R11, E7):
 * lista cronológica (más recientes primero), indicador accesible de leída/no leída,
 * contador de pendientes, acción "Marcar todas como leídas" y navegación contextual.
 */
export default function NotificationsScreen() {
  const dispatch = useAppDispatch();
  const announce = useAnnounce();
  const haptics = useHaptics();
  const { colors } = useTheme();
  const focusKey = useFocusCounter();

  const notifications = useAppSelector(selectNotifications);
  const loadState = useAppSelector(selectNotificationsLoad);
  const unreadCount = useAppSelector(selectUnreadCount);

  const [markingAll, setMarkingAll] = useState(false);
  const [actionError, setActionError] = useState<AppError | null>(null);

  const load = useCallback(() => {
    setActionError(null);
    dispatch(fetchNotifications());
  }, [dispatch]);
  useFocusEffect(load);

  const handleMarkAllRead = useCallback(async () => {
    setActionError(null);
    setMarkingAll(true);
    const result = await dispatch(markAllNotificationsRead());
    setMarkingAll(false);

    if (markAllNotificationsRead.fulfilled.match(result)) {
      haptics.success();
      announce('Todas las notificaciones marcadas como leídas.');
    } else {
      haptics.error();
      setActionError(toAppError(result.payload));
    }
  }, [dispatch, haptics, announce]);

  const handlePressNotification = useCallback(
    async (item: Notificacion) => {
      setActionError(null);
      if (!item.leida) {
        const result = await dispatch(markNotificationRead(item.id));
        if (markNotificationRead.rejected.match(result)) {
          haptics.error();
          setActionError(toAppError(result.payload));
          return;
        }
        announce('Notificación marcada como leída.');
      }

      const route = destinationForNotification(item);
      if (route) {
        router.push(route as never);
      }
    },
    [dispatch, haptics, announce],
  );

  const renderItem = useCallback<ListRenderItem<Notificacion>>(
    ({ item }) => <NotificationItemCard notification={item} onPress={handlePressNotification} />,
    [handlePressNotification],
  );

  const firstLoad = loadState.status === 'loading' && notifications.length === 0;
  const refreshing = loadState.status === 'loading' && notifications.length > 0;

  return (
    <ScreenLayout
      title="Notificaciones"
      titleFocusKey={focusKey}
      onBack={() => router.back()}
      scrollable={false}
    >
      <FlatList
        data={notifications}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        initialNumToRender={12}
        windowSize={5}
        refreshing={refreshing}
        onRefresh={load}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            {loadState.error ? (
              <StatusBanner
                tone={loadState.error.code === 'sin_conexion' ? 'offline' : 'error'}
                message={loadState.error.message}
                onRetry={load}
              />
            ) : null}

            {actionError ? (
              <StatusBanner
                tone={actionError.code === 'sin_conexion' ? 'offline' : 'error'}
                message={actionError.message}
              />
            ) : null}

            {notifications.length > 0 ? (
              <View style={[styles.summaryBar, { backgroundColor: colors.surface }]}>
                <AppText variant="secondary" color="text" style={styles.summaryText}>
                  {unreadCount === 0
                    ? 'Todas las notificaciones están al día.'
                    : unreadCount === 1
                      ? 'Tienes 1 notificación sin leer'
                      : `Tienes ${unreadCount} notificaciones sin leer`}
                </AppText>
                {unreadCount > 0 ? (
                  <Button
                    label="Marcar todas como leídas"
                    variant="secondary"
                    loading={markingAll}
                    accessibilityLabel="Marcar todas las notificaciones como leídas"
                    onPress={handleMarkAllRead}
                  />
                ) : null}
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          firstLoad ? (
            <LoadingState message="Cargando notificaciones…" />
          ) : (
            <View style={[styles.empty, { backgroundColor: colors.surface }]}>
              <Icon name="bell-outline" size={48} color={colors.placeholder} />
              <AppText variant="subtitle" style={styles.centered}>
                No tienes notificaciones
              </AppText>
              <AppText variant="secondary" color="textMuted" style={styles.centered}>
                Cuando cambie el estado de tus viajes o reservas, te avisaremos aquí en tiempo real.
              </AppText>
            </View>
          )
        }
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  summaryBar: {
    borderRadius: radius.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  summaryText: {
    flexShrink: 1,
  },
  empty: {
    borderRadius: radius.card,
    padding: spacing.xl,
    gap: spacing.md,
    alignItems: 'center',
  },
  centered: {
    textAlign: 'center',
  },
});
