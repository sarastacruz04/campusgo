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
import { useAnnounce } from '@/hooks/useAnnounce';
import { type PickedImage, pickImageFromLibrary } from '@/lib/imagePicker';
import { spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

export default function RegisterCarPhotoScreen() {
  const { colors } = useTheme();
  const announce = useAnnounce();

  const params = useLocalSearchParams<{
    placa: string;
    capacidad: string;
    marca: string;
    modelo: string;
  }>();

  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);

  const handlePickPhoto = async () => {
    const img = await pickImageFromLibrary({ aspect: [4, 3] });
    if (img) {
      setPickedImage(img);
      announce('Foto del carro seleccionada.');
    }
  };

  const handleNext = () => {
    announce('Paso 7 de 7: Foto del SOAT vigente.');
    router.push({
      pathname: '/(auth)/register/soat',
      params: {
        ...params,
        carPhotoUri: pickedImage?.uri ?? '',
        carPhotoMime: pickedImage?.mimeType ?? '',
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Logo size="large" />
        </View>

        <StepIndicator current={6} total={7} />

        <ScreenTitle>¡Agrega una foto de tu carro!</ScreenTitle>

        <AppText variant="body" style={[styles.description, { color: colors.textMuted }]}>
          Una foto visible de tu vehículo ayudará a tus compañeros a reconocerlo con facilidad al
          llegar al punto de encuentro.
        </AppText>

        <View style={styles.pickerContainer}>
          <PhotoPicker
            variant="upload"
            label="Foto del vehículo"
            hint="Toca para abrir la galería y seleccionar una foto de tu carro"
            imageUri={pickedImage?.uri}
            onPress={handlePickPhoto}
          />
        </View>

        <View style={styles.actions}>
          <View style={styles.actionWrapper}>
            <Button label="Anterior" variant="secondary" onPress={() => router.back()} />
          </View>
          <View style={styles.actionWrapper}>
            <Button label="Siguiente" onPress={handleNext} />
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
