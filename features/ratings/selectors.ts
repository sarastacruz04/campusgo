import type { RootState } from '@/store/store';

import type { RatingAverage } from './slice';

export const selectRatingAverages = (state: RootState) => state.ratings.averages;

/** Promedio de una persona, o null si todavía no tiene calificaciones. */
export const selectRatingFor = (state: RootState, userId: string): RatingAverage | null =>
  state.ratings.averages[userId] ?? null;

export const selectRatingSubmit = (state: RootState) => state.ratings.submit;
