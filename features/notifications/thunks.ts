import { ERRORS, toAppError } from '@/services/errors';
import * as notificationService from '@/services/notificationService';
import { createAppAsyncThunk } from '@/store/createAppAsyncThunk';

export const fetchNotifications = createAppAsyncThunk(
  'notifications/fetch',
  async (_: void, { getState, rejectWithValue }) => {
    const userId = getState().auth.userId;
    if (!userId) return rejectWithValue(ERRORS.sinSesion);
    try {
      return await notificationService.listNotifications(userId);
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);

export const markNotificationRead = createAppAsyncThunk(
  'notifications/markRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);

export const markAllNotificationsRead = createAppAsyncThunk(
  'notifications/markAllRead',
  async (_: void, { getState, rejectWithValue }) => {
    const userId = getState().auth.userId;
    if (!userId) return rejectWithValue(ERRORS.sinSesion);
    try {
      await notificationService.markAllAsRead(userId);
    } catch (error) {
      return rejectWithValue(toAppError(error));
    }
  },
);
