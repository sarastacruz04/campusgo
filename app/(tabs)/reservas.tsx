import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/ui/AppHeader';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { radius, spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

export default function ReservasTab() {
  const { colors, borders } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <AppHeader onPressProfile={() => router.push('/profile')} />

      <View style={[styles.titleBand, { backgroundColor: colors.titleBand }]}>
        <ScreenTitle color="primary">Viajes reservados</ScreenTitle>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: borders.thin,
            },
          ]}
        >
          <Icon name="map-marker-path" size={48} color={colors.placeholder} />
          <AppText variant="subtitle" style={{ color: colors.text }}>
            No tienes reservas activas
          </AppText>
          <AppText variant="secondary" style={[styles.centeredText, { color: colors.textMuted }]}>
            Cuando reserves un viaje con un conductor, aquí podrás seguir el estado de tu solicitud
            (pendiente, aceptada o rechazada).
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  titleBand: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  content: {
    padding: spacing.xl,
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyCard: {
    borderRadius: radius.card,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  centeredText: {
    textAlign: 'center',
  },
});
