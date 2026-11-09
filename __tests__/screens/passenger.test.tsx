import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import HomeScreen from '@/app/(tabs)/index';
import CursoTab from '@/app/(tabs)/curso';
import ReservasTab from '@/app/(tabs)/reservas';
import ReserveTripScreen from '@/app/trip/[id]/reserve';
import { initialAuthState } from '@/features/auth/slice';
import { initialProfileState } from '@/features/profile/slice';
import { forwardGeocode, reverseGeocode } from '@/lib/location';
import * as reservationService from '@/services/reservationService';
import * as tripService from '@/services/tripService';
import { makeStore, type RootState } from '@/store/store';
import { makeProfile, makeReservation, makeTrip } from '@/test-utils/factories';
import { renderWithProviders } from '@/test-utils/render';

// Navegación, mapa, ubicación y servicios simulados SOLO dentro de estas pruebas.
jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual('react');
  return {
    router: {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      canGoBack: jest.fn(() => true),
    },
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
    useLocalSearchParams: jest.fn(() => ({ id: 't1' })),
  };
});
jest.mock('react-native-maps', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: View, Marker: View };
});
jest.mock('@/lib/location', () => ({
  reverseGeocode: jest.fn(),
  forwardGeocode: jest.fn(),
  getCurrentCoordinates: jest.fn(),
}));
jest.mock('@/hooks/useScreenFocus', () => ({
  useScreenFocus: jest.fn(() => ({ current: null })),
  SCREEN_FOCUS_DELAY_MS: 0,
}));
jest.mock('@/db/cache', () => ({
  loadWithCache: jest.fn(async ({ fetcher }) => ({
    data: await fetcher(),
    fromCache: false,
    cachedAt: 1,
  })),
  clearUserCache: jest.fn(async () => undefined),
}));
jest.mock('@/services/tripService', () => ({
  TRIPS_PAGE_SIZE: 20,
  listSectores: jest.fn(async () => [{ id: 7, nombre: 'Chía' }]),
  searchOpenTrips: jest.fn(),
  getTrip: jest.fn(),
}));
jest.mock('@/services/ratingService', () => ({ getAverages: jest.fn(async () => []) }));
jest.mock('@/services/reservationService', () => ({
  listMyReservations: jest.fn(),
  createReservation: jest.fn(),
  getReservation: jest.fn(),
  cancelReservation: jest.fn(),
}));

const trips = jest.mocked(tripService);
const reservations = jest.mocked(reservationService);

const trip = makeTrip({ id: 't1', origen_lat: 4.7, origen_lng: -74.05 });

function loggedStore(overrides: Partial<RootState> = {}) {
  return makeStore({
    auth: { ...initialAuthState, userId: 'pasajero-1', initialized: true },
    profile: { ...initialProfileState, data: makeProfile({ nombre: 'Sara' }) },
    ...overrides,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: 't1' });
});

describe('Inicio de pasajero (pantalla 10)', () => {
  it('saluda, busca al entrar y abre la reserva al tocar una tarjeta', async () => {
    trips.searchOpenTrips.mockResolvedValue([trip]);
    await renderWithProviders(<HomeScreen />, {}, loggedStore());

    expect(screen.getByRole('header', { name: '¡Buen viaje Sara!' })).toBeOnTheScreen();
    const card = await screen.findByRole('button', { name: /^Colina\. Conductor/ });
    expect(trips.searchOpenTrips).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 0, sectorId: null, minCupos: null }),
    );

    await fireEvent.press(card);
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/trip/[id]/reserve',
      params: { id: 't1' },
    });
  });

  it('filtra por puestos después del debounce y solo acepta dígitos (TC-06)', async () => {
    trips.searchOpenTrips.mockResolvedValue([]);
    await renderWithProviders(<HomeScreen />, {}, loggedStore());
    await screen.findByText(/No hay viajes disponibles/);

    await fireEvent.changeText(screen.getByLabelText('Cantidad de puestos disponibles'), 'a2');
    expect(screen.getByLabelText('Cantidad de puestos disponibles')).toHaveProp('value', '2');
    await waitFor(() =>
      expect(trips.searchOpenTrips).toHaveBeenLastCalledWith(
        expect.objectContaining({ minCupos: 2 }),
      ),
    );
  });

  it('muestra el error con Reintentar y vuelve a buscar (T-05)', async () => {
    trips.searchOpenTrips.mockRejectedValueOnce(new TypeError('Network request failed'));
    trips.searchOpenTrips.mockResolvedValue([trip]);
    await renderWithProviders(<HomeScreen />, {}, loggedStore());

    await fireEvent.press(await screen.findByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('button', { name: /^Colina\. Conductor/ })).toBeOnTheScreen();
  });
});

