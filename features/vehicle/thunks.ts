import { ERRORS, toAppError } from '@/services/errors';
import * as vehicleService from '@/services/vehicleService';
import { createAppAsyncThunk } from '@/store/createAppAsyncThunk';
import type { TablesInsert } from '@/types/database';

export type RegisterVehicleInput = Omit<TablesInsert<'vehiculos'>, 'propietario_id' | 'id'>;

export const fetchMyVehicle = createAppAsyncThunk(
  'vehicle/fetchMine',
  async (_: void, { getState, rejectWithValue }) => {
    const userId = getState().auth.userId;
    if (!userId) return rejectWithValue(ERRORS.sinSesion);
    try {
      return await vehicleService.getMyVehicle(userId);
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);

/** Registra el carro del usuario (pantalla 7). La base valida placa y capacidad. */
export const registerVehicle = createAppAsyncThunk(
  'vehicle/register',
  async (input: RegisterVehicleInput, { getState, rejectWithValue }) => {
    const userId = getState().auth.userId;
    if (!userId) return rejectWithValue(ERRORS.sinSesion);
    try {
      return await vehicleService.createVehicle({ ...input, propietario_id: userId });
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);

/** Elimina el carro (pantalla 15, con ConfirmDialog antes). */
export const removeVehicle = createAppAsyncThunk(
  'vehicle/remove',
  async (vehicleId: string, { rejectWithValue }) => {
    try {
      await vehicleService.deleteVehicle(vehicleId);
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);
