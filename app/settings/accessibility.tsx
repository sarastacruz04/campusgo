import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { RadioGroup, type RadioOption } from '@/components/ui/RadioGroup';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { SwitchRow } from '@/components/ui/SwitchRow';
import { radius, spacing } from '@/theme/layout';
import { useTheme, type ThemePreference } from '@/theme/ThemeProvider';
import type { TextSizePreference } from '@/theme/typography';

const THEME_OPTIONS: RadioOption<ThemePreference>[] = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'highContrast', label: 'Alto contraste' },
];

const TEXT_SIZE_OPTIONS: RadioOption<TextSizePreference>[] = [
  { value: 'system', label: 'Sistema' },
  { value: 'large', label: 'Grande' },
  { value: 'extraLarge', label: 'Extra grande' },
];

/**
 * Ajustes de accesibilidad (V-08): tema, tamaño de texto, reducir movimiento y
 * vibración. Cada cambio se aplica al instante y se guarda en el teléfono.
 */
export default function AccessibilitySettingsScreen() {
  const { colors, preferences, setPreference } = useTheme();

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <ScreenLayout title="Ajustes de accesibilidad" onBack={goBack}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <RadioGroup
          label="Tema"
          options={THEME_OPTIONS}
          value={preferences.theme}
          onChange={(value) => setPreference('theme', value)}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <RadioGroup
          label="Tamaño del texto"
          options={TEXT_SIZE_OPTIONS}
          value={preferences.textSize}
          onChange={(value) => setPreference('textSize', value)}
        />
        <AppText variant="secondary" color="textMuted">
          Se suma al tamaño de letra que tengas en el teléfono.
        </AppText>
        <AppText>Ejemplo: ¿Compartimos el viaje a Chía mañana? ¡Sí, salgo a las 7:00!</AppText>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <SwitchRow
          label="Reducir movimiento"
          description="Quita las animaciones y usa un fundido corto al cambiar de pantalla."
          value={preferences.reduceMotion}
          onValueChange={(value) => setPreference('reduceMotion', value)}
        />
        <SwitchRow
          label="Vibración"
          description="Vibra al confirmar una acción o cuando ocurre un error."
          value={preferences.haptics}
          onValueChange={(value) => setPreference('haptics', value)}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
});
