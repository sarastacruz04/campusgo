import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { TextField } from '@/components/ui/TextField';
import { useAnnounce } from '@/hooks/useAnnounce';
import { validateCapacidad, validatePlaca, validateRequired } from '@/lib/validators';
import { spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

export default function RegisterCarScreen() {
  const { colors } = useTheme();
  const announce = useAnnounce();

  const [placa, setPlaca] = useState('');
  const [capacidad, setCapacidad] = useState('4');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');

  const [placaError, setPlacaError] = useState<string | null>(null);
  const [capacidadError, setCapacidadError] = useState<string | null>(null);
  const [marcaError, setMarcaError] = useState<string | null>(null);
  const [modeloError, setModeloError] = useState<string | null>(null);

  const handleNext = () => {
    const errPlaca = validatePlaca(placa);
    const errCap = validateCapacidad(capacidad);
    const errMarca = validateRequired(marca, 'Marca');
    const errModelo = validateRequired(modelo, 'Modelo');

    setPlacaError(errPlaca);
    setCapacidadError(errCap);
    setMarcaError(errMarca);
    setModeloError(errModelo);

    const firstError = errPlaca || errCap || errMarca || errModelo;
    if (firstError) {
      announce(firstError);
      return;
    }

    announce('Paso 6 de 7: Foto del carro.');
    router.push({
      pathname: '/(auth)/register/car-photo',
      params: {
        placa: placa.trim().toUpperCase(),
        capacidad: capacidad.trim(),
        marca: marca.trim(),
        modelo: modelo.trim(),
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Logo size="large" />
          </View>

          <StepIndicator current={5} total={7} />

          <ScreenTitle>¡Registra tu carro!</ScreenTitle>

          <View style={styles.form}>
            <TextField
              label="Placa"
              value={placa}
              onChangeText={(text) => {
                setPlaca(text.toUpperCase());
                if (placaError) setPlacaError(null);
              }}
              error={placaError ?? undefined}
              hint="3 letras y 3 números (ej. ABC123)"
              autoCapitalize="characters"
              maxLength={6}
              returnKeyType="next"
            />

            <TextField
              label="Cupos vehículo"
              value={capacidad}
              onChangeText={(text) => {
                setCapacidad(text);
                if (capacidadError) setCapacidadError(null);
              }}
              error={capacidadError ?? undefined}
              hint="Puestos para pasajeros (entre 1 y 8)"
              inputMode="numeric"
              keyboardType="number-pad"
              maxLength={1}
              returnKeyType="next"
            />

            <TextField
              label="Marca"
              value={marca}
              onChangeText={(text) => {
                setMarca(text);
                if (marcaError) setMarcaError(null);
              }}
              error={marcaError ?? undefined}
              hint="Ej. Renault, Mazda, Chevrolet"
              returnKeyType="next"
            />

            <TextField
              label="Modelo"
              value={modelo}
              onChangeText={(text) => {
                setModelo(text);
                if (modeloError) setModeloError(null);
              }}
              error={modeloError ?? undefined}
              hint="Ej. Sandero, 3, Spark"
              returnKeyType="done"
              onSubmitEditing={handleNext}
            />

            <View style={styles.actions}>
              <View style={styles.actionWrapper}>
                <Button label="Anterior" variant="secondary" onPress={() => router.back()} />
              </View>
              <View style={styles.actionWrapper}>
                <Button label="Siguiente" onPress={handleNext} />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    flexGrow: 1,
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionWrapper: {
    flex: 1,
  },
});
