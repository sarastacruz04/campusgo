import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';

import { connectivityChanged } from '@/features/settings/slice';
import { isOnlineFromNetInfo } from '@/features/settings/thunks';
import { useAppDispatch } from '@/store/hooks';

/**
 * Escucha la conexión con NetInfo y guarda en Redux si hay internet. Los thunks
 * lo leen para decidir si piden datos a Supabase o usan la caché (TC-17).
 * NetInfo.addEventListener devuelve la función que deja de escuchar (cleanup).
 */
export function useConnectivity() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      dispatch(connectivityChanged(isOnlineFromNetInfo(state)));
    });
    return unsubscribe;
  }, [dispatch]);
}
