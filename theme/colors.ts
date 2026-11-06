import type { ContrastKind } from '../lib/contrast';

// Tokens de color de CampusGo. Las pantallas nunca usan un hexadecimal directo:
// siempre piden un token al tema activo (useTheme().colors).
// Cada combinación texto/fondo que usa la app está en CONTRAST_PAIRS y la verifica
// `npm run a11y:contrast` en los tres temas (V-01).

export type ThemeName = 'light' | 'dark' | 'highContrast';

export type ColorTokens = {
  /** Fondo de la pantalla (zona de contenido #B2BBC9 en el Figma). */
  background: string;
  /** Superficies blancas: encabezado, tarjetas, campos, barra inferior. */
  surface: string;
  /** Banda del título de cada pantalla. */
  titleBand: string;
  /** Encabezado gris de las tarjetas de viaje (solo texto grande y en negrita). */
  cardHeader: string;
  /** Texto principal sobre surface, background, titleBand y cardHeader. */
  text: string;
  /** Texto secundario (14 sp) sobre surface. */
  textMuted: string;
  /** Texto de ejemplo dentro de los campos (V-02). */
  placeholder: string;
  /** Botón principal y bordes de controles. */
  primary: string;
  /** Color del botón principal mientras se presiona. */
  primaryPressed: string;
  /** Texto e íconos sobre primary. */
  onPrimary: string;
  /** Tarjetas y diálogos azules (diálogos, "Crea un viaje", perfil, filtros). */
  brandSurface: string;
  /** Texto e íconos sobre brandSurface. */
  onBrand: string;
  /** Texto secundario sobre brandSurface (V-03). */
  onBrandMuted: string;
  /** Borde de campos y controles sobre surface (1 px; 2 px al enfocar). */
  border: string;
  /** Borde visible de foco con teclado externo (T-03). */
  focus: string;
  /** Enlaces (siempre subrayados). */
  link: string;
  /** Texto e ícono de error (V-05). */
  error: string;
  /** Texto e ícono de éxito (V-05). */
  success: string;
  /** Check de éxito sobre brandSurface. */
  successOnBrand: string;
  /** Fondo del círculo del signo "?" y del error en diálogos (V-04). */
  alertBadge: string;
  /** Signo blanco dentro de alertBadge. */
  onAlertBadge: string;
  /** Fondo semitransparente detrás de los diálogos (no lleva texto). */
  scrim: string;
  /** Fondo del avatar sin foto. */
  avatarBackground: string;
  /** Ícono de persona del avatar sin foto. */
  avatarIcon: string;
};

// Tema claro: valores del Figma, ajustados por la auditoría del Corte 2.
const light: ColorTokens = {
  background: '#B2BBC9',
  surface: '#FFFFFF',
  titleBand: '#C1C9D7',
  cardHeader: '#A9ACB0',
  text: '#334259',
  textMuted: '#5F6B7A',
  placeholder: '#5F6B7A',
  primary: '#334259',
  primaryPressed: '#24303F',
  onPrimary: '#FFFFFF',
  brandSurface: '#334259',
  onBrand: '#FFFFFF',
  onBrandMuted: '#E3E8F0',
  border: '#334259',
  focus: '#1A4FD6',
  link: '#1A4FD6',
  error: '#B3261E',
  success: '#1E7B34',
  successOnBrand: '#3EE700',
  alertBadge: '#AF0000',
  onAlertBadge: '#FFFFFF',
  scrim: '#000000',
  avatarBackground: '#E3E8F0',
  avatarIcon: '#334259',
};

// Tema oscuro: fondo #0F1623, superficie #1B2536, texto #F2F5FA, acento #9DB2D6.
const dark: ColorTokens = {
  background: '#0F1623',
  surface: '#1B2536',
  titleBand: '#243049',
  cardHeader: '#2E3B55',
  text: '#F2F5FA',
  textMuted: '#C3CCDA',
  placeholder: '#A3AEC2',
  primary: '#9DB2D6',
  primaryPressed: '#B8C9E6',
  onPrimary: '#0F1623',
  brandSurface: '#2A3A57',
  onBrand: '#F2F5FA',
  onBrandMuted: '#D5DDEA',
  border: '#7F8EA8',
  focus: '#9DB2D6',
  link: '#A8C7FA',
  error: '#FFB4AB',
  success: '#86D993',
  successOnBrand: '#86D993',
  alertBadge: '#AF0000',
  onAlertBadge: '#FFFFFF',
  scrim: '#000000',
  avatarBackground: '#2E3B55',
  avatarIcon: '#F2F5FA',
};

