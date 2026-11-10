import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';

import { RequestCard } from '@/components/trips/RequestCard';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { InnerTabs, type InnerTab } from '@/components/ui/InnerTabs';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { makeSelectRequestsByEstado, selectRequestsState } from '@/features/reservations/selectors';
import { changeReservationState, fetchRequestsForMyTrips } from '@/features/reservations/thunks';
import { useAnnounce } from '@/hooks/useAnnounce';
import { useFocusCounter } from '@/hooks/useFocusCounter';
import { useHaptics } from '@/hooks/useHaptics';
import { toAppError, type AppError } from '@/services/errors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';
import type { EstadoReserva } from '@/types/database';
import type { ReservationItem } from '@/types/domain';

type TabKey = Extract<EstadoReserva, 'pendiente' | 'aceptada' | 'rechazada'>;

const TABS: InnerTab<TabKey>[] = [
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'aceptada', label: 'Aceptadas' },
  { key: 'rechazada', label: 'Rechazadas' },
];

const EMPTY_TEXT: Record<TabKey, string> = {
  pendiente: 'No tienes solicitudes pendientes de respuesta.',
  aceptada: 'No has aceptado solicitudes aún.',
  rechazada: 'No has rechazado solicitudes.',
};

const keyExtractor = (item: ReservationItem) => item.id;

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/(tabs)');
}

/** Pantalla de solicitudes de reserva para el conductor (pantallas 17 y 19). */
export default function RequestsScreen() {
  const dispatch = useAppDispatch();
  const announce = useAnnounce();
  const haptics = useHaptics();
  const { colors } = useTheme();
  const focusKey = useFocusCounter();

  const [activeTab, setActiveTab] = useState<TabKey>('pendiente');
  const [loadingAction, setLoadingAction] = useState<{
    id: string;
    action: 'accept' | 'reject';
  } | null>(null);
  const [actionError, setActionError] = useState<AppError | null>(null);

  const selectByTab = useMemo(() => makeSelectRequestsByEstado(activeTab), [activeTab]);
  const items = useAppSelector(selectByTab);
  const state = useAppSelector(selectRequestsState);

  const load = useCallback(() => {
    dispatch(fetchRequestsForMyTrips());
  }, [dispatch]);
  useFocusEffect(load);

  const handleAccept = useCallback(
    async (id: string) => {
      setActionError(null);
      setLoadingAction({ id, action: 'accept' });
      const result = await dispatch(
        changeReservationState({ reservationId: id, action: 'aceptar' }),
      );
      setLoadingAction(null);
      if (changeReservationState.fulfilled.match(result)) {
        haptics.success();
        announce('Reserva aceptada');
        dispatch(fetchRequestsForMyTrips());
      } else {
        haptics.error();
        setActionError(toAppError(result.payload));
      }
    },
    [dispatch, haptics, announce],
  );

  const handleReject = useCallback(
    async (id: string) => {
      setActionError(null);
      setLoadingAction({ id, action: 'reject' });
      const result = await dispatch(
        changeReservationState({ reservationId: id, action: 'rechazar' }),
      );
      setLoadingAction(null);
      if (changeReservationState.fulfilled.match(result)) {
        haptics.warning();
        announce('Reserva rechazada');
        dispatch(fetchRequestsForMyTrips());
      } else {
        haptics.error();
        setActionError(toAppError(result.payload));
      }
    },
    [dispatch, haptics, announce],
  );

  const renderItem = useCallback<ListRenderItem<ReservationItem>>(
    ({ item }) => {
      const isItemLoading = loadingAction?.id === item.id ? loadingAction.action : null;
      return (
        <RequestCard
          request={item}
          onAccept={handleAccept}
          onReject={handleReject}
          loadingAction={isItemLoading}
        />
      );
    },
    [handleAccept, handleReject, loadingAction],
  );

  const firstLoad = state.status === 'loading' && items.length === 0;

  return (
    <ScreenLayout
      title="Solicitudes de reserva"
      titleFocusKey={focusKey}
      onBack={goBack}
      onPressProfile={() => router.push('/profile')}
      scrollable={false}
      bandContent={
        <View style={styles.tabsContainer}>
          <InnerTabs
            tabs={TABS}
            activeKey={activeTab}
            onChange={setActiveTab}
            accessibilityLabel="Estado de las solicitudes"
          />
        </View>
      }
    >
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          actionError ? (
            <StatusBanner tone="error" message={actionError.message} />
          ) : state.error ? (
            <StatusBanner tone="error" message={state.error.message} onRetry={load} />
          ) : undefined
        }
        ListHeaderComponentStyle={styles.header}
        ListEmptyComponent={
          firstLoad ? (
            <LoadingState message="Cargando solicitudes…" />
          ) : (
            <View style={[styles.empty, { backgroundColor: colors.surface }]}>
              <Icon name="account" size={40} color={colors.placeholder} />
              <AppText variant="subtitle" style={styles.centered}>
                {EMPTY_TEXT[activeTab]}
              </AppText>
            </View>
          )
        }
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  empty: {
    borderRadius: radius.card,
    padding: spacing.xl,
    gap: spacing.sm,
    alignItems: 'center',
  },
  centered: {
    textAlign: 'center',
  },
});
