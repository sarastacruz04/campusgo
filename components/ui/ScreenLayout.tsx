import type { ReactNode, Ref } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type HostInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

import { AppHeader } from './AppHeader';
import { ScreenTitle } from './ScreenTitle';
import { SegmentedToggle, type SegmentOption } from './SegmentedToggle';

export type AppMode = 'pasajero' | 'conductor';

const MODE_OPTIONS: SegmentOption<AppMode>[] = [
  { value: 'pasajero', label: 'Pasajero', accessibilityLabel: 'Modo pasajero', icon: 'account' },
  { value: 'conductor', label: 'Conductor', accessibilityLabel: 'Modo conductor', icon: 'car' },
];

type ScreenLayoutProps = {
  title: string;
  children: ReactNode;
  /** Modo actual; si se pasa junto con onChangeMode, se muestra el selector Pasajero/Conductor. */
  mode?: AppMode;
  onChangeMode?: (mode: AppMode) => void;
  onPressProfile?: () => void;
  profileButtonRef?: Ref<HostInstance>;
  onBack?: () => void;
  /** Contenido extra en la banda del título (por ejemplo, los filtros del inicio). */
  bandContent?: ReactNode;
  /** Barra inferior (BottomTabBar) en las pantallas de pestañas. */
  bottomBar?: ReactNode;
  /** false si el contenido ya es una lista con scroll propio (FlatList). */
  scrollable?: boolean;
};

/**
 * Estructura común de las pantallas internas (sección 6.4), de arriba abajo:
 * encabezado blanco, selector de modo, banda con el título, contenido y barra inferior.
 * El orden del código es el orden visual, que es el orden de foco del lector (T-03).
 * KeyboardAvoidingView evita que el teclado tape el campo enfocado (T-03).
 */
export function ScreenLayout({
  title,
  children,
  mode,
  onChangeMode,
  onPressProfile,
  profileButtonRef,
  onBack,
  bandContent,
  bottomBar,
  scrollable = true,
}: ScreenLayoutProps) {
  const { colors } = useTheme();

  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: colors.background }}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, styles.content, { backgroundColor: colors.background }]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: colors.surface }]}>
      <AppHeader
        onBack={onBack}
        onPressProfile={onPressProfile}
        profileButtonRef={profileButtonRef}
      />
      {mode && onChangeMode ? (
        <View style={[styles.modeRow, { backgroundColor: colors.surface }]}>
          <SegmentedToggle
            accessibilityLabel="Modo de uso"
            options={MODE_OPTIONS}
            value={mode}
            onChange={onChangeMode}
          />
        </View>
      ) : null}
      <View style={[styles.band, { backgroundColor: colors.titleBand }]}>
        <ScreenTitle>{title}</ScreenTitle>
        {bandContent}
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {content}
      </KeyboardAvoidingView>
      {bottomBar}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  modeRow: {
    paddingBottom: spacing.sm,
  },
  band: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
});
