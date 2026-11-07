import type { Notificacion } from '@/types/database';

import { unwrap } from './errors';
import { supabase } from './supabase';

// Las notificaciones las crean triggers de la base (R11); la app solo las lee y
// las marca como leídas.

const PAGE = 50;

export async function listNotifications(userId: string): Promise<Notificacion[]> {
  return unwrap(
    await supabase
      .from('notificaciones')
      .select('*')
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false })
      .limit(PAGE),
  );
}

export async function markAsRead(notificationId: string): Promise<void> {
  unwrap(await supabase.from('notificaciones').update({ leida: true }).eq('id', notificationId));
}

export async function markAllAsRead(userId: string): Promise<void> {
  unwrap(
    await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('usuario_id', userId)
      .eq('leida', false),
  );
}

/** Escucha las notificaciones nuevas de este usuario por Realtime. */
export function subscribeToNotifications(
  userId: string,
  onInsert: (notificacion: Notificacion) => void,
): () => void {
  const channel = supabase
    .channel(`notificaciones-${userId}-${Math.random().toString(36).slice(2)}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notificaciones',
        filter: `usuario_id=eq.${userId}`,
      },
      (payload) => onInsert(payload.new as Notificacion),
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
