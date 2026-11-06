import { useCallback } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Anuncia un mensaje al lector de pantalla sin mover el foco (S-07).
 * Se usa para errores, éxitos, cargas, mensajes nuevos y notificaciones.
 *
 * Es el único mecanismo de anuncio de la app, en Android y en iOS. En la revisión del
 * catálogo con TalkBack (C-05, C-06 y C-06b), announceForAccessibility sí se oyó y
 * accessibilityLiveRegion no, ni siquiera con la región siempre montada (D-27). Usar
 * un solo mecanismo además evita oír el mismo mensaje dos veces.
 */
export function useAnnounce() {
  return useCallback((message: string) => {
    if (!message) return;
    AccessibilityInfo.announceForAccessibility(message);
  }, []);
}
