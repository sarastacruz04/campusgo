import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';

import { ConnectionBanner } from '@/components/ConnectionBanner';
import { ModeSwitchDialogs } from '@/components/ModeSwitchDialogs';
import { CreatedTripCard } from '@/components/trips/CreatedTripCard';
import { ReservationCard } from '@/components/trips/ReservationCard';
import { AppText } from '@/components/ui/AppText';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { selectRatingAverages } from '@/features/ratings/selectors';
import {
  selectRequestCountsByTrip,
  selectMyReservationsState,
  selectMyTripsInCourse,
} from '@/features/reservations/selectors';
import { fetchMyReservations, fetchRequestsForMyTrips } from '@/features/reservations/thunks';
import { selectCreatedState, selectMyTripsInProgress } from '@/features/trips/selectors';
import { changeTripState, fetchMyCreatedTrips } from '@/features/trips/thunks';
import { useAnnounce } from '@/hooks/useAnnounce';
import { useFocusCounter } from '@/hooks/useFocusCounter';
import { useHaptics } from '@/hooks/useHaptics';
import { useModeSwitch } from '@/hooks/useModeSwitch';
import { toAppError, type AppError } from '@/services/errors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';
import type { ReservationItem, TripListItem } from '@/types/domain';

type CursoItem =
  { type: 'passenger'; data: ReservationItem } | { type: 'driver'; data: TripListItem };

const keyExtractor = (item: CursoItem) => item.data.id;

const openChat = (tripId: string) => router.push(`/trip/${tripId}/chat`);

/**
 * "Viajes en curso" (pantalla 14).
 * - Pasajero: ve sus reservas aceptadas de viajes iniciados, con acceso al chat.
 * - Conductor: ve sus viajes en curso con el botón "Finalizar viaje" (confirmación modal).
 */
export default function CursoTab() {
  const dispatch = useAppDispatch();
  const announce = useAnnounce();
  const haptics = useHaptics();
  const { colors } = useTheme();
  const modeSwitch = useModeSwitch();
  const focusKey = useFocusCounter();
  const isPassenger = modeSwitch.mode === 'pasajero';

  // Datos para pasajero
  const passengerReservations = useAppSelector(selectMyTripsInCourse);
  const reservationsState = useAppSelector(selectMyReservationsState);
  const averages = useAppSelector(selectRatingAverages);

  // Datos para conductor
  const driverTripsInProgress = useAppSelector(selectMyTripsInProgress);
  const createdTripsState = useAppSelector(selectCreatedState);
  const requestCounts = useAppSelector(selectRequestCountsByTrip);

  // Estados de mutación del conductor
  const [finishModalTripId, setFinishModalTripId] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [actionError, setActionError] = useState<AppError | null>(null);

  const load = useCallback(() => {
    if (isPassenger) {
      dispatch(fetchMyReservations());
    } else {
      dispatch(fetchMyCreatedTrips());
      dispatch(fetchRequestsForMyTrips());
    }
  }, [dispatch, isPassenger]);
  useFocusEffect(load);

  const handleConfirmFinishTrip = useCallback(async () => {
    if (!finishModalTripId) return;
    const tripId = finishModalTripId;
    setFinishModalTripId(null);
    setActionError(null);
    setIsFinishing(true);

    const result = await dispatch(changeTripState({ tripId, action: 'finalizar' }));
    setIsFinishing(false);

    if (changeTripState.fulfilled.match(result)) {
      haptics.success();
      announce('Viaje finalizado con éxito');
      dispatch(fetchMyCreatedTrips());
    } else {
      haptics.error();
      setActionError(toAppError(result.payload));
    }
  }, [finishModalTripId, dispatch, haptics, announce]);

  const items: CursoItem[] = isPassenger
    ? passengerReservations.map((data) => ({ type: 'passenger' as const, data }))
    : driverTripsInProgress.map((data) => ({ type: 'driver' as const, data }));

  const currentState = isPassenger ? reservationsState : createdTripsState;
  const firstLoad = currentState.status === 'loading' && items.length === 0;

  const renderItem = useCallback<ListRenderItem<CursoItem>>(
    ({ item }) => {
      if (item.type === 'passenger') {
        const rating = item.data.viaje ? averages[item.data.viaje.conductor_id] : undefined;
        return (
          <ReservationCard
            reservation={item.data}
            ratingAverage={rating?.promedio ?? null}
            ratingTotal={rating?.total ?? 0}
            onPressChat={openChat}
          />
        );
      }

      const counts = requestCounts[item.data.id];
      return (
        <CreatedTripCard
          trip={item.data}
          pendingRequestsCount={counts?.pendientes ?? 0}
          acceptedReservationsCount={counts?.aceptadas ?? 0}
          onFinishTrip={setFinishModalTripId}
          onOpenChat={openChat}
          loadingAction={isFinishing ? 'finish' : null}
        />
      );
    },
    [averages, isFinishing, requestCounts],
  );

  return (
    <ScreenLayout
      title="Viajes en curso"
      titleFocusKey={focusKey}
      mode={modeSwitch.mode}
      onChangeMode={modeSwitch.requestModeChange}
      onPressProfile={() => router.push('/profile')}
      scrollable={false}
    >
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <ConnectionBanner fromCache={currentState.fromCache} cachedAt={currentState.cachedAt} />
            {actionError ? <StatusBanner tone="error" message={actionError.message} /> : null}
            {currentState.error ? (
              <StatusBanner tone="error" message={currentState.error.message} onRetry={load} />
            ) : null}
          </>
        }
        ListHeaderComponentStyle={styles.header}
        ListEmptyComponent={
          firstLoad ? (
            <LoadingState message="Cargando tus viajes en curso…" />
          ) : (
            <View style={[styles.empty, { backgroundColor: colors.surface }]}>
              <AppText variant="subtitle" style={styles.centered}>
                No tienes viajes en curso
              </AppText>
              <AppText style={styles.centered}>
                {isPassenger
                  ? 'Cuando un conductor inicie un viaje en el que tengas una reserva aceptada, aparecerá aquí.'
                  : 'Cuando inicies uno de tus viajes publicados aparecerá aquí para que puedas gestionarlo y finalizarlo.'}
              </AppText>
            </View>
          )
        }
      />

      <ConfirmDialog
        visible={finishModalTripId !== null}
        title="¿Deseas finalizar este viaje?"
        message="El viaje quedará completado y podrás calificar a los pasajeros."
        confirmLabel="Sí, finalizar viaje"
        cancelLabel="No, volver"
        tone="question"
        onConfirm={handleConfirmFinishTrip}
        onCancel={() => setFinishModalTripId(null)}
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
    gap: spacing.sm,
  },
  centered: {
    textAlign: 'center',
  },
});
