import { Pressable, StyleSheet, View } from 'react-native';

import { spacing, TOUCH_MIN } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';

export type InnerTab<K extends string> = {
  key: K;
  label: string;
};

type InnerTabsProps<K extends string> = {
  tabs: InnerTab<K>[];
  activeKey: K;
  onChange: (key: K) => void;
  /** Nombre del grupo para el lector, por ejemplo "Estado de las reservas". */
  accessibilityLabel: string;
};

/**
 * Pestañas internas de una pantalla (Pendientes, Aceptados y Rechazados).
 * Rol tablist con pestañas tab y estado selected (S-06). La activa se marca con
 * negrita y una línea inferior, no solo con color (V-05).
 */
export function InnerTabs<K extends string>({
  tabs,
  activeKey,
  onChange,
  accessibilityLabel,
}: InnerTabsProps<K>) {
  const { colors } = useTheme();

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={styles.container}
    >
      {tabs.map((tab) => {
        const selected = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(tab.key)}
            style={({ pressed }) => [
              styles.tab,
              { borderBottomColor: selected ? colors.text : 'transparent' },
              pressed && styles.pressed,
            ]}
          >
            <AppText variant={selected ? 'bodyStrong' : 'body'} style={styles.label}>
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
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    minHeight: TOUCH_MIN,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    textAlign: 'center',
  },
});
