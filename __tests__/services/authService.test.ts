import { resendSignUpCode, signUp } from '@/services/authService';
import { ERRORS } from '@/services/errors';

// Cliente de Supabase simulado SOLO en esta prueba.
const mockSignUp = jest.fn();
const mockResend = jest.fn();
jest.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
      resend: (...args: unknown[]) => mockResend(...args),
    },
  },
}));

const input = {
  email: 'Nueva@unisabana.edu.co',
  password: '123456',
  nombre: 'Raúl',
  apellido: 'Prueba',
  idUniversidad: '0000123456',
  telefono: '3001234567',
};

// Así llega a la app el 504 que se vio en los logs de Auth cuando el SMTP tardaba.
const timeout504 = {
  name: 'AuthRetryableFetchError',
  message: 'Context deadline exceeded',
  status: 504,
};

beforeEach(() => {
  mockSignUp.mockReset();
  mockResend.mockReset();
});

describe('authService: errores al enviar el código (TC-01)', () => {
  it('si el registro tarda y el servidor responde 504, dice que no se pudo enviar el código', async () => {
    mockSignUp.mockResolvedValue({ data: { user: null, session: null }, error: timeout504 });

    await expect(signUp(input)).rejects.toEqual(ERRORS.correoNoEnviado);
    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'nueva@unisabana.edu.co' }),
    );
  });

  it('sin red el registro sigue diciendo "Sin conexión"', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { name: 'AuthRetryableFetchError', message: 'Network request failed', status: 0 },
    });

    await expect(signUp(input)).rejects.toEqual(ERRORS.sinConexion);
  });

  it('el reenvío del código traduce igual el 504', async () => {
    mockResend.mockResolvedValue({ data: {}, error: timeout504 });

    await expect(resendSignUpCode('nueva@unisabana.edu.co')).rejects.toEqual(
      ERRORS.correoNoEnviado,
    );
  });
});
