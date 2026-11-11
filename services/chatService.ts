import type { Mensaje } from '@/types/database';

import { unwrap } from './errors';
import { supabase } from './supabase';

// Chat del viaje (R10). RLS deja leer y escribir solo al conductor y a los
// pasajeros con reserva aceptada, mientras el viaje no esté cancelado.

export const MAX_MESSAGE_LENGTH = 500;

/** Nombre visible de cada autor, por id: { "uuid": "Miguel Ordóñez" }. */
export type AuthorNames = Record<string, string>;

/**
 * true si el usuario es el conductor o un pasajero aceptado del viaje. Usa la
 * misma función de la base de datos que las políticas de mensajes, para que la
 * app y RLS decidan igual. Hace falta porque RLS no da error a un ajeno: solo le
 * devuelve cero filas, y la pantalla no podría distinguir "sin acceso" de "sin mensajes".
 */
export async function isParticipant(viajeId: string, userId: string): Promise<boolean> {
  return unwrap(
    await supabase.rpc('es_participante_del_viaje', { p_viaje_id: viajeId, p_user_id: userId }),
  );
}

/** Mensajes del viaje, del más antiguo al más nuevo, con el nombre de cada autor. */
export async function listMessages(
  viajeId: string,
): Promise<{ messages: Mensaje[]; authorNames: AuthorNames }> {
  const rows = unwrap(
    await supabase
      .from('mensajes')
      .select('*, autor:profiles(nombre, apellido)')
      .eq('viaje_id', viajeId)
      .order('created_at', { ascending: true }),
  );
  const authorNames: AuthorNames = {};
  const messages = rows.map(({ autor, ...mensaje }) => {
    if (autor) authorNames[mensaje.autor_id] = `${autor.nombre} ${autor.apellido}`.trim();
    return mensaje;
  });
  return { messages, authorNames };
}

/**
 * Nombres de autores que todavía no se conocen. Pasa cuando llega por Realtime el
 * mensaje de alguien que no había escrito antes: el evento trae solo la fila cruda.
 */
export async function getAuthorNames(ids: string[]): Promise<AuthorNames> {
  const rows = unwrap(await supabase.from('profiles').select('id, nombre, apellido').in('id', ids));
  return Object.fromEntries(rows.map((row) => [row.id, `${row.nombre} ${row.apellido}`.trim()]));
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
