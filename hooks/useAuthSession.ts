import { useEffect } from 'react';

import { sessionCleared } from '@/features/auth/actions';
import { sessionChanged } from '@/features/auth/slice';
import { restoreSession } from '@/features/auth/thunks';
import { onSessionChange } from '@/services/authService';
import { bindAutoRefreshToAppState } from '@/services/supabase';
import { useAppDispatch } from '@/store/hooks';

/**
 * Mantiene la sesión sincronizada con Redux. Se usa una sola vez, en app/_layout.tsx:
 * 1. Al abrir la app lee la sesión guardada (TC-22: la sesión persiste al reiniciar).
 * 2. Escucha los cambios de Supabase Auth (inicio, cierre, token vencido).
 * 3. Renueva el token solo con la app en primer plano (AppState).
 * El cleanup quita el listener y el refresco al desmontar.
 */
export function useAuthSession() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreSession());

    const stopListening = onSessionChange((user) => {
      if (user) {
        dispatch(sessionChanged(user));
      } else {
        dispatch(sessionChanged(null));
        dispatch(sessionCleared());
      }
    });
    const stopAutoRefresh = bindAutoRefreshToAppState();

    return () => {
      stopListening();
      stopAutoRefresh();
    };
  }, [dispatch]);
}
