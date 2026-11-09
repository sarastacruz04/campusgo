import { router } from 'expo-router';
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
import { updateMyProfile } from '@/features/profile/thunks';
import { useAnnounce } from '@/hooks/useAnnounce';
import { type PickedImage, pickImageFromLibrary } from '@/lib/imagePicker';
import { uploadImage } from '@/services/storageService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

export default function RegisterPhotoScreen() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectUserId);
  const announce = useAnnounce();

  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePickPhoto = async () => {
    const img = await pickImageFromLibrary({ aspect: [1, 1] });
    if (img) {
      setPickedImage(img);
      announce('Foto de perfil seleccionada.');
    }
  };

  const handleNext = async () => {
    if (!pickedImage || !userId) {
      // La foto es opcional (sección 6.7)
      router.push('/(auth)/register/has-car');
      return;
    }

    try {
      setUploading(true);
      announce('Subiendo foto de perfil...');
      const path = await uploadImage({
        bucket: 'avatars',
        userId,
        fileName: 'avatar.jpg',
        uri: pickedImage.uri,
        contentType: pickedImage.mimeType,
      });

      await dispatch(updateMyProfile({ avatar_path: path }));
      announce('Foto de perfil guardada.');
      router.push('/(auth)/register/has-car');
    } catch {
      announce('Error al subir la foto. Puedes continuar y agregarla después.');
      router.push('/(auth)/register/has-car');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Logo size="large" />
        </View>

        <StepIndicator current={3} total={7} />

        <ScreenTitle>Agrega tu foto</ScreenTitle>

        <AppText variant="body" style={[styles.description, { color: colors.textMuted }]}>
          Una foto clara permite a tus compañeros identificarte en el punto de encuentro. Este paso
          es opcional.
        </AppText>

        <View style={styles.pickerContainer}>
          <PhotoPicker
            variant="avatar"
            label="Foto de perfil"
            hint="Toca para abrir la galería y seleccionar una foto cuadrada"
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
              disabled={uploading}
            />
          </View>
          <View style={styles.actionWrapper}>
            <Button label="Siguiente" onPress={handleNext} loading={uploading} />
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
    textAlign: 'center',
    lineHeight: 22,
  },
  pickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
