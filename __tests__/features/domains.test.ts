import { initialAuthState } from '@/features/auth/slice';
import {
  makeSelectMessagesForTrip,
  makeSelectMessagesNewestFirst,
  selectAuthorNames,
} from '@/features/chat/selectors';
import { messageReceived } from '@/features/chat/slice';
import { fetchAuthorNames, fetchMessages, sendMessage } from '@/features/chat/thunks';
import { selectUnreadCount } from '@/features/notifications/selectors';
import { notificationReceived } from '@/features/notifications/slice';
import { fetchNotifications, markAllNotificationsRead } from '@/features/notifications/thunks';
import { selectCurrentMode, selectFullName } from '@/features/profile/selectors';
import { changeMode, fetchMyProfile } from '@/features/profile/thunks';
import { selectRatingFor } from '@/features/ratings/selectors';
import { fetchRatingAverages } from '@/features/ratings/thunks';
import { selectIsOnline } from '@/features/settings/selectors';
import { connectivityChanged } from '@/features/settings/slice';
import { isOnlineFromNetInfo } from '@/features/settings/thunks';
import { selectHasVehicle } from '@/features/vehicle/selectors';
import { registerVehicle, removeVehicle } from '@/features/vehicle/thunks';
import * as chatService from '@/services/chatService';
import * as notificationService from '@/services/notificationService';
import * as profileService from '@/services/profileService';
import * as ratingService from '@/services/ratingService';
import * as vehicleService from '@/services/vehicleService';
import { makeStore } from '@/store/store';
import { makeNotification, makeProfile } from '@/test-utils/factories';
import { createFakeDatabase } from '@/test-utils/fakeDatabase';
import type { Mensaje, Vehiculo } from '@/types/database';

jest.mock('@/services/profileService', () => ({
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
  changeMode: jest.fn(),
}));
jest.mock('@/services/vehicleService', () => ({
  getMyVehicle: jest.fn(),
  createVehicle: jest.fn(),
  deleteVehicle: jest.fn(),
}));
jest.mock('@/services/notificationService', () => ({
  listNotifications: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
}));
jest.mock('@/services/chatService', () => ({
  MAX_MESSAGE_LENGTH: 500,
  isParticipant: jest.fn(),
  listMessages: jest.fn(),
  getAuthorNames: jest.fn(),
  sendMessage: jest.fn(),
}));
jest.mock('@/services/ratingService', () => ({ getAverages: jest.fn(), submitRating: jest.fn() }));
const mockDb = createFakeDatabase();
jest.mock('@/db/database', () => ({ getDatabase: async () => mockDb }));

function loggedStore() {
  return makeStore({ auth: { ...initialAuthState, userId: 'usuario-1', initialized: true } });
}

const vehicle: Vehiculo = {
  id: 'v1',
  propietario_id: 'usuario-1',
  placa: 'ABC123',
  capacidad: 4,
  marca: 'Renault',
  modelo: 'Logan',
  foto_path: null,
  soat_path: null,
  created_at: '2026-11-01',
};

const message = (id: string, created_at: string): Mensaje => ({
  id,
  viaje_id: 'viaje-1',
  autor_id: 'usuario-1',
  contenido: 'Hola',
  created_at,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockDb.rows.clear();
});

describe('profile', () => {
  it('lee el perfil y arma el nombre completo', async () => {
    jest.mocked(profileService.getProfile).mockResolvedValue(makeProfile({ nombre: 'Sara' }));
    const store = loggedStore();
    await store.dispatch(fetchMyProfile());
    expect(selectFullName(store.getState())).toBe('Sara De Prueba');
    expect(selectCurrentMode(store.getState())).toBe('pasajero');
  });

  it('cambiar a conductor sin carro deja el error de R3 (TC-19)', async () => {
    jest
      .mocked(profileService.changeMode)
      .mockRejectedValue({ code: 'P0001', message: 'sin_vehiculo' });
    const store = loggedStore();
    await store.dispatch(changeMode('conductor'));
    expect(store.getState().profile.save.error?.code).toBe('sin_vehiculo');
  });
});

describe('vehicle', () => {
  it('registrar y eliminar el carro actualiza selectHasVehicle (TC-20)', async () => {
    jest.mocked(vehicleService.createVehicle).mockResolvedValue(vehicle);
    jest.mocked(vehicleService.deleteVehicle).mockResolvedValue(undefined);
    const store = loggedStore();

    await store.dispatch(
      registerVehicle({ placa: 'abc123', capacidad: 4, marca: 'Renault', modelo: 'Logan' }),
    );
    expect(vehicleService.createVehicle).toHaveBeenCalledWith(
      expect.objectContaining({ propietario_id: 'usuario-1' }),
    );
    expect(selectHasVehicle(store.getState())).toBe(true);

    await store.dispatch(removeVehicle('v1'));
    expect(selectHasVehicle(store.getState())).toBe(false);
  });
});

describe('notifications', () => {
  it('cuenta las no leídas, agrega las que llegan en vivo y marca todas', async () => {
    jest
      .mocked(notificationService.listNotifications)
      .mockResolvedValue([
        makeNotification({ id: 'n1' }),
        makeNotification({ id: 'n2', leida: true }),
      ]);
    jest.mocked(notificationService.markAllAsRead).mockResolvedValue(undefined);
    const store = loggedStore();

    await store.dispatch(fetchNotifications());
    expect(selectUnreadCount(store.getState())).toBe(1);

    store.dispatch(notificationReceived(makeNotification({ id: 'n3', created_at: '2026-11-05' })));
    expect(selectUnreadCount(store.getState())).toBe(2);

    await store.dispatch(markAllNotificationsRead());
    expect(selectUnreadCount(store.getState())).toBe(0);
  });
});

