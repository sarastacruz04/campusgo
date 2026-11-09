import { createEntityAdapter, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { sessionCleared } from '@/features/auth/actions';
import { initialRequest, type RequestState } from '@/store/types';
import type { Mensaje } from '@/types/database';

import { fetchMessages, sendMessage } from './thunks';

// Mensajes de todos los chats abiertos, del más antiguo al más nuevo.
export const messagesAdapter = createEntityAdapter<Mensaje>({
  sortComparer: (a, b) => a.created_at.localeCompare(b.created_at),
});

export type ChatState = ReturnType<typeof messagesAdapter.getInitialState> & {
  load: RequestState;
  send: RequestState;
};

export const initialChatState: ChatState = messagesAdapter.getInitialState({
  load: initialRequest,
  send: initialRequest,
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
      .addCase(fetchMessages.pending, (state) => {
        state.load = { status: 'loading', error: null };
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        messagesAdapter.upsertMany(state, action.payload.messages);
        state.load = { status: 'succeeded', error: null };
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.load = { status: 'failed', error: action.payload ?? null };
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
