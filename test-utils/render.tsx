import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DEFAULT_PREFERENCES, ThemeProvider, type Preferences } from '@/theme/ThemeProvider';

// Medidas fijas para que SafeAreaProvider funcione en Node (no hay pantalla real).
const initialMetrics = {
  frame: { x: 0, y: 0, width: 400, height: 800 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

/** Renderiza un componente con los mismos providers que la app (tema y área segura). */
export function renderWithProviders(ui: ReactElement, preferences: Partial<Preferences> = {}) {
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <ThemeProvider initialPreferences={{ ...DEFAULT_PREFERENCES, ...preferences }}>
        {ui}
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

/** Aplana un estilo (arreglo u objeto) para poder leer minHeight, lineHeight, etc. */
export function flatStyle(style: unknown): ViewStyle & TextStyle {
  return StyleSheet.flatten(style as StyleProp<ViewStyle & TextStyle>) ?? {};
}
