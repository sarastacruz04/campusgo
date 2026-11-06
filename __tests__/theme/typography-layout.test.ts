import { Platform } from 'react-native';

import { borderWidths, hitSlopFor, TOUCH_MIN } from '@/theme/layout';
import {
  baseTypography,
  MIN_LINE_HEIGHT_RATIO,
  scaleTypography,
  TEXT_SIZE_FACTORS,
} from '@/theme/typography';

describe('Tipografía (V-06 y V-07)', () => {
  const factors = Object.entries(TEXT_SIZE_FACTORS);

  it.each(factors)(
    'con el tamaño "%s" todo estilo tiene lineHeight ≥ 1,4 × fontSize y letterSpacing ≥ 0',
    (_name, factor) => {
      for (const [variant, style] of Object.entries(scaleTypography(factor))) {
        expect({ variant, ok: style.lineHeight >= style.fontSize * MIN_LINE_HEIGHT_RATIO }).toEqual(
          { variant, ok: true },
        );
        expect(style.letterSpacing).toBeGreaterThanOrEqual(0);
      }
    },
  );

  it('respeta los tamaños mínimos: cuerpo 16, secundario 14 y barra inferior 12', () => {
    expect(baseTypography.body.fontSize).toBeGreaterThanOrEqual(16);
    expect(baseTypography.label.fontSize).toBeGreaterThanOrEqual(16);
    expect(baseTypography.secondary.fontSize).toBeGreaterThanOrEqual(14);
    expect(baseTypography.tab.fontSize).toBeGreaterThanOrEqual(12);
    expect(baseTypography.title.fontSize).toBeGreaterThanOrEqual(24);
    expect(baseTypography.title.fontSize).toBeLessThanOrEqual(28);
  });
});

describe('Medidas táctiles (T-01 y T-02)', () => {
  it('TOUCH_MIN es 44 en iOS y 48 en Android', () => {
    expect(TOUCH_MIN).toBe(Platform.OS === 'ios' ? 44 : 48);
  });

  it('hitSlopFor completa el área de un ícono pequeño hasta TOUCH_MIN', () => {
    const slop = hitSlopFor(24);
    expect(24 + slop.left + slop.right).toBeGreaterThanOrEqual(TOUCH_MIN);
    expect(24 + slop.top + slop.bottom).toBeGreaterThanOrEqual(TOUCH_MIN);
    expect(hitSlopFor(60).top).toBe(0);
  });

  it('el alto contraste usa bordes de 2 px', () => {
    expect(borderWidths('highContrast').thin).toBe(2);
    expect(borderWidths('light').thin).toBe(1);
  });
});
