// =============================================================================
// types/database.ts — tipos de la base de datos CampusGo
//
// GENERADO CON: supabase gen types typescript --project-id <TU_PROJECT_ID>
//
// ⚠ Este archivo es un placeholder tipado a mano a partir del esquema de la
//   migración 0001. Cuando tengas el proyecto de Supabase creado, reemplázalo
//   ejecutando el comando de arriba y borrando este aviso.
//
// NO edites este archivo a mano en producción: vuelve a generarlo.
// =============================================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nombre: string;
          apellido: string;
          id_universidad: string;
          email: string;
          telefono: string;
          avatar_path: string | null;
          modo_actual: 'pasajero' | 'conductor';
          registro_completo: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          nombre: string;
          apellido: string;
          id_universidad: string;
          email: string;
          telefono: string;
          avatar_path?: string | null;
          modo_actual?: 'pasajero' | 'conductor';
          registro_completo?: boolean;
          created_at?: string;
        };
        Update: {
          nombre?: string;
          apellido?: string;
          telefono?: string;
          avatar_path?: string | null;
          modo_actual?: 'pasajero' | 'conductor';
          registro_completo?: boolean;
        };
      };

      sectores: {
        Row: {
          id: number;
          nombre: string;
        };
        Insert: {
          nombre: string;
        };
        Update: {
          nombre?: string;
        };
      };

      vehiculos: {
        Row: {
          id: string;
          propietario_id: string;
          placa: string;
          capacidad: number;
          marca: string;
          modelo: string;
          foto_path: string | null;
          soat_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          propietario_id: string;
          placa: string;
          capacidad: number;
          marca: string;
          modelo: string;
          foto_path?: string | null;
          soat_path?: string | null;
          created_at?: string;
        };
        Update: {
          placa?: string;
          capacidad?: number;
          marca?: string;
          modelo?: string;
          foto_path?: string | null;
          soat_path?: string | null;
        };
      };

      viajes: {
        Row: {
          id: string;
          conductor_id: string;
          vehiculo_id: string;
          sector_id: number;
          origen_texto: string;
          origen_lat: number;
          origen_lng: number;
          destino_texto: string;
          destino_lat: number;
          destino_lng: number;
          salida_at: string;
          valor_por_cupo: number;
          cupos_totales: number;
          cupos_disponibles: number;
          estado: 'abierto' | 'lleno' | 'en_curso' | 'finalizado' | 'cancelado';
          created_at: string;
        };
        Insert: {
          id?: string;
          conductor_id: string;
          vehiculo_id: string;
          sector_id: number;
          origen_texto: string;
          origen_lat: number;
          origen_lng: number;
          destino_texto: string;
          destino_lat: number;
          destino_lng: number;
          salida_at: string;
          valor_por_cupo?: number;
          cupos_totales: number;
          cupos_disponibles: number;
          estado?: 'abierto' | 'lleno' | 'en_curso' | 'finalizado' | 'cancelado';
          created_at?: string;
        };
        Update: {
          sector_id?: number;
          origen_texto?: string;
          origen_lat?: number;
          origen_lng?: number;
          destino_texto?: string;
          destino_lat?: number;
          destino_lng?: number;
          salida_at?: string;
          valor_por_cupo?: number;
          cupos_totales?: number;
          cupos_disponibles?: number;
          estado?: 'abierto' | 'lleno' | 'en_curso' | 'finalizado' | 'cancelado';
        };
      };

      reservas: {
        Row: {
          id: string;
          viaje_id: string;
          pasajero_id: string;
          punto_recogida_texto: string;
          punto_lat: number;
          punto_lng: number;
          estado: 'pendiente' | 'aceptada' | 'rechazada' | 'cancelada';
          created_at: string;
        };
        Insert: {
          id?: string;
          viaje_id: string;
          pasajero_id: string;
          punto_recogida_texto: string;
          punto_lat: number;
          punto_lng: number;
          estado?: 'pendiente' | 'aceptada' | 'rechazada' | 'cancelada';
          created_at?: string;
        };
        Update: {
          estado?: 'pendiente' | 'aceptada' | 'rechazada' | 'cancelada';
        };
      };

      calificaciones: {
        Row: {
          id: string;
          viaje_id: string;
          autor_id: string;
          destinatario_id: string;
          estrellas: number;
          comentario: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          viaje_id: string;
          autor_id: string;
          destinatario_id: string;
          estrellas: number;
          comentario?: string | null;
          created_at?: string;
        };
        Update: {
          comentario?: string | null;
        };
      };

      notificaciones: {
        Row: {
          id: string;
          usuario_id: string;
          tipo: string;
          titulo: string;
          cuerpo: string;
          datos: Json | null;
          leida: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          tipo: string;
          titulo: string;
          cuerpo: string;
          datos?: Json | null;
          leida?: boolean;
          created_at?: string;
        };
        Update: {
          leida?: boolean;
        };
      };

      mensajes: {
        Row: {
          id: string;
          viaje_id: string;
          autor_id: string;
          contenido: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          viaje_id: string;
          autor_id: string;
          contenido: string;
          created_at?: string;
        };
        Update: never;
      };
    };

    Views: {
      promedio_calificaciones: {
        Row: {
          usuario_id: string;
          promedio: number;
          total: number;
        };
      };
    };

    Functions: {
      cambiar_modo: {
        Args: { p_nuevo_modo: string };
        Returns: void;
      };
      crear_reserva: {
        Args: {
          p_viaje_id: string;
          p_punto_recogida_texto: string;
          p_punto_lat: number;
          p_punto_lng: number;
        };
        Returns: string;
      };
      aceptar_reserva: {
        Args: { p_reserva_id: string };
        Returns: void;
      };
      rechazar_reserva: {
        Args: { p_reserva_id: string };
        Returns: void;
      };
      cancelar_reserva: {
        Args: { p_reserva_id: string };
        Returns: void;
      };
      iniciar_viaje: {
        Args: { p_viaje_id: string };
        Returns: void;
      };
      finalizar_viaje: {
        Args: { p_viaje_id: string };
        Returns: void;
      };
      cancelar_viaje: {
        Args: { p_viaje_id: string };
        Returns: void;
      };
      es_participante_del_viaje: {
        Args: { p_viaje_id: string; p_user_id: string };
        Returns: boolean;
      };
    };

    Enums: {
      modo_usuario: 'pasajero' | 'conductor';
      estado_viaje: 'abierto' | 'lleno' | 'en_curso' | 'finalizado' | 'cancelado';
      estado_reserva: 'pendiente' | 'aceptada' | 'rechazada' | 'cancelada';
    };
  };
}

// ─── Tipos de conveniencia derivados ────────────────────────────────────────

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Profile = Tables<'profiles'>;
export type Sector = Tables<'sectores'>;
export type Vehiculo = Tables<'vehiculos'>;
export type Viaje = Tables<'viajes'>;
export type Reserva = Tables<'reservas'>;
export type Calificacion = Tables<'calificaciones'>;
export type Notificacion = Tables<'notificaciones'>;
export type Mensaje = Tables<'mensajes'>;

export type EstadoViaje = Viaje['estado'];
export type EstadoReserva = Reserva['estado'];
export type ModoUsuario = Profile['modo_actual'];
