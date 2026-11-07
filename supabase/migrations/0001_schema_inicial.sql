-- =============================================================================
-- Migración 0001: esquema inicial de CampusGo
-- Autor: Samuel Borda
-- Fecha: 2026-11-06
--
-- Crea todas las tablas, índices, vistas, funciones RPC, triggers y políticas
-- RLS del modelo de datos (sección 5 de la especificación).
-- Aplica en el SQL Editor de Supabase o con la CLI.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensiones necesarias
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1. Tabla profiles
--    Fila creada automáticamente por el trigger handle_new_user al registrarse.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id               UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre           TEXT        NOT NULL,
  apellido         TEXT        NOT NULL,
  -- ID universitario de exactamente 10 dígitos
  id_universidad   TEXT        NOT NULL UNIQUE CHECK (id_universidad ~ '^[0-9]{10}$'),
  -- Solo correos institucionales
  email            TEXT        NOT NULL UNIQUE CHECK (email ~ '@unisabana\.edu\.co$'),
  -- Teléfono de exactamente 10 dígitos
  telefono         TEXT        NOT NULL CHECK (telefono ~ '^[0-9]{10}$'),
  avatar_path      TEXT,
  -- Modo en el que el usuario trabaja actualmente dentro de la app
  modo_actual      TEXT        NOT NULL DEFAULT 'pasajero' CHECK (modo_actual IN ('pasajero', 'conductor')),
  -- Indica si el usuario completó todos los pasos del registro
  registro_completo BOOLEAN    NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.profiles IS 'Perfil público de cada usuario; espeja auth.users y se crea automáticamente.';
COMMENT ON COLUMN public.profiles.id_universidad IS 'Identificador universitario de 10 dígitos, único por persona.';
COMMENT ON COLUMN public.profiles.email          IS 'Debe terminar en @unisabana.edu.co; la restricción también vive en Auth.';
COMMENT ON COLUMN public.profiles.modo_actual    IS 'pasajero o conductor; cambiar a conductor exige vehículo registrado.';

-- ---------------------------------------------------------------------------
-- 2. Tabla sectores
--    Semilla en seed.sql. Zonas de origen de los viajes.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sectores (
  id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre TEXT   NOT NULL UNIQUE
);

COMMENT ON TABLE public.sectores IS 'Zonas geográficas predefinidas de origen de los viajes.';

