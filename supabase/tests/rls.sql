-- =============================================================================
-- Pruebas de RLS — CampusGo (TC-23): qué puede y qué no puede hacer cada rol
--
-- Casos originales (lista comentada, bloques 1 a 9): Samuel Borda, 2026-11-06.
-- Versión ejecutable con cuentas ficticias y casos nuevos (marcados "nuevo"):
-- Sara Santacruz, 2026-11-11.
--
-- QUÉ HACE
-- Crea cuatro cuentas FICTICIAS dentro de una transacción, actúa como cada una
-- (y como anónimo) y registra si la base de datos permite o rechaza cada acción.
-- Al final muestra el resumen como un ERROR A PROPÓSITO: el error deshace TODO
-- (cuentas, viajes, reservas, mensajes, calificaciones y notificaciones de
-- prueba). No toca ni lee datos de personas reales, salvo para contar filas.
--
-- CÓMO CORRERLO
-- 1. Supabase > SQL Editor > New query. Pega este archivo completo.
-- 2. Run. No hay que cambiar nada (no pide correos ni UUID).
-- 3. Sale un error rojo que empieza con "RESULTADO RLS: N de M correctas.".
--    Cada línea siguiente dice OK o FALLA, la prueba, quién la hizo, lo
--    esperado y lo obtenido. Copia ese texto completo como evidencia.
--    Si el error empieza con "PREPARACIÓN:", el problema es del entorno
--    (por ejemplo, faltan los sectores de seed.sql), no de las políticas.
--
-- ACTORES (todos ficticios, @unisabana.edu.co, se borran con el error final)
--   C = conductora con carro          P = pasajera con reserva ACEPTADA
--   Q = pasajero con reserva PENDIENTE X = cuenta ajena, sin reservas ni carro
--   anon = sin sesión
--   T1 = viaje de C (2 cupos): se inicia y se finaliza para calificar
--   T2 = viaje de C (1 cupo): P queda aceptada y C lo cancela
--
-- SALIDA ESPERADA (prueba: esperado)
--   Preparación
--   RS-00 Storage de prueba preparado: si
--   Anónimo (R13: sin acceso anónimo)
--   RA-01 (nuevo) anon lee cada tabla y storage.objects: sin acceso (9 líneas)
--   RA-02 (nuevo) anon reserva un viaje: rechazado
--   Perfiles
--   RP-01 X lee nombre de C y P: 2 fila(s)
--   RP-02 X inserta un perfil directamente: rechazado
--   RP-03 X actualiza su teléfono: permitido
--   RP-04 X actualiza el teléfono de C: rechazado
--   RP-05 (nuevo) X lee teléfono, correo o ID universitario de otras cuentas: sin acceso
--   RP-06 (nuevo) X lee su propio perfil completo con mi_perfil: 1 fila(s)
--   RP-07 (nuevo) X cambia su correo directamente: rechazado
--   RP-08 (nuevo) anon pide un perfil con mi_perfil: rechazado
--   RU-03 X se pone modo conductor sin la RPC: rechazado
--   Vehículos
--   RH-01 (nuevo) C registra su carro: permitido
--   RH-02 (nuevo) X lee el carro de C (tarjetas de viaje): 1 fila(s)
--   RH-03 (nuevo) X modifica el carro de C: rechazado
--   RH-04 (nuevo) X elimina el carro de C: rechazado
--   RH-05 (nuevo) X registra un carro a nombre de C: rechazado
--   RH-06 (nuevo) Q registra su propio carro: permitido
--   Viajes y modo
--   RV-01 X solo ve viajes abiertos o llenos con salida futura: 0 fila(s) de otro tipo
--   RV-02 C ve sus dos viajes en cualquier estado: 2 fila(s)
--   RV-03 X (sin carro) crea un viaje: rechazado
--   RV-04 (nuevo) C (con carro y en modo conductor) crea T1 y T2: permitido
--   RV-05 (nuevo) X crea un viaje a nombre de C: rechazado
--   RV-06 (nuevo) X ve T1 finalizado: 0 fila(s)
--   RV-07 (nuevo) X cambia a modo conductor sin carro (R3): rechazado
--   RV-08 (nuevo) C cambia a modo conductor con carro: permitido
--   RV-09 (nuevo) X inicia o cancela T1: rechazado (2 líneas)
--   RV-10 (nuevo) C cancela T2: permitido
--   RV-11 (nuevo, R4) C crea un viaje con salida en el pasado: rechazado
--   RV-12 (nuevo, R4) C crea un viaje con más cupos que la capacidad: rechazado
--   RV-13 (nuevo, R4) C crea un viaje con el carro de Q: rechazado
--   RV-14 (nuevo, R4) C crea un viaje que ya empieza finalizado: rechazado
--   RU-02 C cambia estado y cupos de T1 sin la RPC: rechazado
--   Reservas
--   RR-01 P lee sus reservas: 2 fila(s)
--   RR-02 C lee las reservas de T1: 2 fila(s)
--   RR-03 C lee reservas que no son suyas ni de sus viajes: 0 fila(s)
--   RR-04 P y Q reservan T1 (y P reserva T2): permitido
--   RR-05 C reserva su propio viaje: rechazado
--   RR-06 (nuevo) P reserva T1 dos veces: rechazado
--   RR-07 (nuevo) Q lee reservas de otras personas: 0 fila(s)
--   RR-08 (nuevo) X lee reservas (no tiene ninguna): 0 fila(s)
--   RR-09 (nuevo) X acepta la reserva de Q: rechazado
--   RR-10 (nuevo) X cancela la reserva de P: rechazado
--   RR-11 (nuevo) X inserta una reserva "aceptada" sin la RPC: rechazado
--   RR-12 (nuevo) C acepta las reservas de P (T1 y T2): permitido
--   RU-01 Q se pone "aceptada" sin la RPC: rechazado
--   Notificaciones
--   RN-01 P lee las notificaciones de C: 0 fila(s)
--   RN-02 P lee su notificación "reserva aceptada" de T1: 1 fila(s)
--   RN-03 P inserta una notificación: rechazado
--   RN-04 (nuevo) X marca como leída una notificación de C: rechazado
--   RN-05 (nuevo) C lee sus dos solicitudes nuevas de T1: 2 fila(s)
--   RN-06 (nuevo) X lee notificaciones de otras personas: 0 fila(s)
--   RN-07 (nuevo) P cambia el título de su propia notificación: rechazado
--   RN-08 (nuevo) P marca como leídas sus notificaciones: permitido
--   Chat
--   RM-01 X lee mensajes de cualquier viaje: 0 fila(s)
--   RM-02 P (aceptada) escribe en T1: permitido
--   RM-03 X escribe en T1: rechazado
--   RM-04 (nuevo) Q (pendiente) lee el chat de T1: 0 fila(s)
--   RM-05 (nuevo) P escribe a nombre de C: rechazado
--   RM-06 (nuevo) C lee el mensaje de P en T1: 1 fila(s)
--   RM-07 (nuevo) C y P escriben en T2 cancelado: rechazado (2 líneas)
--   Calificaciones
--   RC-01 P califica T1 antes de finalizar: rechazado
--   RC-02 X califica a C: rechazado
--   RC-03 C se califica a sí misma: rechazado
--   RC-04 P califica a Q (otro pasajero): rechazado
--   RC-05 C califica a P una vez: permitido; la segunda vez: rechazado
--   RC-06 (nuevo) P califica a C: permitido
--   RC-07 (nuevo) Q (pendiente) califica a C: rechazado
--   RC-08 (nuevo) P lee las calificaciones de T1: 2 fila(s)
--   RC-09 (nuevo) X lee calificaciones (no participa en nada): 0 fila(s)
--   RC-10 (nuevo) C inicia y finaliza T1: permitido
--   Storage
--   RS-01 X lee el SOAT de C: 0 fila(s)
--   RS-02 X lee el avatar de C: 1 fila(s)
--   RS-03 (nuevo) C lee su SOAT: 1 fila(s)
--   RS-04 (nuevo) X sube un archivo a la carpeta de C: rechazado
--   RS-05 (nuevo) X sube un archivo a su carpeta: permitido
--
-- En total son 92 líneas; con las migraciones 0001 a 0009 el resumen dice
-- "RESULTADO RLS: 92 de 92 correctas.".
--
-- Las pruebas que dicen "rechazado" se deshacen aunque la base las permita, para
-- que un fallo no contamine las pruebas siguientes.
--
-- VALIDACIÓN LOCAL (2026-11-11, Sara con Claude): ejecutado en PostgreSQL 17 en
-- Docker con las migraciones 0001 a 0008, seed.sql y una imitación mínima de los
-- esquemas auth y storage de Supabase (no está en el repositorio). Con las 82
-- pruebas originales y sin la 0009: 79 de 82 (fallaban RP-05, RU-03 y RR-11).
-- Con las 92 pruebas: 82 de 92 sin la 0009 y 92 de 92 con ella.
-- Falta ejecutarlo en el proyecto real de Supabase (TC-23 en docs/PRUEBAS.md).
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Preparación (como postgres): cuatro cuentas ficticias
-- -----------------------------------------------------------------------------
SELECT set_config('rls.c', gen_random_uuid()::text, true);
SELECT set_config('rls.p', gen_random_uuid()::text, true);
SELECT set_config('rls.q', gen_random_uuid()::text, true);
SELECT set_config('rls.x', gen_random_uuid()::text, true);

