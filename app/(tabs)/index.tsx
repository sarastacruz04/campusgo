import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { ModeSwitchDialogs } from '@/components/ModeSwitchDialogs';
import { TripFilters } from '@/components/trips/TripFilters';
import { TripList } from '@/components/trips/TripList';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { selectProfile } from '@/features/profile/selectors';
import { selectPendingRequests } from '@/features/reservations/selectors';
import { fetchRequestsForMyTrips } from '@/features/reservations/thunks';
import { selectVehicle } from '@/features/vehicle/selectors';
import { useFocusCounter } from '@/hooks/useFocusCounter';
import { useModeSwitch } from '@/hooks/useModeSwitch';
import { useTripSearch } from '@/hooks/useTripSearch';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

/** Inicio: búsqueda de viajes en modo pasajero (pantalla 10) y panel del conductor (pantalla 17). */
export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { colors, borders } = useTheme();
  const profile = useAppSelector(selectProfile);
  const vehicle = useAppSelector(selectVehicle);
  const pendingRequests = useAppSelector(selectPendingRequests);
  const modeSwitch = useModeSwitch();
  const focusKey = useFocusCounter();
  const isPassenger = modeSwitch.mode === 'pasajero';
  const search = useTripSearch(isPassenger);

  const loadDriverData = useCallback(() => {
    if (!isPassenger) {
      dispatch(fetchRequestsForMyTrips());
    }
  }, [dispatch, isPassenger]);

  useFocusEffect(loadDriverData);

  return (
    <ScreenLayout
      title={`¡Buen viaje ${profile?.nombre || 'estudiante'}!`}
      titleFocusKey={focusKey}
      mode={modeSwitch.mode}
      onChangeMode={modeSwitch.requestModeChange}
      onPressProfile={() => router.push('/profile')}
      scrollable={!isPassenger}
      bandContent={
        isPassenger ? (
          <TripFilters
            sectores={search.sectores}
            sectorId={search.sectorId}
            onChangeSector={search.setSectorId}
            cupos={search.cupos}
            onChangeCupos={search.setCupos}
            onSearch={search.searchNow}
          />
        ) : undefined
      }
    >
      {isPassenger ? (
        <TripList />
      ) : (
        <View style={styles.cardContainer}>
          {/* Tarjeta 1: Crea un viaje */}
          <View style={[styles.primaryCard, { backgroundColor: colors.primary }]}>
            <Icon name="plus-circle" size={40} color={colors.onPrimary} />
            <AppText variant="subtitle" color="onPrimary" accessibilityRole="header">
              Crea un viaje
            </AppText>
            <AppText variant="body" color="onBrandMuted" style={styles.centered}>
              Publica tu trayecto hacia la Universidad para compartir gastos y ayudar a otros
              estudiantes.
            </AppText>
            <View style={styles.cardButtonWrapper}>
              <Button
                label="+"
                variant="onBrand"
                accessibilityLabel="Crear un nuevo viaje"
                accessibilityHint="Abre el formulario para publicar un nuevo viaje con mapa y detalles"
                onPress={() => router.push('/trip/create')}
              />
            </View>
          </View>

          {/* Tarjeta 2: Viajes Pendientes / Solicitudes */}
          <View style={[styles.primaryCard, { backgroundColor: colors.primary }]}>
            <Icon name="clock-outline" size={40} color={colors.onPrimary} />
            <AppText variant="subtitle" color="onPrimary" accessibilityRole="header">
              Viajes Pendientes
            </AppText>
            <AppText variant="body" color="onBrandMuted" style={styles.centered}>
              {pendingRequests.length === 0
                ? 'No tienes solicitudes pendientes de respuesta en este momento.'
                : `Tienes ${pendingRequests.length} ${
                    pendingRequests.length === 1
                      ? 'solicitud de reserva pendiente'
                      : 'solicitudes de reserva pendientes'
                  }.`}
            </AppText>
            <View style={styles.cardButtonWrapper}>
              <Button
                label="Ver más"
                variant="onBrand"
                accessibilityLabel="Ver solicitudes pendientes"
                accessibilityHint="Abre la lista de solicitudes de reserva para aceptar o rechazar pasajeros"
                onPress={() => router.push('/requests')}
              />
            </View>
          </View>

          {/* Caja informativa de vehículo activo */}
          <View
            style={[
              styles.infoBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: borders.thin,
              },
            ]}
          >
            <Icon name="car" size={24} color={colors.primary} />
            <AppText variant="body" style={{ color: colors.text }}>
              Modo Conductor activo con vehículo{' '}
              <AppText variant="bodyStrong">{vehicle?.placa || 'registrado'}</AppText>.
            </AppText>
          </View>
        </View>
      )}

      <ModeSwitchDialogs modeSwitch={modeSwitch} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    gap: spacing.md,
  },
  primaryCard: {
    borderRadius: radius.card,
    padding: spacing.xl,
    gap: spacing.sm,
    alignItems: 'center',
  },
  cardButtonWrapper: {
    marginTop: spacing.xs,
    minWidth: 140,
  },
  centered: {
    textAlign: 'center',
  },
  infoBox: {
    borderRadius: radius.card,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
