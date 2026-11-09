import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { TextField } from '@/components/ui/TextField';
import { selectAuthError, selectAuthStatus } from '@/features/auth/selectors';
import { resendSignUpCode, verifySignUpCode } from '@/features/auth/thunks';
import { fetchMyProfile } from '@/features/profile/thunks';
import { useAnnounce } from '@/hooks/useAnnounce';
import { validateVerificationCode } from '@/lib/validators';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

export default function VerifyCodeScreen() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector(selectAuthStatus);
  const loading = authStatus === 'loading';
  const authError = useAppSelector(selectAuthError);
  const announce = useAnnounce();

  const params = useLocalSearchParams<{ email?: string }>();
  const email = (params.email || '').trim().toLowerCase();

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  const canResend = countdown === 0;

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async () => {
    const errCode = validateVerificationCode(code);
    setCodeError(errCode);
    if (errCode) {
      announce(errCode);
      return;
    }

    const result = await dispatch(verifySignUpCode({ email, token: code.trim() }));
    if (verifySignUpCode.fulfilled.match(result)) {
      announce('Correo verificado exitosamente.');
      await dispatch(fetchMyProfile());
      router.push('/(auth)/register/photo');
    } else if (verifySignUpCode.rejected.match(result)) {
      const msg = result.payload?.message || 'Código incorrecto o vencido.';
      announce(`Error. ${msg}`);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCountdown(30);

    const result = await dispatch(resendSignUpCode(email));
    if (resendSignUpCode.fulfilled.match(result)) {
      announce('Código reenviado a tu correo institucional.');
    } else if (resendSignUpCode.rejected.match(result)) {
      announce('Error al reenviar el código. Intenta de nuevo.');
      setCountdown(0);
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

          <StepIndicator current={2} total={7} />

          <ScreenTitle>Verifica tu correo</ScreenTitle>

          <AppText variant="body" style={[styles.instruction, { color: colors.textMuted }]}>
            Hemos enviado un código de 6 dígitos a{' '}
            <AppText variant="bodyStrong">{email || 'tu correo institucional'}</AppText>. Ingrésalo
            a continuación para activar tu cuenta.
          </AppText>

          {authError ? (
            <AppText variant="secondary" style={[styles.serverError, { color: colors.error }]}>
              {authError.message}
            </AppText>
          ) : null}

          <View style={styles.form}>
            <TextField
              label="Código de verificación"
              value={code}
              onChangeText={(text) => {
                setCode(text);
                if (codeError) setCodeError(null);
              }}
              error={codeError ?? undefined}
              hint="6 dígitos numéricos recibidos en tu correo"
              inputMode="numeric"
              keyboardType="number-pad"
              autoComplete="one-time-code"
              maxLength={6}
              returnKeyType="done"
              onSubmitEditing={handleVerify}
            />

            <View style={styles.buttonWrapper}>
              <Button label="Verificar" onPress={handleVerify} loading={loading} />
            </View>

            <View style={styles.resendContainer}>
              <Button
                label={canResend ? 'Reenviar código' : `Reenviar código en ${countdown} s`}
                variant="secondary"
                disabled={!canResend || loading}
                onPress={handleResend}
              />
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
  instruction: {
    lineHeight: 22,
  },
  form: {
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  buttonWrapper: {
    marginTop: spacing.sm,
  },
  resendContainer: {
    marginTop: spacing.xs,
  },
  serverError: {
    textAlign: 'center',
  },
});
