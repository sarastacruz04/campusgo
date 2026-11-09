import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';

import { ConnectionBanner } from '@/components/ConnectionBanner';
import { ModeSwitchDialogs } from '@/components/ModeSwitchDialogs';
import { ReservationCard } from '@/components/trips/ReservationCard';
import { AppText } from '@/components/ui/AppText';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { selectRatingAverages } from '@/features/ratings/selectors';
import {
  selectMyReservationsState,
  selectMyTripsInCourse,
} from '@/features/reservations/selectors';
import { fetchMyReservations } from '@/features/reservations/thunks';
import { useFocusCounter } from '@/hooks/useFocusCounter';
import { useModeSwitch } from '@/hooks/useModeSwitch';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';
import type { ReservationItem } from '@/types/domain';

const keyExtractor = (item: ReservationItem) => item.id;

/**
 * "Viajes en curso" (pantalla 14). El pasajero ve sus reservas aceptadas de viajes
 * iniciados; el botón del chat llega con esa pantalla (Etapa 7) y la lista del
 * conductor con su flujo (Etapa 6).
 */
export default function CursoTab() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const modeSwitch = useModeSwitch();
  const focusKey = useFocusCounter();
  const isPassenger = modeSwitch.mode === 'pasajero';

  const items = useAppSelector(selectMyTripsInCourse);
  const state = useAppSelector(selectMyReservationsState);
  const averages = useAppSelector(selectRatingAverages);

  const load = useCallback(() => {
    if (isPassenger) dispatch(fetchMyReservations());
  }, [dispatch, isPassenger]);
  useFocusEffect(load);

  const renderItem = useCallback<ListRenderItem<ReservationItem>>(
    ({ item }) => {
      const rating = item.viaje ? averages[item.viaje.conductor_id] : undefined;
      return (
        <ReservationCard
          reservation={item}
          ratingAverage={rating?.promedio ?? null}
          ratingTotal={rating?.total ?? 0}
        />
      );
    },
    [averages],
  );

  const passengerItems = isPassenger ? items : [];
  const firstLoad = isPassenger && state.status === 'loading' && items.length === 0;

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
        data={passengerItems}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          isPassenger ? (
            <>
              <ConnectionBanner fromCache={state.fromCache} cachedAt={state.cachedAt} />
              {state.error ? (
                <StatusBanner tone="error" message={state.error.message} onRetry={load} />
              ) : null}
            </>
          ) : undefined
        }
        ListHeaderComponentStyle={styles.header}
        ListEmptyComponent={
          firstLoad ? (
            <LoadingState message="Cargando tus viajes…" />
          ) : (
            <View style={[styles.empty, { backgroundColor: colors.surface }]}>
              <AppText variant="subtitle" style={styles.centered}>
                No tienes viajes en curso
              </AppText>
              <AppText style={styles.centered}>
                Cuando un conductor inicie un viaje en el que tengas una reserva aceptada, aparecerá
                aquí.
              </AppText>
            </View>
          )
        }
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
