import type { Sector, Viaje } from '@/types/database';
import type { CreateTripInput, TripFilters, TripListItem } from '@/types/domain';

import { unwrap } from './errors';
import { supabase } from './supabase';

// Columnas del viaje + nombre del sector + nombre del conductor, en una sola consulta.
// "sector:sectores(nombre)" usa la llave foránea viajes.sector_id.
export const TRIP_SELECT = '*, sector:sectores(nombre), conductor:profiles(nombre, apellido)';

export const TRIPS_PAGE_SIZE = 20;

type TripRow = Viaje & {
  sector: { nombre: string } | null;
  conductor: { nombre: string; apellido: string } | null;
};

/** Aplana la respuesta de Supabase al tipo que usa la app. */
export function toTripListItem(row: TripRow): TripListItem {
  const { sector, conductor, ...viaje } = row;
  return {
    ...viaje,
    sector_nombre: sector?.nombre ?? '',
    conductor_nombre: conductor ? `${conductor.nombre} ${conductor.apellido}`.trim() : '',
  };
}

export async function listSectores(): Promise<Sector[]> {
  return unwrap(await supabase.from('sectores').select('*').order('nombre'));
}

type SearchParams = TripFilters & {
  offset: number;
  /** Para no mostrarle a un conductor sus propios viajes en la búsqueda. */
  excludeConductorId?: string;
};

/**
 * Viajes abiertos con salida futura, del más próximo al más lejano, por páginas
 * (paginación por rango, sección 4). Los viajes llenos no aparecen (R6).
 */
export async function searchOpenTrips(params: SearchParams): Promise<TripListItem[]> {
  let query = supabase
    .from('viajes')
    .select(TRIP_SELECT)
    .eq('estado', 'abierto')
    .gt('salida_at', new Date().toISOString());

  if (params.sectorId !== null) query = query.eq('sector_id', params.sectorId);
  if (params.minCupos !== null) query = query.gte('cupos_disponibles', params.minCupos);
  if (params.excludeConductorId) query = query.neq('conductor_id', params.excludeConductorId);

  const rows = unwrap(
    await query
      .order('salida_at', { ascending: true })
      .range(params.offset, params.offset + TRIPS_PAGE_SIZE - 1),
  );
  return (rows as TripRow[]).map(toTripListItem);
}

/** Viajes creados por el conductor, del más reciente al más antiguo (pantalla 19). */
export async function listMyCreatedTrips(conductorId: string): Promise<TripListItem[]> {
  const rows = unwrap(
    await supabase
      .from('viajes')
      .select(TRIP_SELECT)
      .eq('conductor_id', conductorId)
      .order('salida_at', { ascending: false }),
  );
  return (rows as TripRow[]).map(toTripListItem);
}

export async function getTrip(tripId: string): Promise<TripListItem> {
  const row = unwrap(await supabase.from('viajes').select(TRIP_SELECT).eq('id', tripId).single());
  return toTripListItem(row as TripRow);
}

/** Crea un viaje (R4). La base valida capacidad, valor y que sea conductor con carro. */
export async function createTrip(input: CreateTripInput): Promise<TripListItem> {
  const row = unwrap(
    await supabase
      .from('viajes')
      .insert({
        conductor_id: input.conductorId,
        vehiculo_id: input.vehiculoId,
        sector_id: input.sectorId,
        origen_texto: input.origenTexto.trim(),
        origen_lat: input.origenLat,
        origen_lng: input.origenLng,
        destino_texto: input.destinoTexto.trim(),
        destino_lat: input.destinoLat,
        destino_lng: input.destinoLng,
        salida_at: input.salidaAt,
        valor_por_cupo: input.valorPorCupo,
        cupos_totales: input.cuposTotales,
        cupos_disponibles: input.cuposTotales,
      })
      .select(TRIP_SELECT)
      .single(),
  );
  return toTripListItem(row as TripRow);
}

// Ciclo del viaje (R8): cada cambio de estado pasa por una RPC que valida permisos.
export async function startTrip(tripId: string): Promise<void> {
  unwrap(await supabase.rpc('iniciar_viaje', { p_viaje_id: tripId }));
}

export async function finishTrip(tripId: string): Promise<void> {
  unwrap(await supabase.rpc('finalizar_viaje', { p_viaje_id: tripId }));
}

export async function cancelTrip(tripId: string): Promise<void> {
  unwrap(await supabase.rpc('cancelar_viaje', { p_viaje_id: tripId }));
}

/**
 * Escucha por Realtime los cambios en viajes que RLS deja ver a este usuario
 * (cupos, estado). Devuelve la función que cierra el canal.
 * Ojo: si un viaje deja de ser visible (por ejemplo, pasa a 'lleno' para un
 * pasajero sin reserva), Realtime no envía ese último cambio (ver API_CONTRATOS).
 */
export function subscribeToTripChanges(onChange: (viaje: Viaje) => void): () => void {
  const channel = supabase
    .channel(`viajes-${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'viajes' }, (payload) => {
      if (payload.eventType !== 'DELETE') onChange(payload.new as Viaje);
    })
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
