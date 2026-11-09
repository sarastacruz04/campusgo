import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { changeMode, updateMyProfile } from '@/features/profile/thunks';
import { useAnnounce } from '@/hooks/useAnnounce';
import { useAppDispatch } from '@/store/hooks';
import { spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

export default function RegisterHasCarScreen() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const announce = useAnnounce();

  const [hasCar, setHasCar] = useState<'no' | 'si'>('no');
  const [submitting, setSubmitting] = useState(false);

  const handleNext = async () => {
    if (hasCar === 'si') {
      announce('Paso 5 de 7: Información del vehículo.');
      router.push('/(auth)/register/car');
      return;
    }

    try {
      setSubmitting(true);
      announce('Finalizando registro en modo pasajero...');
      await dispatch(
        updateMyProfile({
          registro_completo: true,
        }),
      ).unwrap();
      await dispatch(changeMode('pasajero')).unwrap();
      announce('¡Bienvenido a CampusGo! Registro completado.');
      router.replace('/(tabs)');
    } catch {
      announce('Error al guardar el perfil.');
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

        <StepIndicator current={4} total={7} />

        <ScreenTitle>¿Quieres Registrar un Carro?</ScreenTitle>

        <AppText variant="body" style={[styles.description, { color: colors.textMuted }]}>
          Si registras tu carro podrás publicar viajes y compartir tus trayectos con otros
          estudiantes hacia la Universidad. Si no tienes carro, podrás usar la app como pasajero.
        </AppText>

        <View style={styles.radioContainer}>
          <RadioGroup
            label="¿Deseas registrar un carro ahora?"
            value={hasCar}
            onChange={(val) => setHasCar(val as 'no' | 'si')}
            options={[
              { value: 'no', label: 'No, quiero ser pasajero' },
              { value: 'si', label: 'Sí, quiero registrar mi carro' },
            ]}
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
            <Button label="Siguiente" onPress={handleNext} loading={submitting} />
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
  radioContainer: {
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
