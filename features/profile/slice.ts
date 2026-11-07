import { createSlice, isAnyOf } from '@reduxjs/toolkit';

import { sessionCleared } from '@/features/auth/actions';
import { initialCacheInfo, initialRequest, type CacheInfo, type RequestState } from '@/store/types';
import type { Profile } from '@/types/database';

import { changeMode, fetchMyProfile, updateMyProfile } from './thunks';

export type ProfileState = CacheInfo & {
  data: Profile | null;
  /** Lectura del perfil. */
  load: RequestState;
  /** Edición del perfil o cambio de modo (para el botón "Guardar" o el diálogo). */
  save: RequestState;
};

export const initialProfileState: ProfileState = {
  data: null,
  load: initialRequest,
  save: initialRequest,
  ...initialCacheInfo,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState: initialProfileState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sessionCleared, () => initialProfileState)
      .addCase(fetchMyProfile.pending, (state) => {
        state.load = { status: 'loading', error: null };
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.load = { status: 'succeeded', error: null };
        state.data = action.payload.data;
        state.fromCache = action.payload.fromCache;
        state.cachedAt = action.payload.cachedAt;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.load = { status: 'failed', error: action.payload ?? null };
      });

    // Editar el perfil y cambiar de modo comparten el estado "save".
    builder
      .addMatcher(isAnyOf(updateMyProfile.pending, changeMode.pending), (state) => {
        state.save = { status: 'loading', error: null };
      })
      .addMatcher(isAnyOf(updateMyProfile.fulfilled, changeMode.fulfilled), (state, action) => {
        state.save = { status: 'succeeded', error: null };
        state.data = action.payload;
        state.fromCache = false;
      })
      .addMatcher(isAnyOf(updateMyProfile.rejected, changeMode.rejected), (state, action) => {
        state.save = { status: 'failed', error: action.payload ?? null };
      });
  },
});

export default profileSlice.reducer;
