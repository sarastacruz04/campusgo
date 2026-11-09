import type { RootState } from '@/store/store';

export const selectIsOnline = (state: RootState) => state.settings.isOnline;
