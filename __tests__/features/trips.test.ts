import { saveCache } from '@/db/cache';
import { initialAuthState } from '@/features/auth/slice';
import { selectSearchTrips } from '@/features/trips/selectors';
import { filtersChanged, tripChanged } from '@/features/trips/slice';
import { changeTripState, createTrip, searchTrips } from '@/features/trips/thunks';
import * as ratingService from '@/services/ratingService';
import * as tripService from '@/services/tripService';
import { makeStore, type RootState } from '@/store/store';
import { deferred, makeTrip } from '@/test-utils/factories';
import { createFakeDatabase } from '@/test-utils/fakeDatabase';
import type { TripListItem } from '@/types/domain';

// Servicios simulados SOLO en esta prueba. Página de 2 para probar la paginación.
jest.mock('@/services/tripService', () => ({
  TRIPS_PAGE_SIZE: 2,
  searchOpenTrips: jest.fn(),
  listMyCreatedTrips: jest.fn(),
  getTrip: jest.fn(),
  createTrip: jest.fn(),
  startTrip: jest.fn(),
  finishTrip: jest.fn(),
  cancelTrip: jest.fn(),
  listSectores: jest.fn(),
}));
jest.mock('@/services/ratingService', () => ({ getAverages: jest.fn(async () => []) }));
const mockDb = createFakeDatabase();
jest.mock('@/db/database', () => ({ getDatabase: async () => mockDb }));

const trips = jest.mocked(tripService);
const ratings = jest.mocked(ratingService);

const t1 = makeTrip({ id: 't1', conductor_id: 'c1' });
const t2 = makeTrip({ id: 't2', conductor_id: 'c2' });
const t3 = makeTrip({ id: 't3', conductor_id: 'c1' });

function loggedStore(overrides: Partial<RootState> = {}) {
  return makeStore({
    auth: { ...initialAuthState, userId: 'u1', initialized: true },
    ...overrides,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockDb.rows.clear();
});

describe('trips: búsqueda paginada', () => {
  it('la primera página llena la búsqueda y pide los promedios de los conductores', async () => {
    trips.searchOpenTrips.mockResolvedValue([t1, t2]);
    const store = loggedStore();
    await store.dispatch(searchTrips({ reset: true }));

    const { search, searchIds } = store.getState().trips;
    expect(searchIds).toEqual(['t1', 't2']);
    expect(search).toMatchObject({ status: 'succeeded', nextOffset: 2, hasMore: true });
    expect(trips.searchOpenTrips).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 0, excludeConductorId: 'u1' }),
    );
    expect(ratings.getAverages).toHaveBeenCalledWith(['c1', 'c2']);
  });

  it('la página siguiente agrega al final y detecta que no hay más', async () => {
    trips.searchOpenTrips.mockResolvedValueOnce([t1, t2]).mockResolvedValueOnce([t3]);
    const store = loggedStore();
    await store.dispatch(searchTrips({ reset: true }));
    await store.dispatch(searchTrips({ reset: false }));

    expect(trips.searchOpenTrips).toHaveBeenLastCalledWith(expect.objectContaining({ offset: 2 }));
    expect(store.getState().trips.searchIds).toEqual(['t1', 't2', 't3']);
    expect(store.getState().trips.search.hasMore).toBe(false);

    // Sin más páginas, onEndReached no vuelve a pedir (condition del thunk).
    await store.dispatch(searchTrips({ reset: false }));
    expect(trips.searchOpenTrips).toHaveBeenCalledTimes(2);
  });

  it('ignora la respuesta de una búsqueda vieja que llega tarde', async () => {
    const slow = deferred<TripListItem[]>();
    trips.searchOpenTrips.mockImplementationOnce(() => slow.promise).mockResolvedValueOnce([t3]);
    const store = loggedStore();

    const first = store.dispatch(searchTrips({ reset: true }));
    store.dispatch(filtersChanged({ sectorId: 5, minCupos: null }));
    const second = store.dispatch(searchTrips({ reset: true }));
    await second;
    slow.resolve([t1, t2]);
    await first;

    expect(store.getState().trips.searchIds).toEqual(['t3']);
  });

  it('sin conexión muestra la última búsqueda guardada (TC-17)', async () => {
    await saveCache('u1', 'viajes_busqueda', [t1]);
    const store = loggedStore({ settings: { isOnline: false } });
    await store.dispatch(searchTrips({ reset: true }));

    expect(trips.searchOpenTrips).not.toHaveBeenCalled();
    expect(store.getState().trips.searchIds).toEqual(['t1']);
    expect(store.getState().trips.search).toMatchObject({ fromCache: true, hasMore: false });
  });

  it('sin conexión y sin copia guardada queda en error con mensaje (TC-18)', async () => {
    const store = loggedStore({ settings: { isOnline: false } });
    await store.dispatch(searchTrips({ reset: true }));
    expect(store.getState().trips.search.status).toBe('failed');
    expect(store.getState().trips.search.error?.code).toBe('sin_conexion');
  });
});

