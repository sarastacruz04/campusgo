import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import NotificationsScreen from '@/app/notifications';
import { initialAuthState } from '@/features/auth/slice';
import * as notificationService from '@/services/notificationService';
import { makeStore } from '@/store/store';
import { makeNotification } from '@/test-utils/factories';
import { renderWithProviders } from '@/test-utils/render';

jest.setTimeout(25000);

const mockAnnounce = jest.fn();
jest.mock('@/hooks/useAnnounce', () => ({
  useAnnounce: () => mockAnnounce,
}));

const mockHaptics = {
  success: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
};
jest.mock('@/hooks/useHaptics', () => ({
  useHaptics: () => mockHaptics,
}));

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual('react');
  return {
    router: {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    },
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
  };
});

jest.mock('@/hooks/useScreenFocus', () => ({
  useScreenFocus: jest.fn(() => ({ current: null })),
  SCREEN_FOCUS_DELAY_MS: 0,
}));

jest.mock('@/services/notificationService', () => ({
  listNotifications: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
}));

function authedStore() {
  return makeStore({
    auth: { ...initialAuthState, userId: 'usuario-1', initialized: true },
  });
}

describe('NotificationsScreen (Bandeja E7)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lista notificaciones, muestra contador sin leer y marca todas como leídas con anuncio', async () => {
    jest.mocked(notificationService.listNotifications).mockResolvedValue([
      makeNotification({
        id: 'n-unread',
        tipo: 'viaje_finalizado',
        titulo: 'Viaje finalizado',
        cuerpo: 'Ya puedes calificar a tu conductor',
        datos: { viaje_id: 'viaje-10' },
        leida: false,
      }),
      makeNotification({
        id: 'n-read',
        tipo: 'reserva_aceptada',
        titulo: 'Reserva aceptada',
        cuerpo: 'Tu cupo está confirmado',
        leida: true,
      }),
    ]);
    jest.mocked(notificationService.markAllAsRead).mockResolvedValue(undefined);

    await renderWithProviders(<NotificationsScreen />, {}, authedStore());

    expect(await screen.findByText('Tienes 1 notificación sin leer')).toBeTruthy();
    expect(screen.getByText('Viaje finalizado')).toBeTruthy();
    expect(screen.getByText('Nueva')).toBeTruthy();
    expect(screen.getByText('Leída')).toBeTruthy();

    const markAllBtn = screen.getByRole('button', {
      name: 'Marcar todas las notificaciones como leídas',
    });
    await fireEvent.press(markAllBtn);

    await waitFor(() => {
      expect(notificationService.markAllAsRead).toHaveBeenCalledWith('usuario-1');
    });
    expect(mockAnnounce).toHaveBeenCalledWith('Todas las notificaciones marcadas como leídas.');
    expect(await screen.findByText('Todas las notificaciones están al día.')).toBeTruthy();
  });

  it('al tocar una notificación de viaje finalizado la marca leída y navega a calificar', async () => {
    jest.mocked(notificationService.listNotifications).mockResolvedValue([
      makeNotification({
        id: 'n-rate',
        tipo: 'viaje_finalizado',
        titulo: 'Viaje finalizado',
        cuerpo: 'Califica tu viaje',
        datos: { viaje_id: 'viaje-55' },
        leida: false,
      }),
    ]);
    jest.mocked(notificationService.markAsRead).mockResolvedValue(undefined);

    await renderWithProviders(<NotificationsScreen />, {}, authedStore());

    const card = await screen.findByRole('button', { name: /No leída\. Viaje finalizado/ });
    await fireEvent.press(card);

    await waitFor(() => {
      expect(notificationService.markAsRead).toHaveBeenCalledWith('n-rate');
      expect(router.push).toHaveBeenCalledWith('/trip/viaje-55/rate');
    });
  });

  it('soporta estado vacío y error de red con Reintentar', async () => {
    jest
      .mocked(notificationService.listNotifications)
      .mockRejectedValueOnce({ code: 'sin_conexion', message: 'Sin conexión a internet.' })
      .mockResolvedValueOnce([]);

    await renderWithProviders(<NotificationsScreen />, {}, authedStore());

    expect(await screen.findByText('Sin conexión a internet.')).toBeTruthy();
    const retryBtn = screen.getByRole('button', { name: 'Reintentar' });
    await fireEvent.press(retryBtn);

    expect(await screen.findByText('No tienes notificaciones')).toBeTruthy();
  });

  it('navega según tipo incluyendo navegación directa al chat en mensaje_nuevo', async () => {
    jest.mocked(notificationService.listNotifications).mockResolvedValue([
      makeNotification({
        id: 'n-req',
        tipo: 'nueva_reserva',
        titulo: 'Nueva solicitud',
        cuerpo: 'Un pasajero solicitó cupo',
        datos: { viaje_id: 'v1' },
        leida: true,
      }),
      makeNotification({
        id: 'n-msg',
        tipo: 'mensaje_nuevo',
        titulo: 'Nuevo mensaje',
        cuerpo: 'Hola, voy llegando',
        datos: { viaje_id: 'v1' },
        leida: false,
      }),
    ]);
    jest.mocked(notificationService.markAsRead).mockResolvedValue(undefined);

    await renderWithProviders(<NotificationsScreen />, {}, authedStore());

    await fireEvent.press(await screen.findByRole('button', { name: /Leída\. Nueva solicitud/ }));
    expect(router.push).toHaveBeenCalledWith('/requests');

    jest.mocked(router.push).mockClear();
    await fireEvent.press(screen.getByRole('button', { name: /No leída\. Nuevo mensaje/ }));
    await waitFor(() => {
      expect(notificationService.markAsRead).toHaveBeenCalledWith('n-msg');
    });
    expect(router.push).toHaveBeenCalledWith('/trip/v1/chat');
  });
});
