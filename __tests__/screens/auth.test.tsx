import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import LoginScreen from '@/app/(auth)/login';
import * as authService from '@/services/authService';
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

jest.mock('@/services/authService', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  getCurrentUser: jest.fn(),
  verifySignUpCode: jest.fn(),
  resendSignUpCode: jest.fn(),
}));

jest.mock('@/db/cache', () => ({
  clearUserCache: jest.fn(async () => undefined),
}));

jest.mock('@/hooks/useScreenFocus', () => ({
  useScreenFocus: jest.fn(() => ({ current: null })),
  SCREEN_FOCUS_DELAY_MS: 0,
}));

jest.mock('@/hooks/useAnnounce', () => ({
  useAnnounce: () => jest.fn(),
}));

describe('LoginScreen (Pantalla 2 y ERROR)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza título, campos de entrada y botón de inicio de sesión', async () => {
    await renderWithProviders(<LoginScreen />);

    expect(screen.getByText('Inicio Sesión')).toBeTruthy();
    expect(screen.getByLabelText('Correo electrónico')).toBeTruthy();
    expect(screen.getByLabelText('Contraseña')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeTruthy();
  });

  it('actualiza el texto en los campos de entrada', async () => {
    await renderWithProviders(<LoginScreen />);

    const emailInput = screen.getByLabelText('Correo electrónico');
    await fireEvent.changeText(emailInput, 'usuario@gmail.com');
    expect(emailInput.props.value).toBe('usuario@gmail.com');

    const passInput = screen.getByLabelText('Contraseña');
    await fireEvent.changeText(passInput, '123456');
    expect(passInput.props.value).toBe('123456');
  });

  it('muestra errores de validación si los campos están vacíos al presionar iniciar sesión', async () => {
    await renderWithProviders(<LoginScreen />);

    const submitBtn = screen.getByRole('button', { name: 'Iniciar Sesión' });
    await fireEvent.press(submitBtn);

    expect(screen.getByText('Por favor ingresa tu correo electrónico.')).toBeTruthy();
    expect(screen.getByText('Por favor ingresa tu contraseña.')).toBeTruthy();
  });

  it('muestra error si el correo no termina en @unisabana.edu.co', async () => {
    await renderWithProviders(<LoginScreen />);

    const emailInput = screen.getByLabelText('Correo electrónico');
    await fireEvent.changeText(emailInput, 'estudiante@gmail.com');

    const passInput = screen.getByLabelText('Contraseña');
    await fireEvent.changeText(passInput, '123456');

    const submitBtn = screen.getByRole('button', { name: 'Iniciar Sesión' });
    await fireEvent.press(submitBtn);

    expect(
      screen.getByText('Solo se permiten correos institucionales terminados en @unisabana.edu.co.'),
    ).toBeTruthy();
  });

  it('navega al flujo de registro al presionar el enlace de registro', async () => {
    await renderWithProviders(<LoginScreen />);

    const registerLink = screen.getByRole('link', {
      name: 'Regístrate en CampusGo',
    });
    await fireEvent.press(registerLink);

    expect(router.push).toHaveBeenCalledWith('/(auth)/register');
  });

  it('muestra la pantalla completa de ERROR cuando el inicio de sesión falla en el servidor', async () => {
    jest.mocked(authService.signIn).mockRejectedValueOnce({
      code: 'invalid_credentials',
      message: 'El correo o la contraseña no son correctos.',
    });

    await renderWithProviders(<LoginScreen />);

    const emailInput = screen.getByLabelText('Correo electrónico');
    await fireEvent.changeText(emailInput, 'estudiante@unisabana.edu.co');

    const passInput = screen.getByLabelText('Contraseña');
    await fireEvent.changeText(passInput, '123456');

    const submitBtn = screen.getByRole('button', { name: 'Iniciar Sesión' });
    await fireEvent.press(submitBtn);

    // Pantalla de error del Figma
    expect(screen.getByText('ERROR')).toBeTruthy();
    expect(screen.getByText('El correo o la contraseña no son correctos.')).toBeTruthy();

    // Botón volver
    const volverBtn = screen.getByRole('button', { name: 'Volver' });
    await fireEvent.press(volverBtn);

    expect(screen.queryByText('ERROR')).toBeNull();
    expect(screen.getByText('Inicio Sesión')).toBeTruthy();
  });
});
