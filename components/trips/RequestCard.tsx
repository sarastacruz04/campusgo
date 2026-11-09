import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { formatDeparture } from '@/lib/format';
import { radius, spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';
import type { EstadoReserva } from '@/types/database';
import type { ReservationItem } from '@/types/domain';

import { cardStyles } from './TripCard';

const ESTADO_LABEL: Record<EstadoReserva, string> = {
  pendiente: 'Solicitud pendiente',
  aceptada: 'Solicitud aceptada',
  rechazada: 'Solicitud rechazada',
  cancelada: 'Solicitud cancelada',
};

type RequestCardProps = {
  request: ReservationItem;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  loadingAction?: 'accept' | 'reject' | null;
};

/** Tarjeta de solicitud de reserva para el conductor (pantallas 17 y 19). */
export const RequestCard = memo(function RequestCard({
  request,
  onAccept,
  onReject,
  loadingAction = null,
}: RequestCardProps) {
  const { colors, borders } = useTheme();
  const { viaje } = request;
  const isPending = request.estado === 'pendiente';
  const passengerName = request.pasajero_nombre || 'Pasajero';
  const sector = viaje?.sector_nombre || 'Viaje';
  const departureText = viaje?.salida_at ? formatDeparture(viaje.salida_at) : '';

  const label = [
    ESTADO_LABEL[request.estado],
    `Pasajero: ${passengerName}`,
    `Sector: ${sector}`,
    departureText ? `Salida: ${departureText}` : null,
    `Punto de recogida: ${request.punto_recogida_texto}`,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <View style={[cardStyles.card, { backgroundColor: colors.surface }]}>
      {/* Encabezado con nombre del pasajero y estado */}
      <View style={[styles.header, { backgroundColor: colors.cardHeader }]}>
        <View style={styles.passengerRow}>
          <Icon name="account" size={24} color={colors.primary} />
          <AppText variant="cardTitle" color="primary">
            {passengerName}
          </AppText>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isPending
                ? colors.titleBand
                : request.estado === 'aceptada'
                  ? colors.success
                  : colors.error,
            },
          ]}
        >
          <AppText
            variant="label"
            style={{
              color: isPending ? colors.primary : colors.onPrimary,
            }}
          >
            {request.estado === 'pendiente'
              ? 'Pendiente'
              : request.estado === 'aceptada'
                ? 'Aceptada'
                : 'Rechazada'}
          </AppText>
        </View>
      </View>

      {/* Detalles del viaje y punto de recogida */}
      <View accessible accessibilityLabel={label} style={styles.body}>
        <View style={styles.detailRow}>
          <Icon name="map-marker" size={18} color={colors.primary} />
          <AppText variant="body">
            Sector: <AppText variant="bodyStrong">{sector}</AppText>
          </AppText>
        </View>

        {departureText ? (
          <View style={styles.detailRow}>
            <Icon name="clock-outline" size={18} color={colors.primary} />
            <AppText variant="body">Salida: {departureText}</AppText>
          </View>
        ) : null}

        <View style={styles.detailRow}>
          <Icon name="map-marker-path" size={18} color={colors.primary} />
          <AppText variant="body">
            Recogida: <AppText variant="bodyStrong">{request.punto_recogida_texto}</AppText>
          </AppText>
        </View>
      </View>

      {/* Acciones para solicitudes pendientes */}
      {isPending && (onAccept || onReject) ? (
        <View
          style={[
            styles.actionsRow,
            { borderTopColor: colors.border, borderTopWidth: borders.thin },
          ]}
        >
          {onReject ? (
            <View style={styles.actionButton}>
              <Button
                label="Rechazar"
                variant="secondary"
                loading={loadingAction === 'reject'}
                accessibilityLabel={`Rechazar reserva de ${passengerName}`}
                onPress={() => onReject(request.id)}
              />
            </View>
          ) : null}

          {onAccept ? (
            <View style={styles.actionButton}>
              <Button
                label="Aceptar reserva"
                variant="primary"
                loading={loadingAction === 'accept'}
                accessibilityLabel={`Aceptar reserva de ${passengerName}`}
                onPress={() => onAccept(request.id)}
              />
            </View>
          ) : null}
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
  passengerRow: {
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
  actionsRow: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
