import { ERRORS, toAppError } from '@/services/errors';
import * as ratingService from '@/services/ratingService';
import { createAppAsyncThunk } from '@/store/createAppAsyncThunk';

/** Promedios de estrellas de varias personas (conductores de las tarjetas, perfil). */
export const fetchRatingAverages = createAppAsyncThunk(
  'ratings/fetchAverages',
  async (userIds: string[], { rejectWithValue }) => {
    try {
      return await ratingService.getAverages([...new Set(userIds)]);
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);

export type SubmitRatingInput = Omit<ratingService.RatingInput, 'autorId'>;

/** Califica a otra persona del viaje (R9). Después actualiza su promedio. */
export const submitRating = createAppAsyncThunk(
  'ratings/submit',
  async (input: SubmitRatingInput, { getState, dispatch, rejectWithValue }) => {
    const autorId = getState().auth.userId;
    if (!autorId) return rejectWithValue(ERRORS.sinSesion);
    try {
      const rating = await ratingService.submitRating({ ...input, autorId });
      dispatch(fetchRatingAverages([input.destinatarioId]));
      return rating;
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);