DO $$
DECLARE
  v_ids    TEXT[];
  v_placas TEXT[];
  v_sector BIGINT;
  v_suf    TEXT := substr(md5(random()::text), 1, 8);
BEGIN
  SELECT id INTO v_sector FROM public.sectores ORDER BY id LIMIT 1;
  IF v_sector IS NULL THEN
    RAISE EXCEPTION 'PREPARACIÓN: no hay sectores. Aplica supabase/seed.sql primero.';
  END IF;

  -- ID universitarios y placa libres, para no chocar con UNIQUE de datos reales.
  SELECT array_agg(c) INTO v_ids FROM (
    SELECT (9900000000 + n)::TEXT AS c FROM generate_series(1, 999) n
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id_universidad = (9900000000 + n)::TEXT)
    ORDER BY n LIMIT 4
  ) s;
  SELECT array_agg(p) INTO v_placas FROM (
    SELECT 'ZRL' || lpad(n::TEXT, 3, '0') AS p FROM generate_series(0, 999) n
    WHERE NOT EXISTS (SELECT 1 FROM public.vehiculos WHERE placa = 'ZRL' || lpad(n::TEXT, 3, '0'))
    ORDER BY n LIMIT 2
  ) s;

  PERFORM set_config('rls.sector', v_sector::TEXT, true);
  PERFORM set_config('rls.placa', v_placas[1], true);
  PERFORM set_config('rls.placa_q', v_placas[2], true);

  -- El trigger handle_new_user (R2) crea cada perfil a partir de raw_user_meta_data.
  INSERT INTO auth.users (id, aud, role, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  SELECT u.id::UUID, 'authenticated', 'authenticated', u.email, NOW(),
         '{"provider": "email", "providers": ["email"]}'::JSONB,
         jsonb_build_object('nombre', 'Prueba', 'apellido', u.apellido,
                            'id_universidad', v_ids[u.n], 'telefono', '300000000' || u.n),
         NOW(), NOW()
  FROM (VALUES
    (1, current_setting('rls.c'), 'rls.c.' || v_suf || '@unisabana.edu.co', 'Conductora'),
    (2, current_setting('rls.p'), 'rls.p.' || v_suf || '@unisabana.edu.co', 'Aceptada'),
    (3, current_setting('rls.q'), 'rls.q.' || v_suf || '@unisabana.edu.co', 'Pendiente'),
    (4, current_setting('rls.x'), 'rls.x.' || v_suf || '@unisabana.edu.co', 'Ajena')
  ) AS u(n, id, email, apellido);

  IF (SELECT count(*) FROM public.profiles
      WHERE id IN (current_setting('rls.c')::UUID, current_setting('rls.p')::UUID,
                   current_setting('rls.q')::UUID, current_setting('rls.x')::UUID)) <> 4 THEN
    RAISE EXCEPTION 'PREPARACIÓN: el trigger handle_new_user no creó los cuatro perfiles.';
  END IF;
EXCEPTION
  WHEN raise_exception THEN RAISE;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'PREPARACIÓN: no se pudieron crear las cuentas ficticias: %', SQLERRM;
END $$;

-- Archivos de prueba de C en Storage (solo filas; no hay archivos reales).
SELECT set_config('rls.storage', 'si', true);
DO $$
BEGIN
  INSERT INTO storage.objects (bucket_id, name)
  VALUES ('soat', current_setting('rls.c') || '/soat.jpg'),
         ('avatars', current_setting('rls.c') || '/avatar.jpg');
EXCEPTION WHEN OTHERS THEN
  PERFORM set_config('rls.storage', 'no: ' || SQLERRM, true);
END $$;

-- -----------------------------------------------------------------------------
-- Resultados y ayudantes (temporales: desaparecen con la transacción)
-- -----------------------------------------------------------------------------
CREATE TEMP TABLE resultados (
  t        TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  prueba   TEXT,
  quien    TEXT,
  esperado TEXT,
  obtenido TEXT,
  detalle  TEXT
) ON COMMIT DROP;
GRANT ALL ON resultados TO authenticated, anon;

INSERT INTO resultados (prueba, quien, esperado, obtenido)
VALUES ('RS-00 Storage de prueba preparado', 'postgres', 'si', current_setting('rls.storage'));

-- Intenta una escritura y SIEMPRE la deshace; solo registra si la base la permitió.
-- 0 filas afectadas (RLS filtró la fila) cuenta como rechazado.
CREATE FUNCTION pg_temp.probar(p_prueba TEXT, p_esperado TEXT, p_sql TEXT)
RETURNS VOID LANGUAGE plpgsql AS $f$
DECLARE
  v_n        BIGINT;
  v_obtenido TEXT;
  v_detalle  TEXT;
BEGIN
  BEGIN
    EXECUTE p_sql;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    RAISE EXCEPTION USING ERRCODE = 'P0099', MESSAGE = v_n::TEXT;
  EXCEPTION
    WHEN SQLSTATE 'P0099' THEN
      v_obtenido := CASE WHEN SQLERRM::BIGINT > 0 THEN 'permitido' ELSE 'rechazado' END;
      v_detalle  := SQLERRM || ' fila(s) afectada(s)';
    WHEN OTHERS THEN
      v_obtenido := 'rechazado';
      v_detalle  := SQLERRM;
  END;
  INSERT INTO resultados (prueba, quien, esperado, obtenido, detalle)
  VALUES (p_prueba, current_setting('rls.actor'), p_esperado, v_obtenido, v_detalle);
END $f$;

-- Ejecuta una acción que SÍ debe quedar (las siguientes pruebas dependen de ella)
-- y devuelve la primera columna (por ejemplo, el id creado).
CREATE FUNCTION pg_temp.paso(p_prueba TEXT, p_sql TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $f$
DECLARE
  v_valor    TEXT;
  v_obtenido TEXT := 'permitido';
  v_detalle  TEXT;
BEGIN
  BEGIN
    EXECUTE p_sql INTO v_valor;
  EXCEPTION WHEN OTHERS THEN
    v_obtenido := 'rechazado';
    v_detalle  := SQLERRM;
  END;
  INSERT INTO resultados (prueba, quien, esperado, obtenido, detalle)
  VALUES (p_prueba, current_setting('rls.actor'), 'permitido', v_obtenido, v_detalle);
  RETURN coalesce(v_valor, '');
END $f$;

-- Cuenta las filas que el actor actual puede ver.
CREATE FUNCTION pg_temp.contar(p_prueba TEXT, p_esperado INT, p_sql TEXT)
RETURNS VOID LANGUAGE plpgsql AS $f$
DECLARE
  v_n        BIGINT;
  v_obtenido TEXT;
  v_detalle  TEXT;
BEGIN
  BEGIN
    EXECUTE p_sql INTO v_n;
    v_obtenido := v_n || ' fila(s)';
  EXCEPTION WHEN OTHERS THEN
    v_obtenido := 'error';
    v_detalle  := SQLERRM;
  END;
  INSERT INTO resultados (prueba, quien, esperado, obtenido, detalle)
  VALUES (p_prueba, current_setting('rls.actor'), p_esperado || ' fila(s)', v_obtenido, v_detalle);
END $f$;

-- Lectura anónima: "sin acceso" si ve 0 filas o si no tiene permiso sobre la tabla.
CREATE FUNCTION pg_temp.sin_acceso(p_prueba TEXT, p_sql TEXT)
RETURNS VOID LANGUAGE plpgsql AS $f$
DECLARE
  v_n        BIGINT;
  v_obtenido TEXT;
BEGIN
  BEGIN
    EXECUTE p_sql INTO v_n;
    v_obtenido := CASE WHEN v_n = 0 THEN 'sin acceso' ELSE v_n || ' fila(s) visibles' END;
  EXCEPTION WHEN insufficient_privilege THEN
    v_obtenido := 'sin acceso';
  END;
  INSERT INTO resultados (prueba, quien, esperado, obtenido)
  VALUES (p_prueba, current_setting('rls.actor'), 'sin acceso', v_obtenido);
END $f$;

-- Para cambiar de actor se repiten siempre las mismas tres líneas:
--   RESET ROLE;  (vuelve a postgres)
--   set_config de request.jwt.claims (auth.uid() lee el "sub") y de rls.actor;
--   SET LOCAL ROLE authenticated (o anon), el rol que usa la app.

-- -----------------------------------------------------------------------------
-- C: registra su carro, cambia de modo y crea T1 y T2
-- -----------------------------------------------------------------------------
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('rls.c'), 'role', 'authenticated')::TEXT, true),
       set_config('rls.actor', 'C', true);
