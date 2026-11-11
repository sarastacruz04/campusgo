-- =============================================================================
-- Pruebas de RLS del chat del viaje (R10) — CampusGo, Etapa 7
-- Autora: Sara Santacruz
--
-- Qué comprueba: que alguien ajeno a un viaje no puede leer ni escribir su chat,
-- que nadie puede escribir a nombre de otro y que el conductor y el pasajero
-- aceptado sí pueden usarlo. No cambia la base de datos: todo corre dentro de
-- una transacción que termina en ROLLBACK.
--
-- Cómo correrlo (SQL Editor de Supabase, como postgres):
--   1. Ten tres cuentas: un conductor, un pasajero con una reserva ACEPTADA en un
--      viaje de ese conductor que NO esté cancelado, y una cuenta ajena al viaje.
--   2. Cambia los tres correos del paso 1 de abajo por los reales.
--   3. Ejecuta todo el archivo. Al final aparece un ERROR a propósito que empieza
--      con "RESULTADO CHAT RLS: 6 de 6 correctas" si todo está bien; cada prueba
--      dice (OK) o (FALLA). El error deshace la transacción: no queda nada guardado.
--      Cualquier otro error (por ejemplo "Revisa los correos") es de preparación.
-- =============================================================================

BEGIN;

-- Paso 1: cuentas de prueba (cambia los correos).
SELECT set_config('chat.conductor', coalesce((SELECT id::text FROM public.profiles WHERE email = 'conductor@unisabana.edu.co'), ''), true);
SELECT set_config('chat.pasajero', coalesce((SELECT id::text FROM public.profiles WHERE email = 'pasajero@unisabana.edu.co'), ''), true);
SELECT set_config('chat.ajeno', coalesce((SELECT id::text FROM public.profiles WHERE email = 'ajeno@unisabana.edu.co'), ''), true);

-- Paso 2: el viaje más reciente del conductor donde el pasajero está aceptado.
SELECT set_config('chat.viaje', coalesce((
  SELECT v.id::text
  FROM public.viajes v
  JOIN public.reservas r ON r.viaje_id = v.id
  WHERE v.conductor_id = nullif(current_setting('chat.conductor'), '')::uuid
    AND r.pasajero_id = nullif(current_setting('chat.pasajero'), '')::uuid
    AND r.estado = 'aceptada'
    AND v.estado <> 'cancelado'
  ORDER BY v.created_at DESC
  LIMIT 1
), ''), true);

DO $$
BEGIN
  IF current_setting('chat.conductor') = '' OR current_setting('chat.pasajero') = ''
     OR current_setting('chat.ajeno') = '' THEN
    RAISE EXCEPTION 'Revisa los correos del paso 1: alguno no existe en profiles.';
  END IF;
  IF current_setting('chat.viaje') = '' THEN
    RAISE EXCEPTION 'No hay un viaje del conductor con el pasajero aceptado y sin cancelar.';
  END IF;
  IF public.es_participante_del_viaje(current_setting('chat.viaje')::uuid, current_setting('chat.ajeno')::uuid) THEN
    RAISE EXCEPTION 'La cuenta "ajena" sí participa en el viaje: usa otra cuenta.';
  END IF;
END $$;

-- Resultados. Es temporal y desaparece con el ROLLBACK.
CREATE TEMP TABLE resultados (prueba TEXT, esperado TEXT, obtenido TEXT) ON COMMIT DROP;
GRANT ALL ON resultados TO authenticated;

-- ---------------------------------------------------------------------------
-- Como el PASAJERO aceptado
-- ---------------------------------------------------------------------------
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('chat.pasajero'), 'role', 'authenticated')::text, true);
SET LOCAL ROLE authenticated;

-- CH-01: el pasajero aceptado envía un mensaje.
DO $$
BEGIN
  INSERT INTO public.mensajes (viaje_id, autor_id, contenido)
  VALUES (current_setting('chat.viaje')::uuid, auth.uid(), 'prueba RLS chat');
  INSERT INTO resultados VALUES ('CH-01 pasajero aceptado envía', 'permitido', 'permitido');
