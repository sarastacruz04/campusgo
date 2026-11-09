import { initialAuthState } from '@/features/auth/slice';
import {
  makeSelectMyReservationsByEstado,
  selectMyReservations,
  selectPendingRequests,
} from '@/features/reservations/selectors';
import { reservationChanged } from '@/features/reservations/slice';
import {
  changeReservationState,
  createReservation,
  fetchMyReservations,
  fetchRequestsForMyTrips,
} from '@/features/reservations/thunks';
import * as reservationService from '@/services/reservationService';
import { makeStore } from '@/store/store';
import { makeReservation } from '@/test-utils/factories';
import { createFakeDatabase } from '@/test-utils/fakeDatabase';

jest.mock('@/services/reservationService', () => ({
  listMyReservations: jest.fn(),
  listRequestsForMyTrips: jest.fn(),
  createReservation: jest.fn(),
  getReservation: jest.fn(),
  acceptReservation: jest.fn(),
  rejectReservation: jest.fn(),
  cancelReservation: jest.fn(),
}));
const mockDb = createFakeDatabase();
jest.mock('@/db/database', () => ({ getDatabase: async () => mockDb }));

const service = jest.mocked(reservationService);

const pendiente = makeReservation({ id: 'r1', estado: 'pendiente', created_at: '2026-11-03' });
const aceptada = makeReservation({ id: 'r2', estado: 'aceptada', created_at: '2026-11-02' });
const rechazada = makeReservation({ id: 'r3', estado: 'rechazada', created_at: '2026-11-01' });

function loggedStore() {
  return makeStore({ auth: { ...initialAuthState, userId: 'pasajero-1', initialized: true } });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockDb.rows.clear();
});

describe('reservations', () => {
  it('lee mis reservas y las separa por estado (pantalla 13)', async () => {
    service.listMyReservations.mockResolvedValue([pendiente, aceptada, rechazada]);
    const store = loggedStore();
    await store.dispatch(fetchMyReservations());

    const state = store.getState();
    expect(selectMyReservations(state).map((r) => r.id)).toEqual(['r1', 'r2', 'r3']);
    expect(makeSelectMyReservationsByEstado('aceptada')(state).map((r) => r.id)).toEqual(['r2']);
    expect(makeSelectMyReservationsByEstado('rechazada')(state).map((r) => r.id)).toEqual(['r3']);
    expect(state.reservations.mine.fromCache).toBe(false);
  });

  it('una reserva aceptada por el conductor cambia de pestaña en vivo', async () => {
    service.listMyReservations.mockResolvedValue([pendiente]);
    const store = loggedStore();
    await store.dispatch(fetchMyReservations());

    const { viaje: _v, pasajero_nombre: _p, ...row } = pendiente;
    store.dispatch(reservationChanged({ ...row, estado: 'aceptada' }));

    expect(makeSelectMyReservationsByEstado('aceptada')(store.getState()).map((r) => r.id)).toEqual(
      ['r1'],
    );
  });

  it('crear una reserva la agrega a mis reservas (TC-07)', async () => {
    service.createReservation.mockResolvedValue(pendiente);
    const store = loggedStore();
    await store.dispatch(
      createReservation({
        viajeId: 'viaje-1',
        puntoRecogidaTexto: 'Portería',
        puntoLat: 1,
        puntoLng: 1,
      }),
    );
    expect(store.getState().reservations.myIds).toEqual(['r1']);
    expect(store.getState().reservations.mutation.status).toBe('succeeded');
  });

  it('una reserva duplicada queda en error con el mensaje de la RPC (TC-08)', async () => {
    service.createReservation.mockRejectedValue({ code: 'P0001', message: 'reserva_duplicada' });
    const store = loggedStore();
    await store.dispatch(
      createReservation({
        viajeId: 'viaje-1',
        puntoRecogidaTexto: 'Portería',
        puntoLat: 1,
        puntoLng: 1,
      }),
    );
    expect(store.getState().reservations.mutation.error).toEqual({
      code: 'reserva_duplicada',
      message: 'Ya tienes una reserva en este viaje.',
    });
  });

  it('cancelar llama a la RPC y guarda la reserva actualizada (TC-09)', async () => {
    service.cancelReservation.mockResolvedValue(undefined);
    service.getReservation.mockResolvedValue({ ...aceptada, estado: 'cancelada' });
    const store = loggedStore();
    await store.dispatch(changeReservationState({ reservationId: 'r2', action: 'cancelar' }));
    expect(service.cancelReservation).toHaveBeenCalledWith('r2');
    expect(store.getState().reservations.entities.r2?.estado).toBe('cancelada');
  });

  it('el conductor ve solo las solicitudes pendientes', async () => {
    service.listRequestsForMyTrips.mockResolvedValue([pendiente, aceptada]);
    const store = loggedStore();
    await store.dispatch(fetchRequestsForMyTrips());
    expect(selectPendingRequests(store.getState()).map((r) => r.id)).toEqual(['r1']);
  });
});
