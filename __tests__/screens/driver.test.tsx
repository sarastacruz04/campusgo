import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import CreadosTab from '@/app/(tabs)/creados';
import CursoTab from '@/app/(tabs)/curso';
import HomeScreen from '@/app/(tabs)/index';
import RequestsScreen from '@/app/requests';
import CreateTripScreen from '@/app/trip/create';
import { initialAuthState } from '@/features/auth/slice';
import { initialProfileState } from '@/features/profile/slice';
import { initialTripsState } from '@/features/trips/slice';
import { initialVehicleState } from '@/features/vehicle/slice';
import * as reservationService from '@/services/reservationService';
import * as tripService from '@/services/tripService';
import * as vehicleService from '@/services/vehicleService';
import { makeStore, type RootState } from '@/store/store';
import { makeProfile, makeReservation, makeTrip, makeVehicle } from '@/test-utils/factories';
import { renderWithProviders } from '@/test-utils/render';

jest.setTimeout(25000);

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
  };
});

jest.mock('react-native-maps', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: View, Marker: View };
});

jest.mock('@/lib/location', () => ({
  reverseGeocode: jest.fn(async () => 'Calle 100 # 15-20, Bogotá'),
  forwardGeocode: jest.fn(async () => ({ latitude: 4.68, longitude: -74.05 })),
  getCurrentCoordinates: jest.fn(async () => ({ latitude: 4.7, longitude: -74.05 })),
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
  listSectores: jest.fn(async () => [
    { id: 1, nombre: 'Colina' },
    { id: 2, nombre: 'Usaquén' },
  ]),
  listMyCreatedTrips: jest.fn(),
  searchOpenTrips: jest.fn(),
  getTrip: jest.fn(),
  createTrip: jest.fn(),
  startTrip: jest.fn(),
  finishTrip: jest.fn(),
  cancelTrip: jest.fn(),
}));

jest.mock('@/services/reservationService', () => ({
  listMyReservations: jest.fn(),
  listRequestsForMyTrips: jest.fn(),
  createReservation: jest.fn(),
  getReservation: jest.fn(),
  acceptReservation: jest.fn(),
  rejectReservation: jest.fn(),
  cancelReservation: jest.fn(),
}));

jest.mock('@/services/vehicleService', () => ({
  getMyVehicle: jest.fn(),
  registerVehicle: jest.fn(),
  deleteVehicle: jest.fn(),
}));

jest.mock('@/services/ratingService', () => ({
  getAverages: jest.fn(async () => []),
}));

const trips = jest.mocked(tripService);
const reservations = jest.mocked(reservationService);
const vehicles = jest.mocked(vehicleService);

const testVehicle = makeVehicle({ placa: 'XYZ789', capacidad: 4 });
const testTrip = makeTrip({
  id: 'viaje-1',
  conductor_id: 'conductor-1',
  sector_nombre: 'Colina',
  estado: 'abierto',
  cupos_disponibles: 3,
  cupos_totales: 3,
});

