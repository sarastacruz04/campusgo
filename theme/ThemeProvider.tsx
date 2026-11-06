import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

import { themes, type ColorTokens, type ThemeName } from './colors';
import { borderWidths } from './layout';
import { scaleTypography, TEXT_SIZE_FACTORS, type TextSizePreference } from './typography';

// Preferencias de accesibilidad (V-08). Son datos no sensibles, por eso van en
// AsyncStorage y no en SecureStore.

export type ThemePreference = 'system' | ThemeName;

export type Preferences = {
  theme: ThemePreference;
  textSize: TextSizePreference;
  /** Reducir movimiento desde la app, además del ajuste del sistema (V-09). */
  reduceMotion: boolean;
  /** Vibración como retroalimentación (T-04). */
  haptics: boolean;
};

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'system',
  textSize: 'system',
  reduceMotion: false,
  haptics: true,
};

export const PREFERENCES_STORAGE_KEY = 'campusgo:preferencias';

type ThemeContextValue = {
  /** Tema efectivo después de resolver "Sistema". */
  themeName: ThemeName;
  colors: ColorTokens;
  typography: ReturnType<typeof scaleTypography>;
  borders: ReturnType<typeof borderWidths>;
  preferences: Preferences;
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  /** false mientras se leen las preferencias guardadas (evita un parpadeo de tema). */
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Une lo guardado con los valores por defecto, ignorando datos corruptos o de otra versión. */
function parsePreferences(raw: string | null): Preferences {
  if (!raw) return DEFAULT_PREFERENCES;
  try {
    const saved = JSON.parse(raw) as Partial<Preferences>;
    return { ...DEFAULT_PREFERENCES, ...saved };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

type ThemeProviderProps = {
  children: ReactNode;
  /** Solo para pruebas: arranca con estas preferencias sin leer el almacenamiento. */
  initialPreferences?: Preferences;
};

export function ThemeProvider({ children, initialPreferences }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [preferences, setPreferences] = useState<Preferences>(
    initialPreferences ?? DEFAULT_PREFERENCES,
  );
  const [ready, setReady] = useState(initialPreferences !== undefined);

  useEffect(() => {
    if (initialPreferences) return;
    // Bandera para no actualizar el estado si el componente se desmontó antes de leer.
    let active = true;
    AsyncStorage.getItem(PREFERENCES_STORAGE_KEY)
      .then((raw) => {
        if (active) setPreferences(parsePreferences(raw));
      })
      .catch(() => {
        // Si no se puede leer, la app sigue con los valores por defecto.
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [initialPreferences]);

  const setPreference = useCallback(
    <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      setPreferences((current) => {
        const next = { ...current, [key]: value };
        // Guardar es "disparar y olvidar": un error de escritura no debe bloquear la interfaz.
        AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
        return next;
      });
    },
    [],
  );

  const themeName: ThemeName =
    preferences.theme === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : preferences.theme;

  // useMemo evita que todos los consumidores se vuelvan a renderizar si nada cambió.
  const value = useMemo<ThemeContextValue>(
    () => ({
      themeName,
      colors: themes[themeName],
      typography: scaleTypography(TEXT_SIZE_FACTORS[preferences.textSize]),
      borders: borderWidths(themeName),
      preferences,
      setPreference,
      ready,
    }),
    [themeName, preferences, setPreference, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de <ThemeProvider>.');
  }
  return context;
}
