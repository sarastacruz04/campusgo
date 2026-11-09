import { combineReducers, configureStore } from '@reduxjs/toolkit';

import authReducer from '@/features/auth/slice';
import chatReducer from '@/features/chat/slice';
import notificationsReducer from '@/features/notifications/slice';
import profileReducer from '@/features/profile/slice';
import ratingsReducer from '@/features/ratings/slice';
import reservationsReducer from '@/features/reservations/slice';
import settingsReducer from '@/features/settings/slice';
import tripsReducer from '@/features/trips/slice';
import vehicleReducer from '@/features/vehicle/slice';

// Estado global: una "rama" por dominio (sección 3 y 4). Cada rama la maneja su
// slice; las pantallas leen con selectores y cambian el estado con thunks.
export const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  vehicle: vehicleReducer,
  trips: tripsReducer,
  reservations: reservationsReducer,
  notifications: notificationsReducer,
  chat: chatReducer,
  ratings: ratingsReducer,
  settings: settingsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

/**
 * Crea un store. La app usa uno solo (`store`); las pruebas crean uno nuevo por
 * caso, con un estado inicial a medida (preloadedState).
 */
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({ reducer: rootReducer, preloadedState });
}

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
