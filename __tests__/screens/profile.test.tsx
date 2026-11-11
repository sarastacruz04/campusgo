import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import ProfileScreen from '@/app/profile';
import * as notificationService from '@/services/notificationService';
import * as profileService from '@/services/profileService';
import * as ratingService from '@/services/ratingService';
import * as vehicleService from '@/services/vehicleService';
import { initialRequest } from '@/store/types';
import { makeStore } from '@/store/store';
import { makeNotification, makeProfile, makeVehicle } from '@/test-utils/factories';
import { renderWithProviders } from '@/test-utils/render';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useSegments: jest.fn(() => []),
  useLocalSearchParams: jest.fn(() => ({})),
}));

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

jest.mock('@/services/ratingService', () => ({
  getAverages: jest.fn(async () => []),
}));

jest.mock('@/services/notificationService', () => ({
  listNotifications: jest.fn(async () => []),
}));

jest.mock('@/db/cache', () => ({
  loadWithCache: jest.fn(async ({ fetcher }) => ({
    data: await fetcher(),
    fromCache: false,
    cachedAt: null,
  })),
  clearUserCache: jest.fn(async () => undefined),
}));

jest.mock('@/hooks/useScreenFocus', () => ({
  useScreenFocus: jest.fn(() => ({ current: null })),
  SCREEN_FOCUS_DELAY_MS: 0,
}));

