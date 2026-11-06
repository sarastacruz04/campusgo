import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { AccessibilityInfo, Modal, StyleSheet, View, type HostInstance } from 'react-native';

import { useReduceMotion } from '@/hooks/useReduceMotion';
import { SCREEN_FOCUS_DELAY_MS, useScreenFocus } from '@/hooks/useScreenFocus';
import { radius, spacing, TOUCH_GAP } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

export type DialogTone = 'question' | 'error' | 'success';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  /** Acción que se confirma, explícita: "Sí, cancelar reserva" (T-06). */
  confirmLabel: string;
  /** Opción segura: "No, volver". Si se omite, el diálogo solo tiene un botón. */
  cancelLabel?: string;
  onConfirm: () => void;
  /** Se llama con el botón seguro, el botón atrás de Android y el gesto de escape de iOS. */
  onCancel: () => void;
  tone?: DialogTone;
  /** Deshabilita los botones y muestra carga en el de confirmar mientras se procesa. */
  loading?: boolean;
  /** Contenido extra, por ejemplo el formulario de editar perfil. */
  children?: ReactNode;
  /** Botón que abrió el diálogo: al cerrarlo, el foco vuelve ahí (S-08). */
  returnFocusRef?: RefObject<HostInstance | null>;
};

const TONE_ICON: Record<DialogTone, IconName> = {
  question: 'help',
  error: 'close-thick',
  success: 'check-bold',
};

/**
 * Diálogo modal del Figma: tarjeta azul centrada con ícono, título, texto y dos botones.
 * Accesibilidad (S-08 y T-06):
 * - accessibilityViewIsModal: VoiceOver ignora lo que está detrás.
 * - El foco inicial va al título; el siguiente elemento es la opción segura (va primero).
 * - onAccessibilityEscape (iOS) y onRequestClose (botón atrás de Android) cancelan.
 * - Al cerrar, el foco vuelve al botón que lo abrió.
 * - El ícono "?" es blanco dentro de un círculo #AF0000 (V-04).
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  tone = 'question',
  loading = false,
  children,
  returnFocusRef,
}: ConfirmDialogProps) {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const titleRef = useScreenFocus(visible);
  const wasVisible = useRef(visible);

  useEffect(() => {
    // Solo al pasar de visible a oculto se devuelve el foco al botón de origen.
    if (wasVisible.current && !visible && returnFocusRef?.current) {
      const target = returnFocusRef.current;
      const timer = setTimeout(() => {
        AccessibilityInfo.sendAccessibilityEvent(target, 'focus');
      }, SCREEN_FOCUS_DELAY_MS);
      wasVisible.current = visible;
      return () => clearTimeout(timer);
    }
    wasVisible.current = visible;
  }, [visible, returnFocusRef]);

  const iconBackground = tone === 'success' ? 'transparent' : colors.alertBadge;
  const iconColor = tone === 'success' ? colors.successOnBrand : colors.onAlertBadge;

  return (
    <Modal
      visible={visible}
      transparent
      // Con "reducir movimiento" el diálogo aparece sin animación (V-09).
      animationType={reduceMotion ? 'none' : 'fade'}
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={[styles.scrim, { backgroundColor: `${colors.scrim}99` }]}>
        <View
          testID="confirm-dialog"
          accessibilityViewIsModal
          onAccessibilityEscape={onCancel}
          style={[
            styles.card,
            { backgroundColor: colors.brandSurface, borderColor: colors.onBrand },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: iconBackground }]}>
            <Icon name={TONE_ICON[tone]} size={32} color={iconColor} />
          </View>
          <AppText
            ref={titleRef}
            accessible
            accessibilityRole="header"
            variant="subtitle"
            color="onBrand"
            style={styles.centered}
          >
            {title}
          </AppText>
          {message ? (
            <AppText color="onBrandMuted" style={styles.centered}>
              {message}
            </AppText>
          ) : null}
          {children}
          <View style={styles.actions}>
            {cancelLabel ? (
              <View style={styles.action}>
                <Button
                  label={cancelLabel}
                  variant="onBrand"
                  onPress={onCancel}
                  disabled={loading}
                />
              </View>
            ) : null}
            <View style={styles.action}>
              <Button
                label={confirmLabel}
                variant={cancelLabel ? 'onBrandOutline' : 'onBrand'}
                onPress={onConfirm}
                loading={loading}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    borderRadius: radius.dialog,
    padding: spacing.xl,
    gap: spacing.md,
    alignItems: 'stretch',
    borderWidth: 1,
  },
  iconCircle: {
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TOUCH_GAP * 2,
    marginTop: spacing.sm,
  },
  action: {
    flexGrow: 1,
    flexBasis: 120,
  },
});
