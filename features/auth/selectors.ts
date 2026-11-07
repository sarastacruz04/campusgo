import type { RootState } from '@/store/store';

export const selectUserId = (state: RootState) => state.auth.userId;
export const selectIsAuthenticated = (state: RootState) => state.auth.userId !== null;
export const selectAuthInitialized = (state: RootState) => state.auth.initialized;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectPendingVerificationEmail = (state: RootState) =>
  state.auth.pendingVerificationEmail;
