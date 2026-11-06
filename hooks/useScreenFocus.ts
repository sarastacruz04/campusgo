import { useEffect, useRef } from 'react';
import { AccessibilityInfo, type HostInstance } from 'react-native';

// Espera para que termine la transición de pantalla antes de mover el foco; si se
// envía antes, TalkBack lo pierde porque la vista todavía no está en pantalla.
export const SCREEN_FOCUS_DELAY_MS = 500;

/**
 * Mueve el foco del lector de pantalla al elemento de la referencia (T-03).
 * Se usa en el título de cada pantalla. Cuando `focusKey` cambia (por ejemplo, el
 * número de paso del registro), el foco vuelve al título.
 *
 * Usa sendAccessibilityEvent(..., 'focus'), que reemplaza al método deprecado
 * setAccessibilityFocus en React Native 0.88.
 */
export function useScreenFocus(enabled = true, focusKey?: string | number) {
  // HostInstance es el tipo de la vista nativa (View o Text) en React Native 0.88.
  const ref = useRef<HostInstance>(null);

  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => {
      if (ref.current) {
        AccessibilityInfo.sendAccessibilityEvent(ref.current, 'focus');
      }
    }, SCREEN_FOCUS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [enabled, focusKey]);

  return ref;
}
