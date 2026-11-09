import { router } from 'expo-router';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { ModeSwitch } from '@/hooks/useModeSwitch';

/** Diálogos del cambio de modo (pantalla 16). Se usan junto con useModeSwitch. */
export function ModeSwitchDialogs({ modeSwitch }: { modeSwitch: ModeSwitch }) {
  return (
    <>
      <ConfirmDialog
        visible={modeSwitch.noCarVisible}
        title="No tienes un carro registrado"
        message="Debes registrar un carro para cambiar a modo conductor."
        confirmLabel="Registrar Carro"
        cancelLabel="Volver"
        onConfirm={() => {
          modeSwitch.closeNoCar();
          router.push('/(auth)/register/car');
        }}
        onCancel={modeSwitch.closeNoCar}
      />
      <ConfirmDialog
        visible={modeSwitch.confirmVisible}
        title="¿Está seguro que desea cambiar a modo Conductor?"
        message="Esta acción afectará la manera en que usa la app."
        confirmLabel="Sí, cambiar a Conductor"
        cancelLabel="No, cancelar"
        onConfirm={modeSwitch.confirmConductor}
        onCancel={modeSwitch.closeConfirm}
      />
    </>
  );
}
