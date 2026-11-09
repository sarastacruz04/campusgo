import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

// Pantalla provisional hasta la Etapa 4, donde se convierte en la bienvenida con
// redirección según la sesión. Por ahora da acceso a Ajustes y, en desarrollo, al
// catálogo de componentes y a la sesión de prueba de la Etapa 3.
export default function Index() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <Logo size="large" />
      <View style={styles.texts}>
        <ScreenTitle>Te damos la bienvenida</ScreenTitle>
        <AppText style={styles.centered}>Conectando estudiantes, compartiendo trayectos</AppText>
      </View>
      <View style={styles.actions}>
        <Button
          label="Ajustes de accesibilidad"
          variant="secondary"
          onPress={() => router.push('/settings/accessibility')}
        />
        {__DEV__ ? (
          <>
            <Button label="Catálogo de componentes" onPress={() => router.push('/dev/catalogo')} />
            <Button label="Sesión de prueba" onPress={() => router.push('/dev/sesion')} />
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.xxl,
  },
  texts: {
    gap: spacing.sm,
  },
  centered: {
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
  },
});
