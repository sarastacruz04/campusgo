import { loadWithCache } from '@/db/cache';
import { fetchRatingAverages } from '@/features/ratings/thunks';
import { ERRORS, toAppError } from '@/services/errors';
import * as tripService from '@/services/tripService';
import { createAppAsyncThunk } from '@/store/createAppAsyncThunk';
import type { CreateTripInput, TripListItem } from '@/types/domain';

export const fetchSectores = createAppAsyncThunk(
  'trips/fetchSectores',
  async (_: void, { rejectWithValue }) => {
    try {
      return await tripService.listSectores();
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);

type SearchArgs = { reset: boolean };

/**
 * Busca viajes abiertos con los filtros actuales (pantalla 10).
 * - reset: true trae la primera página (al entrar o al cambiar un filtro).
 * - reset: false trae la siguiente (onEndReached de la FlatList).
 * La primera página usa caché sin conexión; las demás necesitan red.
 * Respuestas obsoletas: si llega la respuesta de una búsqueda vieja después de una
 * nueva, el reducer la ignora comparando el requestId (ver slice.ts).
 */
export const searchTrips = createAppAsyncThunk(
  'trips/search',
  async ({ reset }: SearchArgs, { getState, dispatch, rejectWithValue }) => {
    const { auth, settings, trips } = getState();
    if (!auth.userId) return rejectWithValue(ERRORS.sinSesion);
    const userId = auth.userId;
    const offset = reset ? 0 : trips.search.nextOffset;
    const fetcher = () =>
      tripService.searchOpenTrips({
        ...trips.filters,
        offset,
        excludeConductorId: userId,
      });

    try {
      const result =
        offset === 0
          ? await loadWithCache<TripListItem[]>({
              userId,
              key: 'viajes_busqueda',
              isOnline: settings.isOnline,
              fetcher,
            })
          : { data: await fetcher(), fromCache: false, cachedAt: Date.now() };

      // Los promedios de los conductores se piden aparte; si fallan, la lista igual se ve.
      if (!result.fromCache && result.data.length > 0) {
        dispatch(fetchRatingAverages(result.data.map((trip) => trip.conductor_id)));
      }
      return { ...result, offset };
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
  {
    // No pide la página siguiente si ya está cargando o si no hay más.
    condition: ({ reset }, { getState }) => {
      const { search } = getState().trips;
      if (reset) return true;
      return search.status !== 'loading' && search.hasMore;
    },
  },
);

/** Viajes que creó el conductor (pantalla 19), con caché. */
export const fetchMyCreatedTrips = createAppAsyncThunk(
  'trips/fetchMyCreated',
  async (_: void, { getState, rejectWithValue }) => {
    const { auth, settings } = getState();
    if (!auth.userId) return rejectWithValue(ERRORS.sinSesion);
    const userId = auth.userId;
    try {
      return await loadWithCache<TripListItem[]>({
        userId,
        key: 'viajes_creados',
        isOnline: settings.isOnline,
        fetcher: () => tripService.listMyCreatedTrips(userId),
      });
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);

/** Trae un viaje (por ejemplo, para la pantalla de reserva o después de un cambio). */
export const fetchTrip = createAppAsyncThunk(
  'trips/fetchOne',
  async (tripId: string, { rejectWithValue }) => {
    try {
      return await tripService.getTrip(tripId);
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);

export type CreateTripArgs = Omit<CreateTripInput, 'conductorId'>;

/** Crea un viaje (pantalla 18, R4). */
export const createTrip = createAppAsyncThunk(
  'trips/create',
  async (input: CreateTripArgs, { getState, rejectWithValue }) => {
    const conductorId = getState().auth.userId;
    if (!conductorId) return rejectWithValue(ERRORS.sinSesion);
    try {
      return await tripService.createTrip({ ...input, conductorId });
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);

type TripAction = 'iniciar' | 'finalizar' | 'cancelar';

const TRIP_ACTIONS: Record<TripAction, (tripId: string) => Promise<void>> = {
  iniciar: tripService.startTrip,
  finalizar: tripService.finishTrip,
  cancelar: tripService.cancelTrip,
};

/** Inicia, finaliza o cancela un viaje (R8) y devuelve el viaje actualizado. */
export const changeTripState = createAppAsyncThunk(
  'trips/changeState',
  async ({ tripId, action }: { tripId: string; action: TripAction }, { rejectWithValue }) => {
    try {
      await TRIP_ACTIONS[action](tripId);
      return await tripService.getTrip(tripId);
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);
