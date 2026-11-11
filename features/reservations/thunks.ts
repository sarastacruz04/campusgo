import { loadWithCache } from '@/db/cache';
import { fetchRatingAverages } from '@/features/ratings/thunks';
import { ERRORS, toAppError } from '@/services/errors';
import * as reservationService from '@/services/reservationService';
import { createAppAsyncThunk } from '@/store/createAppAsyncThunk';
import type { ReservationItem } from '@/types/domain';

/** Reservas del pasajero (pantalla 13), con caché sin conexión. */
export const fetchMyReservations = createAppAsyncThunk(
  'reservations/fetchMine',
  async (_: void, { getState, dispatch, rejectWithValue }) => {
    const { auth, settings } = getState();
    if (!auth.userId) return rejectWithValue(ERRORS.sinSesion);
    const userId = auth.userId;
    try {
      const result = await loadWithCache<ReservationItem[]>({
        userId,
        key: 'reservas',
        isOnline: settings.isOnline,
        fetcher: () => reservationService.listMyReservations(userId),
      });
      if (!result.fromCache && result.data.length > 0) {
        const conductorIds = result.data
          .map((item) => item.viaje?.conductor_id)
          .filter((id): id is string => Boolean(id));
        if (conductorIds.length > 0) {
          dispatch(fetchRatingAverages(conductorIds));
        }
      }
      return result;
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);

/** Solicitudes recibidas en los viajes del conductor (pantalla de solicitudes). */
export const fetchRequestsForMyTrips = createAppAsyncThunk(
  'reservations/fetchRequests',
  async (_: void, { getState, rejectWithValue }) => {
    const userId = getState().auth.userId;
    if (!userId) return rejectWithValue(ERRORS.sinSesion);
    try {
      return await reservationService.listRequestsForMyTrips(userId);
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);

/** Reserva un viaje (pantalla 11, R5). */
export const createReservation = createAppAsyncThunk(
  'reservations/create',
  async (input: reservationService.CreateReservationInput, { rejectWithValue }) => {
    try {
      return await reservationService.createReservation(input);
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);

type ReservationAction = 'aceptar' | 'rechazar' | 'cancelar';

const RESERVATION_ACTIONS: Record<ReservationAction, (id: string) => Promise<void>> = {
  aceptar: reservationService.acceptReservation,
  rechazar: reservationService.rejectReservation,
  cancelar: reservationService.cancelReservation,
};

/**
 * Acepta o rechaza (conductor, R6) o cancela (pasajero, R7) una reserva y devuelve
 * la reserva actualizada. Los cupos del viaje cambian en la base y llegan por Realtime.
 */
export const changeReservationState = createAppAsyncThunk(
  'reservations/changeState',
  async (
    { reservationId, action }: { reservationId: string; action: ReservationAction },
    { rejectWithValue },
  ) => {
    try {
      await RESERVATION_ACTIONS[action](reservationId);
      return await reservationService.getReservation(reservationId);
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);
