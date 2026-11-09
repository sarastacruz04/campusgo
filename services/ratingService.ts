import type { Calificacion, PromedioCalificacion } from '@/types/database';

import { unwrap } from './errors';
import { supabase } from './supabase';

export type RatingInput = {
  viajeId: string;
  autorId: string;
  destinatarioId: string;
  /** De 1 a 5 (la base lo valida con CHECK). */
  estrellas: number;
  comentario?: string;
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
