import { render } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import { StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { makeStore, type AppStore } from '@/store/store';
import { DEFAULT_PREFERENCES, ThemeProvider, type Preferences } from '@/theme/ThemeProvider';

// Medidas fijas para que SafeAreaProvider funcione en Node (no hay pantalla real).
const initialMetrics = {
  frame: { x: 0, y: 0, width: 400, height: 800 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

/**
 * Renderiza un componente con los mismos providers que la app (área segura, Redux
 * y tema). Usa la opción wrapper para que rerender() conserve los providers.
 * Si la prueba no pasa un store, se crea uno nuevo y vacío.
 */
export function renderWithProviders(
  ui: ReactElement,
  preferences: Partial<Preferences> = {},
  store: AppStore = makeStore(),
) {
  const initialPreferences = { ...DEFAULT_PREFERENCES, ...preferences };
  function Providers({ children }: { children: ReactNode }) {
    return (
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <Provider store={store}>
          <ThemeProvider initialPreferences={initialPreferences}>{children}</ThemeProvider>
        </Provider>
      </SafeAreaProvider>
    );
  }
  return render(ui, { wrapper: Providers });
}

/** Aplana un estilo (arreglo u objeto) para poder leer minHeight, lineHeight, etc. */
export function flatStyle(style: unknown): ViewStyle & TextStyle {
  return StyleSheet.flatten(style as StyleProp<ViewStyle & TextStyle>) ?? {};
}
