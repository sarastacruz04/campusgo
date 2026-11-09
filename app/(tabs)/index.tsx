import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ModeSwitchDialogs } from '@/components/ModeSwitchDialogs';
import { TripFilters } from '@/components/trips/TripFilters';
import { TripList } from '@/components/trips/TripList';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { selectProfile } from '@/features/profile/selectors';
import { selectVehicle } from '@/features/vehicle/selectors';
import { useFocusCounter } from '@/hooks/useFocusCounter';
import { useModeSwitch } from '@/hooks/useModeSwitch';
import { useTripSearch } from '@/hooks/useTripSearch';
import { useAppSelector } from '@/store/hooks';
import { radius, spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

/** Inicio: búsqueda de viajes en modo pasajero (pantalla 10) y panel del conductor. */
export default function HomeScreen() {
  const { colors, borders } = useTheme();
  const profile = useAppSelector(selectProfile);
  const vehicle = useAppSelector(selectVehicle);
  const modeSwitch = useModeSwitch();
  const focusKey = useFocusCounter();
  const isPassenger = modeSwitch.mode === 'pasajero';
  const search = useTripSearch(isPassenger);

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
          <View style={[styles.primaryCard, { backgroundColor: colors.primary }]}>
            <Icon name="plus-circle" size={36} color={colors.onPrimary} />
            <AppText variant="subtitle" color="onPrimary" accessibilityRole="header">
              Crea un viaje
            </AppText>
            <AppText variant="body" color="onBrandMuted" style={styles.centered}>
              Publica tu trayecto hacia la Universidad para compartir gastos y ayudar a otros
              estudiantes.
            </AppText>
          </View>

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
            <AppText variant="body" style={{ color: colors.textMuted }}>
              Modo Conductor activo con vehículo {vehicle?.placa || ''}.
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
  centered: {
    textAlign: 'center',
  },
  infoBox: {
    borderRadius: radius.card,
    padding: spacing.lg,
    alignItems: 'center',
  },
});
