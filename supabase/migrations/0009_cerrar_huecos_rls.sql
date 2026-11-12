-- =============================================================================
-- Migración 0009: cerrar los huecos que encontró la prueba de RLS (Etapa 8)
-- Autora: Sara Santacruz
-- Fecha: 2026-11-11
--
-- supabase/tests/rls.sql dio 79 de 82 con las migraciones 0001 a 0008. Esta
-- migración corrige las tres fallas y agrega en la base la validación de R4,
-- que hasta ahora solo hacía la app:
--
-- 1. RP-05: cualquier usuario autenticado leía teléfono, correo e ID
--    universitario de todos (la política de lectura de profiles es USING (TRUE)).
--    Ahora los demás solo leen id, nombre, apellido, avatar_path y modo_actual;
--    de otras personas la app solo muestra nombre y apellido. El perfil propio
--    completo se lee con la función mi_perfil().
-- 2. RU-03: el trigger que protege modo_actual (0007) comparaba
--    current_user = 'authenticated', pero era SECURITY DEFINER y dentro de una
--    función así current_user es su dueño: nunca se disparaba. Pasa a SECURITY
--    INVOKER y, además, modo_actual deja de ser editable por columna.
-- 3. RR-11: la política de INSERT de reservas solo exigía pasajero_id = auth.uid(),
--    así que se podía insertar una reserva 'aceptada' sin la RPC y entrar al chat.
--    Se elimina: las reservas solo se crean con crear_reserva (R5).
-- 4. R4: un trigger rechaza viajes con el carro de otra persona, con salida en
--    el pasado, con más cupos que la capacidad o que no empiezan abiertos.
--
-- La app no usa nada de lo que se cierra: crea reservas y cambia de modo con
-- RPC, y de otras personas solo lee nombre y apellido.
--
-- Es idempotente: se puede ejecutar varias veces sin error.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. profiles: datos privados solo para su dueño (RP-05)
-- ---------------------------------------------------------------------------
-- Privilegios por columna: la política de lectura sigue dejando ver todas las
-- FILAS, pero un autenticado solo puede leer estas COLUMNAS. anon no lee nada.
-- modo_actual también queda legible: no es un dato privado y la política de
-- creación de viajes (0001) lo consulta con los permisos de quien crea el viaje;
-- sin él, crear un viaje falla con "permission denied for table profiles".
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, nombre, apellido, avatar_path, modo_actual) ON public.profiles TO authenticated;

-- Solo se editan las columnas que la app edita (perfil y registro). modo_actual
-- cambia solo con cambiar_modo (R3) y email lo controla Supabase Auth.
REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (nombre, apellido, id_universidad, telefono, avatar_path, registro_completo)
  ON public.profiles TO authenticated;

-- Perfil propio completo. SECURITY DEFINER para leer todas las columnas, pero
-- siempre filtrado por auth.uid(): nadie puede pedir el perfil de otra persona.
CREATE OR REPLACE FUNCTION public.mi_perfil()
RETURNS SETOF public.profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
-- search_path fijo para evitar inyección de esquema (R13)
SET search_path = public
AS $$
  SELECT * FROM public.profiles WHERE id = auth.uid();
$$;

REVOKE EXECUTE ON FUNCTION public.mi_perfil() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mi_perfil() TO authenticated;

COMMENT ON FUNCTION public.mi_perfil() IS
  'Devuelve el perfil completo (con correo, teléfono e ID) solo de quien tiene la sesión.';

-- ---------------------------------------------------------------------------
-- 2. modo_actual: el trigger de 0007 vuelve a funcionar (RU-03)
-- ---------------------------------------------------------------------------
-- Con SECURITY INVOKER, current_user es quien hace el UPDATE: 'authenticated'
-- desde la app (se rechaza) o el dueño de cambiar_modo, que es SECURITY DEFINER
-- (se permite). Es una segunda barrera además del privilegio por columna de arriba.
ALTER FUNCTION public.fn_proteger_modo_actual_perfil() SECURITY INVOKER;

-- ---------------------------------------------------------------------------
-- 3. reservas: solo se crean con la RPC crear_reserva (RR-11)
-- ---------------------------------------------------------------------------
-- Sin política de INSERT, RLS rechaza cualquier INSERT directo. crear_reserva es
-- SECURITY DEFINER (corre como el dueño de la tabla), así que no la necesita.
DROP POLICY IF EXISTS "reservas: creación solo por el pasajero" ON public.reservas;
REVOKE INSERT ON public.reservas FROM anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. notificaciones: el destinatario solo cambia "leida"
-- ---------------------------------------------------------------------------
-- La app solo marca como leídas; así nadie reescribe el título o el cuerpo.
REVOKE UPDATE ON public.notificaciones FROM anon, authenticated;
GRANT UPDATE (leida) ON public.notificaciones TO authenticated;

-- ---------------------------------------------------------------------------
-- 5. viajes: reglas de R4 en la base
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_validar_viaje_nuevo()
RETURNS TRIGGER
LANGUAGE plpgsql
-- SECURITY DEFINER para leer el carro sin depender de las políticas de vehiculos.
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_capacidad INTEGER;
BEGIN
  -- El carro debe ser de quien crea el viaje
  SELECT capacidad INTO v_capacidad
  FROM public.vehiculos
  WHERE id = NEW.vehiculo_id AND propietario_id = NEW.conductor_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'vehiculo_ajeno' USING
      HINT = 'El viaje debe usar el carro registrado de quien lo crea.';
  END IF;

  IF NEW.salida_at <= NOW() THEN
    RAISE EXCEPTION 'salida_pasada' USING
      HINT = 'La fecha y hora de salida deben estar en el futuro.';
  END IF;

  IF NEW.cupos_totales > v_capacidad THEN
    RAISE EXCEPTION 'cupos_excede_capacidad' USING
      HINT = 'Los cupos no pueden superar la capacidad del carro.';
  END IF;

  -- Un viaje nuevo empieza abierto y con todos sus cupos libres; el resto del
  -- ciclo lo manejan las RPC (aceptar_reserva, iniciar_viaje, …).
  IF NEW.estado <> 'abierto' OR NEW.cupos_disponibles <> NEW.cupos_totales THEN
    RAISE EXCEPTION 'viaje_inicial_invalido' USING
      HINT = 'Un viaje nuevo empieza abierto y con todos sus cupos disponibles.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validar_viaje_nuevo ON public.viajes;
CREATE TRIGGER trg_validar_viaje_nuevo
  BEFORE INSERT ON public.viajes
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_validar_viaje_nuevo();

-- PostgREST (la API de Supabase) vuelve a leer el esquema para ver mi_perfil.
NOTIFY pgrst, 'reload schema';

-- Comprobación: ejecutar supabase/tests/rls.sql; debe decir "92 de 92 correctas".
