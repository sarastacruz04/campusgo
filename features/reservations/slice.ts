import { createEntityAdapter, createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';

import { sessionCleared } from '@/features/auth/actions';
import { tripChanged } from '@/features/trips/slice';
import { initialCacheInfo, initialRequest, type CacheInfo, type RequestState } from '@/store/types';
import type { Reserva } from '@/types/database';
import type { ReservationItem } from '@/types/domain';

import {
  changeReservationState,
  createReservation,
  fetchMyReservations,
  fetchRequestsForMyTrips,
} from './thunks';

// Reservas normalizadas, más recientes primero.
export const reservationsAdapter = createEntityAdapter<ReservationItem>({
  sortComparer: (a, b) => b.created_at.localeCompare(a.created_at),
});

export type ReservationsState = ReturnType<typeof reservationsAdapter.getInitialState> & {
  /** Reservas que hizo esta persona como pasajera. */
  myIds: string[];
  /** Solicitudes que recibió como conductora. */
  requestIds: string[];
  mine: RequestState & CacheInfo;
  requests: RequestState;
  mutation: RequestState;
};

export const initialReservationsState: ReservationsState = reservationsAdapter.getInitialState({
  myIds: [],
  requestIds: [],
  mine: { ...initialRequest, ...initialCacheInfo },
  requests: initialRequest,
  mutation: initialRequest,
});

const reservationsSlice = createSlice({
  name: 'reservations',
  initialState: initialReservationsState,
  reducers: {
    /** Cambio de estado recibido por Realtime (por ejemplo, el conductor aceptó). */
    reservationChanged(state, action: PayloadAction<Reserva>) {
      const reserva = action.payload;
      if (!state.entities[reserva.id]) return;
      reservationsAdapter.updateOne(state, { id: reserva.id, changes: reserva });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sessionCleared, () => initialReservationsState)

      // La reserva guarda una copia de su viaje: cuando el viaje cambia por Realtime
      // (cupos o inicio del viaje), la copia se actualiza para que la tarjeta y la
      // pestaña Curso lo reflejen sin recargar.
      .addCase(tripChanged, (state, action) => {
        for (const id of state.ids) {
          const item = state.entities[id];
          if (item?.viaje?.id === action.payload.id) {
            item.viaje = { ...item.viaje, ...action.payload };
          }
        }
      })

      .addCase(fetchMyReservations.pending, (state) => {
        state.mine.status = 'loading';
        state.mine.error = null;
      })
      .addCase(fetchMyReservations.fulfilled, (state, action) => {
        reservationsAdapter.upsertMany(state, action.payload.data);
        state.myIds = action.payload.data.map((item) => item.id);
        state.mine = {
          status: 'succeeded',
          error: null,
          fromCache: action.payload.fromCache,
          cachedAt: action.payload.cachedAt,
        };
      })
      .addCase(fetchMyReservations.rejected, (state, action) => {
        state.mine.status = 'failed';
        state.mine.error = action.payload ?? null;
      })

      .addCase(fetchRequestsForMyTrips.pending, (state) => {
        state.requests = { status: 'loading', error: null };
      })
      .addCase(fetchRequestsForMyTrips.fulfilled, (state, action) => {
        reservationsAdapter.upsertMany(state, action.payload);
        state.requestIds = action.payload.map((item) => item.id);
        state.requests = { status: 'succeeded', error: null };
      })
      .addCase(fetchRequestsForMyTrips.rejected, (state, action) => {
        state.requests = { status: 'failed', error: action.payload ?? null };
      })

      .addCase(createReservation.fulfilled, (state, action) => {
        reservationsAdapter.upsertOne(state, action.payload);
        state.myIds = [action.payload.id, ...state.myIds.filter((id) => id !== action.payload.id)];
      })
      .addCase(changeReservationState.fulfilled, (state, action) => {
        reservationsAdapter.upsertOne(state, action.payload);
      });

    // Reservar y cambiar el estado de una reserva comparten el estado "mutation".
    builder
      .addMatcher(isAnyOf(createReservation.pending, changeReservationState.pending), (state) => {
        state.mutation = { status: 'loading', error: null };
      })
      .addMatcher(
        isAnyOf(createReservation.fulfilled, changeReservationState.fulfilled),
        (state) => {
          state.mutation = { status: 'succeeded', error: null };
        },
      )
      .addMatcher(
        isAnyOf(createReservation.rejected, changeReservationState.rejected),
        (state, action) => {
          state.mutation = { status: 'failed', error: action.payload ?? null };
        },
      );
  },
});

export const { reservationChanged } = reservationsSlice.actions;
export default reservationsSlice.reducer;
