import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { TextField } from '@/components/ui/TextField';
import { selectAuthError, selectAuthStatus } from '@/features/auth/selectors';
import { signIn } from '@/features/auth/thunks';
import { useAnnounce } from '@/hooks/useAnnounce';
import { validateEmail, validatePassword } from '@/lib/validators';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

export default function LoginScreen() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector(selectAuthStatus);
  const loading = authStatus === 'loading';
  const authError = useAppSelector(selectAuthError);
  const announce = useAnnounce();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Errores de validación local
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  // Estado para controlar la pantalla completa de error según el diseño del Figma
  const [isErrorScreenVisible, setIsErrorScreenVisible] = useState(false);

  const handleSubmit = async () => {
    const errEmail = validateEmail(email);
    const errPass = validatePassword(password);

    setEmailError(errEmail);
    setPasswordError(errPass);

    if (errEmail || errPass) {
      announce(errEmail || errPass || 'Revisa los campos con error.');
      return;
    }

    const result = await dispatch(signIn({ email, password }));
    if (signIn.rejected.match(result)) {
      setIsErrorScreenVisible(true);
      const msg = result.payload?.message || 'Error al iniciar sesión.';
      announce(`Error. ${msg}`);
    }
  };

  // Pantalla de error del Figma: Ícono de error, "ERROR", mensaje y botón "Volver"
  if (isErrorScreenVisible) {
    const errorMessage = authError?.message || 'Ocurrió un error inesperado al iniciar sesión.';
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.surface }]}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={80} color={colors.error} />
          <ScreenTitle color="error">ERROR</ScreenTitle>
          <AppText variant="body" style={[styles.centeredText, { color: colors.text }]}>
            {errorMessage}
          </AppText>
          <View style={styles.errorActions}>
            <Button
              label="Volver"
              onPress={() => {
                setIsErrorScreenVisible(false);
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

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

          <ScreenTitle>Inicio Sesión</ScreenTitle>

          <View style={styles.form}>
            <TextField
              label="Correo electrónico"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(null);
              }}
              error={emailError ?? undefined}
              hint="Ingresa tu correo institucional @unisabana.edu.co"
              autoComplete="email"
              inputMode="email"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />

            <TextField
              label="Contraseña"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError(null);
              }}
              error={passwordError ?? undefined}
              hint="Mínimo 6 caracteres"
              password
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            <View style={styles.buttonWrapper}>
              <Button label="Iniciar Sesión" onPress={handleSubmit} loading={loading} />
            </View>

            <View style={styles.footerRow}>
              <AppText variant="body" style={{ color: colors.textMuted }}>
                ¿No tienes una cuenta?{' '}
              </AppText>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Regístrate en CampusGo"
                onPress={() => router.push('/(auth)/register')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppText variant="bodyStrong" color="link">
                  Regístrate
                </AppText>
              </Pressable>
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
    justifyContent: 'center',
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  form: {
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  buttonWrapper: {
    marginTop: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  centeredText: {
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  errorActions: {
    width: '100%',
    marginTop: spacing.lg,
  },
});