describe('Reserva (pantallas 11 y 12)', () => {
  const ADDRESS = 'Describe la dirección del punto de recogida';

  beforeEach(() => {
    trips.getTrip.mockResolvedValue(trip);
  });

  it('exige la dirección con error en texto y sin llamar a la RPC', async () => {
    await renderWithProviders(<ReserveTripScreen />, {}, loggedStore());
    await fireEvent.press(await screen.findByRole('button', { name: 'Reservar' }));
    expect(screen.getByLabelText(ADDRESS).props.accessibilityHint).toContain('Error:');
    expect(reservations.createReservation).not.toHaveBeenCalled();
  });

  it('al tocar el mapa llena la dirección con geocodificación inversa', async () => {
    jest.mocked(reverseGeocode).mockResolvedValue('Calle 1 # 2-3, Chía');
    await renderWithProviders(<ReserveTripScreen />, {}, loggedStore());
    const map = await screen.findByLabelText(/^Mapa para elegir el punto de recogida/);
    const coordinate = { latitude: 4.8, longitude: -74 };
    await fireEvent(map.children[0] as never, 'press', { nativeEvent: { coordinate } });
    await waitFor(() =>
      expect(screen.getByLabelText(ADDRESS)).toHaveProp('value', 'Calle 1 # 2-3, Chía'),
    );
  });

  it('solo con la dirección escrita reserva con el origen y confirma (T-07)', async () => {
    jest.mocked(forwardGeocode).mockResolvedValue(null);
    reservations.createReservation.mockResolvedValue(makeReservation());
    await renderWithProviders(<ReserveTripScreen />, {}, loggedStore());

    await fireEvent.changeText(await screen.findByLabelText(ADDRESS), 'Portería principal');
    await fireEvent.press(screen.getByRole('button', { name: 'Reservar' }));

    expect(
      await screen.findByText('Tu reserva quedó pendiente de la confirmación del conductor.'),
    ).toBeOnTheScreen();
    expect(reservations.createReservation).toHaveBeenCalledWith({
      viajeId: 't1',
      puntoRecogidaTexto: 'Portería principal',
      puntoLat: 4.7,
      puntoLng: -74.05,
    });

    await fireEvent.press(screen.getByRole('button', { name: '¡Listo!' }));
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/reservas');
  });

  it('una reserva duplicada muestra el mensaje de la RPC (TC-08)', async () => {
    jest.mocked(forwardGeocode).mockResolvedValue(null);
    reservations.createReservation.mockRejectedValue({
      code: 'P0001',
      message: 'reserva_duplicada',
    });
    await renderWithProviders(<ReserveTripScreen />, {}, loggedStore());
    await fireEvent.changeText(await screen.findByLabelText(ADDRESS), 'Portería');
    await fireEvent.press(screen.getByRole('button', { name: 'Reservar' }));
    expect(await screen.findByText('Ya tienes una reserva en este viaje.')).toBeOnTheScreen();
  });
});

describe('Viajes reservados (pantalla 13)', () => {
  const pendiente = makeReservation({ id: 'r1', estado: 'pendiente' });
  const rechazada = makeReservation({ id: 'r3', estado: 'rechazada' });

  it('separa por pestañas y la rechazada no se puede cancelar', async () => {
    reservations.listMyReservations.mockResolvedValue([pendiente, rechazada]);
    await renderWithProviders(<ReservasTab />, {}, loggedStore());

    expect(await screen.findByRole('button', { name: /^Cancelar reserva/ })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Pendientes' })).toBeSelected();

    await fireEvent.press(screen.getByRole('tab', { name: 'Rechazados' }));
    expect(screen.getByLabelText(/^Reserva rechazada/)).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /^Cancelar reserva/ })).toBeNull();
  });

  it('cancela solo tras confirmar, con la opción segura primero (TC-09, T-06)', async () => {
    reservations.listMyReservations.mockResolvedValue([pendiente]);
    reservations.cancelReservation.mockResolvedValue(undefined);
    reservations.getReservation.mockResolvedValue({ ...pendiente, estado: 'cancelada' });
    await renderWithProviders(<ReservasTab />, {}, loggedStore());

    await fireEvent.press(await screen.findByRole('button', { name: /^Cancelar reserva/ }));
    expect(reservations.cancelReservation).not.toHaveBeenCalled();
    const labels = screen.getAllByRole('button').map((b) => b.props.accessibilityLabel);
    expect(labels.indexOf('No, volver')).toBeLessThan(labels.indexOf('Sí, cancelar reserva'));

    await fireEvent.press(screen.getByRole('button', { name: 'Sí, cancelar reserva' }));
    await waitFor(() => expect(reservations.cancelReservation).toHaveBeenCalledWith('r1'));
    expect(await screen.findByText(/No tienes reservas pendientes/)).toBeOnTheScreen();
  });
});

describe('Viajes en curso (pantalla 14)', () => {
  it('muestra solo las reservas aceptadas de viajes iniciados', async () => {
    reservations.listMyReservations.mockResolvedValue([
      makeReservation({ id: 'r1', estado: 'aceptada', viaje: makeTrip({ estado: 'en_curso' }) }),
      makeReservation({ id: 'r2', estado: 'aceptada', viaje: makeTrip({ estado: 'abierto' }) }),
    ]);
    await renderWithProviders(<CursoTab />, {}, loggedStore());
    expect(await screen.findAllByLabelText(/^Reserva aceptada/)).toHaveLength(1);
  });

  it('sin viajes muestra un estado vacío claro', async () => {
    reservations.listMyReservations.mockResolvedValue([]);
    await renderWithProviders(<CursoTab />, {}, loggedStore());
    expect(await screen.findByText('No tienes viajes en curso')).toBeOnTheScreen();
  });
});
