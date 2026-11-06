import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

/**
 * true si hay que evitar animaciones (V-09): cuando el sistema tiene activo
 * "Reducir movimiento" (o "Quitar animaciones" en Android) o cuando el usuario lo
 * activó en Ajustes de accesibilidad de la app.
 */
export function useReduceMotion(): boolean {
  const { preferences } = useTheme();
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) setSystemReduceMotion(enabled);
      })
      .catch(() => undefined);

    // El listener mantiene el valor al día si el usuario cambia el ajuste con la app abierta.
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      setSystemReduceMotion(enabled);
    });

    // Limpieza: sin esto, el listener seguiría vivo después de desmontar el componente.
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return systemReduceMotion || preferences.reduceMotion;
}