SET LOCAL ROLE authenticated;

SELECT pg_temp.paso('RH-01 C registra su carro',
  $q$INSERT INTO public.vehiculos (propietario_id, placa, capacidad, marca, modelo)
     VALUES (auth.uid(), current_setting('rls.placa'), 4, 'Prueba', 'RLS') RETURNING id$q$);
SELECT pg_temp.paso('RV-08 C cambia a modo conductor con carro',
  $q$SELECT public.cambiar_modo('conductor')$q$);
SELECT set_config('rls.t1', pg_temp.paso('RV-04 C crea T1',
  $q$INSERT INTO public.viajes (conductor_id, vehiculo_id, sector_id, origen_texto, origen_lat, origen_lng,
       destino_texto, destino_lat, destino_lng, salida_at, valor_por_cupo, cupos_totales, cupos_disponibles)
     SELECT auth.uid(), v.id, current_setting('rls.sector')::BIGINT, 'Origen prueba', 4.86, -74.03,
       'Universidad de La Sabana', 4.86, -74.03, NOW() + INTERVAL '1 day', 5000, 2, 2
     FROM public.vehiculos v WHERE v.propietario_id = auth.uid() RETURNING id$q$), true);
SELECT set_config('rls.t2', pg_temp.paso('RV-04 C crea T2',
  $q$INSERT INTO public.viajes (conductor_id, vehiculo_id, sector_id, origen_texto, origen_lat, origen_lng,
       destino_texto, destino_lat, destino_lng, salida_at, valor_por_cupo, cupos_totales, cupos_disponibles)
     SELECT auth.uid(), v.id, current_setting('rls.sector')::BIGINT, 'Origen prueba', 4.86, -74.03,
       'Universidad de La Sabana', 4.86, -74.03, NOW() + INTERVAL '2 days', 5000, 1, 1
     FROM public.vehiculos v WHERE v.propietario_id = auth.uid() RETURNING id$q$), true);
