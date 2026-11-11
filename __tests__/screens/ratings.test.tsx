import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { CreatedTripCard } from '@/components/trips/CreatedTripCard';
import { ReservationCard } from '@/components/trips/ReservationCard';
import RateTripScreen from '@/app/trip/[id]/rate';
import { initialAuthState } from '@/features/auth/slice';
import * as ratingService from '@/services/ratingService';
import { makeStore } from '@/store/store';
import { makeReservation, makeTrip } from '@/test-utils/factories';
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
    useLocalSearchParams: jest.fn(() => ({ id: 'viaje-1' })),
    useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
  };
});

jest.mock('@/hooks/useScreenFocus', () => ({
  useScreenFocus: jest.fn(() => ({ current: null })),
  SCREEN_FOCUS_DELAY_MS: 0,
}));

jest.mock('@/services/ratingService', () => ({
  getAverages: jest.fn(async () => []),
  submitRating: jest.fn(),
  getTripRatingContext: jest.fn(),
}));

function authedStore(userId = 'pasajero-1') {
  return makeStore({
    auth: { ...initialAuthState, userId, initialized: true },
  });
}

describe('RateTripScreen y disparadores de calificación (TC-15, E7)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(ratingService.getAverages).mockResolvedValue([]);
  });

  it('pasajero califica un viaje finalizado con estrellas accesibles y comentario opcional', async () => {
    const trip = makeTrip({
      id: 'viaje-1',
      conductor_id: 'conductor-1',
      conductor_nombre: 'Laura Gómez',
      estado: 'finalizado',
    });
    jest.mocked(ratingService.getTripRatingContext).mockResolvedValue({
      trip,
      canRate: true,
      targets: [
        { userId: 'conductor-1', fullName: 'Laura Gómez', role: 'conductor', existingRating: null },
      ],
    });
    jest.mocked(ratingService.submitRating).mockResolvedValue({
      id: 'cal-1',
      viaje_id: 'viaje-1',
      autor_id: 'pasajero-1',
      destinatario_id: 'conductor-1',
      estrellas: 4,
      comentario: 'Excelente viaje',
      created_at: '2026-11-10T16:00:00.000Z',
    });

    await renderWithProviders(<RateTripScreen />, {}, authedStore('pasajero-1'));

    expect(await screen.findByText('Conductor: Laura Gómez')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: '4 de 5 estrellas' }));
    await fireEvent.changeText(screen.getByLabelText(/Comentario \(opcional\)/), 'Excelente viaje');
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar calificación' }));

    await waitFor(() => {
      expect(ratingService.submitRating).toHaveBeenCalledWith({
        viajeId: 'viaje-1',
        autorId: 'pasajero-1',
        destinatarioId: 'conductor-1',
        estrellas: 4,
        comentario: 'Excelente viaje',
      });
    });
    expect(mockHaptics.success).toHaveBeenCalled();
    expect(mockAnnounce).toHaveBeenCalledWith('Calificaste a Laura Gómez con 4 de 5 estrellas.');
    expect(await screen.findByText('Ya calificaste a Laura Gómez')).toBeTruthy();
  });

  it('valida que se seleccione al menos 1 estrella antes de enviar', async () => {
    const trip = makeTrip({ id: 'viaje-1', estado: 'finalizado' });
    jest.mocked(ratingService.getTripRatingContext).mockResolvedValue({
      trip,
      canRate: true,
      targets: [
        { userId: 'conductor-1', fullName: 'Laura Gómez', role: 'conductor', existingRating: null },
      ],
    });

    await renderWithProviders(<RateTripScreen />, {}, authedStore('pasajero-1'));
    await screen.findByText('Conductor: Laura Gómez');

    await fireEvent.press(screen.getByRole('button', { name: 'Enviar calificación' }));
    expect(ratingService.submitRating).not.toHaveBeenCalled();
    expect(
      await screen.findByText('Selecciona una calificación entre 1 y 5 estrellas.'),
    ).toBeTruthy();
    expect(screen.getByText('Revisa los campos con error: Estrellas.')).toBeTruthy();
  });

  it('bloquea la calificación si el viaje no está finalizado (R9)', async () => {
    const trip = makeTrip({ id: 'viaje-1', estado: 'en_curso' });
    jest.mocked(ratingService.getTripRatingContext).mockResolvedValue({
      trip,
      canRate: false,
      targets: [
        { userId: 'conductor-1', fullName: 'Laura Gómez', role: 'conductor', existingRating: null },
      ],
    });

    await renderWithProviders(<RateTripScreen />, {}, authedStore('pasajero-1'));

    expect(
      await screen.findByText('Solo puedes calificar viajes que ya hayan finalizado.'),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Enviar calificación' })).toBeNull();
  });

  it('permite al conductor seleccionar entre múltiples pasajeros aceptados para calificar', async () => {
    const trip = makeTrip({ id: 'viaje-1', conductor_id: 'conductor-1', estado: 'finalizado' });
    jest.mocked(ratingService.getTripRatingContext).mockResolvedValue({
      trip,
      canRate: true,
      targets: [
        { userId: 'p1', fullName: 'Ana Ruiz', role: 'pasajero', existingRating: null },
        { userId: 'p2', fullName: 'Luis Mora', role: 'pasajero', existingRating: null },
      ],
    });
    jest.mocked(ratingService.submitRating).mockResolvedValue({
      id: 'cal-2',
      viaje_id: 'viaje-1',
      autor_id: 'conductor-1',
      destinatario_id: 'p2',
      estrellas: 5,
      comentario: null,
      created_at: '2026-11-10T16:10:00.000Z',
    });

    await renderWithProviders(<RateTripScreen />, {}, authedStore('conductor-1'));

    expect(await screen.findByText('Pasajero: Ana Ruiz')).toBeTruthy();
    await fireEvent.press(
      screen.getByRole('radio', { name: 'Luis Mora (pendiente por calificar)' }),
    );
    expect(await screen.findByText('Pasajero: Luis Mora')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: '5 de 5 estrellas' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar calificación' }));

    await waitFor(() => {
      expect(ratingService.submitRating).toHaveBeenCalledWith({
        viajeId: 'viaje-1',
        autorId: 'conductor-1',
        destinatarioId: 'p2',
        estrellas: 5,
        comentario: undefined,
      });
    });
  });

  it('muestra botones para calificar solo en viajes finalizados con participación aceptada', async () => {
    const onPressRate = jest.fn();
    const onRateTrip = jest.fn();

    await renderWithProviders(
      <>
        <ReservationCard
          reservation={makeReservation({
            estado: 'aceptada',
            viaje: makeTrip({ id: 'v-fin', sector_nombre: 'Chía', estado: 'finalizado' }),
          })}
          ratingAverage={4.5}
          ratingTotal={2}
          onPressRate={onPressRate}
        />
        <CreatedTripCard
          trip={makeTrip({ id: 'v-fin', sector_nombre: 'Chía', estado: 'finalizado' })}
          acceptedReservationsCount={1}
          onRateTrip={onRateTrip}
        />
      </>,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Calificar viaje a Chía' }));
    expect(onPressRate).toHaveBeenCalledWith('v-fin');

    await fireEvent.press(
      screen.getByRole('button', { name: 'Calificar pasajeros del viaje a Chía' }),
    );
    expect(onRateTrip).toHaveBeenCalledWith('v-fin');
  });
});
