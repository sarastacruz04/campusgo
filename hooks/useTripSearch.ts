import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { selectIsOnline } from '@/features/settings/selectors';
import { selectSearchState, selectSectores } from '@/features/trips/selectors';
import { filtersChanged } from '@/features/trips/slice';
import { fetchSectores, searchTrips } from '@/features/trips/thunks';
import { TRIPS_PAGE_SIZE } from '@/services/tripService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { TripFilters } from '@/types/domain';

import { useAnnounce } from './useAnnounce';
import { useDebouncedValue } from './useDebouncedValue';

export const FILTER_DEBOUNCE_MS = 300;

/**
 * Lógica de la búsqueda del inicio de pasajero: los filtros, el debounce de 300 ms,
 * la consulta y el anuncio del resultado. `enabled` es false en modo conductor.
 */
export function useTripSearch(enabled: boolean) {
  const dispatch = useAppDispatch();
  const announce = useAnnounce();
  const sectores = useAppSelector(selectSectores);
  const isOnline = useAppSelector(selectIsOnline);
  const { nextOffset } = useAppSelector(selectSearchState);

  const [sectorId, setSectorId] = useState<number | null>(null);
  const [cupos, setCupos] = useState('');

  const filters = useMemo<TripFilters>(() => {
    const minCupos = Number.parseInt(cupos, 10);
    return { sectorId, minCupos: minCupos > 0 ? minCupos : null };
  }, [sectorId, cupos]);
  const debouncedFilters = useDebouncedValue(filters, FILTER_DEBOUNCE_MS);

  // Solo se anuncia el resultado de la última búsqueda lanzada.
  const lastSearch = useRef(0);
  const runSearch = useCallback(
    async (next: TripFilters) => {
      const search = ++lastSearch.current;
      dispatch(filtersChanged(next));
      const result = await dispatch(searchTrips({ reset: true }));
      if (search !== lastSearch.current || !searchTrips.fulfilled.match(result)) return;
      const total = result.payload.data.length;
      announce(total === 0 ? 'No hay viajes con estos filtros.' : `${total} viajes cargados.`);
    },
    [dispatch, announce],
  );

  // Busca al entrar, al cambiar un filtro (con debounce) y al recuperar o perder la red.
  useEffect(() => {
    if (enabled) runSearch(debouncedFilters);
  }, [enabled, debouncedFilters, isOnline, runSearch]);

  useEffect(() => {
    if (enabled && sectores.length === 0) dispatch(fetchSectores());
  }, [enabled, sectores.length, dispatch]);

  // Valores actuales en una referencia: si fueran dependencias del callback de foco,
  // cada búsqueda (que cambia nextOffset) volvería a dispararlo.
  const latest = useRef({ enabled, nextOffset, filters: debouncedFilters });
  useEffect(() => {
    latest.current = { enabled, nextOffset, filters: debouncedFilters };
  }, [enabled, nextOffset, debouncedFilters]);

  // Al volver a la pantalla se refresca, salvo que la persona ya haya bajado varias
  // páginas: recargar la devolvería al inicio de la lista. Los cambios de esos viajes
  // siguen llegando por Realtime. El primer foco lo cubre la búsqueda inicial.
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      const current = latest.current;
      if (current.enabled && current.nextOffset <= TRIPS_PAGE_SIZE) runSearch(current.filters);
    }, [runSearch]),
  );

  return {
    sectores,
    sectorId,
    setSectorId,
    cupos,
    // Solo dígitos: el campo es numérico y la base guarda cupos enteros.
    setCupos: useCallback((text: string) => setCupos(text.replace(/\D/g, '')), []),
    // La lupa busca de inmediato, sin esperar el debounce.
    searchNow: useCallback(() => runSearch(filters), [runSearch, filters]),
  };
}
