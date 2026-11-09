import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import type { AppMode } from '@/components/ui/ScreenLayout';
import { selectCurrentMode } from '@/features/profile/selectors';
import { changeMode } from '@/features/profile/thunks';
import { selectHasVehicle } from '@/features/vehicle/selectors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { useAnnounce } from './useAnnounce';

/**
 * Cambio entre modo pasajero y conductor, compartido por las pestañas (pantalla 16).
 * Sin carro muestra el aviso; con carro pide confirmación (R3 y T-06). Al cambiar se
 * vuelve a Inicio, porque Reservas solo existe en modo pasajero y Creados en conductor.
 */
export function useModeSwitch() {
  const dispatch = useAppDispatch();
  const announce = useAnnounce();
  const mode = useAppSelector(selectCurrentMode);
  const hasVehicle = useAppSelector(selectHasVehicle);
  const [noCarVisible, setNoCarVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const applyMode = useCallback(
    async (next: AppMode) => {
      const label = next === 'conductor' ? 'Conductor' : 'Pasajero';
      try {
        await dispatch(changeMode(next)).unwrap();
        announce(`Cambiado a modo ${label}.`);
        router.replace('/(tabs)');
      } catch {
        announce(`No se pudo cambiar a modo ${label}.`);
      }
    },
    [dispatch, announce],
  );

  const requestModeChange = useCallback(
    (next: AppMode) => {
      if (next === 'pasajero') applyMode('pasajero');
      else if (hasVehicle) setConfirmVisible(true);
      else setNoCarVisible(true);
    },
    [applyMode, hasVehicle],
  );

  return {
    mode,
    requestModeChange,
    noCarVisible,
    confirmVisible,
    closeNoCar: useCallback(() => setNoCarVisible(false), []),
    closeConfirm: useCallback(() => setConfirmVisible(false), []),
    confirmConductor: useCallback(() => {
      setConfirmVisible(false);
      applyMode('conductor');
    }, [applyMode]),
  };
}

export type ModeSwitch = ReturnType<typeof useModeSwitch>;
