import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@/store/store';

import { messagesAdapter } from './slice';

const adapterSelectors = messagesAdapter.getSelectors((state: RootState) => state.chat);

export const selectChatLoad = (state: RootState) => state.chat.load;
export const selectChatSend = (state: RootState) => state.chat.send;
export const selectAuthorNames = (state: RootState) => state.chat.authorNames;

/** Fábrica: cada pantalla de chat crea su selector memoizado para su viaje. */
export const makeSelectMessagesForTrip = (viajeId: string) =>
  createSelector([adapterSelectors.selectAll], (messages) =>
    messages.filter((message) => message.viaje_id === viajeId),
  );

/**
 * Los mismos mensajes del más nuevo al más antiguo: la lista invertida (inverted)
 * dibuja el primer elemento abajo, junto al campo de escribir, como en todo chat.
 */
export const makeSelectMessagesNewestFirst = (viajeId: string) =>
  createSelector([makeSelectMessagesForTrip(viajeId)], (messages) => [...messages].reverse());
