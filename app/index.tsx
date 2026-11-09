import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

export default function WelcomeScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Logo size="large" />
        </View>

        <View style={styles.texts}>
          <ScreenTitle>Te damos la bienvenida</ScreenTitle>
          <AppText variant="body" style={[styles.centered, { color: colors.textMuted }]}>
            Conectando estudiantes, compartiendo trayectos
          </AppText>
        </View>

        <View style={styles.actions}>
          <Button label="Iniciar Sesión" onPress={() => router.push('/(auth)/login')} />
          <Button
            label="Registrarse"
            variant="secondary"
            onPress={() => router.push('/(auth)/register')}
          />
          <Button
            label="Ajustes de accesibilidad"
            variant="secondary"
            onPress={() => router.push('/settings/accessibility')}
          />

          {__DEV__ ? (
            <View style={styles.devActions}>
              <Button
                label="Catálogo de componentes"
                variant="secondary"
                onPress={() => router.push('/dev/catalogo')}
              />
              <Button
                label="Sesión de prueba"
                variant="secondary"
                onPress={() => router.push('/dev/sesion')}
              />
            </View>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
  },
  texts: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  centered: {
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
  },
  devActions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