-- ---------------------------------------------------------------------------
-- 3. Tabla vehiculos
--    Un vehículo por conductor (restricción UNIQUE en propietario_id).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vehiculos (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  propietario_id UUID        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Placa colombiana: 3 letras mayúsculas + 3 dígitos
  placa          TEXT        NOT NULL UNIQUE CHECK (placa ~ '^[A-Z]{3}[0-9]{3}$'),
  -- Capacidad de pasajeros (sin contar al conductor)
  capacidad      INTEGER     NOT NULL CHECK (capacidad BETWEEN 1 AND 8),
  marca          TEXT        NOT NULL,
  modelo         TEXT        NOT NULL,
  foto_path      TEXT,
  soat_path      TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.vehiculos  IS 'Vehículo registrado por un conductor; máximo uno por usuario.';
COMMENT ON COLUMN public.vehiculos.placa     IS 'Formato colombiano: 3 letras mayúsculas + 3 dígitos. Ej: ABC123.';
COMMENT ON COLUMN public.vehiculos.capacidad IS 'Cupos de pasajeros disponibles (sin incluir al conductor).';

-- ---------------------------------------------------------------------------
-- 4. Tabla viajes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.viajes (
  id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  conductor_id       UUID        NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
  vehiculo_id        UUID        NOT NULL REFERENCES public.vehiculos(id)  ON DELETE CASCADE,
  sector_id          BIGINT      NOT NULL REFERENCES public.sectores(id)   ON DELETE RESTRICT,
  origen_texto       TEXT        NOT NULL,
  origen_lat         DOUBLE PRECISION NOT NULL,
  origen_lng         DOUBLE PRECISION NOT NULL,
  destino_texto      TEXT        NOT NULL,
  destino_lat        DOUBLE PRECISION NOT NULL,
  destino_lng        DOUBLE PRECISION NOT NULL,
  salida_at          TIMESTAMPTZ NOT NULL,
  -- Valor de referencia por cupo en COP; la app no procesa pagos
  valor_por_cupo     INTEGER     NOT NULL DEFAULT 0 CHECK (valor_por_cupo >= 0),
  cupos_totales      INTEGER     NOT NULL CHECK (cupos_totales BETWEEN 1 AND 8),
  cupos_disponibles  INTEGER     NOT NULL CHECK (cupos_disponibles >= 0),
  estado             TEXT        NOT NULL DEFAULT 'abierto'
                     CHECK (estado IN ('abierto', 'lleno', 'en_curso', 'finalizado', 'cancelado')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- cupos_disponibles nunca supera cupos_totales
  CONSTRAINT cupos_coherentes CHECK (cupos_disponibles <= cupos_totales)
);

COMMENT ON TABLE  public.viajes IS 'Viaje creado por un conductor; pasa por estados abierto→lleno→en_curso→finalizado.';
COMMENT ON COLUMN public.viajes.cupos_disponibles IS 'Se decrementa al aceptar una reserva; a 0 el viaje pasa a lleno automáticamente.';
COMMENT ON COLUMN public.viajes.valor_por_cupo    IS 'Referencia de precio en COP; el pago ocurre fuera de la app.';

-- ---------------------------------------------------------------------------
-- 5. Tabla reservas
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reservas (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  viaje_id             UUID        NOT NULL REFERENCES public.viajes(id)   ON DELETE CASCADE,
  pasajero_id          UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  punto_recogida_texto TEXT        NOT NULL,
  punto_lat            DOUBLE PRECISION NOT NULL,
  punto_lng            DOUBLE PRECISION NOT NULL,
  estado               TEXT        NOT NULL DEFAULT 'pendiente'
                       CHECK (estado IN ('pendiente', 'aceptada', 'rechazada', 'cancelada')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Un pasajero solo puede reservar una vez por viaje
  CONSTRAINT reserva_unica UNIQUE (viaje_id, pasajero_id)
);

COMMENT ON TABLE public.reservas IS 'Solicitud de un pasajero para unirse a un viaje; el conductor acepta o rechaza.';

-- ---------------------------------------------------------------------------
-- 6. Tabla calificaciones
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.calificaciones (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  viaje_id        UUID        NOT NULL REFERENCES public.viajes(id)   ON DELETE CASCADE,
  autor_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  destinatario_id UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  estrellas       INTEGER     NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
  -- Comentario libre pero acotado para evitar abuso
  comentario      TEXT        CHECK (char_length(comentario) <= 280),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Cada par (viaje, autor, destinatario) solo califica una vez
  CONSTRAINT calificacion_unica UNIQUE (viaje_id, autor_id, destinatario_id)
);

COMMENT ON TABLE public.calificaciones IS 'Calificación de 1-5 estrellas entre conductor y pasajero al finalizar el viaje.';

-- Vista auxiliar: promedio y total de calificaciones por usuario
CREATE OR REPLACE VIEW public.promedio_calificaciones AS
  SELECT
    destinatario_id AS usuario_id,
    ROUND(AVG(estrellas)::NUMERIC, 2) AS promedio,
    COUNT(*)                           AS total
  FROM public.calificaciones
  GROUP BY destinatario_id;

COMMENT ON VIEW public.promedio_calificaciones IS 'Promedio y conteo de estrellas por usuario destinatario.';

-- ---------------------------------------------------------------------------
-- 7. Tabla notificaciones
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Tipo libre para que la app decida el ícono; ej: 'reserva_aceptada', 'viaje_cancelado'
  tipo       TEXT        NOT NULL,
  titulo     TEXT        NOT NULL,
  cuerpo     TEXT        NOT NULL,
  -- Datos adicionales en formato JSON para la navegación en la app
  datos      JSONB,
  leida      BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.notificaciones IS 'Notificaciones internas creadas por triggers; se entregan por Realtime.';

-- ---------------------------------------------------------------------------
-- 8. Tabla mensajes (chat del viaje)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mensajes (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  viaje_id   UUID        NOT NULL REFERENCES public.viajes(id)   ON DELETE CASCADE,
  autor_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contenido  TEXT        NOT NULL CHECK (char_length(contenido) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.mensajes IS 'Mensajes del chat de un viaje; solo conductor y pasajeros con reserva aceptada.';

-- ---------------------------------------------------------------------------
-- 9. Índices de rendimiento (R14)
-- ---------------------------------------------------------------------------
-- Búsqueda principal de viajes por estado y fecha de salida
CREATE INDEX IF NOT EXISTS idx_viajes_estado_salida   ON public.viajes (estado, salida_at);
-- Filtro por sector en la pantalla de pasajero
CREATE INDEX IF NOT EXISTS idx_viajes_sector          ON public.viajes (sector_id);
-- Listar reservas de un viaje (conductor y pasajero)
CREATE INDEX IF NOT EXISTS idx_reservas_viaje         ON public.reservas (viaje_id);
-- Listar reservas de un pasajero filtradas por estado
CREATE INDEX IF NOT EXISTS idx_reservas_pasajero_est  ON public.reservas (pasajero_id, estado);
-- Chat paginado por fecha ascendente dentro de un viaje
CREATE INDEX IF NOT EXISTS idx_mensajes_viaje_fecha   ON public.mensajes (viaje_id, created_at);
-- Bandeja de notificaciones no leídas de un usuario
CREATE INDEX IF NOT EXISTS idx_notif_usuario_leida    ON public.notificaciones (usuario_id, leida);

-- =============================================================================
-- FUNCIONES Y TRIGGERS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 10. Trigger: handle_new_user (R2)
--     Al crear un usuario en Auth, crea su fila en profiles con los datos
--     que la app envía en raw_user_meta_data al momento del registro.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
-- search_path fijo para evitar inyección de esquema (R13)
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    nombre,
    apellido,
    id_universidad,
    email,
    telefono,
    modo_actual,
    registro_completo
  )
  VALUES (
    NEW.id,
    -- raw_user_meta_data viene del signUp de la app
    COALESCE(NEW.raw_user_meta_data->>'nombre',         ''),
    COALESCE(NEW.raw_user_meta_data->>'apellido',       ''),
    COALESCE(NEW.raw_user_meta_data->>'id_universidad', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'telefono',       ''),
    'pasajero',
    FALSE
  );
  RETURN NEW;
END;
$$;

-- Dispara después de cada INSERT en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 11. Función auxiliar: es_participante_del_viaje
--     Devuelve TRUE si el usuario es el conductor o tiene reserva aceptada.
--     La usan múltiples triggers y políticas para evitar duplicar lógica.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.es_participante_del_viaje(p_viaje_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.viajes WHERE id = p_viaje_id AND conductor_id = p_user_id
    UNION ALL
    SELECT 1 FROM public.reservas
    WHERE viaje_id = p_viaje_id AND pasajero_id = p_user_id AND estado = 'aceptada'
  );
$$;

-- ---------------------------------------------------------------------------
-- 12. Función auxiliar: crear_notificacion
--     Centraliza la inserción de notificaciones desde los triggers.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crear_notificacion(
  p_usuario_id UUID,
  p_tipo       TEXT,
  p_titulo     TEXT,
  p_cuerpo     TEXT,
  p_datos      JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notificaciones (usuario_id, tipo, titulo, cuerpo, datos)
  VALUES (p_usuario_id, p_tipo, p_titulo, p_cuerpo, p_datos);
END;
$$;

-- ---------------------------------------------------------------------------
-- 13. Trigger: notificar_nueva_reserva (R11)
--     Cuando un pasajero crea una reserva, notifica al conductor del viaje.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_notificar_nueva_reserva()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conductor UUID;
  v_pasajero  TEXT;
BEGIN
  -- Obtener el conductor del viaje
  SELECT conductor_id INTO v_conductor FROM public.viajes WHERE id = NEW.viaje_id;
  -- Nombre del pasajero para el mensaje
  SELECT nombre || ' ' || apellido INTO v_pasajero FROM public.profiles WHERE id = NEW.pasajero_id;

  PERFORM public.crear_notificacion(
    v_conductor,
    'nueva_reserva',
    'Nueva solicitud de reserva',
    v_pasajero || ' quiere unirse a tu viaje.',
    jsonb_build_object('viaje_id', NEW.viaje_id, 'reserva_id', NEW.id)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_notificar_nueva_reserva ON public.reservas;
CREATE TRIGGER tg_notificar_nueva_reserva
  AFTER INSERT ON public.reservas
  FOR EACH ROW EXECUTE FUNCTION public.fn_notificar_nueva_reserva();

-- ---------------------------------------------------------------------------
-- 14. Trigger: notificar_cambio_reserva (R11)
--     Cuando el conductor acepta o rechaza una reserva, notifica al pasajero.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_notificar_cambio_reserva()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_titulo TEXT;
  v_cuerpo TEXT;
BEGIN
  -- Solo reaccionamos ante cambios de estado relevantes
  IF NEW.estado = 'aceptada' THEN
    v_titulo := 'Reserva aceptada';
    v_cuerpo := '¡Tu reserva fue aceptada! Revisa los detalles del viaje.';
  ELSIF NEW.estado = 'rechazada' THEN
    v_titulo := 'Reserva rechazada';
    v_cuerpo := 'El conductor rechazó tu solicitud de reserva.';
  ELSE
    RETURN NEW;
  END IF;

  PERFORM public.crear_notificacion(
    NEW.pasajero_id,
    'reserva_' || NEW.estado,
    v_titulo,
    v_cuerpo,
    jsonb_build_object('viaje_id', NEW.viaje_id, 'reserva_id', NEW.id)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_notificar_cambio_reserva ON public.reservas;
CREATE TRIGGER tg_notificar_cambio_reserva
  AFTER UPDATE OF estado ON public.reservas
  FOR EACH ROW
  WHEN (OLD.estado IS DISTINCT FROM NEW.estado)
  EXECUTE FUNCTION public.fn_notificar_cambio_reserva();

-- ---------------------------------------------------------------------------
-- 15. Trigger: notificar_cambio_viaje (R11)
--     Cuando el conductor cambia el estado del viaje, notifica a los pasajeros
--     con reserva aceptada. También cancela reservas pendientes si el viaje
--     se cancela (R8).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_notificar_cambio_viaje()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_titulo TEXT;
  v_cuerpo TEXT;
  v_tipo   TEXT;
  v_pasajero RECORD;
BEGIN
  IF NEW.estado = 'en_curso' THEN
    v_tipo   := 'viaje_iniciado';
    v_titulo := 'Viaje iniciado';
    v_cuerpo := 'El conductor inició el viaje. ¡Buen trayecto!';
  ELSIF NEW.estado = 'finalizado' THEN
    v_tipo   := 'viaje_finalizado';
    v_titulo := 'Viaje finalizado';
    v_cuerpo := 'El viaje terminó. Puedes calificar tu experiencia.';
  ELSIF NEW.estado = 'cancelado' THEN
    v_tipo   := 'viaje_cancelado';
    v_titulo := 'Viaje cancelado';
    v_cuerpo := 'El conductor canceló el viaje. Busca otra opción.';
    -- Cancelar también las reservas pendientes y aceptadas (R8)
    UPDATE public.reservas
    SET estado = 'cancelada'
    WHERE viaje_id = NEW.id AND estado IN ('pendiente', 'aceptada');
  ELSE
    RETURN NEW;
  END IF;

  -- Notificar a todos los pasajeros con reserva aceptada
  FOR v_pasajero IN
    SELECT pasajero_id FROM public.reservas
    WHERE viaje_id = NEW.id AND estado = 'aceptada'
  LOOP
    PERFORM public.crear_notificacion(
      v_pasajero.pasajero_id,
      v_tipo,
      v_titulo,
      v_cuerpo,
      jsonb_build_object('viaje_id', NEW.id)
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_notificar_cambio_viaje ON public.viajes;
CREATE TRIGGER tg_notificar_cambio_viaje
  AFTER UPDATE OF estado ON public.viajes
  FOR EACH ROW
  WHEN (OLD.estado IS DISTINCT FROM NEW.estado)
  EXECUTE FUNCTION public.fn_notificar_cambio_viaje();

-- ---------------------------------------------------------------------------
-- 16. Trigger: notificar_mensaje_nuevo (R11)
--     Cuando se envía un mensaje en el chat, notifica a los otros participantes.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_notificar_mensaje_nuevo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_autor_nombre TEXT;
  v_conductor    UUID;
  v_dest         RECORD;
BEGIN
  SELECT nombre || ' ' || apellido INTO v_autor_nombre
  FROM public.profiles WHERE id = NEW.autor_id;

  SELECT conductor_id INTO v_conductor FROM public.viajes WHERE id = NEW.viaje_id;

  -- Notificar al conductor si no es él quien escribe
  IF v_conductor <> NEW.autor_id THEN
    PERFORM public.crear_notificacion(
      v_conductor,
      'mensaje_nuevo',
      'Nuevo mensaje en el chat',
      v_autor_nombre || ': ' || LEFT(NEW.contenido, 60),
      jsonb_build_object('viaje_id', NEW.viaje_id)
    );
  END IF;

  -- Notificar a los demás pasajeros con reserva aceptada
  FOR v_dest IN
    SELECT pasajero_id FROM public.reservas
    WHERE viaje_id = NEW.viaje_id AND estado = 'aceptada' AND pasajero_id <> NEW.autor_id
  LOOP
    PERFORM public.crear_notificacion(
      v_dest.pasajero_id,
      'mensaje_nuevo',
      'Nuevo mensaje en el chat',
      v_autor_nombre || ': ' || LEFT(NEW.contenido, 60),
      jsonb_build_object('viaje_id', NEW.viaje_id)
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_notificar_mensaje_nuevo ON public.mensajes;
CREATE TRIGGER tg_notificar_mensaje_nuevo
  AFTER INSERT ON public.mensajes
  FOR EACH ROW EXECUTE FUNCTION public.fn_notificar_mensaje_nuevo();

-- =============================================================================
-- FUNCIONES RPC
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 17. RPC: cambiar_modo (R3)
--     Cambia el modo_actual del usuario autenticado.
--     Exige vehículo registrado para pasar a 'conductor'.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cambiar_modo(p_nuevo_modo TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  -- Validar valor del modo
  IF p_nuevo_modo NOT IN ('pasajero', 'conductor') THEN
    RAISE EXCEPTION 'modo_invalido' USING
      HINT = 'El modo debe ser pasajero o conductor.';
  END IF;

  -- Para ser conductor se necesita vehículo (R3)
  IF p_nuevo_modo = 'conductor' THEN
    IF NOT EXISTS (SELECT 1 FROM public.vehiculos WHERE propietario_id = v_user_id) THEN
      RAISE EXCEPTION 'sin_vehiculo' USING
        HINT = 'Debes registrar un vehículo antes de cambiar a modo conductor.';
    END IF;
  END IF;

  UPDATE public.profiles SET modo_actual = p_nuevo_modo WHERE id = v_user_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- 18. RPC: crear_reserva (R5)
--     Crea una reserva verificando todas las reglas de negocio.
--     Transaccional: en caso de error no queda nada en la BD.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crear_reserva(
  p_viaje_id             UUID,
  p_punto_recogida_texto TEXT,
  p_punto_lat            DOUBLE PRECISION,
  p_punto_lng            DOUBLE PRECISION
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_viaje   public.viajes;
  v_nueva_id UUID;
BEGIN
  -- Leer el viaje bloqueando la fila para evitar condiciones de carrera
  SELECT * INTO v_viaje FROM public.viajes WHERE id = p_viaje_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'viaje_no_encontrado' USING
      HINT = 'El viaje solicitado no existe.';
  END IF;

  -- No puedes reservar tu propio viaje
  IF v_viaje.conductor_id = v_user_id THEN
    RAISE EXCEPTION 'reserva_propia' USING
      HINT = 'No puedes reservar tu propio viaje.';
  END IF;

  -- El viaje debe estar abierto con cupos y salida futura (R5)
  IF v_viaje.estado <> 'abierto' THEN
    RAISE EXCEPTION 'viaje_no_abierto' USING
      HINT = 'Este viaje ya no acepta reservas.';
  END IF;

  IF v_viaje.cupos_disponibles <= 0 THEN
    RAISE EXCEPTION 'sin_cupos' USING
      HINT = 'No quedan cupos disponibles en este viaje.';
  END IF;

  IF v_viaje.salida_at <= NOW() THEN
    RAISE EXCEPTION 'viaje_pasado' USING
      HINT = 'La hora de salida ya pasó.';
  END IF;

  -- Reserva duplicada
  IF EXISTS (
    SELECT 1 FROM public.reservas
    WHERE viaje_id = p_viaje_id AND pasajero_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'reserva_duplicada' USING
      HINT = 'Ya tienes una reserva en este viaje.';
  END IF;

  INSERT INTO public.reservas (viaje_id, pasajero_id, punto_recogida_texto, punto_lat, punto_lng)
  VALUES (p_viaje_id, v_user_id, p_punto_recogida_texto, p_punto_lat, p_punto_lng)
  RETURNING id INTO v_nueva_id;

  RETURN v_nueva_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- 19. RPC: aceptar_reserva (R6)
--     Acepta una reserva, descuenta un cupo y cierra el viaje si es necesario.
--     Transaccional con bloqueo de fila para evitar sobrepasar los cupos.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.aceptar_reserva(p_reserva_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_reserva public.reservas;
  v_viaje   public.viajes;
BEGIN
  SELECT * INTO v_reserva FROM public.reservas WHERE id = p_reserva_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'reserva_no_encontrada';
  END IF;

  -- Bloquear el viaje para evitar condición de carrera en los cupos
  SELECT * INTO v_viaje FROM public.viajes WHERE id = v_reserva.viaje_id FOR UPDATE;

  -- Solo el conductor del viaje puede aceptar reservas (R6)
  IF v_viaje.conductor_id <> v_user_id THEN
    RAISE EXCEPTION 'sin_permiso' USING
      HINT = 'Solo el conductor del viaje puede aceptar reservas.';
  END IF;

  IF v_reserva.estado <> 'pendiente' THEN
    RAISE EXCEPTION 'reserva_no_pendiente' USING
      HINT = 'Solo se pueden aceptar reservas pendientes.';
  END IF;

  IF v_viaje.cupos_disponibles <= 0 THEN
    RAISE EXCEPTION 'sin_cupos' USING
      HINT = 'No quedan cupos disponibles en el viaje.';
  END IF;

  -- Marcar la reserva como aceptada
  UPDATE public.reservas SET estado = 'aceptada' WHERE id = p_reserva_id;

  -- Descontar cupo y cerrar el viaje si se llenó (R6, cierre automático R15 checklist)
  UPDATE public.viajes
  SET
    cupos_disponibles = cupos_disponibles - 1,
    -- Si llega a 0 el viaje pasa a 'lleno' y deja de aparecer en la búsqueda
    estado = CASE WHEN cupos_disponibles - 1 = 0 THEN 'lleno' ELSE estado END
  WHERE id = v_viaje.id;
END;
$$;

-- ---------------------------------------------------------------------------
-- 20. RPC: rechazar_reserva (R6)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rechazar_reserva(p_reserva_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_reserva public.reservas;
  v_viaje   public.viajes;
BEGIN
  SELECT * INTO v_reserva FROM public.reservas WHERE id = p_reserva_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'reserva_no_encontrada';
  END IF;

  SELECT * INTO v_viaje FROM public.viajes WHERE id = v_reserva.viaje_id;

  IF v_viaje.conductor_id <> v_user_id THEN
    RAISE EXCEPTION 'sin_permiso' USING
      HINT = 'Solo el conductor del viaje puede rechazar reservas.';
  END IF;

  IF v_reserva.estado <> 'pendiente' THEN
    RAISE EXCEPTION 'reserva_no_pendiente';
  END IF;

  UPDATE public.reservas SET estado = 'rechazada' WHERE id = p_reserva_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- 21. RPC: cancelar_reserva (R7)
--     Solo el pasajero puede cancelar su reserva.
--     Si estaba aceptada, devuelve el cupo y el viaje 'lleno' vuelve a 'abierto'.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cancelar_reserva(p_reserva_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id    UUID := auth.uid();
  v_reserva    public.reservas;
  v_era_aceptada BOOLEAN;
BEGIN
  SELECT * INTO v_reserva FROM public.reservas WHERE id = p_reserva_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'reserva_no_encontrada';
  END IF;

  IF v_reserva.pasajero_id <> v_user_id THEN
    RAISE EXCEPTION 'sin_permiso' USING
      HINT = 'Solo el pasajero puede cancelar su propia reserva.';
  END IF;

  IF v_reserva.estado NOT IN ('pendiente', 'aceptada') THEN
    RAISE EXCEPTION 'reserva_no_cancelable';
  END IF;

  v_era_aceptada := (v_reserva.estado = 'aceptada');

  UPDATE public.reservas SET estado = 'cancelada' WHERE id = p_reserva_id;

  -- Si la reserva estaba aceptada, devolver el cupo (R7)
  IF v_era_aceptada THEN
    UPDATE public.viajes
    SET
      cupos_disponibles = cupos_disponibles + 1,
      -- Si el viaje estaba 'lleno', vuelve a 'abierto' (R7)
      estado = CASE WHEN estado = 'lleno' THEN 'abierto' ELSE estado END
    WHERE id = v_reserva.viaje_id;
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- 22. RPC: iniciar_viaje (R8)
--     El conductor inicia el viaje; exige al menos una reserva aceptada.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.iniciar_viaje(p_viaje_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_viaje   public.viajes;
BEGIN
  SELECT * INTO v_viaje FROM public.viajes WHERE id = p_viaje_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'viaje_no_encontrado';
  END IF;

  IF v_viaje.conductor_id <> v_user_id THEN
    RAISE EXCEPTION 'sin_permiso' USING
      HINT = 'Solo el conductor puede iniciar el viaje.';
  END IF;

  IF v_viaje.estado NOT IN ('abierto', 'lleno') THEN
    RAISE EXCEPTION 'viaje_no_iniciable' USING
      HINT = 'El viaje ya fue iniciado, finalizado o cancelado.';
  END IF;

  -- Exige al menos un pasajero aceptado (R8)
  IF NOT EXISTS (
    SELECT 1 FROM public.reservas
    WHERE viaje_id = p_viaje_id AND estado = 'aceptada'
  ) THEN
    RAISE EXCEPTION 'sin_pasajeros' USING
      HINT = 'Debes tener al menos una reserva aceptada para iniciar el viaje.';
  END IF;

  UPDATE public.viajes SET estado = 'en_curso' WHERE id = p_viaje_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- 23. RPC: finalizar_viaje (R8)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.finalizar_viaje(p_viaje_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_viaje   public.viajes;
BEGIN
  SELECT * INTO v_viaje FROM public.viajes WHERE id = p_viaje_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'viaje_no_encontrado';
  END IF;

  IF v_viaje.conductor_id <> v_user_id THEN
    RAISE EXCEPTION 'sin_permiso';
  END IF;

  IF v_viaje.estado <> 'en_curso' THEN
    RAISE EXCEPTION 'viaje_no_en_curso' USING
      HINT = 'Solo se puede finalizar un viaje que esté en curso.';
  END IF;

  UPDATE public.viajes SET estado = 'finalizado' WHERE id = p_viaje_id;
END;
$$;

-- ---------------------------------------------------------------------------
-- 24. RPC: cancelar_viaje (R8)
--     El conductor cancela el viaje; el trigger fn_notificar_cambio_viaje
--     se encarga de cancelar las reservas y notificar a los pasajeros.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cancelar_viaje(p_viaje_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_viaje   public.viajes;
BEGIN
  SELECT * INTO v_viaje FROM public.viajes WHERE id = p_viaje_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'viaje_no_encontrado';
  END IF;

  IF v_viaje.conductor_id <> v_user_id THEN
    RAISE EXCEPTION 'sin_permiso';
  END IF;

  IF v_viaje.estado IN ('finalizado', 'cancelado') THEN
    RAISE EXCEPTION 'viaje_ya_cerrado' USING
      HINT = 'El viaje ya fue finalizado o cancelado.';
  END IF;

  UPDATE public.viajes SET estado = 'cancelado' WHERE id = p_viaje_id;
END;
$$;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) — R13
-- Todas las tablas tienen RLS activado; sin sesión no hay acceso.
-- Cada política lleva un comentario que explica quién puede qué.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 25. Habilitar RLS en todas las tablas
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectores        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehiculos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viajes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calificaciones  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes        ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 26. Políticas de profiles
-- ---------------------------------------------------------------------------
-- Cualquier usuario autenticado puede leer perfiles (nombre, foto, calificación)
CREATE POLICY "profiles: lectura por usuarios autenticados"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (TRUE);

-- Solo el dueño puede modificar su propio perfil
CREATE POLICY "profiles: escritura solo por el dueño"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- El trigger handle_new_user (SECURITY DEFINER) inserta; los usuarios no insertan directamente
CREATE POLICY "profiles: sin insert directo"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (FALSE);

-- ---------------------------------------------------------------------------
-- 27. Políticas de sectores (solo lectura para todos los autenticados)
-- ---------------------------------------------------------------------------
CREATE POLICY "sectores: lectura pública autenticada"
  ON public.sectores FOR SELECT
  TO authenticated
  USING (TRUE);

-- ---------------------------------------------------------------------------
-- 28. Políticas de vehiculos
-- ---------------------------------------------------------------------------
-- Usuarios autenticados pueden leer vehículos (necesario para ver tarjetas de viaje)
CREATE POLICY "vehiculos: lectura por usuarios autenticados"
  ON public.vehiculos FOR SELECT
  TO authenticated
  USING (TRUE);

-- Solo el propietario puede registrar, editar o eliminar su vehículo
CREATE POLICY "vehiculos: escritura solo por el dueño"
  ON public.vehiculos FOR INSERT
  TO authenticated
  WITH CHECK (propietario_id = auth.uid());

CREATE POLICY "vehiculos: actualización solo por el dueño"
  ON public.vehiculos FOR UPDATE
  TO authenticated
  USING (propietario_id = auth.uid())
  WITH CHECK (propietario_id = auth.uid());

CREATE POLICY "vehiculos: eliminación solo por el dueño"
  ON public.vehiculos FOR DELETE
  TO authenticated
  USING (propietario_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 29. Políticas de viajes
-- ---------------------------------------------------------------------------
-- Solo se muestran viajes abiertos a los pasajeros (y todos al conductor dueño)
CREATE POLICY "viajes: lectura de viajes abiertos o propios"
  ON public.viajes FOR SELECT
  TO authenticated
  USING (
    -- El conductor ve todos sus viajes sin importar el estado
    conductor_id = auth.uid()
    -- Los pasajeros solo ven viajes abiertos con salida futura
    OR (estado = 'abierto' AND salida_at > NOW())
    -- Pasajero con reserva aceptada puede ver el viaje aunque esté lleno o en curso
    OR EXISTS (
      SELECT 1 FROM public.reservas
      WHERE viaje_id = public.viajes.id
        AND pasajero_id = auth.uid()
        AND estado = 'aceptada'
    )
  );

-- Solo conductores en modo conductor con vehículo pueden crear viajes (R4)
CREATE POLICY "viajes: creación solo por conductores con vehículo"
  ON public.viajes FOR INSERT
  TO authenticated
  WITH CHECK (
    conductor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND modo_actual = 'conductor'
    )
    AND EXISTS (
      SELECT 1 FROM public.vehiculos WHERE propietario_id = auth.uid()
    )
  );

-- Solo el conductor puede actualizar su viaje (el estado lo cambian las RPC)
CREATE POLICY "viajes: actualización solo por el conductor"
  ON public.viajes FOR UPDATE
  TO authenticated
  USING (conductor_id = auth.uid())
  WITH CHECK (conductor_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 30. Políticas de reservas
-- ---------------------------------------------------------------------------
-- El conductor del viaje ve todas las reservas de sus viajes; el pasajero ve las suyas
CREATE POLICY "reservas: lectura por conductor o pasajero"
  ON public.reservas FOR SELECT
  TO authenticated
  USING (
    pasajero_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.viajes
      WHERE id = viaje_id AND conductor_id = auth.uid()
    )
  );

-- Solo el pasajero puede crear su reserva (la RPC crear_reserva también verifica)
CREATE POLICY "reservas: creación solo por el pasajero"
  ON public.reservas FOR INSERT
  TO authenticated
  WITH CHECK (pasajero_id = auth.uid());

-- El conductor o el pasajero pueden actualizar el estado (a través de las RPC)
CREATE POLICY "reservas: actualización por conductor o pasajero"
  ON public.reservas FOR UPDATE
  TO authenticated
  USING (
    pasajero_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.viajes
      WHERE id = viaje_id AND conductor_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 31. Políticas de calificaciones
-- ---------------------------------------------------------------------------
-- Solo los participantes del viaje pueden leer las calificaciones
CREATE POLICY "calificaciones: lectura por participantes"
  ON public.calificaciones FOR SELECT
  TO authenticated
  USING (
    autor_id = auth.uid()
    OR destinatario_id = auth.uid()
    OR public.es_participante_del_viaje(viaje_id, auth.uid())
  );

-- Solo quien califica puede insertar (R9)
CREATE POLICY "calificaciones: creación por el autor"
  ON public.calificaciones FOR INSERT
  TO authenticated
  WITH CHECK (
    autor_id = auth.uid()
    -- Solo con viaje finalizado
    AND EXISTS (
      SELECT 1 FROM public.viajes WHERE id = viaje_id AND estado = 'finalizado'
    )
    -- El autor debe ser participante del viaje
    AND public.es_participante_del_viaje(viaje_id, auth.uid())
  );

-- ---------------------------------------------------------------------------
-- 32. Políticas de notificaciones
-- ---------------------------------------------------------------------------
-- Cada usuario solo ve sus propias notificaciones
CREATE POLICY "notificaciones: solo el destinatario"
  ON public.notificaciones FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

-- El usuario puede marcar sus notificaciones como leídas
CREATE POLICY "notificaciones: actualización por el destinatario"
  ON public.notificaciones FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

-- Los triggers (SECURITY DEFINER) insertan; los usuarios no insertan directamente
CREATE POLICY "notificaciones: sin insert directo"
  ON public.notificaciones FOR INSERT
  TO authenticated
  WITH CHECK (FALSE);

-- ---------------------------------------------------------------------------
-- 33. Políticas de mensajes (R10)
-- ---------------------------------------------------------------------------
-- Solo el conductor y pasajeros con reserva aceptada pueden leer el chat
CREATE POLICY "mensajes: lectura por participantes del viaje"
  ON public.mensajes FOR SELECT
  TO authenticated
  USING (public.es_participante_del_viaje(viaje_id, auth.uid()));

-- Solo los participantes pueden enviar mensajes (y el viaje no debe estar cancelado)
CREATE POLICY "mensajes: envío por participantes"
  ON public.mensajes FOR INSERT
  TO authenticated
  WITH CHECK (
    autor_id = auth.uid()
    AND public.es_participante_del_viaje(viaje_id, auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.viajes
      WHERE id = viaje_id AND estado <> 'cancelado'
    )
  );

-- =============================================================================
-- FIN de la migración 0001
-- =============================================================================

