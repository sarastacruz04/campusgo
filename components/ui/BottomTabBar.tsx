import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, TOUCH_MIN } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';
import { fontFamilies } from '@/theme/typography';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export type TabItem<K extends string> = {
  key: K;
  label: string;
  icon: IconName;
};

type BottomTabBarProps<K extends string> = {
  tabs: TabItem<K>[];
  activeKey: K;
  onPressTab: (key: K) => void;
};

/**
 * Barra inferior blanca de tres pestañas (Inicio, Reservas o Creados, Curso).
 * Es presentacional: en la Etapa 4 el layout (tabs) de Expo Router la usa como tabBar.
 * Accesibilidad: rol tablist y una pestaña con rol tab y estado selected (S-06).
 * La activa se marca con subrayado + negrita, no solo con color (V-05). Las etiquetas
 * miden 12 sp como mínimo (V-06) y cada pestaña mide al menos TOUCH_MIN (T-01).
 */
export function BottomTabBar<K extends string>({
  tabs,
  activeKey,
  onPressTab,
}: BottomTabBarProps<K>) {
  const { colors, borders } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel="Navegación principal"
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: borders.thin,
          paddingBottom: Math.max(insets.bottom, spacing.xs),
        },
      ]}
    >
      {tabs.map((tab) => {
        const selected = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected }}
            onPress={() => onPressTab(tab.key)}
            style={({ pressed }) => [styles.tab, pressed && { backgroundColor: colors.titleBand }]}
          >
            <Icon name={tab.icon} size={26} color={colors.text} />
            <AppText
              variant="tab"
              style={selected && [styles.selectedLabel, { textDecorationColor: colors.text }]}
            >
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TOUCH_MIN,
    minWidth: TOUCH_MIN,
    paddingVertical: spacing.xs,
  },
  selectedLabel: {
    fontFamily: fontFamilies.bold,
    textDecorationLine: 'underline',
  },
});
