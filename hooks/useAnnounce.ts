import { useCallback } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

type AnnounceOptions = {
  /**
   * true si el mismo mensaje ya está en pantalla dentro de un contenedor con
   * accessibilityLiveRegion. En Android esa región ya lo lee TalkBack, así que no se
   * anuncia otra vez (evita oírlo dos veces). En iOS siempre se anuncia, porque
   * accessibilityLiveRegion no existe ahí.
   */
  liveRegionVisible?: boolean;
};

/**
 * Anuncia un mensaje al lector de pantalla sin mover el foco (S-07).
 * Se usa para errores, éxitos, cargas, mensajes nuevos y notificaciones.
 */
export function useAnnounce() {
  return useCallback((message: string, options: AnnounceOptions = {}) => {
    if (!message) return;
    if (options.liveRegionVisible && Platform.OS === 'android') return;
    AccessibilityInfo.announceForAccessibility(message);
  }, []);
}
