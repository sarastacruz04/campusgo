// =============================================================================
// types/database.ts — tipos de la base de datos de CampusGo
//
// Escrito a mano con la misma forma que produce
//   npx supabase gen types typescript --project-id <PROJECT_ID> > types/database.ts
// a partir de supabase/migrations/0001_schema_inicial.sql (D-28 y D-32).
//
// Diferencias a propósito con el archivo generado:
// - Las columnas de estado y modo usan uniones de texto ('abierto' | 'lleno' | …)
//   en lugar de `string`, porque en la base son TEXT con CHECK y así TypeScript
//   detecta un estado mal escrito. Si se regenera el archivo, hay que volver a
//   poner estas uniones (o convertir esas columnas en enums de Postgres).
// - `Relationships` sale de las llaves foráneas de la migración; supabase-js las
//   usa para tipar las consultas con joins (por ejemplo, viaje + sector).
// =============================================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type ModoUsuarioDb = 'pasajero' | 'conductor';
type EstadoViajeDb = 'abierto' | 'lleno' | 'en_curso' | 'finalizado' | 'cancelado';
type EstadoReservaDb = 'pendiente' | 'aceptada' | 'rechazada' | 'cancelada';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nombre: string;
          apellido: string;
          // NULL mientras registro_completo = false (migración 0004).
          id_universidad: string | null;
          email: string;
          telefono: string | null;
          avatar_path: string | null;
          modo_actual: ModoUsuarioDb;
          registro_completo: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          nombre: string;
          apellido: string;
          id_universidad?: string | null;
          email: string;
          telefono?: string | null;
          avatar_path?: string | null;
          modo_actual?: ModoUsuarioDb;
          registro_completo?: boolean;
          created_at?: string;
        };
        Update: {
          id_universidad?: string | null;
          nombre?: string;
          apellido?: string;
          telefono?: string | null;
          avatar_path?: string | null;
          modo_actual?: ModoUsuarioDb;
          registro_completo?: boolean;
        };
        Relationships: [];
      };

      sectores: {
        Row: { id: number; nombre: string };
        Insert: { nombre: string };
        Update: { nombre?: string };
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: 'vehiculos_propietario_id_fkey';
            columns: ['propietario_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
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
          estado: EstadoViajeDb;
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
          estado?: EstadoViajeDb;
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
          estado?: EstadoViajeDb;
        };
        Relationships: [
          {
            foreignKeyName: 'viajes_conductor_id_fkey';
            columns: ['conductor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'viajes_vehiculo_id_fkey';
            columns: ['vehiculo_id'];
            isOneToOne: false;
            referencedRelation: 'vehiculos';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'viajes_sector_id_fkey';
            columns: ['sector_id'];
            isOneToOne: false;
            referencedRelation: 'sectores';
            referencedColumns: ['id'];
          },
        ];
      };

      reservas: {
        Row: {
          id: string;
          viaje_id: string;
          pasajero_id: string;
          punto_recogida_texto: string;
          punto_lat: number;
          punto_lng: number;
          estado: EstadoReservaDb;
          created_at: string;
        };
        Insert: {
          id?: string;
          viaje_id: string;
          pasajero_id: string;
          punto_recogida_texto: string;
          punto_lat: number;
          punto_lng: number;
          estado?: EstadoReservaDb;
          created_at?: string;
        };
        Update: { estado?: EstadoReservaDb };
        Relationships: [
          {
            foreignKeyName: 'reservas_viaje_id_fkey';
            columns: ['viaje_id'];
            isOneToOne: false;
            referencedRelation: 'viajes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reservas_pasajero_id_fkey';
            columns: ['pasajero_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
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
        Update: { comentario?: string | null };
        Relationships: [
          {
            foreignKeyName: 'calificaciones_viaje_id_fkey';
            columns: ['viaje_id'];
            isOneToOne: false;
            referencedRelation: 'viajes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'calificaciones_autor_id_fkey';
            columns: ['autor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'calificaciones_destinatario_id_fkey';
            columns: ['destinatario_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
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
        Update: { leida?: boolean };
        Relationships: [
          {
            foreignKeyName: 'notificaciones_usuario_id_fkey';
            columns: ['usuario_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
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
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: 'mensajes_viaje_id_fkey';
            columns: ['viaje_id'];
            isOneToOne: false;
            referencedRelation: 'viajes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mensajes_autor_id_fkey';
            columns: ['autor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };

    Views: {
      promedio_calificaciones: {
        Row: {
          usuario_id: string;
          promedio: number;
          total: number;
        };
        Relationships: [];
      };
    };

    Functions: {
      cambiar_modo: {
        Args: { p_nuevo_modo: string };
        Returns: undefined;
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
      aceptar_reserva: { Args: { p_reserva_id: string }; Returns: undefined };
      rechazar_reserva: { Args: { p_reserva_id: string }; Returns: undefined };
      cancelar_reserva: { Args: { p_reserva_id: string }; Returns: undefined };
      iniciar_viaje: { Args: { p_viaje_id: string }; Returns: undefined };
      finalizar_viaje: { Args: { p_viaje_id: string }; Returns: undefined };
      cancelar_viaje: { Args: { p_viaje_id: string }; Returns: undefined };
      es_participante_del_viaje: {
        Args: { p_viaje_id: string; p_user_id: string };
        Returns: boolean;
      };
      // Perfil propio completo (migración 0009): devuelve 0 o 1 fila.
      mi_perfil: {
        Args: Record<string, never>;
        Returns: Database['public']['Tables']['profiles']['Row'][];
      };
    };

    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// ─── Tipos de conveniencia ──────────────────────────────────────────────────

type PublicSchema = Database['public'];

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update'];

export type Profile = Tables<'profiles'>;
export type Sector = Tables<'sectores'>;
export type Vehiculo = Tables<'vehiculos'>;
export type Viaje = Tables<'viajes'>;
export type Reserva = Tables<'reservas'>;
export type Calificacion = Tables<'calificaciones'>;
export type Notificacion = Tables<'notificaciones'>;
export type Mensaje = Tables<'mensajes'>;
export type PromedioCalificacion = PublicSchema['Views']['promedio_calificaciones']['Row'];

export type EstadoViaje = EstadoViajeDb;
export type EstadoReserva = EstadoReservaDb;
export type ModoUsuario = ModoUsuarioDb;
