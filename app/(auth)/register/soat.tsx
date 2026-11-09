import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { PhotoPicker } from '@/components/ui/PhotoPicker';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { selectUserId } from '@/features/auth/selectors';
import { changeMode, updateMyProfile } from '@/features/profile/thunks';
import { registerVehicle } from '@/features/vehicle/thunks';
import { useAnnounce } from '@/hooks/useAnnounce';
import { type PickedImage, pickImageFromLibrary } from '@/lib/imagePicker';
import { uploadImage } from '@/services/storageService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

export default function RegisterSoatScreen() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectUserId);
  const announce = useAnnounce();

  const params = useLocalSearchParams<{
    placa: string;
    capacidad: string;
    marca: string;
    modelo: string;
    carPhotoUri?: string;
    carPhotoMime?: string;
  }>();

  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handlePickPhoto = async () => {
    const img = await pickImageFromLibrary({ aspect: [4, 3] });
    if (img) {
      setPickedImage(img);
      announce('Foto del SOAT seleccionada.');
    }
  };

  const handleFinish = async () => {
    if (!userId) {
      announce('Error: sesión no disponible.');
      return;
    }

    try {
      setSubmitting(true);
      announce('Registrando tu vehículo y finalizando...');

      let carPhotoPath: string | null = null;
      let soatPath: string | null = null;

      // 1. Subir foto del carro a Storage si existe
      if (params.carPhotoUri) {
        try {
          carPhotoPath = await uploadImage({
            bucket: 'vehiculos',
            userId,
            fileName: 'car.jpg',
            uri: params.carPhotoUri,
            contentType: params.carPhotoMime || 'image/jpeg',
          });
        } catch {
          // Si falla la foto de Storage no bloqueamos el registro del carro
        }
      }

      // 2. Subir foto del SOAT a Storage si existe
      if (pickedImage) {
        try {
          soatPath = await uploadImage({
            bucket: 'soat',
            userId,
            fileName: 'soat.jpg',
            uri: pickedImage.uri,
            contentType: pickedImage.mimeType,
          });
        } catch {
          // Si falla el SOAT en Storage no bloqueamos
        }
      }

      // 3. Registrar vehículo en la base de datos
      await dispatch(
        registerVehicle({
          placa: params.placa,
          capacidad: parseInt(params.capacidad, 10),
          marca: params.marca,
          modelo: params.modelo,
          foto_path: carPhotoPath,
          soat_path: soatPath,
        }),
      ).unwrap();

      // 4. Marcar registro completo y cambiar a modo conductor
      await dispatch(
        updateMyProfile({
          registro_completo: true,
        }),
      ).unwrap();

      await dispatch(changeMode('conductor')).unwrap();

      announce('¡Registro completado! Bienvenido a CampusGo en modo conductor.');
      router.replace('/(tabs)');
    } catch {
      announce('Error al registrar el vehículo. Verifica los datos.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Logo size="large" />
        </View>

        <StepIndicator current={7} total={7} />

        <ScreenTitle>¡Agrega una foto de tu SOAT vigente!</ScreenTitle>

        <AppText variant="body" style={[styles.description, { color: colors.textMuted }]}>
          Para garantizar la seguridad de la comunidad universitaria, requerimos el registro de tu
          seguro obligatorio vigente. Este documento es confidencial y solo tú puedes verlo.
        </AppText>

        <View style={styles.pickerContainer}>
          <PhotoPicker
            variant="upload"
            label="Foto del SOAT vigente"
            hint="Toca para abrir la galería y seleccionar una foto o documento del SOAT"
            imageUri={pickedImage?.uri}
            onPress={handlePickPhoto}
          />
        </View>

        <View style={styles.actions}>
          <View style={styles.actionWrapper}>
            <Button
              label="Anterior"
              variant="secondary"
              onPress={() => router.back()}
              disabled={submitting}
            />
          </View>
          <View style={styles.actionWrapper}>
            <Button label="¡Listo!" onPress={handleFinish} loading={submitting} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    lineHeight: 22,
  },
  pickerContainer: {
    marginVertical: spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  actionWrapper: {
    flex: 1,
  },
});
