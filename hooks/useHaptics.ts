import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Platform } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type FeedbackType = 'success' | 'warning' | 'error';

// En Android, la documentación de expo-haptics recomienda performAndroidHapticsAsync
// en lugar de notificationAsync (que simula la vibración con la API Vibrator).
const ANDROID_HAPTICS: Record<FeedbackType, Haptics.AndroidHaptics> = {
  success: Haptics.AndroidHaptics.Confirm,
  warning: Haptics.AndroidHaptics.Long_Press,
  error: Haptics.AndroidHaptics.Reject,
};

const IOS_HAPTICS: Record<FeedbackType, Haptics.NotificationFeedbackType> = {
  success: Haptics.NotificationFeedbackType.Success,
  warning: Haptics.NotificationFeedbackType.Warning,
  error: Haptics.NotificationFeedbackType.Error,
};

/**
 * Vibración de éxito, advertencia y error (T-04). Respeta el interruptor
 * "Vibración" de Ajustes de accesibilidad. La vibración siempre acompaña a un mensaje
 * visible y a un anuncio del lector: nunca es la única señal.
 */
export function useHaptics() {
  const { preferences } = useTheme();
  const enabled = preferences.haptics;

  return useMemo(() => {
    const trigger = (type: FeedbackType) => {
      if (!enabled) return;
      const promise =
        Platform.OS === 'android'
          ? Haptics.performAndroidHapticsAsync(ANDROID_HAPTICS[type])
          : Haptics.notificationAsync(IOS_HAPTICS[type]);
      // Si el teléfono no tiene motor de vibración, se ignora: es una señal complementaria.
      promise.catch(() => undefined);
    };
    return {
      success: () => trigger('success'),
      warning: () => trigger('warning'),
      error: () => trigger('error'),
    };
  }, [enabled]);
}
