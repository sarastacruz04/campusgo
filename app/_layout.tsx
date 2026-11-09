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
import { Provider } from 'react-redux';

import { selectAuthInitialized, selectUserId } from '@/features/auth/selectors';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useConnectivity } from '@/hooks/useConnectivity';
import { useRealtimeNotifications, useRealtimeTripsAndReservations } from '@/hooks/useRealtime';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useAppSelector } from '@/store/hooks';
import { store } from '@/store/store';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

// La pantalla de carga nativa se mantiene hasta tener fuentes, preferencias y la
// sesión guardada, para no mostrar un instante la fuente del sistema, el tema
// equivocado o una pantalla que luego cambia por la de inicio de sesión.
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

  // Sesión, conexión y Realtime viven aquí para que estén activos en toda la app.
  useAuthSession();
  useConnectivity();
  const authInitialized = useAppSelector(selectAuthInitialized);
  const userId = useAppSelector(selectUserId);
  useRealtimeTripsAndReservations(userId !== null);
  useRealtimeNotifications(userId);

  const appReady = fontsDone && ready && authInitialized;

  useEffect(() => {
    if (appReady) SplashScreen.hideAsync();
  }, [appReady]);

  if (!appReady) return null;

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
      <Provider store={store}>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
