import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

/**
 * Número que sube cada vez que la pantalla recibe el foco de navegación. Las pestañas
 * no se desmontan al cambiar de una a otra: este contador hace que el foco del lector
 * vuelva al título al regresar a una pestaña (T-03).
 */
export function useFocusCounter(): number {
  const [count, setCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setCount((value) => value + 1);
    }, []),
  );

  return count;
}