SELECT pg_temp.probar('RR-05 C reserva su propio viaje', 'rechazado',
  $q$SELECT public.crear_reserva(current_setting('rls.t1')::UUID, 'x', 4.86, -74.03)$q$);

-- -----------------------------------------------------------------------------
-- anon: sin sesión no se lee ni se escribe nada (R13)
-- -----------------------------------------------------------------------------
RESET ROLE;
SELECT set_config('request.jwt.claims', '{"role": "anon"}', true),
       set_config('rls.actor', 'anon', true);
SET LOCAL ROLE anon;

DO $$
DECLARE
  v_tabla TEXT;
BEGIN
  FOREACH v_tabla IN ARRAY ARRAY['profiles', 'sectores', 'vehiculos', 'viajes', 'reservas',
                                 'calificaciones', 'notificaciones', 'mensajes'] LOOP
    PERFORM pg_temp.sin_acceso('RA-01 anon lee public.' || v_tabla,
                               format('SELECT count(*) FROM public.%I', v_tabla));
  END LOOP;
  PERFORM pg_temp.sin_acceso('RA-01 anon lee storage.objects', 'SELECT count(*) FROM storage.objects');
END $$;
SELECT pg_temp.probar('RA-02 anon reserva un viaje', 'rechazado',
  $q$SELECT public.crear_reserva(current_setting('rls.t1')::UUID, 'x', 4.86, -74.03)$q$);
SELECT pg_temp.probar('RP-08 anon pide un perfil con mi_perfil', 'rechazado',
  $q$SELECT * FROM public.mi_perfil()$q$);

-- -----------------------------------------------------------------------------
-- P y Q reservan
-- -----------------------------------------------------------------------------
RESET ROLE;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('rls.p'), 'role', 'authenticated')::TEXT, true),
       set_config('rls.actor', 'P', true);
SET LOCAL ROLE authenticated;

SELECT set_config('rls.r_p', pg_temp.paso('RR-04 P reserva T1',
  $q$SELECT public.crear_reserva(current_setting('rls.t1')::UUID, 'Punto P', 4.86, -74.03)$q$), true);
SELECT set_config('rls.r_p2', pg_temp.paso('RR-04 P reserva T2',
  $q$SELECT public.crear_reserva(current_setting('rls.t2')::UUID, 'Punto P', 4.86, -74.03)$q$), true);
SELECT pg_temp.probar('RR-06 P reserva T1 dos veces', 'rechazado',
  $q$SELECT public.crear_reserva(current_setting('rls.t1')::UUID, 'Punto P', 4.86, -74.03)$q$);

RESET ROLE;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('rls.q'), 'role', 'authenticated')::TEXT, true),
       set_config('rls.actor', 'Q', true);
SET LOCAL ROLE authenticated;

SELECT set_config('rls.r_q', pg_temp.paso('RR-04 Q reserva T1',
  $q$SELECT public.crear_reserva(current_setting('rls.t1')::UUID, 'Punto Q', 4.86, -74.03)$q$), true);
-- Q también tiene carro: sirve para probar que C no puede usar un carro ajeno (RV-13).
SELECT pg_temp.paso('RH-06 Q registra su propio carro',
  $q$INSERT INTO public.vehiculos (propietario_id, placa, capacidad, marca, modelo)
     VALUES (auth.uid(), current_setting('rls.placa_q'), 2, 'Prueba', 'RLS') RETURNING id$q$);

-- -----------------------------------------------------------------------------
-- C acepta a P en T1 y T2 (T2 queda lleno)
-- -----------------------------------------------------------------------------
RESET ROLE;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('rls.c'), 'role', 'authenticated')::TEXT, true),
       set_config('rls.actor', 'C', true);
SET LOCAL ROLE authenticated;

