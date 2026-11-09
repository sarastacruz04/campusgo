import { Redirect, router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, type HostInstance } from 'react-native';

import { ConnectionBanner } from '@/components/ConnectionBanner';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { TextField, type TextInputRef } from '@/components/ui/TextField';
import { selectAuthError, selectAuthStatus, selectUserId } from '@/features/auth/selectors';
import { signIn, signOut } from '@/features/auth/thunks';
import { selectUnreadCount } from '@/features/notifications/selectors';
import { fetchNotifications } from '@/features/notifications/thunks';
import {
  selectFullName,
  selectProfile,
  selectProfileLoad,
  selectProfileCacheInfo,
} from '@/features/profile/selectors';
import { fetchMyProfile } from '@/features/profile/thunks';
import { selectMyReservations, selectMyReservationsState } from '@/features/reservations/selectors';
import { fetchMyReservations } from '@/features/reservations/thunks';
import { selectSearchState, selectSearchTrips, selectSectores } from '@/features/trips/selectors';
import { fetchSectores, searchTrips } from '@/features/trips/thunks';
import { selectVehicle } from '@/features/vehicle/selectors';
import { fetchMyVehicle } from '@/features/vehicle/thunks';
import { useAnnounce } from '@/hooks/useAnnounce';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * PANTALLA TEMPORAL de la Etapa 3, solo en desarrollo (como el catálogo).
 * Sirve para comprobar la capa de cliente con un usuario creado a mano en
 * Supabase: iniciar sesión, que la sesión persista al reiniciar, y que perfil,
 * sectores, viajes y reservas se lean y se guarden en caché.
 * En la Etapa 4 la reemplazan las pantallas reales de autenticación.
 */
export default function SessionTestScreen() {
  if (!__DEV__) return <Redirect href="/" />;
  return <SessionTest />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View accessible style={styles.row}>
      <AppText variant="label">{label}</AppText>
      <AppText>{value}</AppText>
    </View>
  );
}

function SessionTest() {
  const dispatch = useAppDispatch();
  const announce = useAnnounce();
  const { colors } = useTheme();

  const userId = useAppSelector(selectUserId);
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const profile = useAppSelector(selectProfile);
  const fullName = useAppSelector(selectFullName);
  const profileLoad = useAppSelector(selectProfileLoad);
  const profileCache = useAppSelector(selectProfileCacheInfo);
  const sectores = useAppSelector(selectSectores);
  const trips = useAppSelector(selectSearchTrips);
  const searchState = useAppSelector(selectSearchState);
  const reservations = useAppSelector(selectMyReservations);
  const reservationsState = useAppSelector(selectMyReservationsState);
  const vehicle = useAppSelector(selectVehicle);
  const unread = useAppSelector(selectUnreadCount);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const passwordRef = useRef<TextInputRef>(null);
  const signOutButtonRef = useRef<HostInstance>(null);

  // Pide todo lo que la Etapa 3 debe leer y guardar en caché.
  const loadAll = useCallback(() => {
    dispatch(fetchMyProfile());
    dispatch(fetchSectores());
    dispatch(searchTrips({ reset: true }));
    dispatch(fetchMyReservations());
    dispatch(fetchMyVehicle());
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (!userId) return;
    announce('Sesión iniciada');
    loadAll();
  }, [userId, loadAll, announce]);

  const submit = () => dispatch(signIn({ email, password }));

  const fromCache = profileCache.fromCache || searchState.fromCache || reservationsState.fromCache;

  return (
    <ScreenLayout
      title="Sesión de prueba"
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
    >
      {userId ? (
        <>
          <ConnectionBanner fromCache={fromCache} cachedAt={profileCache.cachedAt} />
          {profileLoad.status === 'loading' && !profile ? (
            <LoadingState message="Cargando tu perfil…" />
          ) : null}
          {profileLoad.error ? (
            <StatusBanner tone="error" message={profileLoad.error.message} onRetry={loadAll} />
          ) : null}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Row label="Nombre" value={fullName || '—'} />
            <Row label="Modo" value={profile?.modo_actual ?? '—'} />
            <Row label="Carro" value={vehicle ? vehicle.placa : 'Sin carro registrado'} />
            <Row label="Sectores" value={String(sectores.length)} />
            <Row label="Viajes abiertos cargados" value={String(trips.length)} />
            <Row label="Mis reservas" value={String(reservations.length)} />
            <Row label="Notificaciones sin leer" value={String(unread)} />
          </View>
          {searchState.error ? (
            <StatusBanner
              tone="error"
              message={searchState.error.message}
              onRetry={() => dispatch(searchTrips({ reset: true }))}
            />
          ) : null}
          {reservationsState.error ? (
            <StatusBanner
              tone="error"
              message={reservationsState.error.message}
              onRetry={() => dispatch(fetchMyReservations())}
            />
          ) : null}
          <Button label="Recargar datos" onPress={loadAll} />
          <Button
            ref={signOutButtonRef}
            label="Cerrar Sesión"
            variant="secondary"
            icon="power"
            onPress={() => setConfirmVisible(true)}
          />
        </>
      ) : (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <TextField
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            autoComplete="email"
            textContentType="emailAddress"
            inputMode="email"
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <TextField
            ref={passwordRef}
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            password
            autoComplete="password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={submit}
          />
          {authError ? (
            <StatusBanner tone="error" message={authError.message} onRetry={submit} />
          ) : null}
          <Button
            label="Iniciar Sesión"
            loadingLabel="Iniciando sesión…"
            loading={authStatus === 'loading'}
            onPress={submit}
          />
        </View>
      )}

      <ConfirmDialog
        visible={confirmVisible}
        title="¿Está seguro de que desea cerrar sesión?"
        message="Tendrás que volver a escribir tu correo y contraseña."
        cancelLabel="No, volver"
        confirmLabel="Sí, cerrar sesión"
        returnFocusRef={signOutButtonRef}
        loading={authStatus === 'loading'}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={async () => {
          await dispatch(signOut());
          setConfirmVisible(false);
          announce('Sesión cerrada');
        }}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  row: {
    gap: spacing.xs,
  },
});
