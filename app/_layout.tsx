import {
  NotoSans_400Regular,
  NotoSans_600SemiBold,
  NotoSans_700Bold,
  useFonts,
} from '@expo-google-fonts/noto-sans';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { selectAuthInitialized, selectUserId } from '@/features/auth/selectors';
import { selectProfile } from '@/features/profile/selectors';
import { fetchMyProfile } from '@/features/profile/thunks';
import { fetchMyVehicle } from '@/features/vehicle/thunks';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useConnectivity } from '@/hooks/useConnectivity';
import { useRealtimeNotifications, useRealtimeTripsAndReservations } from '@/hooks/useRealtime';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { store } from '@/store/store';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

// La pantalla de carga nativa se mantiene hasta tener fuentes, preferencias y la
// sesión guardada, para no mostrar un instante la fuente del sistema, el tema
// equivocado o una pantalla que luego cambia por la de inicio de sesión.
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { themeName, colors, ready } = useTheme();
  const reduceMotion = useReduceMotion();
  const dispatch = useAppDispatch();
  const segments = useSegments() as string[];

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
  const profile = useAppSelector(selectProfile);

  useRealtimeTripsAndReservations(userId !== null);
  useRealtimeNotifications(userId);

  // Carga perfil y vehículo cuando hay un usuario autenticado
  useEffect(() => {
    if (userId) {
      dispatch(fetchMyProfile());
      dispatch(fetchMyVehicle());
    }
  }, [userId, dispatch]);

  const appReady = fontsDone && ready && authInitialized;

  useEffect(() => {
    if (appReady) SplashScreen.hideAsync();
  }, [appReady]);

  // Guardia de sesión (sección 4, Etapa 4)
  useEffect(() => {
    if (!appReady) return;

    const segment0 = segments[0] as string | undefined;
    const segment1 = segments[1] as string | undefined;

    const inAuthGroup = segment0 === '(auth)';
    const inTabsGroup = segment0 === '(tabs)';
    const inProfile = segment0 === 'profile';
    const inTrip = segment0 === 'trip';
    const isRoot = !segment0 || segment0 === 'index';

    if (!userId) {
      // Sin sesión: redirige al inicio si intenta acceder a rutas privadas
      if (inTabsGroup || inProfile || inTrip) {
        router.replace('/');
      }
    } else {
      // Con sesión: revisa el estado del perfil
      if (profile) {
        if (!profile.registro_completo) {
          // Registro incompleto: retoma el paso de foto/carro
          if (isRoot || inTabsGroup || segment1 === 'login') {
            router.replace('/(auth)/register/photo');
          }
        } else {
          // Registro completo: redirige directo a las pestañas principales
          if (isRoot || inAuthGroup) {
            router.replace('/(tabs)');
          }
        }
      }
    }
  }, [appReady, userId, profile, segments]);

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
