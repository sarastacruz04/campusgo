import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

import { createAppAsyncThunk } from '@/store/createAppAsyncThunk';

/**
 * Hay internet si NetInfo no dice lo contrario. isConnected e isInternetReachable
 * empiezan en null (desconocido): null no se toma como "sin conexión".
 */
export function isOnlineFromNetInfo(
  state: Pick<NetInfoState, 'isConnected' | 'isInternetReachable'>,
) {
  return state.isConnected !== false && state.isInternetReachable !== false;
}

/** Pregunta el estado de la red en este momento (lo usa "Reintentar"). */
export const refreshConnectivity = createAppAsyncThunk('settings/refreshConnectivity', async () =>
  isOnlineFromNetInfo(await NetInfo.fetch()),
);