function driverStore(overrides: Partial<RootState> = {}) {
  return makeStore({
    auth: { ...initialAuthState, userId: 'conductor-1', initialized: true },
    profile: {
      ...initialProfileState,
      data: makeProfile({ id: 'conductor-1', nombre: 'Samuel', modo_actual: 'conductor' }),
    },
    vehicle: {
      ...initialVehicleState,
      data: testVehicle,
    },
    trips: {
      ...initialTripsState,
      sectores: [
        { id: 1, nombre: 'Colina' },
        { id: 2, nombre: 'Usaquén' },
      ],
      sectoresStatus: 'succeeded',
    },
    ...overrides,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  vehicles.getMyVehicle.mockResolvedValue(testVehicle);
  reservations.listRequestsForMyTrips.mockResolvedValue([]);
  trips.listMyCreatedTrips.mockResolvedValue([testTrip]);
});

describe('Inicio de conductor (pantalla 17)', () => {
  it('saluda, muestra tarjeta "Crea un viaje" y "Viajes Pendientes", y navega a crear viaje', async () => {
    reservations.listRequestsForMyTrips.mockResolvedValue([
      makeReservation({ id: 'r1', estado: 'pendiente' }),
    ]);

    await renderWithProviders(<HomeScreen />, {}, driverStore());

    expect(screen.getByRole('header', { name: '¡Buen viaje Samuel!' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Crea un viaje' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Viajes Pendientes' })).toBeOnTheScreen();
    expect(await screen.findByText('Tienes 1 solicitud de reserva pendiente.')).toBeOnTheScreen();

    // Navegar a crear viaje
    const createBtn = screen.getByRole('button', { name: 'Crear un nuevo viaje' });
    await fireEvent.press(createBtn);
    expect(router.push).toHaveBeenCalledWith('/trip/create');

    // Navegar a solicitudes
    const seeMoreBtn = screen.getByRole('button', { name: 'Ver solicitudes pendientes' });
    await fireEvent.press(seeMoreBtn);
    expect(router.push).toHaveBeenCalledWith('/requests');
  });
});

describe('Crea tu viaje (pantalla 18)', () => {
  it('muestra errores por campo y resumen al enviar datos vacíos', async () => {
    await renderWithProviders(<CreateTripScreen />, {}, driverStore());

    const submitBtn = screen.getByRole('button', { name: '¡Listo!' });
    await fireEvent.press(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Revisa los campos con error/i)).toBeOnTheScreen();
    });
    expect(trips.createTrip).not.toHaveBeenCalled();
  });

  it('permite completar el formulario y publicar el viaje con éxito', async () => {
    trips.createTrip.mockResolvedValue(testTrip);

    await renderWithProviders(<CreateTripScreen />, {}, driverStore());

    // Completar campos con await en cada evento
    await fireEvent.changeText(screen.getByLabelText('Punto de partida'), 'Calle 127 # 15-03');
    await fireEvent.changeText(screen.getByLabelText('Fecha de salida'), '20/12/2028');
    await fireEvent.changeText(screen.getByLabelText('Hora de salida'), '08:30');
    await fireEvent.changeText(screen.getByLabelText('Cupos disponibles'), '3');
    await fireEvent.changeText(screen.getByLabelText('Valor por cupo (COP)'), '6000');

    const submitBtn = screen.getByRole('button', { name: '¡Listo!' });
    await fireEvent.press(submitBtn);

    await waitFor(() => {
      expect(trips.createTrip).toHaveBeenCalledWith(
        expect.objectContaining({
          conductorId: 'conductor-1',
          vehiculoId: 'vehiculo-1',
          origenTexto: 'Calle 127 # 15-03',
          valorPorCupo: 6000,
          cuposTotales: 3,
        }),
      );
    });

    // Modal de confirmación de éxito
    expect(await screen.findByText('Viaje realizado con éxito')).toBeOnTheScreen();
    const readyButtons = screen.getAllByRole('button', { name: '¡Listo!' });
    const readyBtn = readyButtons[readyButtons.length - 1];
    await fireEvent.press(readyBtn);
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/creados');
  });

  it('con una hora mal escrita, el error sale solo bajo la hora y no bajo la fecha (TC-10)', async () => {
    await renderWithProviders(<CreateTripScreen />, {}, driverStore());

    await fireEvent.changeText(screen.getByLabelText('Punto de partida'), 'Calle 127 # 15-03');
    await fireEvent.changeText(screen.getByLabelText('Fecha de salida'), '20/12/2028');
    await fireEvent.changeText(screen.getByLabelText('Hora de salida'), '6');
    await fireEvent.changeText(screen.getByLabelText('Cupos disponibles'), '3');
    await fireEvent.changeText(screen.getByLabelText('Valor por cupo (COP)'), '6000');
    await fireEvent.press(screen.getByRole('button', { name: '¡Listo!' }));

    expect(
      await screen.findByText('Revisa los campos con error: Hora de salida.'),
    ).toBeOnTheScreen();
    expect(
      screen.getAllByText('La hora debe tener el formato HH:MM (ej: 07:30 o 14:15).'),
    ).toHaveLength(1);
    expect(trips.createTrip).not.toHaveBeenCalled();
  });

  it('acepta la hora de un dígito "6:00" y crea el viaje (TC-10)', async () => {
    trips.createTrip.mockResolvedValue(testTrip);
    await renderWithProviders(<CreateTripScreen />, {}, driverStore());

    await fireEvent.changeText(screen.getByLabelText('Punto de partida'), 'Calle 127 # 15-03');
    await fireEvent.changeText(screen.getByLabelText('Fecha de salida'), '20/12/2028');
    await fireEvent.changeText(screen.getByLabelText('Hora de salida'), '6:00');
    await fireEvent.changeText(screen.getByLabelText('Cupos disponibles'), '3');
    await fireEvent.changeText(screen.getByLabelText('Valor por cupo (COP)'), '6000');
    await fireEvent.press(screen.getByRole('button', { name: '¡Listo!' }));

    await waitFor(() => expect(trips.createTrip).toHaveBeenCalled());
  });
});

