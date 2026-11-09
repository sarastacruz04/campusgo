import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@/store/store';

export const selectProfile = (state: RootState) => state.profile.data;
export const selectProfileLoad = (state: RootState) => state.profile.load;
export const selectProfileSave = (state: RootState) => state.profile.save;
export const selectProfileCacheInfo = createSelector(
  [(state: RootState) => state.profile.fromCache, (state: RootState) => state.profile.cachedAt],
  (fromCache, cachedAt) => ({ fromCache, cachedAt }),
);

/** Modo actual; mientras no haya perfil se asume pasajero (el valor por defecto de la base). */
export const selectCurrentMode = (state: RootState) =>
  state.profile.data?.modo_actual ?? 'pasajero';

/** "Nombre Apellido" para el saludo "¡Buen viaje {Nombre}!" y el perfil. */
export const selectFullName = createSelector([selectProfile], (profile) =>
  profile ? `${profile.nombre} ${profile.apellido}`.trim() : '',
);
