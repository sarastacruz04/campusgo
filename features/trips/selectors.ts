import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@/store/store';

import { tripsAdapter } from './slice';

// Selectores memoizados (createSelector): solo recalculan si cambian sus entradas,
// así una lista no se vuelve a crear (ni la FlatList a redibujarse) sin necesidad.

const adapterSelectors = tripsAdapter.getSelectors((state: RootState) => state.trips);

export const selectTripById = adapterSelectors.selectById;
const selectTripEntities = adapterSelectors.selectEntities;

export const selectSearchIds = (state: RootState) => state.trips.searchIds;
export const selectCreatedIds = (state: RootState) => state.trips.createdIds;
export const selectTripFilters = (state: RootState) => state.trips.filters;
export const selectSearchState = (state: RootState) => state.trips.search;
export const selectCreatedState = (state: RootState) => state.trips.created;
export const selectTripMutation = (state: RootState) => state.trips.mutation;
export const selectSectores = (state: RootState) => state.trips.sectores;

/** Viajes de la búsqueda, en orden, listos para la FlatList del inicio de pasajero. */
export const selectSearchTrips = createSelector(
  [selectSearchIds, selectTripEntities],
  (ids, entities) => ids.map((id) => entities[id]).filter((trip) => trip !== undefined),
);

/** Viajes creados por el conductor, en orden. */
export const selectCreatedTrips = createSelector(
  [selectCreatedIds, selectTripEntities],
  (ids, entities) => ids.map((id) => entities[id]).filter((trip) => trip !== undefined),
);

/** Viajes del conductor que están en curso (pestaña Curso, pantalla 14). */
export const selectMyTripsInProgress = createSelector([selectCreatedTrips], (trips) =>
  trips.filter((trip) => trip.estado === 'en_curso'),
);
