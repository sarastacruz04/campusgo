-- =============================================================================
-- Migración 0006: los viajes llenos con salida futura se pueden leer
-- Autora: Sara Santacruz
-- Fecha: 2026-11-08
--
-- Problema: la política de lectura solo dejaba ver a los pasajeros los viajes
-- 'abierto'. Realtime respeta RLS y evalúa la fila ya cambiada: cuando un viaje
-- pasaba a 'lleno', el pasajero dejaba de poder leerlo y por lo tanto no recibía
-- ese último cambio. El viaje seguía en su lista hasta recargar, y una reserva
-- pendiente perdía los datos de su viaje.
--
-- Solución: también se pueden leer los viajes 'lleno' con salida futura. La regla
-- R6 ("un viaje lleno deja de aparecer en la búsqueda") se sigue cumpliendo porque
-- la búsqueda de la app filtra estado = 'abierto' (services/tripService.ts), y
-- reservar un viaje lleno lo sigue rechazando la RPC crear_reserva.
--
-- Es idempotente: se puede ejecutar varias veces sin error.
-- =============================================================================

DROP POLICY IF EXISTS "viajes: lectura de viajes abiertos o propios" ON public.viajes;
CREATE POLICY "viajes: lectura de viajes abiertos o propios"
  ON public.viajes FOR SELECT
  TO authenticated
  USING (
    -- El conductor ve todos sus viajes sin importar el estado
    conductor_id = auth.uid()
    -- Los autenticados ven los viajes abiertos o llenos que aún no han salido
    OR (estado IN ('abierto', 'lleno') AND salida_at > NOW())
    -- El pasajero con reserva aceptada ve su viaje en cualquier estado
    OR public.tiene_reserva_aceptada(id, auth.uid())
  );
