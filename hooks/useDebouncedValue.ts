import { useEffect, useState } from 'react';

/**
 * Devuelve el valor con retraso: solo cambia cuando `value` lleva `delayMs` sin
 * cambiar. Evita lanzar una búsqueda por cada tecla (300 ms en los filtros, sección 4).
 * El cleanup cancela el temporizador anterior si el valor vuelve a cambiar.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