describe('chat', () => {
  it('ordena por fecha y no duplica el mensaje que llega por Realtime', () => {
    const store = loggedStore();
    store.dispatch(messageReceived(message('m2', '2026-11-05T10:01:00Z')));
    store.dispatch(messageReceived(message('m1', '2026-11-05T10:00:00Z')));
    store.dispatch(messageReceived(message('m2', '2026-11-05T10:01:00Z')));
    const messages = makeSelectMessagesForTrip('viaje-1')(store.getState());
    expect(messages.map((m) => m.id)).toEqual(['m1', 'm2']);
  });

  it('no envía mensajes vacíos ni de más de 500 caracteres', async () => {
    const store = loggedStore();
    await store.dispatch(sendMessage({ viajeId: 'viaje-1', contenido: '   ' }));
    expect(store.getState().chat.send.error?.code).toBe('mensaje_invalido');
    await store.dispatch(sendMessage({ viajeId: 'viaje-1', contenido: 'x'.repeat(501) }));
    expect(chatService.sendMessage).not.toHaveBeenCalled();
  });

  it('a quien no participa del viaje no le carga mensajes (R10)', async () => {
    jest.mocked(chatService.isParticipant).mockResolvedValue(false);
    const store = loggedStore();
    await store.dispatch(fetchMessages('viaje-1'));
    expect(chatService.isParticipant).toHaveBeenCalledWith('viaje-1', 'usuario-1');
    expect(chatService.listMessages).not.toHaveBeenCalled();
    expect(store.getState().chat.load).toMatchObject({
      status: 'failed',
      viajeId: 'viaje-1',
      error: { code: 'chat_sin_acceso' },
    });
  });

  it('guarda los mensajes y los nombres de sus autores', async () => {
    jest.mocked(chatService.isParticipant).mockResolvedValue(true);
    jest.mocked(chatService.listMessages).mockResolvedValue({
      messages: [message('m1', '2026-11-05T10:00:00Z')],
      authorNames: { 'usuario-1': 'Sara Santacruz' },
    });
    const store = loggedStore();
    await store.dispatch(fetchMessages('viaje-1'));
    expect(store.getState().chat.load.status).toBe('succeeded');
    expect(selectAuthorNames(store.getState())).toEqual({ 'usuario-1': 'Sara Santacruz' });
    const newestFirst = makeSelectMessagesNewestFirst('viaje-1');
    store.dispatch(messageReceived(message('m2', '2026-11-05T10:01:00Z')));
    expect(newestFirst(store.getState()).map((m) => m.id)).toEqual(['m2', 'm1']);
  });

  it('ignora la respuesta de una carga vieja (sección 4)', async () => {
    let resolveOld: (value: boolean) => void = () => undefined;
    jest
      .mocked(chatService.isParticipant)
      .mockImplementationOnce(() => new Promise((resolve) => (resolveOld = resolve)))
      .mockResolvedValueOnce(false);
    const store = loggedStore();
    const old = store.dispatch(fetchMessages('viaje-viejo'));
    await store.dispatch(fetchMessages('viaje-1'));
    jest.mocked(chatService.listMessages).mockResolvedValue({ messages: [], authorNames: {} });
    resolveOld(true);
    await old;
    expect(store.getState().chat.load).toMatchObject({ status: 'failed', viajeId: 'viaje-1' });
  });

  it('no vuelve a pedir el nombre de un autor conocido o ya pedido', async () => {
    jest.mocked(chatService.getAuthorNames).mockResolvedValue({ c1: 'Miguel Ordóñez' });
    const store = loggedStore();
    await store.dispatch(fetchAuthorNames(['c1']));
    await store.dispatch(fetchAuthorNames(['c1']));
    expect(chatService.getAuthorNames).toHaveBeenCalledTimes(1);
    expect(selectAuthorNames(store.getState()).c1).toBe('Miguel Ordóñez');
  });
});

describe('ratings', () => {
  it('convierte el promedio a número (la vista devuelve NUMERIC)', async () => {
    jest
      .mocked(ratingService.getAverages)
      .mockResolvedValue([{ usuario_id: 'c1', promedio: '4.50' as unknown as number, total: 2 }]);
    const store = loggedStore();
    await store.dispatch(fetchRatingAverages(['c1', 'c1']));
    expect(ratingService.getAverages).toHaveBeenCalledWith(['c1']);
    expect(selectRatingFor(store.getState(), 'c1')).toEqual({ promedio: 4.5, total: 2 });
    expect(selectRatingFor(store.getState(), 'nadie')).toBeNull();
  });
});

describe('settings', () => {
  it('solo se toma como sin conexión cuando NetInfo lo confirma', () => {
    expect(isOnlineFromNetInfo({ isConnected: true, isInternetReachable: null })).toBe(true);
    expect(isOnlineFromNetInfo({ isConnected: null, isInternetReachable: null })).toBe(true);
    expect(isOnlineFromNetInfo({ isConnected: false, isInternetReachable: null })).toBe(false);
    expect(isOnlineFromNetInfo({ isConnected: true, isInternetReachable: false })).toBe(false);

    const store = loggedStore();
    store.dispatch(connectivityChanged(false));
    expect(selectIsOnline(store.getState())).toBe(false);
  });
});
