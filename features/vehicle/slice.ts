import { createSlice, isAnyOf } from '@reduxjs/toolkit';

import { sessionCleared } from '@/features/auth/actions';
import { initialRequest, type RequestState } from '@/store/types';
import type { Vehiculo } from '@/types/database';

import { fetchMyVehicle, registerVehicle, removeVehicle } from './thunks';

export type VehicleState = {
  /** null si el usuario no tiene carro. */
  data: Vehiculo | null;
  load: RequestState;
  save: RequestState;
};

export const initialVehicleState: VehicleState = {
  data: null,
  load: initialRequest,
  save: initialRequest,
};

const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState: initialVehicleState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sessionCleared, () => initialVehicleState)
      .addCase(fetchMyVehicle.pending, (state) => {
        state.load = { status: 'loading', error: null };
      })
      .addCase(fetchMyVehicle.fulfilled, (state, action) => {
        state.load = { status: 'succeeded', error: null };
        state.data = action.payload;
      })
      .addCase(fetchMyVehicle.rejected, (state, action) => {
        state.load = { status: 'failed', error: action.payload ?? null };
      })
      .addCase(registerVehicle.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(removeVehicle.fulfilled, (state) => {
        state.data = null;
      });

    // Registrar y eliminar el carro comparten el estado "save".
    builder
      .addMatcher(isAnyOf(registerVehicle.pending, removeVehicle.pending), (state) => {
        state.save = { status: 'loading', error: null };
      })
      .addMatcher(isAnyOf(registerVehicle.fulfilled, removeVehicle.fulfilled), (state) => {
        state.save = { status: 'succeeded', error: null };
      })
      .addMatcher(isAnyOf(registerVehicle.rejected, removeVehicle.rejected), (state, action) => {
        state.save = { status: 'failed', error: action.payload ?? null };
      });
  },
});

export default vehicleSlice.reducer;