describe('Viajes creados (pantalla 19)', () => {
  it('muestra la lista de viajes creados y controla inicio y cancelación', async () => {
    const tripWithAcceptedRes = makeTrip({
      id: 'viaje-1',
      sector_nombre: 'Colina',
      estado: 'abierto',
    });
    trips.listMyCreatedTrips.mockResolvedValue([tripWithAcceptedRes]);
    reservations.listRequestsForMyTrips.mockResolvedValue([
      makeReservation({ id: 'r1', viaje_id: 'viaje-1', estado: 'aceptada' }),
    ]);
    trips.startTrip.mockResolvedValue(undefined);
    trips.getTrip.mockResolvedValue({ ...tripWithAcceptedRes, estado: 'en_curso' });

    await renderWithProviders(<CreadosTab />, {}, driverStore());

    // Botón Iniciar viaje habilitado porque tiene 1 reserva aceptada
    const startBtn = await screen.findByRole('button', { name: 'Iniciar viaje a Colina' });
    expect(startBtn).not.toBeDisabled();
    await fireEvent.press(startBtn);

    await waitFor(() => {
      expect(trips.startTrip).toHaveBeenCalledWith('viaje-1');
    });

    // Cancelar viaje abre el ConfirmDialog
    const cancelBtn = screen.getByRole('button', { name: 'Cancelar viaje a Colina' });
    await fireEvent.press(cancelBtn);

    expect(await screen.findByText('¿Deseas cancelar este viaje?')).toBeOnTheScreen();
    trips.cancelTrip.mockResolvedValue(undefined);
    const confirmCancelBtn = screen.getByRole('button', { name: 'Sí, cancelar viaje' });
    await fireEvent.press(confirmCancelBtn);

    await waitFor(() => {
      expect(trips.cancelTrip).toHaveBeenCalledWith('viaje-1');
    });
  });

  it('deshabilita "Iniciar viaje" si no hay reservas aceptadas (R8)', async () => {
    const tripNoReservations = makeTrip({
      id: 'viaje-2',
      sector_nombre: 'Usaquén',
      estado: 'abierto',
    });
    trips.listMyCreatedTrips.mockResolvedValue([tripNoReservations]);
    reservations.listRequestsForMyTrips.mockResolvedValue([]);

    await renderWithProviders(<CreadosTab />, {}, driverStore());

    const startBtn = await screen.findByRole('button', { name: 'Iniciar viaje a Usaquén' });
    expect(startBtn).toBeDisabled();
  });
});

describe('Solicitudes de reserva (requests.tsx)', () => {
  it('permite aceptar y rechazar solicitudes de reserva', async () => {
    const req1 = makeReservation({
      id: 'r1',
      pasajero_nombre: 'Pedro Gómez',
      estado: 'pendiente',
    });
    reservations.listRequestsForMyTrips.mockResolvedValue([req1]);
    reservations.acceptReservation.mockResolvedValue(undefined);
    reservations.getReservation.mockResolvedValue({ ...req1, estado: 'aceptada' });

    await renderWithProviders(<RequestsScreen />, {}, driverStore());

    const acceptBtn = await screen.findByRole('button', {
      name: 'Aceptar reserva de Pedro Gómez',
    });
    await fireEvent.press(acceptBtn);

    await waitFor(() => {
      expect(reservations.acceptReservation).toHaveBeenCalledWith('r1');
    });

    // Rechazar
    reservations.rejectReservation.mockResolvedValue(undefined);
    reservations.getReservation.mockResolvedValue({ ...req1, estado: 'rechazada' });
    const rejectBtn = screen.getByRole('button', { name: 'Rechazar reserva de Pedro Gómez' });
    await fireEvent.press(rejectBtn);

    await waitFor(() => {
      expect(reservations.rejectReservation).toHaveBeenCalledWith('r1');
    });
  });
});

describe('Viajes en curso (pantalla 14) para conductor', () => {
  it('muestra viajes en curso y permite finalizarlos con confirmación', async () => {
    const inProgressTrip = makeTrip({
      id: 'viaje-en-curso',
      sector_nombre: 'Colina',
      estado: 'en_curso',
    });
    trips.listMyCreatedTrips.mockResolvedValue([inProgressTrip]);
    trips.finishTrip.mockResolvedValue(undefined);
    trips.getTrip.mockResolvedValue({ ...inProgressTrip, estado: 'finalizado' });

    await renderWithProviders(<CursoTab />, {}, driverStore());

    const finishBtn = await screen.findByRole('button', {
      name: 'Finalizar viaje a Colina',
    });
    await fireEvent.press(finishBtn);

    expect(await screen.findByText('¿Deseas finalizar este viaje?')).toBeOnTheScreen();

    const confirmFinishBtn = screen.getByRole('button', { name: 'Sí, finalizar viaje' });
    await fireEvent.press(confirmFinishBtn);

    await waitFor(() => {
      expect(trips.finishTrip).toHaveBeenCalledWith('viaje-en-curso');
    });
  });
});
