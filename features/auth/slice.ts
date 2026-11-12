import { createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';

import type { SessionUser } from '@/services/authService';
import type { AppError } from '@/services/errors';
import type { LoadStatus } from '@/store/types';

import { sessionCleared } from './actions';
import {
  resendSignUpCode,
  restoreSession,
  signIn,
  signOut,
  signUp,
  verifySignUpCode,
} from './thunks';

export type AuthState = {
  userId: string | null;
  email: string | null;
  /** true cuando ya se leyó la sesión guardada al abrir la app. */
  initialized: boolean;
  status: LoadStatus;
  error: AppError | null;
  /** Correo que espera el código de verificación después de registrarse. */
  pendingVerificationEmail: string | null;
  /** true si Supabase exige confirmar el correo con el código (D-68). */
  emailCodeRequired: boolean;
};

export const initialAuthState: AuthState = {
  userId: null,
  email: null,
  initialized: false,
  status: 'idle',
  error: null,
  pendingVerificationEmail: null,
  emailCodeRequired: false,
};

function setUser(state: AuthState, user: SessionUser | null) {
  state.userId = user?.userId ?? null;
  state.email = user?.email ?? null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    /** Lo despacha el listener de Supabase Auth (hooks/useAuthSession). */
    sessionChanged(state, action: PayloadAction<SessionUser | null>) {
      setUser(state, action.payload);
      state.initialized = true;
    },
    authErrorCleared(state) {
      state.error = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sessionCleared, (state) => ({
        ...initialAuthState,
        initialized: state.initialized,
      }))
      .addCase(restoreSession.fulfilled, (state, action) => {
        setUser(state, action.payload);
        state.initialized = true;
      })
      // Si no se puede leer la sesión guardada, la app sigue como "sin sesión".
      .addCase(restoreSession.rejected, (state) => {
        state.initialized = true;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        const { email, user } = action.payload;
        // Sin sesión, Supabase espera el código; con sesión, la cuenta ya está activa.
        state.emailCodeRequired = user === null;
        state.pendingVerificationEmail = user === null ? email : null;
        if (user) setUser(state, user);
      })
      .addCase(verifySignUpCode.fulfilled, (state, action) => {
        setUser(state, action.payload);
        state.pendingVerificationEmail = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        setUser(state, action.payload);
      });

    // Las acciones del formulario comparten el mismo manejo de carga y error.
    // addMatcher con isAnyOf corre además de los addCase de arriba (addCase no
    // permite registrar dos reducers para la misma acción).
    builder
      .addMatcher(
        isAnyOf(
          signIn.pending,
          signUp.pending,
          verifySignUpCode.pending,
          resendSignUpCode.pending,
          signOut.pending,
        ),
        (state) => {
          state.status = 'loading';
          state.error = null;
        },
      )
      .addMatcher(
        isAnyOf(
          signIn.fulfilled,
          signUp.fulfilled,
          verifySignUpCode.fulfilled,
          resendSignUpCode.fulfilled,
          signOut.fulfilled,
        ),
        (state) => {
          state.status = 'succeeded';
        },
      )
      .addMatcher(
        isAnyOf(
          signIn.rejected,
          signUp.rejected,
          verifySignUpCode.rejected,
          resendSignUpCode.rejected,
          signOut.rejected,
        ),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload ?? null;
        },
      );
  },
});

export const { sessionChanged, authErrorCleared } = authSlice.actions;
export default authSlice.reducer;
