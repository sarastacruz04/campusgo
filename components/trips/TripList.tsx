import { router } from 'expo-router';
import { useCallback, useState, type ReactElement } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';

import { ConnectionBanner } from '@/components/ConnectionBanner';
import { AppText } from '@/components/ui/AppText';
import { LoadingState } from '@/components/ui/LoadingState';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { selectRatingAverages } from '@/features/ratings/selectors';
import { selectSearchState, selectSearchTrips } from '@/features/trips/selectors';
import { searchTrips } from '@/features/trips/thunks';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';
import type { TripListItem } from '@/types/domain';

import { TripCard } from './TripCard';

const keyExtractor = (trip: TripListItem) => trip.id;

/** Lista de viajes del inicio de pasajero, con sus estados y paginación (pantalla 10). */
export function TripList() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const trips = useAppSelector(selectSearchTrips);
  const search = useAppSelector(selectSearchState);
  const averages = useAppSelector(selectRatingAverages);
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    setRefreshing(true);
    await dispatch(searchTrips({ reset: true }));
    setRefreshing(false);
  }, [dispatch]);

  const openTrip = useCallback((tripId: string) => {
    router.push({ pathname: '/trip/[id]/reserve', params: { id: tripId } });
  }, []);

  // Estable: la condición del thunk ya evita pedir otra página si está cargando o no hay más.
  const loadMore = useCallback(() => {
    dispatch(searchTrips({ reset: false }));
  }, [dispatch]);

  const renderItem = useCallback<ListRenderItem<TripListItem>>(
    ({ item }) => {
      const rating = averages[item.conductor_id];
      return (
        <TripCard
          trip={item}
          ratingAverage={rating?.promedio ?? null}
          ratingTotal={rating?.total ?? 0}
          onPress={openTrip}
        />
      );
    },
    [averages, openTrip],
  );

  const loading = search.status === 'loading';
  const firstLoad = loading && trips.length === 0;

  let emptyState: ReactElement | undefined;
  if (firstLoad) {
    emptyState = <LoadingState message="Cargando viajes…" />;
  } else if (search.status === 'succeeded') {
    emptyState = (
      <View style={[styles.empty, { backgroundColor: colors.surface }]}>
        <AppText style={styles.centered}>
          No hay viajes disponibles con estos filtros. Prueba con otro sector o menos puestos.
        </AppText>
      </View>
    );
  }

  return (
    <FlatList
      data={trips}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      // Rendimiento en listas largas (sección 4): pocos elementos iniciales y ventana corta.
      initialNumToRender={6}
      maxToRenderPerBatch={8}
      windowSize={7}
      onEndReachedThreshold={0.5}
      onEndReached={loadMore}
      refreshing={refreshing}
      onRefresh={reload}
      ListHeaderComponent={
        <>
          <ConnectionBanner fromCache={search.fromCache} cachedAt={search.cachedAt} />
          {search.error ? (
            <StatusBanner tone="error" message={search.error.message} onRetry={reload} />
          ) : null}
        </>
      }
      ListHeaderComponentStyle={styles.header}
      ListEmptyComponent={emptyState}
      ListFooterComponent={
        loading && trips.length > 0 ? <LoadingState message="Cargando más viajes…" /> : undefined
      }
    />
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
