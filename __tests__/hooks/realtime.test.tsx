import NetInfo from '@react-native-community/netinfo';
import { act, renderHook, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { AccessibilityInfo } from 'react-native';
import { Provider } from 'react-redux';

import { ConnectionBanner } from '@/components/ConnectionBanner';
import { useConnectivity } from '@/hooks/useConnectivity';
import { useRealtimeNotifications, useRealtimeTripsAndReservations } from '@/hooks/useRealtime';
import * as notificationService from '@/services/notificationService';
import * as reservationService from '@/services/reservationService';
import * as tripService from '@/services/tripService';
import { makeStore, type AppStore } from '@/store/store';
import { makeNotification } from '@/test-utils/factories';
import { renderWithProviders } from '@/test-utils/render';
import type { Notificacion } from '@/types/database';

// Suscripciones simuladas: cada una devuelve una función "stop" espía para
// comprobar que el cleanup del useEffect cierra el canal.
const mockStopTrips = jest.fn();
const mockStopReservations = jest.fn();
const mockStopNotifications = jest.fn();
jest.mock('@/services/tripService', () => ({
  TRIPS_PAGE_SIZE: 20,
  subscribeToTripChanges: jest.fn(() => mockStopTrips),
}));
jest.mock('@/services/reservationService', () => ({
  subscribeToReservationChanges: jest.fn(() => mockStopReservations),
}));
jest.mock('@/services/notificationService', () => ({
  subscribeToNotifications: jest.fn(() => mockStopNotifications),
}));

function wrapperFor(store: AppStore) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

beforeEach(() => jest.clearAllMocks());

describe('suscripciones Realtime', () => {
  it('abre los canales de viajes y reservas y los cierra al desmontar', async () => {
    const { unmount } = await renderHook(() => useRealtimeTripsAndReservations(true), {
      wrapper: wrapperFor(makeStore()),
    });
    expect(tripService.subscribeToTripChanges).toHaveBeenCalledTimes(1);
    expect(reservationService.subscribeToReservationChanges).toHaveBeenCalledTimes(1);

    await unmount();
    expect(mockStopTrips).toHaveBeenCalledTimes(1);
    expect(mockStopReservations).toHaveBeenCalledTimes(1);
  });

  it('sin sesión no abre ningún canal', async () => {
    await renderHook(() => useRealtimeTripsAndReservations(false), {
      wrapper: wrapperFor(makeStore()),
    });
    expect(tripService.subscribeToTripChanges).not.toHaveBeenCalled();
  });

  it('una notificación nueva entra al store y se anuncia al lector (S-07)', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    const store = makeStore();
    const { unmount } = await renderHook(() => useRealtimeNotifications('usuario-1'), {
      wrapper: wrapperFor(store),
    });

    const onInsert = jest.mocked(notificationService.subscribeToNotifications).mock.calls[0][1] as (
      n: Notificacion,
    ) => void;
    await act(() => onInsert(makeNotification({ id: 'n1' })));

    expect(store.getState().notifications.ids).toEqual(['n1']);
    expect(announce).toHaveBeenCalledWith(
      'Notificación: Reserva aceptada. ¡Tu reserva fue aceptada!',
    );

    await unmount();
    expect(mockStopNotifications).toHaveBeenCalled();
    announce.mockRestore();
  });
});

describe('conexión', () => {
  it('useConnectivity escucha NetInfo y deja de escuchar al desmontar', async () => {
    const stop = jest.fn();
    jest.mocked(NetInfo.addEventListener).mockReturnValueOnce(stop);
    const store = makeStore();
    const { unmount } = await renderHook(() => useConnectivity(), { wrapper: wrapperFor(store) });

    const listener = jest.mocked(NetInfo.addEventListener).mock.calls[0][0];
    await act(() =>
      listener({ isConnected: false, isInternetReachable: false } as Parameters<
        typeof listener
      >[0]),
    );
    expect(store.getState().settings.isOnline).toBe(false);

    await unmount();
    expect(stop).toHaveBeenCalled();
  });

  it('el banner aparece con datos guardados y la hora (TC-17)', async () => {
    const store = makeStore({ settings: { isOnline: false } });
    await renderWithProviders(
      <ConnectionBanner fromCache cachedAt={new Date(2026, 10, 7, 7, 5).getTime()} />,
      {},
      store,
    );
    expect(
      screen.getByText('Sin conexión: mostrando datos guardados (guardados a las 7:05 a. m.).'),
    ).toBeOnTheScreen();
  });

  it('con conexión y datos frescos no muestra el banner', async () => {
    await renderWithProviders(<ConnectionBanner fromCache={false} cachedAt={null} />);
    expect(screen.queryByText(/Sin conexión/)).toBeNull();
  });
});