SELECT pg_temp.contar('RR-02 C lee las reservas de T1', 2,
  $q$SELECT count(*) FROM public.reservas WHERE viaje_id = current_setting('rls.t1')::UUID$q$);
SELECT pg_temp.paso('RR-12 C acepta la reserva de P en T1',
  $q$SELECT public.aceptar_reserva(current_setting('rls.r_p')::UUID)$q$);
SELECT pg_temp.paso('RR-12 C acepta la reserva de P en T2',
  $q$SELECT public.aceptar_reserva(current_setting('rls.r_p2')::UUID)$q$);
SELECT pg_temp.contar('RR-03 C lee reservas que no son suyas ni de sus viajes', 0,
  $q$SELECT count(*) FROM public.reservas r
     WHERE r.pasajero_id <> auth.uid()
       AND NOT public.es_conductor_del_viaje(r.viaje_id, auth.uid())$q$);
SELECT pg_temp.contar('RN-05 C lee sus dos solicitudes nuevas de T1', 2,
  $q$SELECT count(*) FROM public.notificaciones
     WHERE tipo = 'nueva_reserva' AND datos->>'viaje_id' = current_setting('rls.t1')$q$);
SELECT pg_temp.probar('RU-02 C cambia estado y cupos de T1 sin la RPC', 'rechazado',
  $q$UPDATE public.viajes SET estado = 'finalizado', cupos_disponibles = 0
     WHERE id = current_setting('rls.t1')::UUID$q$);

-- R4 en la base (migración 0009). Cada intento cambia una sola cosa de un viaje válido.
SELECT pg_temp.probar('RV-11 C crea un viaje con salida en el pasado', 'rechazado',
  $q$INSERT INTO public.viajes (conductor_id, vehiculo_id, sector_id, origen_texto, origen_lat, origen_lng,
       destino_texto, destino_lat, destino_lng, salida_at, cupos_totales, cupos_disponibles)
     SELECT auth.uid(), v.id, current_setting('rls.sector')::BIGINT, 'x', 0, 0, 'x', 0, 0,
       NOW() - INTERVAL '1 hour', 1, 1
     FROM public.vehiculos v WHERE v.propietario_id = auth.uid()$q$);
SELECT pg_temp.probar('RV-12 C crea un viaje con más cupos que la capacidad (4)', 'rechazado',
  $q$INSERT INTO public.viajes (conductor_id, vehiculo_id, sector_id, origen_texto, origen_lat, origen_lng,
       destino_texto, destino_lat, destino_lng, salida_at, cupos_totales, cupos_disponibles)
     SELECT auth.uid(), v.id, current_setting('rls.sector')::BIGINT, 'x', 0, 0, 'x', 0, 0,
       NOW() + INTERVAL '1 day', 5, 5
     FROM public.vehiculos v WHERE v.propietario_id = auth.uid()$q$);
SELECT pg_temp.probar('RV-13 C crea un viaje con el carro de Q', 'rechazado',
  $q$INSERT INTO public.viajes (conductor_id, vehiculo_id, sector_id, origen_texto, origen_lat, origen_lng,
       destino_texto, destino_lat, destino_lng, salida_at, cupos_totales, cupos_disponibles)
     SELECT auth.uid(), v.id, current_setting('rls.sector')::BIGINT, 'x', 0, 0, 'x', 0, 0,
       NOW() + INTERVAL '1 day', 1, 1
     FROM public.vehiculos v WHERE v.propietario_id = current_setting('rls.q')::UUID$q$);
SELECT pg_temp.probar('RV-14 C crea un viaje que ya empieza finalizado', 'rechazado',
  $q$INSERT INTO public.viajes (conductor_id, vehiculo_id, sector_id, origen_texto, origen_lat, origen_lng,
       destino_texto, destino_lat, destino_lng, salida_at, cupos_totales, cupos_disponibles, estado)
     SELECT auth.uid(), v.id, current_setting('rls.sector')::BIGINT, 'x', 0, 0, 'x', 0, 0,
       NOW() + INTERVAL '1 day', 1, 1, 'finalizado'
     FROM public.vehiculos v WHERE v.propietario_id = auth.uid()$q$);

-- -----------------------------------------------------------------------------
-- X: cuenta ajena, sin carro y sin reservas
-- -----------------------------------------------------------------------------
RESET ROLE;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('rls.x'), 'role', 'authenticated')::TEXT, true),
       set_config('rls.actor', 'X', true);
SET LOCAL ROLE authenticated;

-- Perfiles
SELECT pg_temp.contar('RP-01 X lee nombre de C y P', 2,
  $q$SELECT count(nombre) FROM public.profiles
     WHERE id IN (current_setting('rls.c')::UUID, current_setting('rls.p')::UUID)$q$);
-- "sin acceso" = 0 filas o sin permiso sobre esas columnas (migración 0009).
SELECT pg_temp.sin_acceso('RP-05 X lee teléfono, correo o ID universitario de otras cuentas',
  $q$SELECT count(*) FROM public.profiles
     WHERE id <> auth.uid() AND (telefono IS NOT NULL OR email IS NOT NULL OR id_universidad IS NOT NULL)$q$);
SELECT pg_temp.contar('RP-06 X lee su propio perfil completo con mi_perfil', 1,
  $q$SELECT count(*) FROM public.mi_perfil()
     WHERE id = auth.uid() AND telefono IS NOT NULL AND email IS NOT NULL AND id_universidad IS NOT NULL$q$);
SELECT pg_temp.probar('RP-07 X cambia su correo directamente', 'rechazado',
  $q$UPDATE public.profiles SET email = 'otro.correo@unisabana.edu.co' WHERE id = auth.uid()$q$);
SELECT pg_temp.probar('RP-02 X inserta un perfil directamente', 'rechazado',
  $q$INSERT INTO public.profiles (id, nombre, apellido, email)
     VALUES (gen_random_uuid(), 'Intruso', 'X', 'intruso@unisabana.edu.co')$q$);
