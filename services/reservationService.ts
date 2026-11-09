import type { Reserva } from '@/types/database';
import type { ReservationItem } from '@/types/domain';

import { unwrap } from './errors';
import { supabase } from './supabase';
import { TRIP_SELECT, toTripListItem } from './tripService';

// Reserva + su viaje (con sector y conductor) + nombre del pasajero.
const RESERVATION_SELECT = `*, viaje:viajes(${TRIP_SELECT}), pasajero:profiles(nombre, apellido)`;

type ReservationRow = Reserva & {
  viaje: Parameters<typeof toTripListItem>[0] | null;
  pasajero: { nombre: string; apellido: string } | null;
};

function toReservationItem(row: ReservationRow): ReservationItem {
  const { viaje, pasajero, ...reserva } = row;
  return {
    ...reserva,
    // RLS puede ocultar el viaje (por ejemplo, si la reserva fue rechazada y el viaje se llenó).
    viaje: viaje ? toTripListItem(viaje) : null,
    pasajero_nombre: pasajero ? `${pasajero.nombre} ${pasajero.apellido}`.trim() : null,
  };
}

export type CreateReservationInput = {
  viajeId: string;
  puntoRecogidaTexto: string;
  puntoLat: number;
  puntoLng: number;
};

/** Reserva un viaje con la RPC crear_reserva (R5) y devuelve la reserva completa. */
export async function createReservation(input: CreateReservationInput): Promise<ReservationItem> {
  const reservationId = unwrap(
    await supabase.rpc('crear_reserva', {
      p_viaje_id: input.viajeId,
      p_punto_recogida_texto: input.puntoRecogidaTexto.trim(),
      p_punto_lat: input.puntoLat,
      p_punto_lng: input.puntoLng,
    }),
  );
  return getReservation(reservationId);
}

export async function getReservation(reservationId: string): Promise<ReservationItem> {
  const row = unwrap(
    await supabase.from('reservas').select(RESERVATION_SELECT).eq('id', reservationId).single(),
  );
  return toReservationItem(row as ReservationRow);
}

/** Reservas del pasajero, de la más reciente a la más antigua (pantalla 13). */
export async function listMyReservations(pasajeroId: string): Promise<ReservationItem[]> {
  const rows = unwrap(
    await supabase
      .from('reservas')
      .select(RESERVATION_SELECT)
      .eq('pasajero_id', pasajeroId)
      .order('created_at', { ascending: false }),
  );
  return (rows as ReservationRow[]).map(toReservationItem);
}

/**
 * Solicitudes que recibió el conductor en sus viajes (pantalla de solicitudes).
 * RLS ya limita a las reservas de sus viajes y las suyas como pasajero; se excluyen
 * las suyas con neq.
 */
export async function listRequestsForMyTrips(conductorId: string): Promise<ReservationItem[]> {
  const rows = unwrap(
    await supabase
      .from('reservas')
      .select(RESERVATION_SELECT)
      .neq('pasajero_id', conductorId)
      .order('created_at', { ascending: false }),
  );
  return (rows as ReservationRow[]).map(toReservationItem);
}

// Cambios de estado (R6 y R7): siempre por RPC, que valida permisos y ajusta cupos.
export async function acceptReservation(reservationId: string): Promise<void> {
  unwrap(await supabase.rpc('aceptar_reserva', { p_reserva_id: reservationId }));
}

export async function rejectReservation(reservationId: string): Promise<void> {
  unwrap(await supabase.rpc('rechazar_reserva', { p_reserva_id: reservationId }));
}

export async function cancelReservation(reservationId: string): Promise<void> {
  unwrap(await supabase.rpc('cancelar_reserva', { p_reserva_id: reservationId }));
}

/** Escucha por Realtime los cambios de reservas visibles para este usuario (RLS). */
export function subscribeToReservationChanges(onChange: (reserva: Reserva) => void): () => void {
  const channel = supabase
    .channel(`reservas-${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reservas' }, (payload) => {
      if (payload.eventType !== 'DELETE') onChange(payload.new as Reserva);
    })
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
