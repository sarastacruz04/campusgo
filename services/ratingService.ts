import type { Calificacion, PromedioCalificacion } from '@/types/database';
import type { TripListItem } from '@/types/domain';

import { toAppError, unwrap } from './errors';
import { supabase } from './supabase';
import { getTrip } from './tripService';

export type RatingInput = {
  viajeId: string;
  autorId: string;
  destinatarioId: string;
  /** De 1 a 5 (la base lo valida con CHECK). */
  estrellas: number;
  comentario?: string;
};

export type RatingTarget = {
  userId: string;
  fullName: string;
  role: 'conductor' | 'pasajero';
  existingRating: Calificacion | null;
};

export type TripRatingContext = {
  trip: TripListItem;
  targets: RatingTarget[];
  canRate: boolean;
};

type AcceptedPassengerRow = {
  pasajero_id: string;
  pasajero: { nombre: string; apellido: string } | null;
};

/** Califica a otra persona del viaje (R9: viaje finalizado, una vez por par). */
export async function submitRating(input: RatingInput): Promise<Calificacion> {
  return unwrap(
    await supabase
      .from('calificaciones')
      .insert({
        viaje_id: input.viajeId,
        autor_id: input.autorId,
        destinatario_id: input.destinatarioId,
        estrellas: input.estrellas,
        comentario: input.comentario?.trim() || null,
      })
      .select('*')
      .single(),
  );
}

/** Promedio y total de estrellas de varias personas a la vez (para las tarjetas). */
export async function getAverages(userIds: string[]): Promise<PromedioCalificacion[]> {
  if (userIds.length === 0) return [];
  return unwrap(
    await supabase.from('promedio_calificaciones').select('*').in('usuario_id', userIds),
  );
}

/**
 * Carga el contexto de calificación de un viaje para el usuario actual (R9):
 * datos del viaje, destinatarios elegibles (pasajeros aceptados o conductor)
 * y las calificaciones ya enviadas por este autor en el mismo viaje.
 */
export async function getTripRatingContext(
  viajeId: string,
  currentUserId: string,
): Promise<TripRatingContext> {
  const trip = await getTrip(viajeId);

  const existingRatings = unwrap(
    await supabase
      .from('calificaciones')
      .select('*')
      .eq('viaje_id', viajeId)
      .eq('autor_id', currentUserId),
  );
  const byDestinatario = new Map<string, Calificacion>();
  for (const rating of existingRatings) {
    byDestinatario.set(rating.destinatario_id, rating);
  }

  let targets: RatingTarget[] = [];

  if (trip.conductor_id === currentUserId) {
    const rows = unwrap(
      await supabase
        .from('reservas')
        .select('pasajero_id, pasajero:profiles(nombre, apellido)')
        .eq('viaje_id', viajeId)
        .eq('estado', 'aceptada'),
    ) as unknown as AcceptedPassengerRow[];

    targets = rows.map((row) => ({
      userId: row.pasajero_id,
      fullName: row.pasajero
        ? `${row.pasajero.nombre} ${row.pasajero.apellido}`.trim()
        : 'Pasajero',
      role: 'pasajero',
      existingRating: byDestinatario.get(row.pasajero_id) ?? null,
    }));
  } else {
    const { data, error } = await supabase
      .from('reservas')
      .select('id')
      .eq('viaje_id', viajeId)
      .eq('pasajero_id', currentUserId)
      .eq('estado', 'aceptada')
      .maybeSingle();

    if (error) {
      throw toAppError(error);
    }

    if (data) {
      targets = [
        {
          userId: trip.conductor_id,
          fullName: trip.conductor_nombre || 'Conductor',
          role: 'conductor',
          existingRating: byDestinatario.get(trip.conductor_id) ?? null,
        },
      ];
    }
  }

  return {
    trip,
    targets,
    canRate: trip.estado === 'finalizado' && targets.length > 0,
  };
}
