import { sessionCleared } from '@/features/auth/actions';
import { sessionChanged } from '@/features/auth/slice';
import { restoreSession, signIn, signOut, signUp } from '@/features/auth/thunks';
import { initialProfileState } from '@/features/profile/slice';
import { clearUserCache } from '@/db/cache';
import * as authService from '@/services/authService';
import { makeStore } from '@/store/store';
import { makeProfile } from '@/test-utils/factories';

// Servicios simulados SOLO en esta prueba: no se habla con Supabase.
jest.mock('@/services/authService', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  getCurrentUser: jest.fn(),
  verifySignUpCode: jest.fn(),
  resendSignUpCode: jest.fn(),
}));
jest.mock('@/db/cache', () => ({ clearUserCache: jest.fn(async () => undefined) }));

const service = jest.mocked(authService);

beforeEach(() => jest.clearAllMocks());

describe('auth: thunks y reducers', () => {
  it('signIn exitoso guarda el usuario y pasa de loading a succeeded', async () => {
    service.signIn.mockResolvedValue({ userId: 'u1', email: 'sara@unisabana.edu.co' });
    const store = makeStore();

    const promise = store.dispatch(signIn({ email: 'sara@unisabana.edu.co', password: '123456' }));
    expect(store.getState().auth.status).toBe('loading');
    await promise;

    expect(store.getState().auth).toMatchObject({
      userId: 'u1',
      email: 'sara@unisabana.edu.co',
      status: 'succeeded',
      error: null,
    });
  });

  it('signIn fallido guarda el AppError en español (TC-04)', async () => {
    service.signIn.mockRejectedValue({ code: 'invalid_credentials', message: 'Invalid login' });
    const store = makeStore();
    await store.dispatch(signIn({ email: 'x@unisabana.edu.co', password: 'malo00' }));

    expect(store.getState().auth.status).toBe('failed');
    expect(store.getState().auth.error).toEqual({
      code: 'invalid_credentials',
      message: 'El correo o la contraseña no son correctos.',
    });
    expect(store.getState().auth.userId).toBeNull();
  });

  it('signUp deja pendiente el correo que debe verificarse', async () => {
    service.signUp.mockResolvedValue(undefined);
    const store = makeStore();
    await store.dispatch(
      signUp({
        email: 'Nueva@UniSabana.edu.co',
        password: '123456',
        nombre: 'Ana',
        apellido: 'Gómez',
        idUniversidad: '0000000002',
        telefono: '3000000001',
      }),
    );
    expect(store.getState().auth.pendingVerificationEmail).toBe('nueva@unisabana.edu.co');
  });

  it('restoreSession marca la app como inicializada con o sin sesión (TC-22)', async () => {
    service.getCurrentUser.mockResolvedValue({ userId: 'u1', email: 'a@unisabana.edu.co' });
    const store = makeStore();
    await store.dispatch(restoreSession());
    expect(store.getState().auth).toMatchObject({ initialized: true, userId: 'u1' });

    service.getCurrentUser.mockRejectedValue(new Error('almacenamiento dañado'));
    const other = makeStore();
    await other.dispatch(restoreSession());
    expect(other.getState().auth).toMatchObject({ initialized: true, userId: null });
  });

  it('signOut borra la caché del usuario y limpia todos los slices (TC-21)', async () => {
    service.signOut.mockResolvedValue(undefined);
    const store = makeStore({
      auth: {
        userId: 'u1',
        email: 'a@unisabana.edu.co',
        initialized: true,
        status: 'idle',
        error: null,
        pendingVerificationEmail: null,
      },
      profile: { ...initialProfileState, data: makeProfile({ id: 'u1' }) },
    });

    await store.dispatch(signOut());

    expect(clearUserCache).toHaveBeenCalledWith('u1');
    expect(store.getState().auth.userId).toBeNull();
    expect(store.getState().auth.initialized).toBe(true);
    expect(store.getState().profile.data).toBeNull();
  });

  it('sessionChanged y sessionCleared reflejan los avisos de Supabase Auth', () => {
    const store = makeStore();
    store.dispatch(sessionChanged({ userId: 'u9', email: 'z@unisabana.edu.co' }));
    expect(store.getState().auth.userId).toBe('u9');
    store.dispatch(sessionCleared());
    expect(store.getState().auth.userId).toBeNull();
  });
});
