import { initialAuthState } from '@/features/auth/slice';
import { selectUnreadCount } from '@/features/notifications/selectors';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/features/notifications/thunks';
import { selectRatingFor, selectTripRatingContext } from '@/features/ratings/selectors';
import { fetchTripRatingContext, submitRating } from '@/features/ratings/thunks';
import { fetchMyReservations } from '@/features/reservations/thunks';
import * as notificationService from '@/services/notificationService';
import * as ratingService from '@/services/ratingService';
import * as reservationService from '@/services/reservationService';
import { makeStore } from '@/store/store';
import { makeNotification, makeReservation, makeTrip } from '@/test-utils/factories';
import { createFakeDatabase } from '@/test-utils/fakeDatabase';

jest.mock('@/services/ratingService', () => ({
  getAverages: jest.fn(),
  submitRating: jest.fn(),
  getTripRatingContext: jest.fn(),
}));
jest.mock('@/services/notificationService', () => ({
  listNotifications: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
}));
jest.mock('@/services/reservationService', () => ({
  listMyReservations: jest.fn(),
}));

const mockDb = createFakeDatabase();
jest.mock('@/db/database', () => ({ getDatabase: async () => mockDb }));

function loggedStore(userId = 'u1') {
  return makeStore({ auth: { ...initialAuthState, userId, initialized: true } });
}

describe('ratings y notificaciones (E7)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.rows.clear();
  });

  it('carga el contexto de calificación del viaje, envía calificación y actualiza el estado local y promedio', async () => {
    const trip = makeTrip({ id: 'v1', conductor_id: 'c1', estado: 'finalizado' });
    jest.mocked(ratingService.getTripRatingContext).mockResolvedValue({
      trip,
      canRate: true,
      targets: [
        { userId: 'c1', fullName: 'Carlos Pérez', role: 'conductor', existingRating: null },
      ],
    });
    jest.mocked(ratingService.submitRating).mockResolvedValue({
      id: 'cal-1',
      viaje_id: 'v1',
      autor_id: 'u1',
      destinatario_id: 'c1',
      estrellas: 5,
      comentario: 'Muy puntual',
      created_at: '2026-11-10T15:00:00.000Z',
    });
    jest
      .mocked(ratingService.getAverages)
      .mockResolvedValue([{ usuario_id: 'c1', promedio: 4.9, total: 10 }]);

    const store = loggedStore('u1');
    await store.dispatch(fetchTripRatingContext('v1'));

    expect(selectTripRatingContext(store.getState()).canRate).toBe(true);
    expect(selectTripRatingContext(store.getState()).targets[0]?.existingRating).toBeNull();

    await store.dispatch(
      submitRating({
        viajeId: 'v1',
        destinatarioId: 'c1',
        estrellas: 5,
        comentario: 'Muy puntual',
      }),
    );

    expect(selectTripRatingContext(store.getState()).targets[0]?.existingRating?.estrellas).toBe(5);
    expect(selectRatingFor(store.getState(), 'c1')).toEqual({ promedio: 4.9, total: 10 });
  });

  it('rechaza auto-calificación, estrellas inválidas, comentario > 280 chars y traduce duplicado', async () => {
    const store = loggedStore('u1');

    const selfResult = await store.dispatch(
      submitRating({ viajeId: 'v1', destinatarioId: 'u1', estrellas: 5 }),
    );
    if (!submitRating.rejected.match(selfResult)) throw new Error('Debía rechazarse');
    expect(selfResult.payload?.code).toBe('sin_permiso');

    const starsResult = await store.dispatch(
      submitRating({ viajeId: 'v1', destinatarioId: 'c1', estrellas: 0 }),
    );
    if (!submitRating.rejected.match(starsResult)) throw new Error('Debía rechazarse');
    expect(starsResult.payload?.code).toBe('datos_invalidos');

    const longCommentResult = await store.dispatch(
      submitRating({
        viajeId: 'v1',
        destinatarioId: 'c1',
        estrellas: 4,
        comentario: 'a'.repeat(281),
      }),
    );
    if (!submitRating.rejected.match(longCommentResult)) throw new Error('Debía rechazarse');
    expect(longCommentResult.payload?.code).toBe('datos_invalidos');

    jest
      .mocked(ratingService.submitRating)
      .mockRejectedValueOnce({ code: 'duplicado', message: 'Ese dato ya está registrado.' });
    const dupResult = await store.dispatch(
      submitRating({ viajeId: 'v1', destinatarioId: 'c1', estrellas: 4 }),
    );
    if (!submitRating.rejected.match(dupResult)) throw new Error('Debía rechazarse');
    expect(dupResult.payload?.message).toBe('Ya calificaste a esta persona en este viaje.');
  });

  it('fetchMyReservations solicita los promedios de los conductores cuando hay red', async () => {
    jest.mocked(reservationService.listMyReservations).mockResolvedValue([
      makeReservation({
        id: 'r1',
        viaje: makeTrip({ id: 'v1', conductor_id: 'c-99', estado: 'finalizado' }),
      }),
    ]);
    jest
      .mocked(ratingService.getAverages)
      .mockResolvedValue([{ usuario_id: 'c-99', promedio: 4.7, total: 3 }]);

    const store = loggedStore('u1');
    await store.dispatch(fetchMyReservations());

    expect(ratingService.getAverages).toHaveBeenCalledWith(['c-99']);
    expect(selectRatingFor(store.getState(), 'c-99')).toEqual({ promedio: 4.7, total: 3 });
  });

  it('marca una notificación o todas como leídas y actualiza el contador', async () => {
    jest
      .mocked(notificationService.listNotifications)
      .mockResolvedValue([
        makeNotification({ id: 'n1', leida: false }),
        makeNotification({ id: 'n2', leida: false }),
      ]);
    jest.mocked(notificationService.markAsRead).mockResolvedValue(undefined);
    jest.mocked(notificationService.markAllAsRead).mockResolvedValue(undefined);

    const store = loggedStore('u1');
    await store.dispatch(fetchNotifications());
    expect(selectUnreadCount(store.getState())).toBe(2);

    await store.dispatch(markNotificationRead('n1'));
    expect(notificationService.markAsRead).toHaveBeenCalledWith('n1');
    expect(selectUnreadCount(store.getState())).toBe(1);

    await store.dispatch(markAllNotificationsRead());
    expect(notificationService.markAllAsRead).toHaveBeenCalledWith('u1');
    expect(selectUnreadCount(store.getState())).toBe(0);
  });
});
