import { createSlice } from '@reduxjs/toolkit';

import { sessionCleared } from '@/features/auth/actions';
import { initialRequest, type RequestState } from '@/store/types';

import { fetchRatingAverages, submitRating } from './thunks';

export type RatingAverage = { promedio: number; total: number };

export type RatingsState = {
  /** Promedio por id de usuario, para buscarlo rápido al dibujar una tarjeta. */
  averages: Record<string, RatingAverage>;
  load: RequestState;
  submit: RequestState;
};

export const initialRatingsState: RatingsState = {
  averages: {},
  load: initialRequest,
  submit: initialRequest,
};

const ratingsSlice = createSlice({
  name: 'ratings',
  initialState: initialRatingsState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sessionCleared, () => initialRatingsState)
      .addCase(fetchRatingAverages.pending, (state) => {
        state.load = { status: 'loading', error: null };
      })
      .addCase(fetchRatingAverages.fulfilled, (state, action) => {
        state.load = { status: 'succeeded', error: null };
        for (const row of action.payload) {
          // La vista devuelve NUMERIC; PostgREST lo puede mandar como texto.
          state.averages[row.usuario_id] = {
            promedio: Number(row.promedio),
            total: Number(row.total),
          };
        }
      })
      .addCase(fetchRatingAverages.rejected, (state, action) => {
        state.load = { status: 'failed', error: action.payload ?? null };
      })
      .addCase(submitRating.pending, (state) => {
        state.submit = { status: 'loading', error: null };
      })
      .addCase(submitRating.fulfilled, (state) => {
        state.submit = { status: 'succeeded', error: null };
      })
      .addCase(submitRating.rejected, (state, action) => {
        state.submit = { status: 'failed', error: action.payload ?? null };
      });
  },
});

export default ratingsSlice.reducer;
