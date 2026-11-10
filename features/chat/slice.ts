import { createEntityAdapter, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { sessionCleared } from '@/features/auth/actions';
import type { AuthorNames } from '@/services/chatService';
import { initialRequest, type RequestState } from '@/store/types';
import type { Mensaje } from '@/types/database';

import { fetchAuthorNames, fetchMessages, sendMessage } from './thunks';

// Mensajes de todos los chats abiertos, del más antiguo al más nuevo.
export const messagesAdapter = createEntityAdapter<Mensaje>({
  sortComparer: (a, b) => a.created_at.localeCompare(b.created_at),
});

export type ChatState = ReturnType<typeof messagesAdapter.getInitialState> & {
  /** Carga del chat abierto; viajeId dice de qué viaje es el estado. */
  load: RequestState & { viajeId: string | null };
  send: RequestState;
  authorNames: AuthorNames;
  /** Ids cuyo nombre ya se está pidiendo, para no repetir la consulta. */
  requestedAuthorIds: string[];
  /** requestId de la última carga: una respuesta vieja no pisa a la nueva (sección 4). */
  loadRequestId: string | null;
};

export const initialChatState: ChatState = messagesAdapter.getInitialState({
  load: { ...initialRequest, viajeId: null },
  send: initialRequest,
  authorNames: {},
  requestedAuthorIds: [],
  loadRequestId: null,
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: initialChatState,
  reducers: {
    /**
     * Mensaje recibido por Realtime. upsert evita duplicados: el mensaje propio
     * llega dos veces (respuesta del envío y evento de Realtime) con el mismo id.
     */
    messageReceived(state, action: PayloadAction<Mensaje>) {
      messagesAdapter.upsertOne(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sessionCleared, () => initialChatState)
      .addCase(fetchMessages.pending, (state, action) => {
        state.loadRequestId = action.meta.requestId;
        state.load = { status: 'loading', error: null, viajeId: action.meta.arg };
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.loadRequestId) return;
        messagesAdapter.upsertMany(state, action.payload.messages);
        Object.assign(state.authorNames, action.payload.authorNames);
        state.load = { status: 'succeeded', error: null, viajeId: action.meta.arg };
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        if (action.meta.requestId !== state.loadRequestId) return;
        state.load = { status: 'failed', error: action.payload ?? null, viajeId: action.meta.arg };
      })
      .addCase(fetchAuthorNames.pending, (state, action) => {
        state.requestedAuthorIds.push(...action.meta.arg);
      })
      .addCase(fetchAuthorNames.fulfilled, (state, action) => {
        Object.assign(state.authorNames, action.payload);
      })
      .addCase(fetchAuthorNames.rejected, (state, action) => {
        // Se olvidan para poder reintentar con el siguiente mensaje.
        state.requestedAuthorIds = state.requestedAuthorIds.filter(
          (id) => !action.meta.arg.includes(id),
        );
      })
      .addCase(sendMessage.pending, (state) => {
        state.send = { status: 'loading', error: null };
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        messagesAdapter.upsertOne(state, action.payload);
        state.send = { status: 'succeeded', error: null };
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.send = { status: 'failed', error: action.payload ?? null };
      });
  },
});

export const { messageReceived } = chatSlice.actions;
export default chatSlice.reducer;
