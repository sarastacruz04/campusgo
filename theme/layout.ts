import { Platform } from 'react-native';

import type { ThemeName } from './colors';

/**
 * Área táctil mínima (T-01): 44 pt en iOS (Apple HIG) y 48 dp en Android (Material).
 * Se usa como minHeight y minWidth en todo control, aunque el Figma lo dibuje más pequeño.
 */
export const TOUCH_MIN = Platform.select({ ios: 44, default: 48 });

/** Separación mínima entre objetivos táctiles vecinos (T-02). */
export const TOUCH_GAP = 8;

/** Escala de espaciado con base de 4 pt. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Radios del Figma: controles 4–6, tarjetas 8–12, diálogos 12. */
export const radius = {
  control: 6,
  card: 10,
  dialog: 12,
  pill: 999,
} as const;

/**
 * Grosor de bordes por tema. En alto contraste todo borde mide 2 px para que los
 * límites de los controles se vean sin depender de un color suave.
 */
export function borderWidths(theme: ThemeName) {
  const thin = theme === 'highContrast' ? 2 : 1;
  return { thin, focus: 2, error: 2 };
}

/**
 * hitSlop necesario para que un ícono de `visualSize` alcance TOUCH_MIN (T-02).
 * Ejemplo: un ícono de 24 en Android necesita 12 de hitSlop por lado (24 + 12 + 12 = 48).
 */
export function hitSlopFor(visualSize: number) {
  const extra = Math.max(0, Math.ceil((TOUCH_MIN - visualSize) / 2));
  return { top: extra, bottom: extra, left: extra, right: extra };
}