SELECT pg_temp.probar('RP-03 X actualiza su teléfono', 'permitido',
  $q$UPDATE public.profiles SET telefono = '3001112233' WHERE id = auth.uid()$q$);
SELECT pg_temp.probar('RP-04 X actualiza el teléfono de C', 'rechazado',
  $q$UPDATE public.profiles SET telefono = '3009999999' WHERE id = current_setting('rls.c')::UUID$q$);
SELECT pg_temp.probar('RU-03 X se pone modo conductor sin la RPC', 'rechazado',
  $q$UPDATE public.profiles SET modo_actual = 'conductor' WHERE id = auth.uid()$q$);

-- Vehículos
SELECT pg_temp.contar('RH-02 X lee el carro de C', 1,
  $q$SELECT count(*) FROM public.vehiculos WHERE propietario_id = current_setting('rls.c')::UUID$q$);
SELECT pg_temp.probar('RH-03 X modifica el carro de C', 'rechazado',
  $q$UPDATE public.vehiculos SET capacidad = 8 WHERE propietario_id = current_setting('rls.c')::UUID$q$);
SELECT pg_temp.probar('RH-04 X elimina el carro de C', 'rechazado',
  $q$DELETE FROM public.vehiculos WHERE propietario_id = current_setting('rls.c')::UUID$q$);
SELECT pg_temp.probar('RH-05 X registra un carro a nombre de C', 'rechazado',
  $q$INSERT INTO public.vehiculos (propietario_id, placa, capacidad, marca, modelo)
     VALUES (current_setting('rls.c')::UUID, 'ZZZ999', 4, 'X', 'X')$q$);

-- Viajes y modo
SELECT pg_temp.contar('RV-01 X ve viajes que no están abiertos o llenos con salida futura', 0,
  $q$SELECT count(*) FROM public.viajes WHERE NOT (estado IN ('abierto', 'lleno') AND salida_at > NOW())$q$);
SELECT pg_temp.probar('RV-07 X cambia a modo conductor sin carro', 'rechazado',
  $q$SELECT public.cambiar_modo('conductor')$q$);
SELECT pg_temp.probar('RV-03 X (sin carro) crea un viaje', 'rechazado',
  $q$INSERT INTO public.viajes (conductor_id, vehiculo_id, sector_id, origen_texto, origen_lat, origen_lng,
       destino_texto, destino_lat, destino_lng, salida_at, cupos_totales, cupos_disponibles)
     SELECT auth.uid(), v.id, current_setting('rls.sector')::BIGINT, 'x', 0, 0, 'x', 0, 0,
       NOW() + INTERVAL '1 day', 1, 1
     FROM public.vehiculos v WHERE v.propietario_id = current_setting('rls.c')::UUID$q$);
SELECT pg_temp.probar('RV-05 X crea un viaje a nombre de C', 'rechazado',
  $q$INSERT INTO public.viajes (conductor_id, vehiculo_id, sector_id, origen_texto, origen_lat, origen_lng,
       destino_texto, destino_lat, destino_lng, salida_at, cupos_totales, cupos_disponibles)
     SELECT current_setting('rls.c')::UUID, v.id, current_setting('rls.sector')::BIGINT, 'x', 0, 0, 'x', 0, 0,
       NOW() + INTERVAL '1 day', 1, 1
     FROM public.vehiculos v WHERE v.propietario_id = current_setting('rls.c')::UUID$q$);
SELECT pg_temp.probar('RV-09 X inicia T1', 'rechazado',
  $q$SELECT public.iniciar_viaje(current_setting('rls.t1')::UUID)$q$);
SELECT pg_temp.probar('RV-09 X cancela T1', 'rechazado',
  $q$SELECT public.cancelar_viaje(current_setting('rls.t1')::UUID)$q$);

-- Reservas
SELECT pg_temp.contar('RR-08 X lee reservas (no tiene ninguna)', 0,
  $q$SELECT count(*) FROM public.reservas$q$);
SELECT pg_temp.probar('RR-09 X acepta la reserva de Q', 'rechazado',
  $q$SELECT public.aceptar_reserva(current_setting('rls.r_q')::UUID)$q$);
SELECT pg_temp.probar('RR-10 X cancela la reserva de P', 'rechazado',
  $q$SELECT public.cancelar_reserva(current_setting('rls.r_p')::UUID)$q$);
SELECT pg_temp.probar('RR-11 X inserta una reserva "aceptada" sin la RPC', 'rechazado',
  $q$INSERT INTO public.reservas (viaje_id, pasajero_id, punto_recogida_texto, punto_lat, punto_lng, estado)
     VALUES (current_setting('rls.t1')::UUID, auth.uid(), 'x', 0, 0, 'aceptada')$q$);

-- Notificaciones
SELECT pg_temp.contar('RN-06 X lee notificaciones de otras personas', 0,
  $q$SELECT count(*) FROM public.notificaciones WHERE usuario_id <> auth.uid()$q$);
SELECT pg_temp.probar('RN-04 X marca como leída una notificación de C', 'rechazado',
  $q$UPDATE public.notificaciones SET leida = TRUE WHERE usuario_id = current_setting('rls.c')::UUID$q$);

-- -----------------------------------------------------------------------------
-- P (aceptada en T1): chat, reservas y notificaciones propias
-- -----------------------------------------------------------------------------
RESET ROLE;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('rls.p'), 'role', 'authenticated')::TEXT, true),
       set_config('rls.actor', 'P', true);
SET LOCAL ROLE authenticated;

SELECT pg_temp.paso('RM-02 P (aceptada) escribe en T1',
  $q$INSERT INTO public.mensajes (viaje_id, autor_id, contenido)
     VALUES (current_setting('rls.t1')::UUID, auth.uid(), 'prueba RLS') RETURNING id$q$);
SELECT pg_temp.probar('RM-05 P escribe a nombre de C', 'rechazado',
  $q$INSERT INTO public.mensajes (viaje_id, autor_id, contenido)
     VALUES (current_setting('rls.t1')::UUID, current_setting('rls.c')::UUID, 'suplantación')$q$);
