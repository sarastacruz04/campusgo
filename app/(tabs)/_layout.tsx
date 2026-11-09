import { Tabs, router } from 'expo-router';

import { BottomTabBar, type TabItem } from '@/components/ui/BottomTabBar';
import { selectProfile } from '@/features/profile/selectors';
import { useAppSelector } from '@/store/hooks';

export default function TabsLayout() {
  const profile = useAppSelector(selectProfile);
  const isConductor = profile?.modo_actual === 'conductor';

  // Configuración dinámica de las 3 pestañas según el modo actual
  const tabs: TabItem<string>[] = isConductor
    ? [
        { key: 'index', label: 'Inicio', icon: 'home' },
        { key: 'creados', label: 'Creados', icon: 'car' },
        { key: 'curso', label: 'Curso', icon: 'road-variant' },
      ]
    : [
        { key: 'index', label: 'Inicio', icon: 'home' },
        { key: 'reservas', label: 'Reservas', icon: 'map-marker-path' },
        { key: 'curso', label: 'Curso', icon: 'road-variant' },
      ];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Ocultamos la barra por defecto para usar BottomTabBar
      }}
      tabBar={({ state }) => {
        const activeRoute = state.routes[state.index]?.name ?? 'index';
        return (
          <BottomTabBar
            tabs={tabs}
            activeKey={activeRoute}
            onPressTab={(key) => {
              if (key === 'index') router.push('/(tabs)');
              else if (key === 'reservas') router.push('/(tabs)/reservas');
              else if (key === 'creados') router.push('/(tabs)/creados');
              else if (key === 'curso') router.push('/(tabs)/curso');
            }}
          />
        );
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen
        name="reservas"
        options={{
          title: 'Reservas',
          href: isConductor ? null : '/(tabs)/reservas',
        }}
      />
      <Tabs.Screen
        name="creados"
        options={{
          title: 'Creados',
          href: isConductor ? '/(tabs)/creados' : null,
        }}
      />
      <Tabs.Screen name="curso" options={{ title: 'Curso' }} />
    </Tabs>
  );
}
