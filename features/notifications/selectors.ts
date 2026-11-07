import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@/store/store';

import { notificationsAdapter } from './slice';

const adapterSelectors = notificationsAdapter.getSelectors(
  (state: RootState) => state.notifications,
);

export const selectNotifications = adapterSelectors.selectAll;
export const selectNotificationsLoad = (state: RootState) => state.notifications.load;

/** Contador del ícono de notificaciones (E7). */
export const selectUnreadCount = createSelector(
  [selectNotifications],
  (items) => items.filter((item) => !item.leida).length,
);
