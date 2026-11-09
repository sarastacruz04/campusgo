import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { TextField } from '@/components/ui/TextField';
import { signOut } from '@/features/auth/thunks';
import { selectProfile } from '@/features/profile/selectors';
import { changeMode, fetchMyProfile, updateMyProfile } from '@/features/profile/thunks';
import { selectVehicle } from '@/features/vehicle/selectors';
import { fetchMyVehicle, removeVehicle } from '@/features/vehicle/thunks';
import { useAnnounce } from '@/hooks/useAnnounce';
import { validatePhone, validateRequired } from '@/lib/validators';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

export default function ProfileScreen() {
  const { colors, borders } = useTheme();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectProfile);
  const vehicle = useAppSelector(selectVehicle);
  const announce = useAnnounce();

  // Tab interno del perfil: 'pasajero' (datos personales) o 'carro' (datos del vehículo)
  const [activeTab, setActiveTab] = useState<'pasajero' | 'carro'>('pasajero');

  // Diálogo de confirmación para cerrar sesión
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  // Diálogo de confirmación para eliminar carro
  const [showDeleteCarDialog, setShowDeleteCarDialog] = useState(false);

  // Modal para editar perfil (Nombre, Apellido, Teléfono)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNombre, setEditNombre] = useState('');
  const [editApellido, setEditApellido] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editErrors, setEditErrors] = useState<{ [key: string]: string | null }>({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Diálogo para cambiar a modo conductor
  const [showChangeModeDialog, setShowChangeModeDialog] = useState(false);
  const [showNoCarDialog, setShowNoCarDialog] = useState(false);

  useEffect(() => {
    dispatch(fetchMyProfile());
    dispatch(fetchMyVehicle());
  }, [dispatch]);

  const openEditModal = () => {
    if (profile) {
      setEditNombre(profile.nombre || '');
      setEditApellido(profile.apellido || '');
      setEditTelefono(profile.telefono || '');
      setEditErrors({});
      setShowEditModal(true);
    }
  };

  const handleSaveProfile = async () => {
    const errNombre = validateRequired(editNombre, 'Nombre');
    const errApellido = validateRequired(editApellido, 'Apellido');
    const errTel = validatePhone(editTelefono);

    setEditErrors({
      nombre: errNombre,
      apellido: errApellido,
      telefono: errTel,
    });

    if (errNombre || errApellido || errTel) {
      announce(errNombre || errApellido || errTel || 'Revisa los campos con error.');
      return;
    }

    try {
      setSavingProfile(true);
      await dispatch(
        updateMyProfile({
          nombre: editNombre.trim(),
          apellido: editApellido.trim(),
          telefono: editTelefono.trim(),
        }),
      ).unwrap();
      setShowEditModal(false);
      announce('Perfil actualizado con éxito.');
    } catch {
      announce('Error al actualizar el perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleConfirmSignOut = async () => {
    setShowSignOutDialog(false);
    announce('Cerrando sesión...');
    await dispatch(signOut());
    router.replace('/');
  };

  const handleConfirmDeleteCar = async () => {
    if (!vehicle) return;
    setShowDeleteCarDialog(false);
    try {
      announce('Eliminando vehículo...');
      await dispatch(removeVehicle(vehicle.id)).unwrap();
      // Si estaba en modo conductor, volver a pasajero
      if (profile?.modo_actual === 'conductor') {
        await dispatch(changeMode('pasajero'));
      }
      announce('Vehículo eliminado con éxito.');
    } catch {
      announce('Error al eliminar el vehículo.');
    }
  };

  const handleModeToggle = async (newMode: 'pasajero' | 'conductor') => {
    if (newMode === profile?.modo_actual) return;

    if (newMode === 'conductor') {
      if (!vehicle) {
        setShowNoCarDialog(true);
      } else {
        setShowChangeModeDialog(true);
      }
    } else {
      // De conductor a pasajero cambia directamente
      try {
        await dispatch(changeMode('pasajero')).unwrap();
        announce('Cambiado a modo pasajero.');
      } catch {
        announce('Error al cambiar de modo.');
      }
    }
  };

  const handleConfirmChangeMode = async () => {
    setShowChangeModeDialog(false);
    try {
      await dispatch(changeMode('conductor')).unwrap();
      announce('Cambiado a modo conductor.');
    } catch {
      announce('Error al cambiar a modo conductor.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Barra superior con volver y cerrar sesión */}
        <View style={styles.topBar}>
          <IconButton
            icon="arrow-left"
            accessibilityLabel="Volver a la pantalla principal"
            onPress={() => router.back()}
          />
          <ScreenTitle>Mi Perfil</ScreenTitle>
          <IconButton
            icon="power"
            accessibilityLabel="Cerrar sesión"
            onPress={() => setShowSignOutDialog(true)}
          />
        </View>

        {/* Tarjeta Primary con datos principales */}
        <View style={[styles.cardPrimary, { backgroundColor: colors.primary }]}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.onBrandMuted }]}>
              <Icon name="account" size={48} color={colors.primary} />
            </View>
            <View style={styles.profileHeaderInfo}>
              <AppText variant="cardTitle" color="onPrimary">
                {profile ? `${profile.nombre} ${profile.apellido}` : 'Cargando...'}
              </AppText>
              <AppText variant="secondary" color="onBrandMuted">
                Modo actual: {profile?.modo_actual === 'conductor' ? 'Conductor' : 'Pasajero'}
              </AppText>
            </View>
            <IconButton
              icon="pencil"
              accessibilityLabel="Editar información personal"
              onPress={openEditModal}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <AppText variant="secondary" color="onBrandMuted">
                ID Universidad:
              </AppText>
              <AppText variant="bodyStrong" color="onPrimary">
                {profile?.id_universidad || 'No registrado'}
              </AppText>
            </View>

            <View style={styles.infoItem}>
              <AppText variant="secondary" color="onBrandMuted">
                Correo institucional:
              </AppText>
              <AppText variant="bodyStrong" color="onPrimary">
                {profile?.email || 'Cargando...'}
              </AppText>
            </View>

            <View style={styles.infoItem}>
              <AppText variant="secondary" color="onBrandMuted">
                Teléfono:
              </AppText>
              <AppText variant="bodyStrong" color="onPrimary">
                {profile?.telefono || 'No registrado'}
              </AppText>
            </View>
          </View>
        </View>

        {/* Selector Pasajero | Carro */}
        <View style={styles.toggleContainer}>
          <SegmentedToggle
            accessibilityLabel="Detalle del perfil"
            value={activeTab}
            onChange={(val) => setActiveTab(val as 'pasajero' | 'carro')}
            options={[
              { value: 'pasajero', label: 'Pasajero', icon: 'account' },
              { value: 'carro', label: 'Carro', icon: 'car' },
            ]}
          />
        </View>

        {/* Contenido según la pestaña seleccionada */}
        {activeTab === 'pasajero' ? (
          <View style={styles.tabContent}>
            <View style={styles.sectionTitle}>
              <AppText variant="subtitle">Opciones y accesos</AppText>
            </View>

            <Button
              label={
                profile?.modo_actual === 'conductor'
                  ? 'Cambiar a modo Pasajero'
                  : 'Cambiar a modo Conductor'
              }
              variant="secondary"
              onPress={() =>
                handleModeToggle(profile?.modo_actual === 'conductor' ? 'pasajero' : 'conductor')
              }
            />

            <Button
              label="Ajustes de accesibilidad"
              variant="secondary"
              onPress={() => router.push('/settings/accessibility')}
            />
          </View>
        ) : (
          <View style={styles.tabContent}>
            {vehicle ? (
              <View
                style={[
                  styles.vehicleCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: borders.thin,
                  },
                ]}
              >
                <View style={styles.vehicleHeader}>
                  <View>
                    <AppText variant="cardTitle" color="primary">
                      {vehicle.placa}
                    </AppText>
                    <AppText variant="secondary" style={{ color: colors.textMuted }}>
                      {vehicle.marca} {vehicle.modelo}
                    </AppText>
                  </View>
                  <IconButton
                    icon="delete"
                    accessibilityLabel="Eliminar este carro"
                    onPress={() => setShowDeleteCarDialog(true)}
                  />
                </View>

                <View style={styles.vehicleDetails}>
                  <View style={styles.detailRow}>
                    <Icon name="seat" size={20} color={colors.primary} />
                    <AppText variant="body">
                      Capacidad: <AppText variant="bodyStrong">{vehicle.capacidad} cupos</AppText>
                    </AppText>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.noVehicleContainer}>
                <Icon name="car" size={56} color={colors.placeholder} />
                <AppText variant="body" style={[styles.centeredText, { color: colors.textMuted }]}>
                  No tienes un carro registrado actualmente.
                </AppText>
                <View style={{ width: '100%' }}>
                  <Button
                    label="Registrar Carro"
                    onPress={() => router.push('/(auth)/register/car')}
                  />
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Diálogo de confirmación: Cerrar Sesión */}
      <ConfirmDialog
        visible={showSignOutDialog}
        title="¿Deseas cerrar sesión?"
        message="Se cerrará tu sesión activa en este dispositivo y deberás iniciar sesión de nuevo."
        confirmLabel="Sí, cerrar sesión"
        cancelLabel="No, volver"
        onConfirm={handleConfirmSignOut}
        onCancel={() => setShowSignOutDialog(false)}
        tone="error"
      />

      {/* Diálogo de confirmación: Eliminar carro */}
      <ConfirmDialog
        visible={showDeleteCarDialog}
        title="¿Está seguro de que desea eliminar este carro?"
        message="Esta acción no se puede deshacer. Si estás en modo conductor, volverás a modo pasajero."
        confirmLabel="Sí, eliminar carro"
        cancelLabel="No, volver"
        onConfirm={handleConfirmDeleteCar}
        onCancel={() => setShowDeleteCarDialog(false)}
        tone="error"
      />

      {/* Diálogo de confirmación: Cambiar a modo Conductor */}
      <ConfirmDialog
        visible={showChangeModeDialog}
        title="¿Está seguro que desea cambiar a modo Conductor?"
        message="Esta acción afectará la manera en que usa la app."
        confirmLabel="Sí, cambiar a Conductor"
        cancelLabel="No, cancelar"
        onConfirm={handleConfirmChangeMode}
        onCancel={() => setShowChangeModeDialog(false)}
      />

      {/* Diálogo informativo: Sin carro registrado */}
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

      {/* Modal accesible para editar perfil */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <ScreenTitle>Editar perfil</ScreenTitle>

            <TextField
              label="Nombre"
              value={editNombre}
              onChangeText={setEditNombre}
              error={editErrors.nombre ?? undefined}
            />

            <TextField
              label="Apellido"
              value={editApellido}
              onChangeText={setEditApellido}
              error={editErrors.apellido ?? undefined}
            />

            <TextField
              label="Teléfono"
              value={editTelefono}
              onChangeText={setEditTelefono}
              error={editErrors.telefono ?? undefined}
              hint="10 dígitos numéricos"
              inputMode="tel"
              keyboardType="phone-pad"
              maxLength={10}
            />

            <View style={styles.modalActions}>
              <View style={styles.modalButtonWrapper}>
                <Button
                  label="Cancelar"
                  variant="secondary"
                  onPress={() => setShowEditModal(false)}
                  disabled={savingProfile}
                />
              </View>
              <View style={styles.modalButtonWrapper}>
                <Button label="Guardar" onPress={handleSaveProfile} loading={savingProfile} />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardPrimary: {
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeaderInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoList: {
    gap: spacing.sm,
  },
  infoItem: {
    gap: 2,
  },
  toggleContainer: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  tabContent: {
    gap: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  vehicleCard: {
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vehicleDetails: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  noVehicleContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  centeredText: {
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    borderRadius: radius.card,
    padding: spacing.xl,
    gap: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalButtonWrapper: {
    flex: 1,
  },
});
