import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Icon } from '@/components/ui/Icon';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { selectProfile } from '@/features/profile/selectors';
import { changeMode, fetchMyProfile } from '@/features/profile/thunks';
import { selectVehicle } from '@/features/vehicle/selectors';
import { fetchMyVehicle } from '@/features/vehicle/thunks';
import { useAnnounce } from '@/hooks/useAnnounce';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

export default function HomeScreen() {
  const { colors, borders } = useTheme();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectProfile);
  const vehicle = useAppSelector(selectVehicle);
  const announce = useAnnounce();

  const [showNoCarDialog, setShowNoCarDialog] = useState(false);
  const [showConfirmConductorDialog, setShowConfirmConductorDialog] = useState(false);

  useEffect(() => {
    dispatch(fetchMyProfile());
    dispatch(fetchMyVehicle());
  }, [dispatch]);

  const currentMode = profile?.modo_actual ?? 'pasajero';

  const handleModeChange = async (newMode: 'pasajero' | 'conductor') => {
    if (newMode === currentMode) return;

    if (newMode === 'conductor') {
      if (!vehicle) {
        setShowNoCarDialog(true);
      } else {
        setShowConfirmConductorDialog(true);
      }
    } else {
      try {
        await dispatch(changeMode('pasajero')).unwrap();
        announce('Cambiado a modo Pasajero.');
      } catch {
        announce('Error al cambiar a modo pasajero.');
      }
    }
  };

  const handleConfirmConductor = async () => {
    setShowConfirmConductorDialog(false);
    try {
      await dispatch(changeMode('conductor')).unwrap();
      announce('Cambiado a modo Conductor.');
    } catch {
      announce('Error al cambiar a modo conductor.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      {/* Encabezado blanco con Logo y botón de Perfil */}
      <AppHeader onPressProfile={() => router.push('/profile')} />

      {/* Selector Pasajero/Conductor centrado */}
      <View style={styles.toggleRow}>
        <SegmentedToggle
          accessibilityLabel="Selector de modo"
          value={currentMode}
          onChange={(val) => handleModeChange(val as 'pasajero' | 'conductor')}
          options={[
            { value: 'pasajero', label: 'Pasajero', icon: 'account' },
            { value: 'conductor', label: 'Conductor', icon: 'car' },
          ]}
        />
      </View>

      {/* Banda de título #C1C9D7 */}
      <View style={[styles.titleBand, { backgroundColor: colors.titleBand }]}>
        <AppText variant="cardTitle" color="primary">
          ¡Buen viaje {profile?.nombre || 'estudiante'}!
        </AppText>
      </View>

      {/* Zona de contenido */}
      <ScrollView contentContainerStyle={styles.content}>
        {currentMode === 'pasajero' ? (
          <View style={styles.cardContainer}>
            <View style={[styles.primaryCard, { backgroundColor: colors.primary }]}>
              <Icon name="magnify" size={36} color={colors.onPrimary} />
              <ScreenTitle color="onPrimary">Buscar trayectos</ScreenTitle>
              <AppText variant="body" color="onBrandMuted" style={styles.centered}>
                Encuentra compañeros de la Universidad de La Sabana que van hacia o desde el campus.
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
                Modo Pasajero activo. En la siguiente etapa se habilitará el buscador con filtros en
                tiempo real.
              </AppText>
            </View>
          </View>
        ) : (
          <View style={styles.cardContainer}>
            <View style={[styles.primaryCard, { backgroundColor: colors.primary }]}>
              <Icon name="plus-circle" size={36} color={colors.onPrimary} />
              <ScreenTitle color="onPrimary">Crea un viaje</ScreenTitle>
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
      </ScrollView>

      {/* Diálogo cuando no tiene carro */}
      <ConfirmDialog
        visible={showNoCarDialog}
        title="No tienes un carro registrado"
        message="Debes registrar un carro para cambiar a modo conductor."
        confirmLabel="Registrar Carro"
        cancelLabel="Volver"
        onConfirm={() => {
          setShowNoCarDialog(false);
          router.push('/(auth)/register/car');
        }}
        onCancel={() => setShowNoCarDialog(false)}
      />

      {/* Diálogo de confirmación para pasar a conductor */}
      <ConfirmDialog
        visible={showConfirmConductorDialog}
        title="¿Está seguro que desea cambiar a modo Conductor?"
        message="Esta acción afectará la manera en que usa la app."
        confirmLabel="Sí, cambiar a Conductor"
        cancelLabel="No, cancelar"
        onConfirm={handleConfirmConductor}
        onCancel={() => setShowConfirmConductorDialog(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  toggleRow: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  titleBand: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
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
