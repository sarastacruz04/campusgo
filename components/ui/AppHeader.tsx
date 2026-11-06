import type { Ref } from 'react';
import { StyleSheet, View, type HostInstance } from 'react-native';

import { spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

import { IconButton } from './IconButton';
import { Logo } from './Logo';

type AppHeaderProps = {
  /** Botón de volver a la izquierda (pantallas fuera de las pestañas). */
  onBack?: () => void;
  /** Botón de perfil a la derecha. Si se omite, no se muestra. */
  onPressProfile?: () => void;
  /** Referencia al botón de perfil, para devolverle el foco al cerrar un diálogo. */
  profileButtonRef?: Ref<HostInstance>;
};

/**
 * Encabezado blanco de las pantallas internas (sección 6.4): logo pequeño a la
 * izquierda y botón de perfil (avatar gris claro con ícono de persona) a la derecha.
 * Aquí el logo es decorativo (S-09): el lector salta directo a los controles.
 */
export function AppHeader({ onBack, onPressProfile, profileButtonRef }: AppHeaderProps) {
  const { colors, borders } = useTheme();
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: borders.thin,
        },
      ]}
    >
      <View style={styles.side}>
        {onBack ? (
          <IconButton icon="arrow-left" accessibilityLabel="Volver" onPress={onBack} />
        ) : null}
        <Logo size="small" decorative />
      </View>
      {onPressProfile ? (
        <IconButton
          ref={profileButtonRef}
          icon="account"
          variant="avatar"
          accessibilityLabel="Perfil"
          accessibilityHint="Abre tu perfil, notificaciones y ajustes de accesibilidad"
          onPress={onPressProfile}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
