import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { formatDeparture, formatPesos } from '@/lib/format';
import { radius, spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';
import type { EstadoViaje } from '@/types/database';
import type { TripListItem } from '@/types/domain';

import { cardStyles } from './TripCard';

const ESTADO_LABEL: Record<EstadoViaje, string> = {
  abierto: 'Abierto',
  lleno: 'Lleno',
  en_curso: 'En curso',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};

export type CreatedTripCardProps = {
  trip: TripListItem;
  pendingRequestsCount?: number;
  acceptedReservationsCount?: number;
  onStartTrip?: (tripId: string) => void;
  onCancelTrip?: (tripId: string) => void;
  onFinishTrip?: (tripId: string) => void;
  onViewRequests?: (tripId: string) => void;
  loadingAction?: 'start' | 'cancel' | 'finish' | null;
};

/**
 * Tarjeta de viaje creado para el conductor (pantalla 19 y pestaña Curso).
 * Accesible (S-04 y T-01): área de detalles con accesibilidad semántica y
 * botones de acción de 48 dp con estados de carga claros.
 */
export const CreatedTripCard = memo(function CreatedTripCard({
  trip,
  pendingRequestsCount = 0,
  acceptedReservationsCount = 0,
  onStartTrip,
  onCancelTrip,
  onFinishTrip,
  onViewRequests,
  loadingAction = null,
}: CreatedTripCardProps) {
  const { colors, borders } = useTheme();

  const sector = trip.sector_nombre || 'Viaje';
  const estado = trip.estado;
  const departureText = formatDeparture(trip.salida_at);
  const valorText = formatPesos(trip.valor_por_cupo);

  const canStart = estado === 'abierto' || estado === 'lleno';
  const hasAcceptedReservations = acceptedReservationsCount > 0;
  const isInProgress = estado === 'en_curso';

  const accessibleSummary = [
    `Viaje hacia ${sector}`,
    `Estado: ${ESTADO_LABEL[estado]}`,
    `Salida: ${departureText}`,
    `Punto de partida: ${trip.origen_texto}`,
    `Destino: ${trip.destino_texto}`,
    `Cupos: ${trip.cupos_disponibles} de ${trip.cupos_totales} disponibles`,
    `Valor: ${valorText}`,
    `${acceptedReservationsCount} reservas aceptadas`,
    pendingRequestsCount > 0 ? `${pendingRequestsCount} solicitudes pendientes` : null,
  ]
    .filter(Boolean)
    .join('. ');

  const getStatusBadgeColor = () => {
    switch (estado) {
      case 'en_curso':
        return colors.success;
      case 'lleno':
        return colors.primary;
      case 'abierto':
        return colors.titleBand;
      case 'cancelado':
        return colors.error;
      case 'finalizado':
      default:
        return colors.placeholder;
    }
  };

  const getStatusTextColor = () => {
    switch (estado) {
      case 'en_curso':
      case 'cancelado':
      case 'lleno':
        return colors.onPrimary;
      case 'abierto':
      case 'finalizado':
      default:
        return colors.primary;
    }
  };

  return (
    <View style={[cardStyles.card, { backgroundColor: colors.surface }]}>
      {/* Encabezado con Sector y Estado */}
      <View style={[styles.header, { backgroundColor: colors.cardHeader }]}>
        <View style={styles.titleRow}>
          <Icon name="car" size={24} color={colors.primary} />
          <AppText variant="cardTitle" color="primary">
            {sector}
          </AppText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeColor() }]}>
          <AppText variant="label" style={{ color: getStatusTextColor() }}>
            {ESTADO_LABEL[estado]}
          </AppText>
        </View>
      </View>

      {/* Contenido accesible */}
      <View accessible accessibilityLabel={accessibleSummary} style={styles.body}>
        <View style={styles.detailRow}>
          <Icon name="clock-outline" size={18} color={colors.primary} />
          <AppText variant="body">
            Salida: <AppText variant="bodyStrong">{departureText}</AppText>
          </AppText>
        </View>

        <View style={styles.detailRow}>
          <Icon name="map-marker" size={18} color={colors.primary} />
          <AppText variant="body" numberOfLines={2}>
            Desde: <AppText variant="bodyStrong">{trip.origen_texto}</AppText>
          </AppText>
        </View>

        <View style={styles.detailRow}>
          <Icon name="map-marker-check" size={18} color={colors.primary} />
          <AppText variant="body" numberOfLines={2}>
            Para: <AppText variant="bodyStrong">{trip.destino_texto}</AppText>
          </AppText>
        </View>

        <View style={styles.detailRow}>
          <Icon name="seat" size={18} color={colors.primary} />
          <AppText variant="body">
            Cupos:{' '}
            <AppText variant="bodyStrong">
              {trip.cupos_disponibles} de {trip.cupos_totales} disponibles
            </AppText>
          </AppText>
        </View>

        <View style={styles.detailRow}>
          <Icon name="cash" size={18} color={colors.primary} />
          <AppText variant="body">
            Valor: <AppText variant="bodyStrong">{valorText}</AppText>
          </AppText>
        </View>

        <View style={styles.detailRow}>
          <Icon name="account-group" size={18} color={colors.primary} />
          <AppText variant="body">
            Reservas aceptadas: <AppText variant="bodyStrong">{acceptedReservationsCount}</AppText>
          </AppText>
        </View>

        {pendingRequestsCount > 0 ? (
          <View
            style={[
              styles.pendingNotice,
              {
                backgroundColor: colors.titleBand,
                borderColor: colors.border,
                borderWidth: borders.thin,
              },
            ]}
          >
            <Icon name="account-clock" size={18} color={colors.primary} />
            <AppText variant="secondary" color="primary" style={styles.flex}>
              {pendingRequestsCount === 1
                ? '1 solicitud pendiente por responder'
                : `${pendingRequestsCount} solicitudes pendientes por responder`}
            </AppText>
          </View>
        ) : null}
      </View>

      {/* Acciones para viajes abiertos o llenos */}
      {canStart ? (
        <View
          style={[
            styles.actionsContainer,
            { borderTopColor: colors.border, borderTopWidth: borders.thin },
          ]}
        >
          {onViewRequests ? (
            <Button
              label={
                pendingRequestsCount > 0
                  ? `Solicitudes (${pendingRequestsCount})`
                  : 'Ver solicitudes'
              }
              variant="secondary"
              accessibilityLabel={`Ver solicitudes del viaje a ${sector}`}
              onPress={() => onViewRequests(trip.id)}
            />
          ) : null}

          <View style={styles.actionButtonsRow}>
            {onCancelTrip ? (
              <View style={styles.flex}>
                <Button
                  label="Cancelar viaje"
                  variant="secondary"
                  loading={loadingAction === 'cancel'}
                  accessibilityLabel={`Cancelar viaje a ${sector}`}
                  onPress={() => onCancelTrip(trip.id)}
                />
              </View>
            ) : null}

            {onStartTrip ? (
              <View style={styles.flex}>
                <Button
                  label="Iniciar viaje"
                  variant="primary"
                  loading={loadingAction === 'start'}
                  disabled={!hasAcceptedReservations}
                  accessibilityLabel={`Iniciar viaje a ${sector}`}
                  accessibilityHint={
                    hasAcceptedReservations
                      ? 'Inicia el viaje y notifica a los pasajeros'
                      : 'Requiere al menos una reserva aceptada para iniciar'
                  }
                  onPress={() => onStartTrip(trip.id)}
                />
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* Acción para viaje en curso */}
      {isInProgress && onFinishTrip ? (
        <View
          style={[
            styles.actionsContainer,
            { borderTopColor: colors.border, borderTopWidth: borders.thin },
          ]}
        >
          <Button
            label="Finalizar viaje"
            variant="primary"
            loading={loadingAction === 'finish'}
            accessibilityLabel={`Finalizar viaje a ${sector}`}
            onPress={() => onFinishTrip(trip.id)}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pendingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.card,
    marginTop: spacing.xs,
  },
  actionsContainer: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
});
