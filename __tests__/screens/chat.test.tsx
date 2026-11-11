import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import TripChatScreen from '@/app/trip/[id]/chat';
import { ReservationCard } from '@/components/trips/ReservationCard';
import { initialAuthState } from '@/features/auth/slice';
import * as chatService from '@/services/chatService';
import * as tripService from '@/services/tripService';
import { makeStore } from '@/store/store';
import { makeReservation, makeTrip } from '@/test-utils/factories';
import { flatStyle, renderWithProviders } from '@/test-utils/render';
import { TOUCH_MIN } from '@/theme/layout';
import type { Mensaje } from '@/types/database';

// Navegación y servicios simulados SOLO dentro de estas pruebas.
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) },
  useLocalSearchParams: jest.fn(() => ({ id: 't1' })),
}));
jest.mock('@/hooks/useScreenFocus', () => ({
  useScreenFocus: jest.fn(() => ({ current: null })),
  SCREEN_FOCUS_DELAY_MS: 0,
}));
// La suscripción guarda el callback para simular un mensaje que llega por Realtime.
let mockOnInsert: (mensaje: Mensaje) => void = () => undefined;
const mockStop = jest.fn();
jest.mock('@/services/chatService', () => ({
  MAX_MESSAGE_LENGTH: 500,
  isParticipant: jest.fn(),
  listMessages: jest.fn(),
  getAuthorNames: jest.fn(async () => ({})),
  sendMessage: jest.fn(),
  subscribeToMessages: jest.fn((_viajeId: string, onInsert: (mensaje: Mensaje) => void) => {
    mockOnInsert = onInsert;
    return mockStop;
  }),
}));
jest.mock('@/services/tripService', () => ({ TRIPS_PAGE_SIZE: 20, getTrip: jest.fn() }));

const chat = jest.mocked(chatService);
const trips = jest.mocked(tripService);

const trip = makeTrip({ id: 't1', conductor_id: 'c1', conductor_nombre: 'Miguel Ordóñez' });

const message = (id: string, autor_id: string, contenido: string, minute = 0): Mensaje => ({
  id,
  viaje_id: 't1',
  autor_id,
  contenido,
  created_at: `2026-11-09T15:${String(minute).padStart(2, '0')}:00Z`,
});

function renderChat() {
  const store = makeStore({
    auth: { ...initialAuthState, userId: 'pasajero-1', initialized: true },
  });
  return renderWithProviders(<TripChatScreen />, {}, store);
}

beforeEach(() => {
  jest.clearAllMocks();
  trips.getTrip.mockResolvedValue(trip);
  chat.isParticipant.mockResolvedValue(true);
  chat.listMessages.mockResolvedValue({ messages: [], authorNames: {} });
});