SELECT pg_temp.contar('RR-01 P lee sus reservas', 2,
  $q$SELECT count(*) FROM public.reservas WHERE pasajero_id = auth.uid()$q$);
SELECT pg_temp.contar('RN-02 P lee su notificación "reserva aceptada" de T1', 1,
  $q$SELECT count(*) FROM public.notificaciones
     WHERE tipo = 'reserva_aceptada' AND datos->>'viaje_id' = current_setting('rls.t1')$q$);
SELECT pg_temp.contar('RN-01 P lee las notificaciones de C', 0,
  $q$SELECT count(*) FROM public.notificaciones WHERE usuario_id = current_setting('rls.c')::UUID$q$);
SELECT pg_temp.probar('RN-03 P inserta una notificación', 'rechazado',
  $q$INSERT INTO public.notificaciones (usuario_id, tipo, titulo, cuerpo)
     VALUES (current_setting('rls.c')::UUID, 'test', 'Test', 'cuerpo')$q$);
SELECT pg_temp.probar('RN-07 P cambia el título de su propia notificación', 'rechazado',
  $q$UPDATE public.notificaciones SET titulo = 'cambiado' WHERE usuario_id = auth.uid()$q$);
SELECT pg_temp.probar('RN-08 P marca como leídas sus notificaciones', 'permitido',
  $q$UPDATE public.notificaciones SET leida = TRUE WHERE usuario_id = auth.uid()$q$);

-- -----------------------------------------------------------------------------
-- Q (pendiente): no entra al chat ni ve reservas ajenas
-- -----------------------------------------------------------------------------
RESET ROLE;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('rls.q'), 'role', 'authenticated')::TEXT, true),
       set_config('rls.actor', 'Q', true);
SET LOCAL ROLE authenticated;

SELECT pg_temp.contar('RM-04 Q (pendiente) lee el chat de T1', 0,
  $q$SELECT count(*) FROM public.mensajes WHERE viaje_id = current_setting('rls.t1')::UUID$q$);
SELECT pg_temp.contar('RR-07 Q lee reservas de otras personas', 0,
  $q$SELECT count(*) FROM public.reservas WHERE pasajero_id <> auth.uid()$q$);
SELECT pg_temp.probar('RU-01 Q se pone "aceptada" sin la RPC', 'rechazado',
  $q$UPDATE public.reservas SET estado = 'aceptada' WHERE id = current_setting('rls.r_q')::UUID$q$);

-- -----------------------------------------------------------------------------
-- X frente al chat
-- -----------------------------------------------------------------------------
RESET ROLE;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('rls.x'), 'role', 'authenticated')::TEXT, true),
       set_config('rls.actor', 'X', true);
SET LOCAL ROLE authenticated;

SELECT pg_temp.contar('RM-01 X lee mensajes de cualquier viaje', 0,
  $q$SELECT count(*) FROM public.mensajes$q$);
SELECT pg_temp.probar('RM-03 X escribe en T1', 'rechazado',
  $q$INSERT INTO public.mensajes (viaje_id, autor_id, contenido)
     VALUES (current_setting('rls.t1')::UUID, auth.uid(), 'intruso')$q$);

-- -----------------------------------------------------------------------------
-- C: lee el chat, cancela T2, inicia y finaliza T1
-- -----------------------------------------------------------------------------
RESET ROLE;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('rls.c'), 'role', 'authenticated')::TEXT, true),
       set_config('rls.actor', 'C', true);
SET LOCAL ROLE authenticated;

SELECT pg_temp.contar('RM-06 C lee el mensaje de P en T1', 1,
  $q$SELECT count(*) FROM public.mensajes WHERE viaje_id = current_setting('rls.t1')::UUID$q$);
SELECT pg_temp.paso('RV-10 C cancela T2 (P estaba aceptada)',
  $q$SELECT public.cancelar_viaje(current_setting('rls.t2')::UUID)$q$);
SELECT pg_temp.probar('RM-07 C escribe en T2 cancelado', 'rechazado',
  $q$INSERT INTO public.mensajes (viaje_id, autor_id, contenido)
     VALUES (current_setting('rls.t2')::UUID, auth.uid(), 'viaje cancelado')$q$);

RESET ROLE;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('rls.p'), 'role', 'authenticated')::TEXT, true),
       set_config('rls.actor', 'P', true);
SET LOCAL ROLE authenticated;

SELECT pg_temp.probar('RM-07 P escribe en T2 cancelado', 'rechazado',
  $q$INSERT INTO public.mensajes (viaje_id, autor_id, contenido)
     VALUES (current_setting('rls.t2')::UUID, auth.uid(), 'viaje cancelado')$q$);
SELECT pg_temp.probar('RC-01 P califica T1 antes de finalizar', 'rechazado',
  $q$INSERT INTO public.calificaciones (viaje_id, autor_id, destinatario_id, estrellas)
     VALUES (current_setting('rls.t1')::UUID, auth.uid(), current_setting('rls.c')::UUID, 5)$q$);

RESET ROLE;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('rls.c'), 'role', 'authenticated')::TEXT, true),
       set_config('rls.actor', 'C', true);
SET LOCAL ROLE authenticated;

SELECT pg_temp.paso('RC-10 C inicia T1', $q$SELECT public.iniciar_viaje(current_setting('rls.t1')::UUID)$q$);
SELECT pg_temp.paso('RC-10 C finaliza T1', $q$SELECT public.finalizar_viaje(current_setting('rls.t1')::UUID)$q$);
SELECT pg_temp.paso('RC-05 C califica a P',
  $q$INSERT INTO public.calificaciones (viaje_id, autor_id, destinatario_id, estrellas, comentario)
     VALUES (current_setting('rls.t1')::UUID, auth.uid(), current_setting('rls.p')::UUID, 5, 'Puntual')
     RETURNING id$q$);
