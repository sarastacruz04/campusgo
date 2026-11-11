import { MessageBubble } from '@/components/chat/MessageBubble';
import { CreatedTripCard } from '@/components/trips/CreatedTripCard';
import { ReservationCard } from '@/components/trips/ReservationCard';
import { TripCard } from '@/components/trips/TripCard';
import { initialAuthState } from '@/features/auth/slice';
import { selectRequestCountsByTrip } from '@/features/reservations/selectors';
import { fetchRequestsForMyTrips } from '@/features/reservations/thunks';
import { connectivityChanged } from '@/features/settings/slice';
import * as reservationService from '@/services/reservationService';
import { makeStore } from '@/store/store';
import { makeReservation } from '@/test-utils/factories';

// Rendimiento de listas (E8, sección 4). Servicio simulado SOLO en esta prueba.
jest.mock('@/services/reservationService', () => ({ listRequestsForMyTrips: jest.fn() }));

const REACT_MEMO = Symbol.for('react.memo');

describe('rendimiento de listas', () => {
  it('las tarjetas de las listas están envueltas en React.memo', () => {
    for (const component of [TripCard, CreatedTripCard, ReservationCard, MessageBubble]) {
      expect((component as unknown as { $$typeof: symbol }).$$typeof).toBe(REACT_MEMO);
    }
  });

  it('cuenta las solicitudes por viaje una sola vez y conserva el resultado si no cambian', async () => {
    jest
      .mocked(reservationService.listRequestsForMyTrips)
      .mockResolvedValue([
        makeReservation({ id: 'r1', viaje_id: 'v1', estado: 'pendiente' }),
        makeReservation({ id: 'r2', viaje_id: 'v1', estado: 'aceptada' }),
        makeReservation({ id: 'r3', viaje_id: 'v1', estado: 'aceptada' }),
        makeReservation({ id: 'r4', viaje_id: 'v2', estado: 'rechazada' }),
      ]);
    const store = makeStore({
      auth: { ...initialAuthState, userId: 'conductor-1', initialized: true },
    });
    await store.dispatch(fetchRequestsForMyTrips());

    const counts = selectRequestCountsByTrip(store.getState());
    expect(counts).toEqual({
      v1: { pendientes: 1, aceptadas: 2 },
      v2: { pendientes: 0, aceptadas: 0 },
    });
    // Un cambio ajeno a las solicitudes no crea un objeto nuevo: las tarjetas no se redibujan.
    store.dispatch(connectivityChanged(false));
    expect(selectRequestCountsByTrip(store.getState())).toBe(counts);
  });
});
