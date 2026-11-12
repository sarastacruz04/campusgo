import type { ModoUsuario, Profile, TablesUpdate } from '@/types/database';

import { ERRORS, unwrap } from './errors';
import { supabase } from './supabase';

// id_universidad se puede completar después si el perfil se creó incompleto (migración 0004).
export type ProfileUpdate = Pick<
  TablesUpdate<'profiles'>,
  'nombre' | 'apellido' | 'id_universidad' | 'telefono' | 'avatar_path' | 'registro_completo'
>;

/**
 * Perfil propio completo. Desde la migración 0009 la tabla profiles solo deja leer
 * nombre, apellido, foto y modo de otras personas (RP-05), y `select('*')` falla;
 * el correo, el teléfono y el ID propios se leen con la función mi_perfil, que
 * usa la sesión del cliente.
 */
export async function getProfile(userId: string): Promise<Profile> {
  const profile = unwrap(await supabase.rpc('mi_perfil').single());
  // Si la sesión del cliente ya no es la del store (otra cuenta), no se mezclan datos.
  if (profile.id !== userId) throw ERRORS.sinSesion;
  return profile;
}

/** Guarda los cambios y vuelve a leer el perfil (sin `select('*')`, por la 0009). */
export async function updateProfile(userId: string, changes: ProfileUpdate): Promise<Profile> {
  unwrap(await supabase.from('profiles').update(changes).eq('id', userId));
  return getProfile(userId);
}

/** Cambia de modo con la RPC cambiar_modo, que exige carro para ser conductor (R3). */
export async function changeMode(modo: ModoUsuario): Promise<void> {
  unwrap(await supabase.rpc('cambiar_modo', { p_nuevo_modo: modo }));
}
