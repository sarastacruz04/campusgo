import { ERRORS } from '@/services/errors';
import { getProfile, updateProfile } from '@/services/profileService';
import type { Profile } from '@/types/database';

// Cliente de Supabase simulado SOLO en esta prueba: se comprueba qué le pide el servicio.
const mockRpc = jest.fn();
const mockFrom = jest.fn();
jest.mock('@/services/supabase', () => ({
  supabase: {
    rpc: (...args: unknown[]) => mockRpc(...args),
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

const USER_ID = '11111111-1111-1111-1111-111111111111';

const profile: Profile = {
  id: USER_ID,
  nombre: 'Sara',
  apellido: 'Santacruz',
  id_universidad: '0000123456',
  email: 'sara@unisabana.edu.co',
  telefono: '3001234567',
  avatar_path: null,
  modo_actual: 'pasajero',
  registro_completo: true,
  created_at: '2026-11-11T00:00:00Z',
};

function rpcReturns(data: Profile | null, error: unknown = null) {
  mockRpc.mockReturnValue({ single: jest.fn().mockResolvedValue({ data, error }) });
}

beforeEach(() => {
  mockRpc.mockReset();
  mockFrom.mockReset();
});

describe('profileService con la migración 0009 (RP-05)', () => {
  it('lee el perfil propio con mi_perfil y no con select * sobre profiles', async () => {
    rpcReturns(profile);

    await expect(getProfile(USER_ID)).resolves.toEqual(profile);
    expect(mockRpc).toHaveBeenCalledWith('mi_perfil');
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('no devuelve el perfil si la sesión del cliente es de otra cuenta', async () => {
    rpcReturns({ ...profile, id: '22222222-2222-2222-2222-222222222222' });

    await expect(getProfile(USER_ID)).rejects.toEqual(ERRORS.sinSesion);
  });

  it('traduce el error de la función (por ejemplo, sin red)', async () => {
    rpcReturns(null, { message: 'Network request failed' });

    await expect(getProfile(USER_ID)).rejects.toEqual(ERRORS.sinConexion);
  });

  it('guarda los cambios sin pedir select * y vuelve a leer con mi_perfil', async () => {
    const mockEq = jest.fn().mockResolvedValue({ data: null, error: null });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });
    rpcReturns({ ...profile, telefono: '3009998877' });

    const result = await updateProfile(USER_ID, { telefono: '3009998877' });

    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockUpdate).toHaveBeenCalledWith({ telefono: '3009998877' });
    expect(mockEq).toHaveBeenCalledWith('id', USER_ID);
    expect(mockRpc).toHaveBeenCalledWith('mi_perfil');
    expect(result.telefono).toBe('3009998877');
  });
});
