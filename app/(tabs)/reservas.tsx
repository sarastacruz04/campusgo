import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState, type ReactElement, type RefObject } from 'react';
import { FlatList, StyleSheet, View, type HostInstance, type ListRenderItem } from 'react-native';

import { ConnectionBanner } from '@/components/ConnectionBanner';
import { ModeSwitchDialogs } from '@/components/ModeSwitchDialogs';
import { ReservationCard } from '@/components/trips/ReservationCard';
import { AppText } from '@/components/ui/AppText';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { InnerTabs, type InnerTab } from '@/components/ui/InnerTabs';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { selectRatingAverages } from '@/features/ratings/selectors';
import {
  makeSelectMyReservationsByEstado,
  selectMyReservations,
  selectMyReservationsState,
  selectReservationMutation,
} from '@/features/reservations/selectors';
import { changeReservationState, fetchMyReservations } from '@/features/reservations/thunks';
import { useAnnounce } from '@/hooks/useAnnounce';
import { useFocusCounter } from '@/hooks/useFocusCounter';
import { useHaptics } from '@/hooks/useHaptics';
import { useModeSwitch } from '@/hooks/useModeSwitch';
import type { AppError } from '@/services/errors';
import { toAppError } from '@/services/errors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';
import type { ReservationItem } from '@/types/domain';

type TabKey = 'pendiente' | 'aceptada' | 'rechazada';

const TABS: InnerTab<TabKey>[] = [
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'aceptada', label: 'Aceptados' },
  { key: 'rechazada', label: 'Rechazados' },
];

const EMPTY_TEXT: Record<TabKey, string> = {
  pendiente: 'No tienes reservas pendientes. Busca un viaje en Inicio.',
  aceptada: 'Todavía no te han aceptado ninguna reserva.',
  rechazada: 'No tienes reservas rechazadas.',
};

const keyExtractor = (item: ReservationItem) => item.id;

const openChat = (tripId: string) => router.push(`/trip/${tripId}/chat`);

type CancelTarget = { id: string; button: RefObject<HostInstance | null> };

/** "Viajes reservados" (pantalla 13): reservas por estado y cancelación con confirmación. */
export default function ReservasTab() {
  const dispatch = useAppDispatch();
  const announce = useAnnounce();
  const haptics = useHaptics();
  const { colors } = useTheme();
  const modeSwitch = useModeSwitch();
  const focusKey = useFocusCounter();

  const [activeTab, setActiveTab] = useState<TabKey>('pendiente');
  const [cancelTarget, setCancelTarget] = useState<CancelTarget | null>(null);
  const [cancelError, setCancelError] = useState<AppError | null>(null);

  // useMemo: un selector memoizado por pestaña, que solo se recrea al cambiar de pestaña.
  const selectByTab = useMemo(() => makeSelectMyReservationsByEstado(activeTab), [activeTab]);
  const items = useAppSelector(selectByTab);
  const hasAny = useAppSelector(selectMyReservations).length > 0;
  const state = useAppSelector(selectMyReservationsState);
  const mutation = useAppSelector(selectReservationMutation);
  const averages = useAppSelector(selectRatingAverages);

  // Se recarga cada vez que se entra a la pestaña; los cambios en vivo llegan por Realtime.
  const load = useCallback(() => {
    dispatch(fetchMyReservations());
  }, [dispatch]);
  useFocusEffect(load);

  const requestCancel = useCallback(
    (id: string, button: RefObject<HostInstance | null>) => setCancelTarget({ id, button }),
    [],
  );

  const openRate = useCallback((viajeId: string) => {
    router.push(`/trip/${viajeId}/rate`);
  }, []);

  const renderItem = useCallback<ListRenderItem<ReservationItem>>(
    ({ item }) => {
      const rating = item.viaje ? averages[item.viaje.conductor_id] : undefined;
      return (
        <ReservationCard
          reservation={item}
          ratingAverage={rating?.promedio ?? null}
          ratingTotal={rating?.total ?? 0}
          // Una reserva rechazada ya no se puede cancelar (R7).
          onPressCancel={item.estado === 'rechazada' ? undefined : requestCancel}
          onPressRate={
            item.estado === 'aceptada' && item.viaje?.estado === 'finalizado' ? openRate : undefined
          }
          // El chat es solo para reservas aceptadas (R10).
          onPressChat={item.estado === 'aceptada' ? openChat : undefined}
        />
      );
    },
    [averages, requestCancel, openRate],
  );

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelError(null);
    try {
      await dispatch(
        changeReservationState({ reservationId: cancelTarget.id, action: 'cancelar' }),
      ).unwrap();
      haptics.success();
      announce('Reserva cancelada.');
    } catch (caught) {
      setCancelError(toAppError(caught));
    }
    setCancelTarget(null);
  };

  const firstLoad = state.status === 'loading' && !hasAny;
  let emptyState: ReactElement | undefined;
  if (firstLoad) {
    emptyState = <LoadingState message="Cargando tus reservas…" />;
  } else if (state.status === 'succeeded') {
    emptyState = (
      <View style={[styles.empty, { backgroundColor: colors.surface }]}>
        <AppText style={styles.centered}>{EMPTY_TEXT[activeTab]}</AppText>
      </View>
    );
  }

  return (
    <ScreenLayout
      title="Viajes reservados"
      titleFocusKey={focusKey}
      mode={modeSwitch.mode}
      onChangeMode={modeSwitch.requestModeChange}
      onPressProfile={() => router.push('/profile')}
      scrollable={false}
      bandContent={
        <InnerTabs
          accessibilityLabel="Estado de las reservas"
          tabs={TABS}
          activeKey={activeTab}
          onChange={setActiveTab}
        />
      }
    >
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        initialNumToRender={6}
        windowSize={7}
        ListHeaderComponent={
          <>
            <ConnectionBanner fromCache={state.fromCache} cachedAt={state.cachedAt} />
            {state.error ? (
              <StatusBanner tone="error" message={state.error.message} onRetry={load} />
            ) : null}
            {cancelError ? <StatusBanner tone="error" message={cancelError.message} /> : null}
          </>
        }
        ListHeaderComponentStyle={styles.header}
        ListEmptyComponent={emptyState}
      />

      <ConfirmDialog
        visible={cancelTarget !== null}
        title="¿Está seguro que desea cancelar esta reserva?"
        message="Esta acción no se puede deshacer."
        cancelLabel="No, volver"
        confirmLabel="Sí, cancelar reserva"
        loading={mutation.status === 'loading'}
        returnFocusRef={cancelTarget?.button}
        onCancel={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
      />
      <ModeSwitchDialogs modeSwitch={modeSwitch} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.md,
  },
  empty: {
    borderRadius: radius.card,
    padding: spacing.xl,
  },
  centered: {
    textAlign: 'center',
  },
});
