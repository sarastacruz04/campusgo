-- =============================================================================
-- Migración 0005: quitar la recursión entre las políticas de viajes y reservas
-- Autora: Sara Santacruz
-- Fecha: 2026-11-07
--
-- Problema: la política de lectura de "viajes" consultaba "reservas" (para que el
-- pasajero con reserva aceptada vea su viaje) y la de "reservas" consultaba
-- "viajes" (para que el conductor vea las reservas de sus viajes). Cada consulta
-- dispara la política de la otra tabla, que dispara la primera otra vez:
-- PostgreSQL lo detecta y rechaza la consulta con
--   42P17: infinite recursion detected in policy for relation "viajes"
-- En la app, la búsqueda de viajes y "Mis reservas" fallaban siempre.
--
-- Solución (patrón recomendado por Supabase): dos funciones SECURITY DEFINER que
-- hacen esa comprobación sin pasar por RLS (corren como el dueño de las tablas),
-- y las políticas las usan en lugar de la subconsulta. Las reglas de quién ve qué
-- NO cambian: solo se rompe el ciclo.
--
-- Es idempotente: se puede ejecutar varias veces sin error.
-- =============================================================================

-- ¿El usuario es el conductor de este viaje?
CREATE OR REPLACE FUNCTION public.es_conductor_del_viaje(p_viaje_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
-- search_path fijo para evitar inyección de esquema (R13)
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.viajes WHERE id = p_viaje_id AND conductor_id = p_user_id
  );
$$;

-- ¿El usuario tiene una reserva aceptada en este viaje?
CREATE OR REPLACE FUNCTION public.tiene_reserva_aceptada(p_viaje_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.reservas
    WHERE viaje_id = p_viaje_id AND pasajero_id = p_user_id AND estado = 'aceptada'
  );
$$;

-- Viajes: el conductor ve todos los suyos; los pasajeros ven los abiertos con
-- salida futura y aquellos en los que tienen una reserva aceptada (igual que 0001).
DROP POLICY IF EXISTS "viajes: lectura de viajes abiertos o propios" ON public.viajes;
CREATE POLICY "viajes: lectura de viajes abiertos o propios"
  ON public.viajes FOR SELECT
  TO authenticated
  USING (
    conductor_id = auth.uid()
    OR (estado = 'abierto' AND salida_at > NOW())
    OR public.tiene_reserva_aceptada(id, auth.uid())
  );

-- Reservas: el pasajero ve las suyas y el conductor las de sus viajes (igual que 0001).
DROP POLICY IF EXISTS "reservas: lectura por conductor o pasajero" ON public.reservas;
CREATE POLICY "reservas: lectura por conductor o pasajero"
  ON public.reservas FOR SELECT
  TO authenticated
  USING (
    pasajero_id = auth.uid()
    OR public.es_conductor_del_viaje(viaje_id, auth.uid())
  );

-- Mismo cambio en la política de actualización, que también consultaba viajes.
-- (Su alcance no cambia; ver los hallazgos de la Etapa 3 en docs/API_CONTRATOS.md.)
DROP POLICY IF EXISTS "reservas: actualización por conductor o pasajero" ON public.reservas;
CREATE POLICY "reservas: actualización por conductor o pasajero"
  ON public.reservas FOR UPDATE
  TO authenticated
  USING (
    pasajero_id = auth.uid()
    OR public.es_conductor_del_viaje(viaje_id, auth.uid())
  );

-- Comprobación (como usuario autenticado desde la app, o en el SQL Editor):
-- SELECT count(*) FROM public.viajes;  -- ya no debe dar el error 42P17
