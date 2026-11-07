-- =============================================================================
-- Migración 0003: habilitar Supabase Realtime (R11 y Etapa 3)
-- Autora: Sara Santacruz
-- Fecha: 2026-11-07
--
-- Supabase Realtime solo envía cambios de las tablas que están en la publicación
-- "supabase_realtime". Las migraciones 0001 y 0002 no las agregaban, así que la
-- app no recibía cupos, reservas, notificaciones ni mensajes en vivo.
--
-- Seguridad: Realtime respeta RLS. Cada usuario solo recibe los cambios de las
-- filas que sus políticas le dejan leer (por ejemplo, solo sus notificaciones).
--
-- Es idempotente: se puede ejecutar varias veces sin error.
-- =============================================================================

DO $$
DECLARE
  v_tabla TEXT;
BEGIN
  FOREACH v_tabla IN ARRAY ARRAY['viajes', 'reservas', 'notificaciones', 'mensajes']
  LOOP
    -- Solo se agrega si todavía no está en la publicación.
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = v_tabla
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', v_tabla);
    END IF;
  END LOOP;
END;
$$;

-- Comprobación: debe devolver las cuatro tablas.
-- SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
