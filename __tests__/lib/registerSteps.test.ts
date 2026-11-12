import { registerStep } from '@/lib/registerSteps';

describe('registerStep ("Paso x de y", T-08 y D-68)', () => {
  it('con el código de correo el registro tiene 7 pasos', () => {
    expect(registerStep('datos', true)).toEqual({ current: 1, total: 7 });
    expect(registerStep('codigo', true)).toEqual({ current: 2, total: 7 });
    expect(registerStep('foto', true)).toEqual({ current: 3, total: 7 });
    expect(registerStep('soat', true)).toEqual({ current: 7, total: 7 });
  });

  it('sin el código el registro tiene 6 pasos y no se salta ningún número', () => {
    expect(registerStep('datos', false)).toEqual({ current: 1, total: 6 });
    expect(registerStep('foto', false)).toEqual({ current: 2, total: 6 });
    expect(registerStep('tieneCarro', false)).toEqual({ current: 3, total: 6 });
    expect(registerStep('carro', false)).toEqual({ current: 4, total: 6 });
    expect(registerStep('fotoCarro', false)).toEqual({ current: 5, total: 6 });
    expect(registerStep('soat', false)).toEqual({ current: 6, total: 6 });
  });

  it('la pantalla del código siempre se cuenta a sí misma', () => {
    expect(registerStep('codigo', false)).toEqual({ current: 2, total: 7 });
  });
});
