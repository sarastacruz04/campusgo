import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';

import { ConnectionBanner } from '@/components/ConnectionBanner';
import { ModeSwitchDialogs } from '@/components/ModeSwitchDialogs';
import { CreatedTripCard } from '@/components/trips/CreatedTripCard';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Icon } from '@/components/ui/Icon';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { selectRequestCountsByTrip } from '@/features/reservations/selectors';
import { fetchRequestsForMyTrips } from '@/features/reservations/thunks';
import { selectCreatedState, selectCreatedTrips } from '@/features/trips/selectors';
import { changeTripState, fetchMyCreatedTrips } from '@/features/trips/thunks';
import { useAnnounce } from '@/hooks/useAnnounce';
import { useFocusCounter } from '@/hooks/useFocusCounter';
import { useHaptics } from '@/hooks/useHaptics';
import { useModeSwitch } from '@/hooks/useModeSwitch';
import { toAppError, type AppError } from '@/services/errors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';
import type { TripListItem } from '@/types/domain';

const keyExtractor = (item: TripListItem) => item.id;

// Fuera del componente: son la misma función en cada render (callbacks estables).
const openRequests = () => router.push('/requests');
const openRate = (tripId: string) => router.push(`/trip/${tripId}/rate`);
const openChat = (tripId: string) => router.push(`/trip/${tripId}/chat`);

/**
 * Pestaña "Creados" (pantalla 19): lista de viajes publicados por el conductor,
 * con acciones para iniciar, cancelar y ver solicitudes asociadas.
 */
export default function CreadosTab() {
  const dispatch = useAppDispatch();
  const announce = useAnnounce();
  const haptics = useHaptics();
  const { colors } = useTheme();
  const modeSwitch = useModeSwitch();
  const focusKey = useFocusCounter();

  const trips = useAppSelector(selectCreatedTrips);
  const tripsState = useAppSelector(selectCreatedState);
  const requestCounts = useAppSelector(selectRequestCountsByTrip);

  const [loadingTripAction, setLoadingTripAction] = useState<{
    tripId: string;
    action: 'start' | 'cancel' | 'finish';
  } | null>(null);
  const [cancelModalTripId, setCancelModalTripId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<AppError | null>(null);

  const load = useCallback(() => {
    dispatch(fetchMyCreatedTrips());
    dispatch(fetchRequestsForMyTrips());
  }, [dispatch]);
  useFocusEffect(load);

  const handleStartTrip = useCallback(
    async (tripId: string) => {
      setActionError(null);
      setLoadingTripAction({ tripId, action: 'start' });
      const result = await dispatch(changeTripState({ tripId, action: 'iniciar' }));
      setLoadingTripAction(null);

      if (changeTripState.fulfilled.match(result)) {
        haptics.success();
        announce('Viaje iniciado con éxito');
        dispatch(fetchMyCreatedTrips());
      } else {
        haptics.error();
        setActionError(toAppError(result.payload));
      }
    },
    [dispatch, haptics, announce],
  );

  const handleConfirmCancelTrip = useCallback(async () => {
    if (!cancelModalTripId) return;
    const tripId = cancelModalTripId;
    setCancelModalTripId(null);
    setActionError(null);
    setLoadingTripAction({ tripId, action: 'cancel' });

    const result = await dispatch(changeTripState({ tripId, action: 'cancelar' }));
    setLoadingTripAction(null);

    if (changeTripState.fulfilled.match(result)) {
      haptics.warning();
      announce('Viaje cancelado');
      dispatch(fetchMyCreatedTrips());
    } else {
      haptics.error();
      setActionError(toAppError(result.payload));
    }
  }, [cancelModalTripId, dispatch, haptics, announce]);

  // Las props de la tarjeta son números y funciones estables, para que React.memo
  // de CreatedTripCard no la vuelva a dibujar si su viaje no cambió (E8, rendimiento).
  const renderItem = useCallback<ListRenderItem<TripListItem>>(
    ({ item }) => {
      const counts = requestCounts[item.id];
      const isTripLoading = loadingTripAction?.tripId === item.id ? loadingTripAction.action : null;

      return (
        <CreatedTripCard
          trip={item}
          pendingRequestsCount={counts?.pendientes ?? 0}
          acceptedReservationsCount={counts?.aceptadas ?? 0}
          onStartTrip={handleStartTrip}
          onCancelTrip={setCancelModalTripId}
          onViewRequests={openRequests}
          onRateTrip={openRate}
          onOpenChat={openChat}
          loadingAction={isTripLoading}
        />
      );
    },
    [handleStartTrip, loadingTripAction, requestCounts],
  );

  const firstLoad = tripsState.status === 'loading' && trips.length === 0;

  return (
    <ScreenLayout
      title="Viajes creados"
      titleFocusKey={focusKey}
      mode={modeSwitch.mode}
      onChangeMode={modeSwitch.requestModeChange}
      onPressProfile={() => router.push('/profile')}
      scrollable={false}
    >
      <FlatList
        data={trips}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        // Mismos valores que la lista de Inicio: pocas tarjetas al abrir y ventana corta.
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        ListHeaderComponent={
          <>
            <ConnectionBanner fromCache={tripsState.fromCache} cachedAt={tripsState.cachedAt} />
            {actionError ? <StatusBanner tone="error" message={actionError.message} /> : null}
            {tripsState.error ? (
              <StatusBanner tone="error" message={tripsState.error.message} onRetry={load} />
            ) : null}
          </>
        }
        ListHeaderComponentStyle={styles.header}
        ListEmptyComponent={
          firstLoad ? (
            <LoadingState message="Cargando tus viajes creados…" />
          ) : (
            <View style={[styles.empty, { backgroundColor: colors.surface }]}>
              <Icon name="car" size={48} color={colors.placeholder} />
              <AppText variant="subtitle" style={styles.centered}>
                No has publicado viajes
              </AppText>
              <AppText variant="secondary" style={[styles.centered, { color: colors.textMuted }]}>
                Crea tu primera ruta para compartirla con la comunidad universitaria.
              </AppText>
              <View style={styles.emptyAction}>
                <Button
                  label="Crea un viaje"
                  variant="primary"
                  accessibilityLabel="Crear un nuevo viaje"
                  onPress={() => router.push('/trip/create')}
                />
              </View>
            </View>
          )
        }
      />

      <ConfirmDialog
        visible={cancelModalTripId !== null}
        title="¿Deseas cancelar este viaje?"
        message="Esta acción cancelará el viaje y las reservas asociadas. No se puede deshacer."
        confirmLabel="Sí, cancelar viaje"
        cancelLabel="No, volver"
        tone="error"
        onConfirm={handleConfirmCancelTrip}
        onCancel={() => setCancelModalTripId(null)}
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
    marginBottom: spacing.xs,
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
  emptyAction: {
    marginTop: spacing.sm,
    width: '100%',
  },
});
