import {
  NotoSans_400Regular,
  NotoSans_600SemiBold,
  NotoSans_700Bold,
  useFonts,
} from '@expo-google-fonts/noto-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useReduceMotion } from '@/hooks/useReduceMotion';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

// La pantalla de carga nativa se mantiene hasta tener fuentes y preferencias, para no
// mostrar un instante la fuente del sistema o el tema equivocado.
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { themeName, colors, ready } = useTheme();
  const reduceMotion = useReduceMotion();
  const [fontsLoaded, fontError] = useFonts({
    NotoSans_400Regular,
    NotoSans_600SemiBold,
    NotoSans_700Bold,
  });
  // Si la fuente falla, la app sigue con la del sistema en lugar de quedarse bloqueada.
  const fontsDone = fontsLoaded || Boolean(fontError);

  useEffect(() => {
    if (fontsDone && ready) SplashScreen.hideAsync();
  }, [fontsDone, ready]);

  if (!fontsDone || !ready) return null;

  return (
    <>
      <StatusBar style={themeName === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.surface },
          // Con "reducir movimiento", las pantallas cambian con un fundido corto (V-09).
          animation: reduceMotion ? 'fade' : 'default',
          animationDuration: reduceMotion ? 150 : undefined,
        }}
      />
    </>
  );
}

// Layout raíz. En la Etapa 4 aquí vivirá el guardia de sesión (auth vs. tabs).
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
