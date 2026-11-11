-- =============================================================================
-- Migración 0008: Restringir calificaciones a pares conductor-pasajero (R9, E7)
-- Autor: Samuel Borda
-- Fecha: 2026-11-10
--
-- Refuerza la regla R9 en Supabase:
-- - Solo el autor autenticado puede crear su propia calificación (autor_id = auth.uid()).
-- - Impide la auto-calificación (autor_id <> destinatario_id).
-- - El viaje debe estar en estado 'finalizado'.
-- - El conductor solo puede calificar a pasajeros con reserva 'aceptada' en ese viaje,
--   y un pasajero con reserva 'aceptada' solo puede calificar al conductor del viaje.
-- Usa las funciones SECURITY DEFINER es_conductor_del_viaje y tiene_reserva_aceptada
-- (migración 0005) para evitar recursión en políticas RLS.
-- =============================================================================

DROP POLICY IF EXISTS "calificaciones: creación por el autor" ON public.calificaciones;

CREATE POLICY "calificaciones: creación por el autor"
  ON public.calificaciones FOR INSERT
  TO authenticated
  WITH CHECK (
    autor_id = auth.uid()
    AND autor_id <> destinatario_id
    AND EXISTS (
      SELECT 1 FROM public.viajes v
      WHERE v.id = viaje_id AND v.estado = 'finalizado'
    )
    AND (
      (
        public.es_conductor_del_viaje(viaje_id, auth.uid())
        AND public.tiene_reserva_aceptada(viaje_id, destinatario_id)
      )
      OR (
        public.tiene_reserva_aceptada(viaje_id, auth.uid())
        AND public.es_conductor_del_viaje(viaje_id, destinatario_id)
      )
    )
  );