describe('ProfileScreen (Pantalla 15)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(ratingService.getAverages).mockResolvedValue([]);
    jest.mocked(notificationService.listNotifications).mockResolvedValue([]);
  });

  it('renderiza la información del perfil en la pestaña Pasajero', async () => {
    const profile = makeProfile({
      nombre: 'Samuel',
      apellido: 'Borda',
      id_universidad: '0000123456',
      email: 'sborda@unisabana.edu.co',
      telefono: '3101234567',
    });

    jest.mocked(profileService.getProfile).mockResolvedValue(profile);
    jest.mocked(vehicleService.getMyVehicle).mockResolvedValue(null);

    const store = makeStore({
      auth: {
        userId: profile.id,
        email: profile.email,
        pendingVerificationEmail: null,
        initialized: true,
        status: 'succeeded',
        error: null,
      },
      profile: {
        data: profile,
        load: { status: 'succeeded', error: null },
        save: initialRequest,
        fromCache: false,
        cachedAt: null,
      },
      vehicle: {
        data: null,
        load: { status: 'succeeded', error: null },
        save: initialRequest,
      },
    });

    await renderWithProviders(<ProfileScreen />, {}, store);

    expect(screen.getByText('Mi Perfil')).toBeTruthy();
    expect(screen.getByText('Samuel Borda')).toBeTruthy();
    expect(screen.getByText('0000123456')).toBeTruthy();
    expect(screen.getByText('sborda@unisabana.edu.co')).toBeTruthy();
    expect(screen.getByText('3101234567')).toBeTruthy();
  });

  it('cambia entre la pestaña Pasajero y la pestaña Carro', async () => {
    const profile = makeProfile();
    const vehicle = makeVehicle({
      placa: 'XYZ987',
      marca: 'Chevrolet',
      modelo: 'Onix',
      capacidad: 4,
    });

    jest.mocked(profileService.getProfile).mockResolvedValue(profile);
    jest.mocked(vehicleService.getMyVehicle).mockResolvedValue(vehicle);

    const store = makeStore({
      auth: {
        userId: profile.id,
        email: profile.email,
        pendingVerificationEmail: null,
        initialized: true,
        status: 'succeeded',
        error: null,
      },
      profile: {
        data: profile,
        load: { status: 'succeeded', error: null },
        save: initialRequest,
        fromCache: false,
        cachedAt: null,
      },
      vehicle: {
        data: vehicle,
        load: { status: 'succeeded', error: null },
        save: initialRequest,
      },
    });

    await renderWithProviders(<ProfileScreen />, {}, store);

    // Inicialmente en pestaña Pasajero
    expect(screen.getByText('Opciones y accesos')).toBeTruthy();

    // Cambiamos a pestaña Carro (SegmentedToggle role="radio")
    const carroTab = screen.getByRole('radio', { name: 'Carro' });
    await fireEvent.press(carroTab);

    // Debe mostrar la información del vehículo
    expect(screen.getByText('XYZ987')).toBeTruthy();
    expect(screen.getByText('Chevrolet Onix')).toBeTruthy();
    expect(screen.getByText('4 cupos')).toBeTruthy();
  });

  it('muestra opción de registrar carro si el usuario no tiene vehículo', async () => {
    const profile = makeProfile();
    jest.mocked(profileService.getProfile).mockResolvedValue(profile);
    jest.mocked(vehicleService.getMyVehicle).mockResolvedValue(null);

    const store = makeStore({
      auth: {
        userId: profile.id,
        email: profile.email,
        pendingVerificationEmail: null,
        initialized: true,
        status: 'succeeded',
        error: null,
      },
      profile: {
        data: profile,
        load: { status: 'succeeded', error: null },
        save: initialRequest,
        fromCache: false,
        cachedAt: null,
      },
      vehicle: {
        data: null,
        load: { status: 'succeeded', error: null },
        save: initialRequest,
      },
    });

    await renderWithProviders(<ProfileScreen />, {}, store);

    const carroTab = screen.getByRole('radio', { name: 'Carro' });
    await fireEvent.press(carroTab);

    expect(screen.getByText('No tienes un carro registrado actualmente.')).toBeTruthy();
    const registrarCarroBtn = screen.getByRole('button', { name: 'Registrar Carro' });
    expect(registrarCarroBtn).toBeTruthy();

    await fireEvent.press(registrarCarroBtn);
    expect(router.push).toHaveBeenCalledWith('/(auth)/register/car');
  });

  it('abre el diálogo de confirmación para eliminar vehículo con opciones accesibles', async () => {
    const profile = makeProfile();
    const vehicle = makeVehicle();
    jest.mocked(profileService.getProfile).mockResolvedValue(profile);
    jest.mocked(vehicleService.getMyVehicle).mockResolvedValue(vehicle);

    const store = makeStore({
      auth: {
        userId: profile.id,
        email: profile.email,
        pendingVerificationEmail: null,
        initialized: true,
        status: 'succeeded',
        error: null,
      },
      profile: {
        data: profile,
        load: { status: 'succeeded', error: null },
        save: initialRequest,
        fromCache: false,
        cachedAt: null,
      },
      vehicle: {
        data: vehicle,
        load: { status: 'succeeded', error: null },
        save: initialRequest,
      },
    });

    await renderWithProviders(<ProfileScreen />, {}, store);

    const carroTab = screen.getByRole('radio', { name: 'Carro' });
    await fireEvent.press(carroTab);

    const deleteBtn = screen.getByRole('button', { name: 'Eliminar este carro' });
    await fireEvent.press(deleteBtn);

    expect(screen.getByText('¿Está seguro de que desea eliminar este carro?')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sí, eliminar carro' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'No, volver' })).toBeTruthy();
  });

  it('abre el diálogo de confirmación para cerrar sesión', async () => {
    const profile = makeProfile();
    jest.mocked(profileService.getProfile).mockResolvedValue(profile);
    jest.mocked(vehicleService.getMyVehicle).mockResolvedValue(null);

    const store = makeStore({
      auth: {
        userId: profile.id,
        email: profile.email,
        pendingVerificationEmail: null,
        initialized: true,
        status: 'succeeded',
        error: null,
      },
      profile: {
        data: profile,
        load: { status: 'succeeded', error: null },
        save: initialRequest,
        fromCache: false,
        cachedAt: null,
      },
      vehicle: {
        data: null,
        load: { status: 'succeeded', error: null },
        save: initialRequest,
      },
    });

    await renderWithProviders(<ProfileScreen />, {}, store);

    const signOutBtn = screen.getByRole('button', { name: 'Cerrar sesión' });
    await fireEvent.press(signOutBtn);

    expect(screen.getByText('¿Deseas cerrar sesión?')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sí, cerrar sesión' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'No, volver' })).toBeTruthy();
  });

  it('muestra el promedio de calificación y el acceso a Notificaciones con contador', async () => {
    const profile = makeProfile({ id: 'u-notif' });
    jest.mocked(profileService.getProfile).mockResolvedValue(profile);
    jest.mocked(vehicleService.getMyVehicle).mockResolvedValue(null);
    jest
      .mocked(ratingService.getAverages)
      .mockResolvedValue([{ usuario_id: 'u-notif', promedio: 4.8, total: 5 }]);
    jest
      .mocked(notificationService.listNotifications)
      .mockResolvedValue([
        makeNotification({ id: 'n1', leida: false }),
        makeNotification({ id: 'n2', leida: false }),
        makeNotification({ id: 'n3', leida: true }),
      ]);

    const store = makeStore({
      auth: {
        userId: profile.id,
        email: profile.email,
        pendingVerificationEmail: null,
        initialized: true,
        status: 'succeeded',
        error: null,
      },
      profile: {
        data: profile,
        load: { status: 'succeeded', error: null },
        save: initialRequest,
        fromCache: false,
        cachedAt: null,
      },
      vehicle: {
        data: null,
        load: { status: 'succeeded', error: null },
        save: initialRequest,
      },
    });

    await renderWithProviders(<ProfileScreen />, {}, store);

    expect(await screen.findByText('Calificación: 4,8 de 5 (5)')).toBeTruthy();
    const notifBtn = await screen.findByRole('button', {
      name: 'Notificaciones, 2 sin leer',
    });
    expect(notifBtn).toBeTruthy();

    await fireEvent.press(notifBtn);
    expect(router.push).toHaveBeenCalledWith('/notifications');
  });
});
