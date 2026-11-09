import type { Mensaje } from '@/types/database';

import { unwrap } from './errors';
import { supabase } from './supabase';

// Chat del viaje (R10). RLS deja leer y escribir solo al conductor y a los
// pasajeros con reserva aceptada, mientras el viaje no esté cancelado.

export const MAX_MESSAGE_LENGTH = 500;

export async function listMessages(viajeId: string): Promise<Mensaje[]> {
  return unwrap(
    await supabase
      .from('mensajes')
      .select('*')
      .eq('viaje_id', viajeId)
      .order('created_at', { ascending: true }),
  );
}

export async function sendMessage(
  viajeId: string,
  autorId: string,
  contenido: string,
): Promise<Mensaje> {
  return unwrap(
    await supabase
      .from('mensajes')
      .insert({ viaje_id: viajeId, autor_id: autorId, contenido: contenido.trim() })
      .select('*')
      .single(),
  );
}

/** Escucha los mensajes nuevos de un viaje por Realtime. */
export function subscribeToMessages(
  viajeId: string,
  onInsert: (mensaje: Mensaje) => void,
): () => void {
  const channel = supabase
    .channel(`mensajes-${viajeId}-${Math.random().toString(36).slice(2)}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'mensajes', filter: `viaje_id=eq.${viajeId}` },
      (payload) => onInsert(payload.new as Mensaje),
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
