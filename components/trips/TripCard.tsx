import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { formatDeparture, formatPesos, formatRating, formatSeats } from '@/lib/format';
import { radius, spacing, TOUCH_MIN } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';
import type { TripListItem } from '@/types/domain';

/** Promedio del conductor. Son números sueltos para que React.memo los compare bien. */
export type TripRatingProps = {
  ratingAverage: number | null;
  ratingTotal: number;
};

function ratingText(average: number | null, total: number): string {
  if (average === null) return 'Sin calificaciones';
  return `${formatRating(average)} de 5 (${total})`;
}

/** Texto que lee TalkBack: toda la tarjeta en una sola frase (S-04). */
export function tripAccessibilityLabel(
  trip: TripListItem,
  { ratingAverage, ratingTotal }: TripRatingProps,
): string {
  return [
    trip.sector_nombre,
    `Conductor ${trip.conductor_nombre}`,
    `Desde ${trip.origen_texto}`,
    `Para ${trip.destino_texto}`,
    `Sale ${formatDeparture(trip.salida_at)}`,
    `Valor ${formatPesos(trip.valor_por_cupo)}`,
    formatSeats(trip.cupos_disponibles),
    `Calificación: ${ratingText(ratingAverage, ratingTotal)}`,
  ].join('. ');
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <AppText>
      <AppText variant="bodyStrong">{label} </AppText>
      {value}
    </AppText>
  );
}

/** Encabezado gris y líneas de la tarjeta (pantalla 10). Solo dibuja: el foco va afuera. */
export function TripDetails({
  trip,
  ratingAverage,
  ratingTotal,
  headerAction = false,
}: TripRatingProps & {
  trip: TripListItem;
  /** true si hay un botón en la esquina del encabezado: el título no debe quedar debajo. */
  headerAction?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.cardHeader },
          headerAction && styles.headerWithAction,
        ]}
      >
        <AppText variant="cardTitle">{trip.sector_nombre}</AppText>
      </View>
      <View style={styles.body}>
        <Line label="Conductor:" value={trip.conductor_nombre} />
        <Line label="Desde:" value={trip.origen_texto} />
        <Line label="Para:" value={trip.destino_texto} />
        <Line label="Hora salida:" value={formatDeparture(trip.salida_at)} />
        <Line label="Valor:" value={formatPesos(trip.valor_por_cupo)} />
        <Line label="Cupos:" value={String(trip.cupos_disponibles)} />
        <Line label="Calificación:" value={ratingText(ratingAverage, ratingTotal)} />
      </View>
    </>
  );
}

type TripCardProps = TripRatingProps & {
  trip: TripListItem;
  onPress: (tripId: string) => void;
};

/**
 * Tarjeta de un viaje en la búsqueda. Toda la tarjeta es un solo botón con una
 * etiqueta compuesta (S-04): los textos y el "+" no son focos aparte.
 * React.memo evita redibujarla si sus datos no cambiaron (lista de 200 viajes).
 */
export const TripCard = memo(function TripCard({
  trip,
  ratingAverage,
  ratingTotal,
  onPress,
}: TripCardProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={tripAccessibilityLabel(trip, { ratingAverage, ratingTotal })}
      accessibilityHint="Abre la reserva de este viaje"
      onPress={() => onPress(trip.id)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface },
        pressed && styles.pressed,
      ]}
    >
      <TripDetails trip={trip} ratingAverage={ratingAverage} ratingTotal={ratingTotal} />
      <View style={[styles.plus, { backgroundColor: colors.primary }]}>
        <Icon name="plus" size={28} color={colors.onPrimary} />
      </View>
    </Pressable>
  );
});

export const cardStyles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    overflow: 'hidden',
  },
});

const styles = StyleSheet.create({
  card: cardStyles.card,
  pressed: {
    opacity: 0.85,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerWithAction: {
    paddingRight: TOUCH_MIN + spacing.md,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.xs,
    // Deja libre la esquina del "+" para que no tape el texto al agrandar la letra.
    paddingBottom: TOUCH_MIN + spacing.lg,
  },
  plus: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
