import { selectEmailCodeRequired } from '@/features/auth/selectors';
import { registerStep, type RegisterStep } from '@/lib/registerSteps';
import { useAppSelector } from '@/store/hooks';

/** "Paso x de y" de una pantalla del registro, con o sin el paso del código (D-68). */
export function useRegisterStep(step: RegisterStep) {
  const withEmailCode = useAppSelector(selectEmailCodeRequired);
  return registerStep(step, withEmailCode);
}
