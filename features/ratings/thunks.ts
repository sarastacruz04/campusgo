import { validateRatingComment, validateRatingStars } from '@/lib/validators';
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

/** Carga el viaje, destinatarios elegibles y calificaciones previas del autor (R9). */
export const fetchTripRatingContext = createAppAsyncThunk(
  'ratings/fetchTripContext',
  async (viajeId: string, { getState, rejectWithValue }) => {
    const currentUserId = getState().auth.userId;
    if (!currentUserId) return rejectWithValue(ERRORS.sinSesion);
    try {
      return await ratingService.getTripRatingContext(viajeId, currentUserId);
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
    if (autorId === input.destinatarioId) {
      return rejectWithValue({
        code: 'sin_permiso',
        message: 'No puedes calificarte a ti mismo.',
      });
    }
    const starsError = validateRatingStars(input.estrellas);
    if (starsError) {
      return rejectWithValue({ code: 'datos_invalidos', message: starsError });
    }
    const commentError = validateRatingComment(input.comentario ?? '');
    if (commentError) {
      return rejectWithValue({ code: 'datos_invalidos', message: commentError });
    }

    try {
      const rating = await ratingService.submitRating({ ...input, autorId });
      dispatch(fetchRatingAverages([input.destinatarioId]));
      return rating;
    } catch (error) {
      const appError = toAppError(error);
      if (appError.code === 'duplicado') {
        return rejectWithValue({
          code: 'duplicado',
          message: 'Ya calificaste a esta persona en este viaje.',
        });
      }
      return rejectWithValue(appError);
    }
  },
);
