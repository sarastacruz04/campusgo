import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@/store/store';

import { messagesAdapter } from './slice';

const adapterSelectors = messagesAdapter.getSelectors((state: RootState) => state.chat);

export const selectChatLoad = (state: RootState) => state.chat.load;
export const selectChatSend = (state: RootState) => state.chat.send;

/** Fábrica: cada pantalla de chat crea su selector memoizado para su viaje. */
export const makeSelectMessagesForTrip = (viajeId: string) =>
  createSelector([adapterSelectors.selectAll], (messages) =>
    messages.filter((message) => message.viaje_id === viajeId),
  );
