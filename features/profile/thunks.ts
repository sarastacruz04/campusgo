import { loadWithCache } from '@/db/cache';
import { ERRORS, toAppError } from '@/services/errors';
import * as profileService from '@/services/profileService';
import { createAppAsyncThunk } from '@/store/createAppAsyncThunk';
import type { ModoUsuario, Profile } from '@/types/database';

/** Lee el perfil propio; sin conexión devuelve la copia guardada (TC-17). */
export const fetchMyProfile = createAppAsyncThunk(
  'profile/fetchMine',
  async (_: void, { getState, rejectWithValue }) => {
    const { auth, settings } = getState();
    if (!auth.userId) return rejectWithValue(ERRORS.sinSesion);
    const userId = auth.userId;
    try {
      return await loadWithCache<Profile>({
        userId,
        key: 'perfil',
        isOnline: settings.isOnline,
        fetcher: () => profileService.getProfile(userId),
      });
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);

/** Edita nombre, apellido o teléfono (pantalla 15) o marca el registro completo. */
export const updateMyProfile = createAppAsyncThunk(
  'profile/updateMine',
  async (changes: profileService.ProfileUpdate, { getState, rejectWithValue }) => {
    const userId = getState().auth.userId;
    if (!userId) return rejectWithValue(ERRORS.sinSesion);
    try {
      return await profileService.updateProfile(userId, changes);
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);

/** Cambia de modo (R3) y devuelve el perfil actualizado. */
export const changeMode = createAppAsyncThunk(
  'profile/changeMode',
  async (modo: ModoUsuario, { getState, rejectWithValue }) => {
    const userId = getState().auth.userId;
    if (!userId) return rejectWithValue(ERRORS.sinSesion);
    try {
      await profileService.changeMode(modo);
      return await profileService.getProfile(userId);
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);
