import { contrastRatio, hexToRgb, meetsContrast } from '@/lib/contrast';
import { CONTRAST_PAIRS, themes, type ThemeName } from '@/theme/colors';

describe('contrastRatio (fórmula de WCAG)', () => {
  it('da 21:1 entre negro y blanco y 1:1 entre un color y sí mismo', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#334259', '#334259')).toBeCloseTo(1, 5);
  });

  it('coincide con los valores medidos en la propuesta del Corte 2', () => {
    // Valores de docs/PROPUESTA_ACCESIBILIDAD_CORTE2.md, secciones 3 y 5.
    expect(contrastRatio('#334259', '#FFFFFF')).toBeCloseTo(10.17, 1);
    expect(contrastRatio('#5F6B7A', '#FFFFFF')).toBeCloseTo(5.43, 1);
    expect(contrastRatio('#E3E8F0', '#334259')).toBeCloseTo(8.27, 1);
    expect(contrastRatio('#FFFFFF', '#AF0000')).toBeCloseTo(7.44, 1);
  });

  it('no depende del orden de los colores', () => {
    expect(contrastRatio('#FFFFFF', '#334259')).toBe(contrastRatio('#334259', '#FFFFFF'));
  });

  it('rechaza colores con formato inválido', () => {
    expect(() => hexToRgb('#FFF')).toThrow('Color inválido');
  });

  it('aplica 4,5:1 a texto y 3:1 a interfaz', () => {
    // #7F7F7F sobre blanco = 4,00:1: falla como texto, pasa como borde (H1 del Corte 2).
    expect(meetsContrast('#7F7F7F', '#FFFFFF', 'text')).toBe(false);
    expect(meetsContrast('#7F7F7F', '#FFFFFF', 'ui')).toBe(true);
  });
});

describe('Tokens de color (V-01)', () => {
  const themeNames = Object.keys(themes) as ThemeName[];

  it('los tres temas definen exactamente los mismos tokens', () => {
    const keys = Object.keys(themes.light).sort();
    for (const name of themeNames) {
      expect(Object.keys(themes[name]).sort()).toEqual(keys);
    }
  });

  it.each(themeNames)('todos los pares del tema %s cumplen WCAG AA', (name) => {
    const failures = CONTRAST_PAIRS.filter(
      (pair) =>
        !meetsContrast(themes[name][pair.foreground], themes[name][pair.background], pair.kind),
    ).map((pair) => `${pair.foreground}/${pair.background}`);
    expect(failures).toEqual([]);
  });

  it('el tema claro conserva los colores aprobados del Corte 2', () => {
    expect(themes.light.primary).toBe('#334259');
    expect(themes.light.placeholder).toBe('#5F6B7A');
    expect(themes.light.onBrandMuted).toBe('#E3E8F0');
    expect(themes.light.alertBadge).toBe('#AF0000');
    expect(themes.highContrast.text).toBe('#000000');
    expect(themes.dark.background).toBe('#0F1623');
  });
});