describe('Chat del viaje', () => {
  it('muestra el estado vacío y un botón de enviar de 48 dp deshabilitado sin texto', async () => {
    await renderChat();
    expect(await screen.findByText('Todavía no hay mensajes')).toBeTruthy();
    const sendButton = screen.getByRole('button', { name: 'Enviar mensaje' });
    expect(sendButton).toBeDisabled();
    const style = flatStyle(sendButton.props.style);
    expect(style.minHeight).toBeGreaterThanOrEqual(TOUCH_MIN);
    expect(style.minWidth).toBeGreaterThanOrEqual(TOUCH_MIN);
  });

  it('lista los mensajes invertida, con cada mensaje como un solo foco', async () => {
    chat.listMessages.mockResolvedValue({
      messages: [message('m1', 'c1', 'Salgo en 10', 0), message('m2', 'pasajero-1', 'Listo', 1)],
      authorNames: { c1: 'Miguel Ordóñez', 'pasajero-1': 'Sara Santacruz' },
    });
    await renderChat();
    const mine = await screen.findByLabelText(/^Tú, .*: Listo$/);
    expect(mine).toBeTruthy();
    expect(screen.getByLabelText(/^Miguel Ordóñez, .*: Salgo en 10$/)).toBeTruthy();
    // El más nuevo va primero en los datos: inverted lo dibuja abajo.
    const labels = screen
      .getAllByLabelText(/: (Listo|Salgo en 10)$/)
      .map((node) => node.props.accessibilityLabel as string);
    expect(labels[0]).toMatch(/Listo$/);
  });

  it('limita el mensaje a 500 caracteres y muestra el contador', async () => {
    await renderChat();
    const input = await screen.findByLabelText('Mensaje');
    expect(input).toHaveProp('maxLength', 500);
    await fireEvent.changeText(input, 'Hola');
    expect(screen.getByText('4 de 500 caracteres')).toBeTruthy();
  });

  it('envía el mensaje, limpia el campo y lo anuncia', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    chat.sendMessage.mockResolvedValue(message('m3', 'pasajero-1', 'Voy saliendo'));
    await renderChat();
    const input = await screen.findByLabelText('Mensaje');
    await fireEvent.changeText(input, 'Voy saliendo');
    await fireEvent.press(screen.getByRole('button', { name: 'Enviar mensaje' }));
    await waitFor(() =>
      expect(chat.sendMessage).toHaveBeenCalledWith('t1', 'pasajero-1', 'Voy saliendo'),
    );
    await waitFor(() => expect(announce).toHaveBeenCalledWith('Mensaje enviado.'));
    expect(screen.getByLabelText('Mensaje')).toHaveProp('value', '');
  });

  it('anuncia al lector el mensaje nuevo de otra persona que llega por Realtime (S-07)', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    await renderChat();
    await screen.findByText('Todavía no hay mensajes');
    await act(async () => mockOnInsert(message('m4', 'c1', 'Ya llegué', 5)));
    await waitFor(() =>
      expect(announce).toHaveBeenCalledWith('Mensaje nuevo de Miguel Ordóñez: Ya llegué'),
    );
  });

  it('no anuncia los mensajes que ya estaban al abrir', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    chat.listMessages.mockResolvedValue({
      messages: [message('m1', 'c1', 'Salgo en 10')],
      authorNames: { c1: 'Miguel Ordóñez' },
    });
    await renderChat();
    await screen.findByLabelText(/Salgo en 10$/);
    expect(announce).not.toHaveBeenCalledWith(expect.stringContaining('Mensaje nuevo'));
  });

  it('a quien no participa le muestra que no tiene acceso y oculta el campo (R10)', async () => {
    chat.isParticipant.mockResolvedValue(false);
    await renderChat();
    expect(await screen.findByText(/No tienes acceso a este chat/)).toBeTruthy();
    expect(screen.queryByLabelText('Mensaje')).toBeNull();
    expect(chat.listMessages).not.toHaveBeenCalled();
  });

  it('con el viaje cancelado deja leer pero no enviar', async () => {
    trips.getTrip.mockResolvedValue({ ...trip, estado: 'cancelado' });
    await renderChat();
    expect(await screen.findByText(/Este viaje fue cancelado/)).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText('Mensaje'), 'Hola');
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeDisabled();
  });

  it('cierra la suscripción de Realtime al salir', async () => {
    const view = await renderChat();
    await screen.findByText('Todavía no hay mensajes');
    await view.unmount();
    expect(mockStop).toHaveBeenCalled();
  });
});

describe('ReservationCard con chat', () => {
  it('muestra "Abrir chat" con el sector y pasa el id del viaje', async () => {
    const onPressChat = jest.fn();
    await renderWithProviders(
      <ReservationCard
        reservation={makeReservation({ estado: 'aceptada', viaje: trip })}
        ratingAverage={null}
        ratingTotal={0}
        onPressChat={onPressChat}
      />,
    );
    await fireEvent.press(
      screen.getByRole('button', { name: `Abrir chat del viaje a ${trip.sector_nombre}` }),
    );
    expect(onPressChat).toHaveBeenCalledWith('t1');
  });
});
