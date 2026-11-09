// Datos de ejemplo SOLO para las pruebas automáticas. La app nunca los usa
// (sección 14: cero datos simulados en la app).
import type { Notificacion, Profile } from '@/types/database';
import type { ReservationItem, TripListItem } from '@/types/domain';

const FUTURE = '2099-01-01T12:00:00.000Z';

export function makeTrip(overrides: Partial<TripListItem> = {}): TripListItem {
  return {
    id: 'viaje-1',
    conductor_id: 'conductor-1',
    vehiculo_id: 'vehiculo-1',
    sector_id: 1,
    origen_texto: 'Colina Campestre',
    origen_lat: 4.7,
    origen_lng: -74.05,
    destino_texto: 'Universidad de La Sabana',
    destino_lat: 4.86,
    destino_lng: -74.03,
    salida_at: FUTURE,
    valor_por_cupo: 5000,
    cupos_totales: 3,
    cupos_disponibles: 3,
    estado: 'abierto',
    created_at: '2026-11-01T10:00:00.000Z',
    sector_nombre: 'Colina',
    conductor_nombre: 'Conductor de prueba',
    ...overrides,
  };
}

export function makeReservation(overrides: Partial<ReservationItem> = {}): ReservationItem {
  return {
    id: 'reserva-1',
    viaje_id: 'viaje-1',
    pasajero_id: 'pasajero-1',
    punto_recogida_texto: 'Portería principal',
    punto_lat: 4.7,
    punto_lng: -74.05,
    estado: 'pendiente',
    created_at: '2026-11-02T10:00:00.000Z',
    viaje: makeTrip(),
    pasajero_nombre: 'Pasajera de prueba',
    ...overrides,
  };
}

export function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'usuario-1',
    nombre: 'Persona',
    apellido: 'De Prueba',
    id_universidad: '0000000001',
    email: 'prueba@unisabana.edu.co',
    telefono: '3000000000',
    avatar_path: null,
    modo_actual: 'pasajero',
    registro_completo: true,
    created_at: '2026-11-01T10:00:00.000Z',
    ...overrides,
  };
}

export function makeNotification(overrides: Partial<Notificacion> = {}): Notificacion {
  return {
    id: 'notificacion-1',
    usuario_id: 'usuario-1',
    tipo: 'reserva_aceptada',
    titulo: 'Reserva aceptada',
    cuerpo: '¡Tu reserva fue aceptada!',
    datos: null,
    leida: false,
    created_at: '2026-11-02T10:00:00.000Z',
    ...overrides,
  };
}

/** Promesa que se resuelve cuando la prueba decide (para simular respuestas lentas). */
export function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}
