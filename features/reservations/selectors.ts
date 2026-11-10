import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@/store/store';
import type { EstadoReserva } from '@/types/database';

import { reservationsAdapter } from './slice';

const adapterSelectors = reservationsAdapter.getSelectors((state: RootState) => state.reservations);

export const selectReservationById = adapterSelectors.selectById;
const selectReservationEntities = adapterSelectors.selectEntities;

export const selectMyReservationsState = (state: RootState) => state.reservations.mine;
export const selectRequestsState = (state: RootState) => state.reservations.requests;
export const selectReservationMutation = (state: RootState) => state.reservations.mutation;

export const selectMyReservations = createSelector(
  [(state: RootState) => state.reservations.myIds, selectReservationEntities],
  (ids, entities) => ids.map((id) => entities[id]).filter((item) => item !== undefined),
);

/**
 * Reservas propias de un estado (pestañas Pendientes, Aceptados y Rechazados).
 * Es una fábrica: cada pestaña crea su propio selector memoizado con useMemo.
 */
export const makeSelectMyReservationsByEstado = (estado: EstadoReserva) =>
  createSelector([selectMyReservations], (items) => items.filter((item) => item.estado === estado));

/** Reservas aceptadas de viajes ya iniciados (pestaña Curso del pasajero, pantalla 14). */
export const selectMyTripsInCourse = createSelector([selectMyReservations], (items) =>
  items.filter((item) => item.estado === 'aceptada' && item.viaje?.estado === 'en_curso'),
);

/** Solicitudes pendientes de responder (inicio de conductor y pantalla de solicitudes). */
export const selectPendingRequests = createSelector(
  [(state: RootState) => state.reservations.requestIds, selectReservationEntities],
  (ids, entities) =>
    ids
      .map((id) => entities[id])
      .filter((item) => item !== undefined && item.estado === 'pendiente'),
);

/** Todas las solicitudes recibidas en viajes del conductor. */
export const selectAllRequests = createSelector(
  [(state: RootState) => state.reservations.requestIds, selectReservationEntities],
  (ids, entities) => ids.map((id) => entities[id]).filter((item) => item !== undefined),
);

/** Fábrica de selector de solicitudes por estado (para filtrar en pantalla de solicitudes). */
export const makeSelectRequestsByEstado = (estado: EstadoReserva) =>
  createSelector([selectAllRequests], (items) => items.filter((item) => item.estado === estado));
