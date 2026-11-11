import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { AccessibilityInfo } from 'react-native';

import LoginScreen from '@/app/(auth)/login';
import RegisterStep1Screen from '@/app/(auth)/register/index';
import * as authService from '@/services/authService';
import { renderWithProviders } from '@/test-utils/render';

// Flujos de pantalla de la sección 10 (E8): inicio de sesión con error y registro
// con validación. Navegación y servicio de Auth simulados SOLO en estas pruebas.
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
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
jest.mock('@/db/cache', () => ({ clearUserCache: jest.fn(async () => undefined) }));
jest.mock('@/hooks/useScreenFocus', () => ({
  useScreenFocus: jest.fn(() => ({ current: null })),
  SCREEN_FOCUS_DELAY_MS: 0,
}));

const auth = jest.mocked(authService);

beforeEach(() => jest.clearAllMocks());

async function login(email: string, password: string) {
  await renderWithProviders(<LoginScreen />);
  await fireEvent.changeText(screen.getByLabelText('Correo electrónico'), email);
  await fireEvent.changeText(screen.getByLabelText('Contraseña'), password);
  await fireEvent.press(screen.getByRole('button', { name: 'Iniciar Sesión' }));
}

describe('Inicio de sesión con error (pantalla 2, TC-04 y TC-18)', () => {
  it('con el correo sin verificar muestra ERROR con ese mensaje y lo anuncia', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    auth.signIn.mockRejectedValueOnce({
      code: 'email_not_confirmed',
      message: 'Email not confirmed',
    });
    await login('estudiante@unisabana.edu.co', '123456');
    const message = 'Tu correo aún no está verificado. Revisa el código que te enviamos.';
    expect(await screen.findByText(message)).toBeTruthy();
    expect(screen.getByText('ERROR')).toBeTruthy();
    expect(announce).toHaveBeenCalledWith(`Error. ${message}`);
  });

  it('sin conexión muestra el mensaje de red en español, no el error técnico', async () => {
    auth.signIn.mockRejectedValueOnce(new TypeError('Network request failed'));
    await login('estudiante@unisabana.edu.co', '123456');
    expect(
      await screen.findByText('Sin conexión a internet. Revisa tu red e intenta de nuevo.'),
    ).toBeTruthy();
    expect(screen.queryByText(/Network request failed/)).toBeNull();
  });

  it('con un correo de otro dominio no llama al servidor (TC-05, R1)', async () => {
    await login('estudiante@gmail.com', '123456');
    expect(
      screen.getByText('Solo se permiten correos institucionales terminados en @unisabana.edu.co.'),
    ).toBeTruthy();
    expect(auth.signIn).not.toHaveBeenCalled();
  });
});

describe('Registro, paso 1 con validación (pantalla 3, TC-01, TC-02 y TC-05)', () => {
  async function fill(values: Partial<Record<string, string>>) {
    for (const [label, value] of Object.entries(values)) {
      await fireEvent.changeText(screen.getByLabelText(label), value ?? '');
    }
  }

  it('sin datos muestra un error en texto bajo cada campo y no registra', async () => {
    await renderWithProviders(<RegisterStep1Screen />);
    expect(screen.getByText('Paso 1 de 7')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Registrarse' }));
    expect(screen.getByText('Por favor completa el campo Nombre.')).toBeTruthy();
    expect(screen.getByText('Por favor completa el campo Apellido.')).toBeTruthy();
    expect(screen.getByText('Por favor ingresa tu ID universitario.')).toBeTruthy();
    expect(screen.getByText('Por favor ingresa tu correo electrónico.')).toBeTruthy();
    expect(screen.getByText('Por favor ingresa tu número de teléfono.')).toBeTruthy();
    expect(screen.getByText('Por favor ingresa tu contraseña.')).toBeTruthy();
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it('valida ID y teléfono de 10 dígitos, correo institucional y contraseña de 6', async () => {
    await renderWithProviders(<RegisterStep1Screen />);
    await fill({
      Nombre: 'Sara',
      Apellido: 'Santacruz',
      'ID de la Universidad': '123456789',
      'Correo Electrónico': 'sara@gmail.com',
      Teléfono: '300123456',
      Contraseña: '12345',
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Registrarse' }));
    expect(
      screen.getByText('El ID universitario debe tener exactamente 10 dígitos numéricos.'),
    ).toBeTruthy();
    expect(
      screen.getByText('Solo se permiten correos institucionales terminados en @unisabana.edu.co.'),
    ).toBeTruthy();
    expect(
      screen.getByText('El teléfono debe tener exactamente 10 dígitos numéricos.'),
    ).toBeTruthy();
    expect(screen.getByText('La contraseña debe tener al menos 6 caracteres.')).toBeTruthy();
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it('con datos válidos registra y lleva a "Verifica tu correo" con el correo', async () => {
    auth.signUp.mockResolvedValueOnce(undefined);
    await renderWithProviders(<RegisterStep1Screen />);
    await fill({
      Nombre: 'Sara',
      Apellido: 'Santacruz',
      'ID de la Universidad': '0000123456',
      'Correo Electrónico': 'Sara.Prueba@unisabana.edu.co',
      Teléfono: '3001234567',
      Contraseña: 'secreta1',
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Registrarse' }));
    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/(auth)/register/verify',
        params: { email: 'sara.prueba@unisabana.edu.co' },
      }),
    );
    expect(auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({ idUniversidad: '0000123456', telefono: '3001234567' }),
    );
  });

  it('si el correo ya existe muestra el mensaje del servidor y no avanza', async () => {
    auth.signUp.mockRejectedValueOnce({ code: 'user_already_exists', message: 'User exists' });
    await renderWithProviders(<RegisterStep1Screen />);
    await fill({
      Nombre: 'Sara',
      Apellido: 'Santacruz',
      'ID de la Universidad': '0000123456',
      'Correo Electrónico': 'sara@unisabana.edu.co',
      Teléfono: '3001234567',
      Contraseña: 'secreta1',
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Registrarse' }));
    expect(await screen.findByText('Ya existe una cuenta con este correo.')).toBeTruthy();
    expect(router.push).not.toHaveBeenCalled();
  });
});
