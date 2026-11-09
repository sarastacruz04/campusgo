import type { AppError } from '@/services/errors';

/** Los cuatro estados de toda petición asíncrona (sección 4). */
export type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

/** Estado de una petición: en qué va y, si falló, por qué. */
export type RequestState = {
  status: LoadStatus;
  error: AppError | null;
};

export const initialRequest: RequestState = { status: 'idle', error: null };

/** Datos leídos con caché: si vienen guardados y de cuándo son. */
export type CacheInfo = {
  fromCache: boolean;
  cachedAt: number | null;
};

export const initialCacheInfo: CacheInfo = { fromCache: false, cachedAt: null };
