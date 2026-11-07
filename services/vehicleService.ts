import type { TablesInsert, TablesUpdate, Vehiculo } from '@/types/database';

import { unwrap } from './errors';
import { supabase } from './supabase';

/** Carro del usuario; null si no tiene (un carro por conductor). */
export async function getMyVehicle(userId: string): Promise<Vehiculo | null> {
  return unwrap(
    await supabase.from('vehiculos').select('*').eq('propietario_id', userId).maybeSingle(),
  );
}

export async function createVehicle(input: TablesInsert<'vehiculos'>): Promise<Vehiculo> {
  return unwrap(
    await supabase
      .from('vehiculos')
      // La placa se guarda en mayúsculas: el CHECK de la base exige ^[A-Z]{3}[0-9]{3}$.
      .insert({ ...input, placa: input.placa.trim().toUpperCase() })
      .select('*')
      .single(),
  );
}

export async function updateVehicle(
  vehicleId: string,
  changes: TablesUpdate<'vehiculos'>,
): Promise<Vehiculo> {
  return unwrap(
    await supabase.from('vehiculos').update(changes).eq('id', vehicleId).select('*').single(),
  );
}

export async function deleteVehicle(vehicleId: string): Promise<void> {
  unwrap(await supabase.from('vehiculos').delete().eq('id', vehicleId));
}
