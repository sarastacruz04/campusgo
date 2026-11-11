import { createSlice } from '@reduxjs/toolkit';

import { sessionCleared } from '@/features/auth/actions';
import type { RatingTarget } from '@/services/ratingService';
import { initialRequest, type RequestState } from '@/store/types';
import type { TripListItem } from '@/types/domain';

import { fetchRatingAverages, fetchTripRatingContext, submitRating } from './thunks';

export type RatingAverage = { promedio: number; total: number };

export type TripRatingContextState = {
  trip: TripListItem | null;
  targets: RatingTarget[];
  canRate: boolean;
  load: RequestState;
};

export type RatingsState = {
  /** Promedio por id de usuario, para buscarlo rápido al dibujar una tarjeta. */
  averages: Record<string, RatingAverage>;
  load: RequestState;
  submit: RequestState;
  tripContext: TripRatingContextState;
};

const initialTripContext: TripRatingContextState = {
  trip: null,
  targets: [],
  canRate: false,
  load: initialRequest,
};

export const initialRatingsState: RatingsState = {
  averages: {},
  load: initialRequest,
  submit: initialRequest,
  tripContext: initialTripContext,
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
      .addCase(fetchTripRatingContext.pending, (state, action) => {
        state.submit = initialRequest;
        if (state.tripContext.trip?.id !== action.meta.arg) {
          state.tripContext = {
            trip: null,
            targets: [],
            canRate: false,
            load: { status: 'loading', error: null },
          };
        } else {
          state.tripContext.load = { status: 'loading', error: null };
        }
      })
      .addCase(fetchTripRatingContext.fulfilled, (state, action) => {
        state.tripContext = {
          ...action.payload,
          load: { status: 'succeeded', error: null },
        };
      })
      .addCase(fetchTripRatingContext.rejected, (state, action) => {
        state.tripContext.load = { status: 'failed', error: action.payload ?? null };
      })
      .addCase(submitRating.pending, (state) => {
        state.submit = { status: 'loading', error: null };
      })
      .addCase(submitRating.fulfilled, (state, action) => {
        state.submit = { status: 'succeeded', error: null };
        const created = action.payload;
        state.tripContext.targets = state.tripContext.targets.map((target) =>
          target.userId === created.destinatario_id
            ? { ...target, existingRating: created }
            : target,
        );
      })
      .addCase(submitRating.rejected, (state, action) => {
        state.submit = { status: 'failed', error: action.payload ?? null };
      });
  },
});

export default ratingsSlice.reducer;
