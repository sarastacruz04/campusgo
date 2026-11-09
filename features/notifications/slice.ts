import { createEntityAdapter, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { sessionCleared } from '@/features/auth/actions';
import { initialRequest, type RequestState } from '@/store/types';
import type { Notificacion } from '@/types/database';

import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from './thunks';

// Bandeja de notificaciones, más recientes primero.
export const notificationsAdapter = createEntityAdapter<Notificacion>({
  sortComparer: (a, b) => b.created_at.localeCompare(a.created_at),
});

export type NotificationsState = ReturnType<typeof notificationsAdapter.getInitialState> & {
  load: RequestState;
};

export const initialNotificationsState: NotificationsState = notificationsAdapter.getInitialState({
  load: initialRequest,
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: initialNotificationsState,
  reducers: {
    /** Notificación nueva recibida por Realtime (R11). */
    notificationReceived(state, action: PayloadAction<Notificacion>) {
      notificationsAdapter.upsertOne(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sessionCleared, () => initialNotificationsState)
      .addCase(fetchNotifications.pending, (state) => {
        state.load = { status: 'loading', error: null };
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        notificationsAdapter.setAll(state, action.payload);
        state.load = { status: 'succeeded', error: null };
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.load = { status: 'failed', error: action.payload ?? null };
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        notificationsAdapter.updateOne(state, { id: action.payload, changes: { leida: true } });
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        notificationsAdapter.updateMany(
          state,
          state.ids.map((id) => ({ id, changes: { leida: true } })),
        );
      });
  },
});

export const { notificationReceived } = notificationsSlice.actions;
export default notificationsSlice.reducer;
