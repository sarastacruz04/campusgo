import * as chatService from '@/services/chatService';
import { ERRORS, toAppError } from '@/services/errors';
import { createAppAsyncThunk } from '@/store/createAppAsyncThunk';

/**
 * Abre el chat de un viaje: primero comprueba que el usuario participa y luego
 * trae los mensajes con el nombre de sus autores (R10).
 */
export const fetchMessages = createAppAsyncThunk(
  'chat/fetchMessages',
  async (viajeId: string, thunkApi) => {
    const userId = thunkApi.getState().auth.userId;
    if (!userId) return thunkApi.rejectWithValue(ERRORS.sinSesion);
    try {
      if (!(await chatService.isParticipant(viajeId, userId))) {
        return thunkApi.rejectWithValue(ERRORS.chatSinAcceso);
      }
      const { messages, authorNames } = await chatService.listMessages(viajeId);
      return { viajeId, messages, authorNames };
    } catch (error) {
      return thunkApi.rejectWithValue(toAppError(error));
    }
  },
);

/**
 * Trae el nombre de autores desconocidos (llegaron por Realtime). condition evita
 * pedir otra vez un nombre que ya se conoce o que ya se está pidiendo.
 */
export const fetchAuthorNames = createAppAsyncThunk(
  'chat/fetchAuthorNames',
  async (ids: string[], { rejectWithValue }) => {
    try {
      return await chatService.getAuthorNames(ids);
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
  {
    condition: (ids, { getState }) => {
      const { authorNames, requestedAuthorIds } = getState().chat;
      return ids.some((id) => !(id in authorNames) && !requestedAuthorIds.includes(id));
    },
  },
);

/** Envía un mensaje (R10). Se valida el largo antes de ir a la red. */
export const sendMessage = createAppAsyncThunk(
  'chat/sendMessage',
  async ({ viajeId, contenido }: { viajeId: string; contenido: string }, thunkApi) => {
    const autorId = thunkApi.getState().auth.userId;
    if (!autorId) return thunkApi.rejectWithValue(ERRORS.sinSesion);
    const text = contenido.trim();
    if (text.length === 0 || text.length > chatService.MAX_MESSAGE_LENGTH) {
      return thunkApi.rejectWithValue(ERRORS.mensajeInvalido);
    }
    try {
      return await chatService.sendMessage(viajeId, autorId, text);
    } catch (error) {
      return thunkApi.rejectWithValue(toAppError(error));
    }
  },
);