describe('trips: cambios en vivo y ciclo del viaje', () => {
  it('un viaje que se llena sale de la búsqueda (cierre automático, R6)', async () => {
    trips.searchOpenTrips.mockResolvedValue([t1, t2]);
    const store = loggedStore();
    await store.dispatch(searchTrips({ reset: true }));

    const { sector_nombre: _s, conductor_nombre: _c, ...row } = t1;
    store.dispatch(tripChanged({ ...row, cupos_disponibles: 0, estado: 'lleno' }));

    expect(store.getState().trips.searchIds).toEqual(['t2']);
    expect(store.getState().trips.entities.t1?.cupos_disponibles).toBe(0);
    // Conserva los datos que no vienen en el evento de Realtime.
    expect(store.getState().trips.entities.t1?.sector_nombre).toBe('Colina');
  });

  it('un cambio de cupos actualiza la tarjeta sin sacarla de la búsqueda', async () => {
    trips.searchOpenTrips.mockResolvedValue([t1]);
    const store = loggedStore();
    await store.dispatch(searchTrips({ reset: true }));
    const { sector_nombre: _s, conductor_nombre: _c, ...row } = t1;
    store.dispatch(tripChanged({ ...row, cupos_disponibles: 1 }));
    expect(store.getState().trips.searchIds).toEqual(['t1']);
    expect(store.getState().trips.entities.t1?.cupos_disponibles).toBe(1);
  });

  it('crear un viaje lo agrega a "Viajes creados" con el conductor de la sesión', async () => {
    trips.createTrip.mockResolvedValue(t1);
    const store = loggedStore();
    await store.dispatch(
      createTrip({
        vehiculoId: 'v1',
        sectorId: 1,
        origenTexto: 'A',
        origenLat: 1,
        origenLng: 1,
        destinoTexto: 'B',
        destinoLat: 2,
        destinoLng: 2,
        salidaAt: '2099-01-01T12:00:00.000Z',
        valorPorCupo: 5000,
        cuposTotales: 3,
      }),
    );
    expect(trips.createTrip).toHaveBeenCalledWith(expect.objectContaining({ conductorId: 'u1' }));
    expect(store.getState().trips.createdIds).toEqual(['t1']);
  });

  it('iniciar sin pasajeros aceptados deja el error de la RPC en español (R8)', async () => {
    trips.startTrip.mockRejectedValue({ code: 'P0001', message: 'sin_pasajeros' });
    const store = loggedStore();
    await store.dispatch(changeTripState({ tripId: 't1', action: 'iniciar' }));
    expect(store.getState().trips.mutation).toEqual({
      status: 'failed',
      error: {
        code: 'sin_pasajeros',
        message: 'Debes tener al menos una reserva aceptada para iniciar el viaje.',
      },
    });
  });
});

describe('trips: selectores memoizados', () => {
  it('selectSearchTrips devuelve la misma lista si el estado de viajes no cambió', async () => {
    trips.searchOpenTrips.mockResolvedValue([t1, t2]);
    const store = loggedStore();
    await store.dispatch(searchTrips({ reset: true }));

    const first = selectSearchTrips(store.getState());
    store.dispatch({ type: 'settings/connectivityChanged', payload: false });
    const second = selectSearchTrips(store.getState());

    expect(first.map((trip) => trip.id)).toEqual(['t1', 't2']);
    // Misma referencia: la FlatList no se redibuja por un cambio ajeno a los viajes.
    expect(second).toBe(first);
  });
});
