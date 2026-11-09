import type { RootState } from '@/store/store';

export const selectVehicle = (state: RootState) => state.vehicle.data;
/** Para R3: sin carro no se puede pasar a modo conductor. */
export const selectHasVehicle = (state: RootState) => state.vehicle.data !== null;
export const selectVehicleLoad = (state: RootState) => state.vehicle.load;
export const selectVehicleSave = (state: RootState) => state.vehicle.save;
