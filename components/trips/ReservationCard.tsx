import { memo, useRef, type RefObject } from 'react';
import { StyleSheet, View, type HostInstance } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';
import type { EstadoReserva } from '@/types/database';
import type { ReservationItem } from '@/types/domain';

import { cardStyles, TripDetails, tripAccessibilityLabel, type TripRatingProps } from './TripCard';

const ESTADO_LABEL: Record<EstadoReserva, string> = {
  pendiente: 'Reserva pendiente',
  aceptada: 'Reserva aceptada',
  rechazada: 'Reserva rechazada',
  cancelada: 'Reserva cancelada',
};

type ReservationCardProps = TripRatingProps & {
  reservation: ReservationItem;
  /** Si se pasa, muestra la papelera. Recibe la referencia para devolverle el foco. */
  onPressCancel?: (reservationId: string, button: RefObject<HostInstance | null>) => void;
  /** Si se pasa, muestra "Abrir chat" (solo reservas aceptadas, R10). Recibe el id del viaje. */
  onPressChat?: (viajeId: string) => void;
};

/**
 * Tarjeta de una reserva (pantallas 13 y 14). Los datos son un solo foco y la
 * papelera es otro, hermano y no anidado: dentro de un elemento accessible TalkBack
 * no podría llegar al botón (sección 7.3).
 */
export const ReservationCard = memo(function ReservationCard({
  reservation,
  ratingAverage,
  ratingTotal,
  onPressCancel,
  onPressChat,
}: ReservationCardProps) {
  const { colors } = useTheme();
  const cancelRef = useRef<HostInstance>(null);
  const { viaje } = reservation;
  const pickup = `Recogida: ${reservation.punto_recogida_texto}`;
  const sector = viaje?.sector_nombre ?? 'Viaje no disponible';

  const label = [
    ESTADO_LABEL[reservation.estado],
    viaje
      ? tripAccessibilityLabel(viaje, { ratingAverage, ratingTotal })
      : 'Los datos de este viaje ya no están disponibles',
    pickup,
  ].join('. ');

  return (
    <View style={[cardStyles.card, { backgroundColor: colors.surface }]}>
      <View accessible accessibilityLabel={label}>
        {viaje ? (
          <TripDetails
            trip={viaje}
            ratingAverage={ratingAverage}
            ratingTotal={ratingTotal}
            headerAction={Boolean(onPressCancel)}
          />
        ) : (
          <View style={[styles.header, { backgroundColor: colors.cardHeader }]}>
            <AppText variant="cardTitle">{sector}</AppText>
          </View>
        )}
        <View style={styles.pickup}>
          <AppText>{pickup}</AppText>
        </View>
      </View>
      {onPressCancel ? (
        <View style={styles.cancel}>
          <IconButton
            ref={cancelRef}
            icon="trash-can-outline"
            compact
            accessibilityLabel={`Cancelar reserva de ${sector}`}
            onPress={() => onPressCancel(reservation.id, cancelRef)}
          />
        </View>
      ) : null}
      {onPressChat && viaje ? (
        <View style={styles.chat}>
          <Button
            label="Abrir chat"
            variant="secondary"
            accessibilityLabel={`Abrir chat del viaje a ${sector}`}
            onPress={() => onPressChat(viaje.id)}
          />
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  pickup: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  chat: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  cancel: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.md,
  },
});