// Alto contraste: blanco y negro con primary #1B2433 y bordes de 2 px (ver layout.ts).
const highContrast: ColorTokens = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  titleBand: '#FFFFFF',
  cardHeader: '#FFFFFF',
  text: '#000000',
  textMuted: '#1B2433',
  placeholder: '#3B3B3B',
  primary: '#1B2433',
  primaryPressed: '#000000',
  onPrimary: '#FFFFFF',
  brandSurface: '#1B2433',
  onBrand: '#FFFFFF',
  onBrandMuted: '#FFFFFF',
  border: '#000000',
  focus: '#0033AA',
  link: '#0033AA',
  error: '#8C1D18',
  success: '#0B5A1F',
  successOnBrand: '#7CFC5A',
  alertBadge: '#AF0000',
  onAlertBadge: '#FFFFFF',
  scrim: '#000000',
  avatarBackground: '#FFFFFF',
  avatarIcon: '#000000',
};

export const themes: Record<ThemeName, ColorTokens> = { light, dark, highContrast };

export type ContrastPair = {
  foreground: keyof ColorTokens;
  background: keyof ColorTokens;
  kind: ContrastKind;
  /** Dónde se usa, para que el reporte del script sea legible. */
  usage: string;
};

// Pares que de verdad aparecen en la interfaz. Si un componente nuevo combina dos
// tokens que no están aquí, hay que agregarlos para que el script los verifique.
export const CONTRAST_PAIRS: ContrastPair[] = [
  { foreground: 'text', background: 'surface', kind: 'text', usage: 'Texto en tarjetas y campos' },
  { foreground: 'text', background: 'background', kind: 'text', usage: 'Texto sobre el fondo' },
  { foreground: 'text', background: 'titleBand', kind: 'text', usage: 'Título en la banda' },
  {
    foreground: 'text',
    background: 'cardHeader',
    kind: 'largeText',
    usage: 'Título de tarjeta (22 sp negrita)',
  },
  { foreground: 'textMuted', background: 'surface', kind: 'text', usage: 'Texto secundario' },
  { foreground: 'placeholder', background: 'surface', kind: 'text', usage: 'Placeholder' },
  { foreground: 'onPrimary', background: 'primary', kind: 'text', usage: 'Botón principal' },
  {
    foreground: 'onPrimary',
    background: 'primaryPressed',
    kind: 'text',
    usage: 'Botón principal presionado',
  },
  { foreground: 'primary', background: 'surface', kind: 'text', usage: 'Botón secundario' },
  { foreground: 'onBrand', background: 'brandSurface', kind: 'text', usage: 'Diálogos y tarjetas' },
  {
    foreground: 'onBrandMuted',
    background: 'brandSurface',
    kind: 'text',
    usage: 'Texto secundario en diálogos y filtros',
  },
  {
    foreground: 'brandSurface',
    background: 'onBrand',
    kind: 'text',
    usage: 'Botón blanco en diálogo y segmento activo',
  },
  { foreground: 'link', background: 'surface', kind: 'text', usage: 'Enlaces' },
  { foreground: 'error', background: 'surface', kind: 'text', usage: 'Mensaje de error' },
  { foreground: 'success', background: 'surface', kind: 'text', usage: 'Mensaje de éxito' },
  { foreground: 'border', background: 'surface', kind: 'ui', usage: 'Borde de campos' },
  { foreground: 'focus', background: 'surface', kind: 'ui', usage: 'Borde de foco' },
  { foreground: 'primary', background: 'background', kind: 'ui', usage: 'Botones sobre el fondo' },
  {
    foreground: 'onBrand',
    background: 'brandSurface',
    kind: 'ui',
    usage: 'Borde del botón secundario en diálogos',
  },
  {
    foreground: 'successOnBrand',
    background: 'brandSurface',
    kind: 'ui',
    usage: 'Check de éxito en diálogos',
  },
  { foreground: 'onAlertBadge', background: 'alertBadge', kind: 'ui', usage: 'Signo "?" (V-04)' },
  { foreground: 'avatarIcon', background: 'avatarBackground', kind: 'ui', usage: 'Avatar vacío' },
];
