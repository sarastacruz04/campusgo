import { useEffect } from 'react';

import { messageReceived } from '@/features/chat/slice';
import { notificationReceived } from '@/features/notifications/slice';
import { reservationChanged } from '@/features/reservations/slice';
import { tripChanged } from '@/features/trips/slice';
import { subscribeToMessages } from '@/services/chatService';
import { subscribeToNotifications } from '@/services/notificationService';
import { subscribeToReservationChanges } from '@/services/reservationService';
import { subscribeToTripChanges } from '@/services/tripService';
import { useAppDispatch } from '@/store/hooks';

import { useAnnounce } from './useAnnounce';

// Suscripciones de Supabase Realtime. Cada hook abre un canal al montarse y lo
// cierra en el cleanup del useEffect: sin ese cierre, el canal seguiría abierto al
// salir de la pantalla (fuga de memoria y eventos duplicados).
// Los eventos entran al store por los mismos reducers que las respuestas normales.

/**
 * Cambios de viajes y reservas visibles para este usuario (cupos en vivo,
 * reserva aceptada o rechazada). `enabled` es false mientras no hay sesión.
 */
export function useRealtimeTripsAndReservations(enabled: boolean) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!enabled) return;
    const stopTrips = subscribeToTripChanges((viaje) => dispatch(tripChanged(viaje)));
    const stopReservations = subscribeToReservationChanges((reserva) =>
      dispatch(reservationChanged(reserva)),
    );
    return () => {
      stopTrips();
      stopReservations();
    };
  }, [enabled, dispatch]);
}

/** Notificaciones nuevas (R11): entran a la bandeja y se anuncian al lector (S-07). */
export function useRealtimeNotifications(userId: string | null) {
  const dispatch = useAppDispatch();
  const announce = useAnnounce();

  useEffect(() => {
    if (!userId) return;
    return subscribeToNotifications(userId, (notificacion) => {
      dispatch(notificationReceived(notificacion));
      announce(`Notificación: ${notificacion.titulo}. ${notificacion.cuerpo}`);
    });
  }, [userId, dispatch, announce]);
}

/** Mensajes nuevos de un chat (R10). Lo usa la pantalla del chat (Etapa 7). */
export function useRealtimeMessages(viajeId: string | null) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!viajeId) return;
    return subscribeToMessages(viajeId, (mensaje) => dispatch(messageReceived(mensaje)));
  }, [viajeId, dispatch]);
}