EXCEPTION WHEN insufficient_privilege THEN
  INSERT INTO resultados VALUES ('CH-01 pasajero aceptado envía', 'permitido', 'rechazado');
END $$;

-- CH-02: el pasajero no puede escribir a nombre del conductor.
DO $$
BEGIN
  INSERT INTO public.mensajes (viaje_id, autor_id, contenido)
  VALUES (current_setting('chat.viaje')::uuid, current_setting('chat.conductor')::uuid, 'suplantación');
  INSERT INTO resultados VALUES ('CH-02 escribir a nombre de otro', 'rechazado', 'permitido');
EXCEPTION WHEN insufficient_privilege THEN
  INSERT INTO resultados VALUES ('CH-02 escribir a nombre de otro', 'rechazado', 'rechazado');
END $$;

RESET ROLE;

-- ---------------------------------------------------------------------------
-- Como el CONDUCTOR
-- ---------------------------------------------------------------------------
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('chat.conductor'), 'role', 'authenticated')::text, true);
SET LOCAL ROLE authenticated;

-- CH-03: el conductor lee el mensaje del pasajero.
INSERT INTO resultados
SELECT 'CH-03 conductor lee el chat', '1 mensaje', count(*) || ' mensaje'
FROM public.mensajes
WHERE viaje_id = current_setting('chat.viaje')::uuid AND contenido = 'prueba RLS chat';

RESET ROLE;

-- ---------------------------------------------------------------------------
-- Como la cuenta AJENA al viaje
-- ---------------------------------------------------------------------------
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('chat.ajeno'), 'role', 'authenticated')::text, true);
SET LOCAL ROLE authenticated;

-- CH-04: el ajeno no ve ningún mensaje del viaje (RLS filtra, no da error).
INSERT INTO resultados
SELECT 'CH-04 ajeno lee el chat', '0 mensajes', count(*) || ' mensajes'
FROM public.mensajes
WHERE viaje_id = current_setting('chat.viaje')::uuid;

-- CH-05: el ajeno no puede enviar mensajes.
DO $$
BEGIN
  INSERT INTO public.mensajes (viaje_id, autor_id, contenido)
  VALUES (current_setting('chat.viaje')::uuid, auth.uid(), 'intruso');
  INSERT INTO resultados VALUES ('CH-05 ajeno envía', 'rechazado', 'permitido');
EXCEPTION WHEN insufficient_privilege THEN
  INSERT INTO resultados VALUES ('CH-05 ajeno envía', 'rechazado', 'rechazado');
END $$;

-- CH-06: la función que usa la app para mostrar "No tienes acceso" responde false.
INSERT INTO resultados
SELECT 'CH-06 la app detecta al ajeno', 'false',
  public.es_participante_del_viaje(current_setting('chat.viaje')::uuid, auth.uid())::text;

RESET ROLE;

-- El resumen sale como un error A PROPÓSITO: así el SQL Editor siempre lo muestra
-- y el error deshace todo (el mensaje de prueba y su notificación no quedan guardados).
DO $$
DECLARE
  v_resumen TEXT;
  v_ok INT;
  v_total INT;
BEGIN
  SELECT string_agg(prueba || ': esperado ' || esperado || ', obtenido ' || obtenido
                    || CASE WHEN esperado = obtenido THEN ' (OK)' ELSE ' (FALLA)' END,
                    ' | ' ORDER BY prueba),
         count(*) FILTER (WHERE esperado = obtenido),
         count(*)
  INTO v_resumen, v_ok, v_total
  FROM resultados;
  RAISE EXCEPTION 'RESULTADO CHAT RLS: % de % correctas. %', v_ok, v_total, v_resumen;
END $$;

ROLLBACK;
