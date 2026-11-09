import { clearUserCache, loadWithCache, readCache, saveCache } from '@/db/cache';
import { ERRORS } from '@/services/errors';
import { createFakeDatabase } from '@/test-utils/fakeDatabase';

// La base SQLite real es nativa; aquí se usa una falsa en memoria.
// (Jest exige que las variables usadas dentro de jest.mock empiecen por "mock".)
const mockDb = createFakeDatabase();
jest.mock('@/db/database', () => ({ getDatabase: async () => mockDb }));

beforeEach(() => mockDb.rows.clear());

describe('caché sin conexión', () => {
  it('guarda y lee datos por usuario y clave, con la hora de guardado', async () => {
    const cachedAt = await saveCache('u1', 'perfil', { nombre: 'Sara' });
    expect(await readCache('u1', 'perfil')).toEqual({ data: { nombre: 'Sara' }, cachedAt });
    expect(await readCache('u2', 'perfil')).toBeNull();
  });

  it('borra solo la caché del usuario que cierra sesión', async () => {
    await saveCache('u1', 'perfil', 1);
    await saveCache('u2', 'perfil', 2);
    await clearUserCache('u1');
    expect(await readCache('u1', 'perfil')).toBeNull();
    expect(await readCache('u2', 'perfil')).not.toBeNull();
  });
});

describe('loadWithCache', () => {
  const base = { userId: 'u1', key: 'reservas' as const };

  it('con red pide los datos y guarda una copia', async () => {
    const result = await loadWithCache({ ...base, isOnline: true, fetcher: async () => ['r1'] });
    expect(result).toMatchObject({ data: ['r1'], fromCache: false });
    expect((await readCache('u1', 'reservas'))?.data).toEqual(['r1']);
  });

  it('sin red devuelve la copia guardada (TC-17)', async () => {
    await saveCache('u1', 'reservas', ['guardada']);
    const fetcher = jest.fn();
    const result = await loadWithCache({ ...base, isOnline: false, fetcher });
    expect(result).toMatchObject({ data: ['guardada'], fromCache: true });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('si la petición falla por red, también usa la copia', async () => {
    await saveCache('u1', 'reservas', ['guardada']);
    const result = await loadWithCache({
      ...base,
      isOnline: true,
      fetcher: async () => {
        throw new TypeError('Network request failed');
      },
    });
    expect(result.fromCache).toBe(true);
  });

  it('sin red y sin copia lanza "Sin conexión" para mostrar Reintentar (TC-18)', async () => {
    await expect(loadWithCache({ ...base, isOnline: false, fetcher: jest.fn() })).rejects.toEqual(
      ERRORS.sinConexion,
    );
  });

  it('no tapa con la caché un error que no es de red', async () => {
    await saveCache('u1', 'reservas', ['guardada']);
    await expect(
      loadWithCache({
        ...base,
        isOnline: true,
        fetcher: async () => {
          throw { code: '42501', message: 'permission denied' };
        },
      }),
    ).rejects.toMatchObject({ code: 'sin_permiso' });
  });
});
