import { clearUserCache } from '@/db/cache';
import * as authService from '@/services/authService';
import { toAppError } from '@/services/errors';
import { createAppAsyncThunk } from '@/store/createAppAsyncThunk';

import { sessionCleared } from './actions';

// Flujo de cada thunk: pantalla → dispatch(thunk) → servicio → Supabase →
// reducer (fulfilled o rejected) → selector → pantalla.
// Todos atrapan el error y lo entregan como AppError con rejectWithValue.

/** Al abrir la app: lee la sesión guardada en el almacenamiento seguro (TC-22). */
export const restoreSession = createAppAsyncThunk(
  'auth/restoreSession',
  async (_: void, { rejectWithValue }) => {
    try {
      return await authService.getCurrentUser();
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);

export const signIn = createAppAsyncThunk(
  'auth/signIn',
  async (input: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await authService.signIn(input.email, input.password);
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);

/** Registra y devuelve el correo que debe verificarse con el código. */
export const signUp = createAppAsyncThunk(
  'auth/signUp',
  async (input: authService.SignUpInput, { rejectWithValue }) => {
    try {
      await authService.signUp(input);
      return input.email.trim().toLowerCase();
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);

export const verifySignUpCode = createAppAsyncThunk(
  'auth/verifySignUpCode',
  async (input: { email: string; token: string }, { rejectWithValue }) => {
    try {
      return await authService.verifySignUpCode(input.email, input.token);
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);

export const resendSignUpCode = createAppAsyncThunk(
  'auth/resendSignUpCode',
  async (email: string, { rejectWithValue }) => {
    try {
      await authService.resendSignUpCode(email);
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);

/**
 * Cierra la sesión (TC-21): borra los tokens del almacenamiento seguro, la caché
 * de esta persona y el estado de todos los slices (sessionCleared).
 */
export const signOut = createAppAsyncThunk(
  'auth/signOut',
  async (_: void, { getState, dispatch, rejectWithValue }) => {
    const userId = getState().auth.userId;
    try {
      await authService.signOut();
      if (userId) await clearUserCache(userId).catch(() => undefined);
      dispatch(sessionCleared());
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);
