import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { Logo } from '@/components/ui/Logo';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { TextField } from '@/components/ui/TextField';
import { selectAuthError, selectAuthStatus } from '@/features/auth/selectors';
import { authErrorCleared } from '@/features/auth/slice';
import { signUp } from '@/features/auth/thunks';
import { useAnnounce } from '@/hooks/useAnnounce';
import {
  validateEmail,
  validateIdUniversidad,
  validatePassword,
  validatePhone,
  validateRequired,
} from '@/lib/validators';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

export default function RegisterStep1Screen() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector(selectAuthStatus);
  const loading = authStatus === 'loading';
  const authError = useAppSelector(selectAuthError);
  const announce = useAnnounce();

  // El error de Auth vive en el store y lo comparten las pantallas de acceso: sin
  // esto, un inicio de sesión fallido se mostraba aquí al entrar (TC-05).
  useEffect(() => {
    dispatch(authErrorCleared());
  }, [dispatch]);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [idUniversidad, setIdUniversidad] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');

  // Errores de validación
  const [nombreError, setNombreError] = useState<string | null>(null);
  const [apellidoError, setApellidoError] = useState<string | null>(null);
  const [idError, setIdError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [telefonoError, setTelefonoError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const errNombre = validateRequired(nombre, 'Nombre');
    const errApellido = validateRequired(apellido, 'Apellido');
    const errId = validateIdUniversidad(idUniversidad);
    const errEmail = validateEmail(email);
    const errTel = validatePhone(telefono);
    const errPass = validatePassword(password);

    setNombreError(errNombre);
    setApellidoError(errApellido);
    setIdError(errId);
    setEmailError(errEmail);
    setTelefonoError(errTel);
    setPasswordError(errPass);

    const firstError = errNombre || errApellido || errId || errEmail || errTel || errPass;
    if (firstError) {
      announce(firstError);
      return;
    }

    const result = await dispatch(
      signUp({
        email,
        password,
        nombre,
        apellido,
        idUniversidad,
        telefono,
      }),
    );

    if (signUp.fulfilled.match(result)) {
      announce('Registro iniciado. Ingresa el código enviado a tu correo.');
      router.push({
        pathname: '/(auth)/register/verify',
        params: { email: email.trim().toLowerCase() },
      });
    } else if (signUp.rejected.match(result)) {
      const msg = result.payload?.message || 'Error al registrar la cuenta.';
      announce(`Error. ${msg}`);
    }
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

          <StepIndicator current={1} total={7} />

          <ScreenTitle>Registro</ScreenTitle>

          {authError ? (
            <AppText variant="secondary" style={[styles.serverError, { color: colors.error }]}>
              {authError.message}
            </AppText>
          ) : null}

          <View style={styles.form}>
            <View style={styles.nameRow}>
              <View style={styles.flexField}>
                <TextField
                  label="Nombre"
                  value={nombre}
                  onChangeText={(text) => {
                    setNombre(text);
                    if (nombreError) setNombreError(null);
                  }}
                  error={nombreError ?? undefined}
                  hint="Tu nombre de pila"
                  autoComplete="name-given"
                  returnKeyType="next"
                />
              </View>
              <View style={styles.flexField}>
                <TextField
                  label="Apellido"
                  value={apellido}
                  onChangeText={(text) => {
                    setApellido(text);
                    if (apellidoError) setApellidoError(null);
                  }}
                  error={apellidoError ?? undefined}
                  hint="Tu apellido familiar"
                  autoComplete="name-family"
                  returnKeyType="next"
                />
              </View>
            </View>

            <TextField
              label="ID de la Universidad"
              value={idUniversidad}
              onChangeText={(text) => {
                setIdUniversidad(text);
                if (idError) setIdError(null);
              }}
              error={idError ?? undefined}
              hint="10 dígitos numéricos"
              inputMode="numeric"
              keyboardType="number-pad"
              maxLength={10}
              returnKeyType="next"
            />

            <TextField
              label="Correo Electrónico"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(null);
              }}
              error={emailError ?? undefined}
              hint="terminado en @unisabana.edu.co"
              autoComplete="email"
              inputMode="email"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />

            <TextField
              label="Teléfono"
              value={telefono}
              onChangeText={(text) => {
                setTelefono(text);
                if (telefonoError) setTelefonoError(null);
              }}
              error={telefonoError ?? undefined}
              hint="10 dígitos (ej. 3001234567)"
              autoComplete="tel"
              inputMode="tel"
              keyboardType="phone-pad"
              maxLength={10}
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
              hint="Al menos 6 caracteres"
              password
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            <View style={styles.buttonWrapper}>
              <Button label="Registrarse" onPress={handleSubmit} loading={loading} />
            </View>

            <View style={styles.footerRow}>
              <AppText variant="body" style={{ color: colors.textMuted }}>
                ¿Ya tienes una cuenta?{' '}
              </AppText>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Inicia sesión en CampusGo"
                onPress={() => router.push('/(auth)/login')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppText variant="bodyStrong" color="link">
                  Inicia Sesión
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
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  form: {
    gap: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flexField: {
    flex: 1,
  },
  buttonWrapper: {
    marginTop: spacing.sm,
  },
  serverError: {
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
});
