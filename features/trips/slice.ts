import { createEntityAdapter, createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';

import { sessionCleared } from '@/features/auth/actions';
import { TRIPS_PAGE_SIZE } from '@/services/tripService';
import {
  initialCacheInfo,
  initialRequest,
  type CacheInfo,
  type LoadStatus,
  type RequestState,
} from '@/store/types';
import type { Sector, Viaje } from '@/types/database';
import type { TripFilters, TripListItem } from '@/types/domain';

import {
  changeTripState,
  createTrip,
  fetchMyCreatedTrips,
  fetchSectores,
  fetchTrip,
  searchTrips,
} from './thunks';

// createEntityAdapter guarda los viajes normalizados: { ids: [...], entities: { id: viaje } }.
// Así un viaje existe una sola vez aunque aparezca en la búsqueda y en "Creados",
// y actualizarlo (por Realtime) lo cambia en las dos listas a la vez.
export const tripsAdapter = createEntityAdapter<TripListItem>();

type SearchState = RequestState &
  CacheInfo & {
    /** requestId del último searchTrips lanzado: las respuestas de otros se ignoran. */
    requestId: string | null;
    nextOffset: number;
    hasMore: boolean;
  };

export type TripsState = ReturnType<typeof tripsAdapter.getInitialState> & {
  /** Orden de la búsqueda (salida más próxima primero). */
  searchIds: string[];
  /** Orden de "Viajes creados". */
  createdIds: string[];
  filters: TripFilters;
  search: SearchState;
  created: RequestState & CacheInfo;
  sectores: Sector[];
  sectoresStatus: LoadStatus;
  /** Crear, iniciar, finalizar o cancelar un viaje. */
  mutation: RequestState;
};

export const initialTripsState: TripsState = tripsAdapter.getInitialState({
  searchIds: [],
  createdIds: [],
  filters: { sectorId: null, minCupos: null },
  search: {
    ...initialRequest,
    ...initialCacheInfo,
    requestId: null,
    nextOffset: 0,
    hasMore: true,
  },
  created: { ...initialRequest, ...initialCacheInfo },
  sectores: [],
  sectoresStatus: 'idle',
  mutation: initialRequest,
});

/** Un viaje sigue en la búsqueda solo si está abierto, con cupos y salida futura (R6). */
function isSearchable(viaje: Viaje): boolean {
  return (
    viaje.estado === 'abierto' &&
    viaje.cupos_disponibles > 0 &&
    new Date(viaje.salida_at).getTime() > Date.now()
  );
}

const tripsSlice = createSlice({
  name: 'trips',
  initialState: initialTripsState,
  reducers: {
    filtersChanged(state, action: PayloadAction<TripFilters>) {
      state.filters = action.payload;
    },
    /**
     * Cambio recibido por Realtime (cupos o estado). Se actualizan los campos del
     * viaje conservando el sector y el conductor que ya se tenían. Si el viaje deja
     * de ser reservable, sale de la búsqueda (cierre automático en vivo).
     */
    tripChanged(state, action: PayloadAction<Viaje>) {
      const viaje = action.payload;
      if (!state.entities[viaje.id]) return;
      tripsAdapter.updateOne(state, { id: viaje.id, changes: viaje });
      if (!isSearchable(viaje)) {
        state.searchIds = state.searchIds.filter((id) => id !== viaje.id);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sessionCleared, () => initialTripsState)

      .addCase(fetchSectores.pending, (state) => {
        state.sectoresStatus = 'loading';
      })
      .addCase(fetchSectores.fulfilled, (state, action) => {
        state.sectoresStatus = 'succeeded';
        state.sectores = action.payload;
      })
      .addCase(fetchSectores.rejected, (state) => {
        state.sectoresStatus = 'failed';
      })

      .addCase(searchTrips.pending, (state, action) => {
        state.search.status = 'loading';
        state.search.error = null;
        state.search.requestId = action.meta.requestId;
      })
      .addCase(searchTrips.fulfilled, (state, action) => {
        // Respuesta obsoleta: ya se lanzó otra búsqueda después de esta.
        if (state.search.requestId !== action.meta.requestId) return;
        const { data, offset, fromCache, cachedAt } = action.payload;
        tripsAdapter.upsertMany(state, data);
        const newIds = data.map((trip) => trip.id);
        state.searchIds =
          offset === 0
            ? newIds
            : [...state.searchIds, ...newIds.filter((id) => !state.searchIds.includes(id))];
        state.search.status = 'succeeded';
        state.search.nextOffset = offset + data.length;
        // Sin conexión no se pueden pedir más páginas.
        state.search.hasMore = !fromCache && data.length === TRIPS_PAGE_SIZE;
        state.search.fromCache = fromCache;
        state.search.cachedAt = cachedAt;
      })
      .addCase(searchTrips.rejected, (state, action) => {
        if (state.search.requestId !== action.meta.requestId) return;
        state.search.status = 'failed';
        state.search.error = action.payload ?? null;
      })

      .addCase(fetchMyCreatedTrips.pending, (state) => {
        state.created.status = 'loading';
        state.created.error = null;
      })
      .addCase(fetchMyCreatedTrips.fulfilled, (state, action) => {
        tripsAdapter.upsertMany(state, action.payload.data);
        state.createdIds = action.payload.data.map((trip) => trip.id);
        state.created = {
          status: 'succeeded',
          error: null,
          fromCache: action.payload.fromCache,
          cachedAt: action.payload.cachedAt,
        };
      })
      .addCase(fetchMyCreatedTrips.rejected, (state, action) => {
        state.created.status = 'failed';
        state.created.error = action.payload ?? null;
      })

      .addCase(fetchTrip.fulfilled, (state, action) => {
        tripsAdapter.upsertOne(state, action.payload);
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        tripsAdapter.upsertOne(state, action.payload);
        state.createdIds = [action.payload.id, ...state.createdIds];
      })
      .addCase(changeTripState.fulfilled, (state, action) => {
        tripsAdapter.upsertOne(state, action.payload);
        if (!isSearchable(action.payload)) {
          state.searchIds = state.searchIds.filter((id) => id !== action.payload.id);
        }
      });

    // Crear y cambiar el estado de un viaje comparten el estado "mutation".
    builder
      .addMatcher(isAnyOf(createTrip.pending, changeTripState.pending), (state) => {
        state.mutation = { status: 'loading', error: null };
      })
      .addMatcher(isAnyOf(createTrip.fulfilled, changeTripState.fulfilled), (state) => {
        state.mutation = { status: 'succeeded', error: null };
      })
      .addMatcher(isAnyOf(createTrip.rejected, changeTripState.rejected), (state, action) => {
        state.mutation = { status: 'failed', error: action.payload ?? null };
      });
  },
});

export const { filtersChanged, tripChanged } = tripsSlice.actions;
export default tripsSlice.reducer;
