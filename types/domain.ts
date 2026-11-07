// Tipos que usa la app por encima de las filas crudas de la base de datos.
// Combinan una fila con datos de otras tablas (por ejemplo, el nombre del sector)
// para que las pantallas no tengan que hacer más consultas.
import type { Reserva, Viaje } from './database';

/** Viaje listo para mostrar en una tarjeta: incluye sector y conductor. */
export type TripListItem = Viaje & {
  sector_nombre: string;
  conductor_nombre: string;
};

/** Reserva con el viaje al que pertenece (null si RLS ya no deja ver el viaje). */
export type ReservationItem = Reserva & {
  viaje: TripListItem | null;
  /** Nombre del pasajero; lo usa el conductor en las solicitudes. */
  pasajero_nombre: string | null;
};

/** Datos para crear un viaje (R4). cupos_disponibles empieza igual a cupos_totales. */
export type CreateTripInput = {
  conductorId: string;
  vehiculoId: string;
  sectorId: number;
  origenTexto: string;
  origenLat: number;
  origenLng: number;
  destinoTexto: string;
  destinoLat: number;
  destinoLng: number;
  salidaAt: string;
  valorPorCupo: number;
  cuposTotales: number;
};

/** Filtros de búsqueda del inicio de pasajero (pantalla 10). */
export type TripFilters = {
  sectorId: number | null;
  minCupos: number | null;
};
