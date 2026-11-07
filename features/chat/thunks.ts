import * as chatService from '@/services/chatService';
import { ERRORS, toAppError } from '@/services/errors';
import { createAppAsyncThunk } from '@/store/createAppAsyncThunk';

export const fetchMessages = createAppAsyncThunk(
  'chat/fetchMessages',
  async (viajeId: string, { rejectWithValue }) => {
    try {
      return { viajeId, messages: await chatService.listMessages(viajeId) };
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
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
