// Pasos del registro para el indicador "Paso x de y" (T-08).
// El paso del código solo existe si Supabase exige confirmar el correo; con la
// confirmación apagada (D-68) el registro tiene 6 pasos y no se salta un número.

export type RegisterStep =
  'datos' | 'codigo' | 'foto' | 'tieneCarro' | 'carro' | 'fotoCarro' | 'soat';

const ALL_STEPS: RegisterStep[] = [
  'datos',
  'codigo',
  'foto',
  'tieneCarro',
  'carro',
  'fotoCarro',
  'soat',
];

export function registerStep(
  step: RegisterStep,
  withEmailCode: boolean,
): { current: number; total: number } {
  // La pantalla del código siempre se cuenta a sí misma, aunque el estado no lo sepa
  // (por ejemplo, si la app se reinició en ese paso).
  const steps =
    withEmailCode || step === 'codigo' ? ALL_STEPS : ALL_STEPS.filter((s) => s !== 'codigo');
  return { current: steps.indexOf(step) + 1, total: steps.length };
}
