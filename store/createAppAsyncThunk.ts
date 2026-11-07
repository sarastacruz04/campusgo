import { createAsyncThunk } from '@reduxjs/toolkit';

import type { AppError } from '@/services/errors';

import type { AppDispatch, RootState } from './store';

/**
 * createAsyncThunk con los tipos de la app ya puestos: conoce el estado global,
 * el dispatch y que los errores (rejectWithValue) siempre son AppError.
 * Así cada thunk no repite la misma configuración de tipos.
 */
export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: AppError;
}>();
