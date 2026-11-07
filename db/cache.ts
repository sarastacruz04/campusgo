import { ERRORS, toAppError } from '@/services/errors';

import { getDatabase } from './database';

// Caché sin conexión: guarda la última copia buena de los datos y la devuelve
// cuando no hay red (TC-17). Solo lectura: sin conexión no se reserva ni se crea nada.

/** Qué conjunto de datos se guarda. */
export type CacheKey = 'perfil' | 'viajes_busqueda' | 'viajes_creados' | 'reservas';

export type CachedValue<T> = { data: T; cachedAt: number };

export async function saveCache<T>(userId: string, key: CacheKey, data: T): Promise<number> {
  const db = await getDatabase();
  const cachedAt = Date.now();
  // INSERT OR REPLACE: si ya había una copia de ese usuario y esa clave, se reemplaza.
  await db.runAsync(
    'INSERT OR REPLACE INTO cache (user_id, clave, datos, cached_at) VALUES (?, ?, ?, ?)',
    userId,
    key,
    JSON.stringify(data),
    cachedAt,
  );
  return cachedAt;
}

export async function readCache<T>(userId: string, key: CacheKey): Promise<CachedValue<T> | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ datos: string; cached_at: number }>(
    'SELECT datos, cached_at FROM cache WHERE user_id = ? AND clave = ?',
    userId,
    key,
  );
  if (!row) return null;
  return { data: JSON.parse(row.datos) as T, cachedAt: row.cached_at };
}

/** Al cerrar sesión se borra la caché de ese usuario (no deben quedar sus datos). */
export async function clearUserCache(userId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM cache WHERE user_id = ?', userId);
}

export type LoadResult<T> = {
  data: T;
  /** true si los datos vienen de la caché (se muestra el banner "Sin conexión"). */
  fromCache: boolean;
  /** Hora (ms) en que se obtuvieron los datos mostrados. */
  cachedAt: number;
};

type LoadOptions<T> = {
  userId: string;
  key: CacheKey;
  isOnline: boolean;
  fetcher: () => Promise<T>;
};

/**
 * Pide los datos a Supabase y guarda una copia; si no hay red (o la petición falla
 * por red), devuelve la última copia guardada. Si tampoco hay copia, lanza
 * "Sin conexión" para que la pantalla muestre el error con "Reintentar".
 * Otros errores (permisos, datos) no se tapan con la caché: se lanzan tal cual.
 */
export async function loadWithCache<T>({
  userId,
  key,
  isOnline,
  fetcher,
}: LoadOptions<T>): Promise<LoadResult<T>> {
  if (isOnline) {
    try {
      const data = await fetcher();
      // Si guardar la copia falla, los datos frescos igual se muestran.
      const cachedAt = await saveCache(userId, key, data).catch(() => Date.now());
      return { data, fromCache: false, cachedAt };
    } catch (error) {
      const appError = toAppError(error);
      if (appError.code !== ERRORS.sinConexion.code) throw appError;
    }
  }

  const cached = await readCache<T>(userId, key).catch(() => null);
  if (cached) return { data: cached.data, fromCache: true, cachedAt: cached.cachedAt };
  throw ERRORS.sinConexion;
}
