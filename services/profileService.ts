import type { ModoUsuario, Profile, TablesUpdate } from '@/types/database';

import { unwrap } from './errors';
import { supabase } from './supabase';

// id_universidad se puede completar después si el perfil se creó incompleto (migración 0004).
export type ProfileUpdate = Pick<
  TablesUpdate<'profiles'>,
  'nombre' | 'apellido' | 'id_universidad' | 'telefono' | 'avatar_path' | 'registro_completo'
>;

export async function getProfile(userId: string): Promise<Profile> {
  return unwrap(await supabase.from('profiles').select('*').eq('id', userId).single());
}

export async function updateProfile(userId: string, changes: ProfileUpdate): Promise<Profile> {
  return unwrap(
    await supabase.from('profiles').update(changes).eq('id', userId).select('*').single(),
  );
}

/** Cambia de modo con la RPC cambiar_modo, que exige carro para ser conductor (R3). */
export async function changeMode(modo: ModoUsuario): Promise<void> {
  unwrap(await supabase.rpc('cambiar_modo', { p_nuevo_modo: modo }));
}
