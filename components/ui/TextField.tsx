import { useEffect, useState, type ComponentRef, type Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useAnnounce } from '@/hooks/useAnnounce';
import { radius, spacing, TOUCH_MIN } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';
import { MAX_FONT_SIZE_MULTIPLIER } from '@/theme/typography';

import { AppText } from './AppText';
import { Icon } from './Icon';
import { IconButton } from './IconButton';

export type TextFieldProps = Omit<TextInputProps, 'style' | 'accessibilityLabel'> & {
  /** Etiqueta visible sobre el campo y nombre accesible (obligatoria, V-02 y S-05). */
  label: string;
  /** Formato esperado, visible bajo la etiqueta y leído como pista: "10 dígitos". */
  hint?: string;
  /** Mensaje de error en texto bajo el campo; vacío o undefined si no hay error. */
  error?: string;
  /** Campo de contraseña con botón accesible "Mostrar contraseña" (T-08). */
  password?: boolean;
  /** Referencia al TextInput, para saltar al siguiente campo con returnKeyType="next" (T-03). */
  ref?: Ref<TextInputRef>;
};

/** Instancia de TextInput (tiene focus() y blur()). */
export type TextInputRef = ComponentRef<typeof TextInput>;

export function TextField({
  label,
  hint,
  error,
  password = false,
  ref,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const { colors, typography, borders } = useTheme();
  const announce = useAnnounce();
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Cuando aparece un error nuevo se anuncia sin mover el foco (S-07). En Android lo
  // lee la región viva del mensaje; en iOS lo anuncia useAnnounce.
  useEffect(() => {
    if (error) announce(`${label}: ${error}`, { liveRegionVisible: true });
  }, [error, label, announce]);

  const hasError = Boolean(error);
  // Error: borde de 2 px + ícono + texto, no solo color (V-05).
  const borderColor = hasError ? colors.error : focused ? colors.focus : colors.border;
  const borderWidth = hasError || focused ? borders.focus : borders.thin;
  // La pista accesible incluye el error para que se oiga al volver al campo.
  const accessibilityHint = [hasError ? `Error: ${error}` : null, hint].filter(Boolean).join('. ');

  return (
    <View style={styles.container}>
      <AppText variant="label">{label}</AppText>
      {hint ? (
        <AppText variant="secondary" color="textMuted" importantForAccessibility="no">
          {hint}
        </AppText>
      ) : null}
      <View
        style={[styles.inputRow, { borderColor, borderWidth, backgroundColor: colors.surface }]}
      >
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={accessibilityHint || undefined}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={password && !showPassword}
          allowFontScaling
          maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[styles.input, typography.body, { color: colors.text }]}
          {...inputProps}
        />
        {password ? (
          <IconButton
            icon={showPassword ? 'eye-off' : 'eye'}
            accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onPress={() => setShowPassword((value) => !value)}
          />
        ) : null}
      </View>
      {hasError ? (
        <View style={styles.errorRow} accessibilityLiveRegion="polite" accessible>
          <Icon name="alert-circle" size={18} color={colors.error} />
          <AppText variant="secondary" color="error" style={styles.errorText}>
            {error}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH_MIN,
    borderRadius: radius.control,
  },
  input: {
    flex: 1,
    // Sin altura fija: minHeight + padding permiten que el texto crezca al 200 % (V-06).
    minHeight: TOUCH_MIN,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  errorText: {
    flexShrink: 1,
  },
});
