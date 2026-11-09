import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type HostInstance,
} from 'react-native';

import { useReduceMotion } from '@/hooks/useReduceMotion';
import { SCREEN_FOCUS_DELAY_MS, useScreenFocus } from '@/hooks/useScreenFocus';
import { radius, spacing, TOUCH_MIN } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';
import { Button } from './Button';
import { Icon } from './Icon';
import { RadioGroup, type RadioOption } from './RadioGroup';

type SelectFieldProps<T extends string> = {
  /** Etiqueta visible sobre el control y título de la lista. */
  label: string;
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** surface: control blanco. brand: control azul sobre la banda (V-03). */
  tone?: 'surface' | 'brand';
};

/**
 * Lista desplegable accesible (por ejemplo, "Sectores"). Se hace con un botón que
 * abre un diálogo con opciones de un solo toque (T-07), porque el stack no incluye
 * un selector nativo. Sigue el patrón de ConfirmDialog (S-08): modal, foco en el
 * título, botón atrás para cerrar y retorno del foco al botón que lo abrió.
 */
export function SelectField<T extends string>({
  label,
  options,
  value,
  onChange,
  tone = 'surface',
}: SelectFieldProps<T>) {
  const { colors, borders } = useTheme();
  const reduceMotion = useReduceMotion();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HostInstance>(null);
  const titleRef = useScreenFocus(open);
  const wasOpen = useRef(false);

  useEffect(() => {
    // Solo al pasar de abierto a cerrado se devuelve el foco al botón.
    if (wasOpen.current && !open && triggerRef.current) {
      const target = triggerRef.current;
      const timer = setTimeout(() => {
        AccessibilityInfo.sendAccessibilityEvent(target, 'focus');
      }, SCREEN_FOCUS_DELAY_MS);
      wasOpen.current = open;
      return () => clearTimeout(timer);
    }
    wasOpen.current = open;
  }, [open]);

  const selected = options.find((option) => option.value === value);
  const isBrand = tone === 'brand';
  const foreground = isBrand ? 'onBrand' : 'text';

  return (
    <View style={styles.container}>
      <AppText variant="label" importantForAccessibility="no">
        {label}
      </AppText>
      <Pressable
        ref={triggerRef}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? 'sin elegir'}`}
        accessibilityHint="Abre la lista de opciones"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: isBrand ? colors.brandSurface : colors.surface,
            borderColor: isBrand ? colors.onBrand : colors.border,
            borderWidth: borders.thin,
          },
          pressed && styles.pressed,
        ]}
      >
        <AppText color={foreground} style={styles.triggerText}>
          {selected?.label ?? ''}
        </AppText>
        <Icon name="chevron-down" size={24} color={colors[foreground]} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType={reduceMotion ? 'none' : 'fade'}
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
      >
        <View style={[styles.scrim, { backgroundColor: `${colors.scrim}99` }]}>
          <View
            testID="select-dialog"
            accessibilityViewIsModal
            onAccessibilityEscape={() => setOpen(false)}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <AppText ref={titleRef} accessible accessibilityRole="header" variant="subtitle">
              {label}
            </AppText>
            <ScrollView style={styles.list}>
              <RadioGroup
                label={label}
                hideVisibleLabel
                options={options}
                value={value}
                onChange={(next) => {
                  onChange(next);
                  setOpen(false);
                }}
              />
            </ScrollView>
            <Button label="Cerrar" variant="secondary" onPress={() => setOpen(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: TOUCH_MIN,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.control,
  },
  triggerText: {
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  scrim: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    borderRadius: radius.dialog,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.md,
    maxHeight: '85%',
  },
  list: {
    flexGrow: 0,
  },
});