SELECT pg_temp.probar('RC-05 C califica a P por segunda vez', 'rechazado',
  $q$INSERT INTO public.calificaciones (viaje_id, autor_id, destinatario_id, estrellas)
     VALUES (current_setting('rls.t1')::UUID, auth.uid(), current_setting('rls.p')::UUID, 1)$q$);
SELECT pg_temp.probar('RC-03 C se califica a sí misma', 'rechazado',
  $q$INSERT INTO public.calificaciones (viaje_id, autor_id, destinatario_id, estrellas)
     VALUES (current_setting('rls.t1')::UUID, auth.uid(), auth.uid(), 5)$q$);
SELECT pg_temp.contar('RV-02 C ve sus dos viajes en cualquier estado', 2,
  $q$SELECT count(*) FROM public.viajes WHERE conductor_id = auth.uid()$q$);

-- -----------------------------------------------------------------------------
-- Calificaciones de P, Q y X
-- -----------------------------------------------------------------------------
RESET ROLE;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('rls.p'), 'role', 'authenticated')::TEXT, true),
       set_config('rls.actor', 'P', true);
SET LOCAL ROLE authenticated;

SELECT pg_temp.paso('RC-06 P califica a C',
  $q$INSERT INTO public.calificaciones (viaje_id, autor_id, destinatario_id, estrellas)
     VALUES (current_setting('rls.t1')::UUID, auth.uid(), current_setting('rls.c')::UUID, 4) RETURNING id$q$);
SELECT pg_temp.probar('RC-04 P califica a Q (otro pasajero)', 'rechazado',
  $q$INSERT INTO public.calificaciones (viaje_id, autor_id, destinatario_id, estrellas)
     VALUES (current_setting('rls.t1')::UUID, auth.uid(), current_setting('rls.q')::UUID, 3)$q$);
SELECT pg_temp.contar('RC-08 P lee las calificaciones de T1', 2,
  $q$SELECT count(*) FROM public.calificaciones WHERE viaje_id = current_setting('rls.t1')::UUID$q$);

RESET ROLE;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('rls.q'), 'role', 'authenticated')::TEXT, true),
       set_config('rls.actor', 'Q', true);
SET LOCAL ROLE authenticated;

SELECT pg_temp.probar('RC-07 Q (pendiente) califica a C', 'rechazado',
  $q$INSERT INTO public.calificaciones (viaje_id, autor_id, destinatario_id, estrellas)
     VALUES (current_setting('rls.t1')::UUID, auth.uid(), current_setting('rls.c')::UUID, 1)$q$);

RESET ROLE;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('rls.x'), 'role', 'authenticated')::TEXT, true),
       set_config('rls.actor', 'X', true);
SET LOCAL ROLE authenticated;

SELECT pg_temp.probar('RC-02 X califica a C', 'rechazado',
  $q$INSERT INTO public.calificaciones (viaje_id, autor_id, destinatario_id, estrellas)
     VALUES (current_setting('rls.t1')::UUID, auth.uid(), current_setting('rls.c')::UUID, 1)$q$);
SELECT pg_temp.contar('RC-09 X lee calificaciones (no participa en nada)', 0,
  $q$SELECT count(*) FROM public.calificaciones$q$);
SELECT pg_temp.contar('RV-06 X ve T1 finalizado', 0,
  $q$SELECT count(*) FROM public.viajes WHERE id = current_setting('rls.t1')::UUID$q$);

-- -----------------------------------------------------------------------------
-- Storage (R12): el SOAT solo lo lee su dueña; cada quien escribe en su carpeta
-- -----------------------------------------------------------------------------
SELECT pg_temp.contar('RS-01 X lee el SOAT de C', 0,
  $q$SELECT count(*) FROM storage.objects
     WHERE bucket_id = 'soat' AND name LIKE current_setting('rls.c') || '/%'$q$);
SELECT pg_temp.contar('RS-02 X lee el avatar de C', 1,
  $q$SELECT count(*) FROM storage.objects
     WHERE bucket_id = 'avatars' AND name LIKE current_setting('rls.c') || '/%'$q$);
SELECT pg_temp.probar('RS-04 X sube un archivo a la carpeta de C', 'rechazado',
  $q$INSERT INTO storage.objects (bucket_id, name) VALUES ('avatars', current_setting('rls.c') || '/intruso.jpg')$q$);
SELECT pg_temp.probar('RS-05 X sube un archivo a su carpeta', 'permitido',
  $q$INSERT INTO storage.objects (bucket_id, name) VALUES ('avatars', auth.uid() || '/avatar.jpg')$q$);

RESET ROLE;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('rls.c'), 'role', 'authenticated')::TEXT, true),
       set_config('rls.actor', 'C', true);
SET LOCAL ROLE authenticated;

SELECT pg_temp.contar('RS-03 C lee su SOAT', 1,
  $q$SELECT count(*) FROM storage.objects
     WHERE bucket_id = 'soat' AND name LIKE auth.uid() || '/%'$q$);

RESET ROLE;

-- -----------------------------------------------------------------------------
-- Resumen. Sale como un error A PROPÓSITO: el SQL Editor siempre lo muestra y el
-- error deshace todo lo de prueba.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  v_lineas TEXT;
  v_ok     INT;
  v_total  INT;
BEGIN
  SELECT string_agg(
           CASE WHEN esperado = obtenido THEN 'OK    ' ELSE 'FALLA ' END
           || prueba || ' [' || quien || ']: esperado ' || esperado || ', obtenido ' || obtenido
           || CASE WHEN esperado <> obtenido AND detalle IS NOT NULL THEN ' (' || detalle || ')' ELSE '' END,
           chr(10) ORDER BY t),
         count(*) FILTER (WHERE esperado = obtenido),
         count(*)
  INTO v_lineas, v_ok, v_total
  FROM resultados;
  RAISE EXCEPTION '%', 'RESULTADO RLS: ' || v_ok || ' de ' || v_total || ' correctas.' || chr(10) || v_lineas;
END $$;

ROLLBACK;
