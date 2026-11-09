-- =============================================================================
-- Migración 0007: Proteger políticas de UPDATE frente a bypass de RPCs (E6)
-- Autor: Samuel Borda
-- Fecha: 2026-11-09
--
-- Resuelve los hallazgos documentados en docs/API_CONTRATOS.md:
-- 1. Elimina la política de UPDATE directa en 'reservas'. Los cambios de estado
--    (aceptar, rechazar, cancelar) se ejecutan exclusivamente a través de las
--    RPCs transaccionales SECURITY DEFINER (aceptar_reserva, rechazar_reserva, cancelar_reserva).
-- 2. Elimina la política de UPDATE directa en 'viajes'. El ciclo de vida
--    (iniciar, finalizar, cancelar) se gestiona exclusivamente por las RPCs
--    SECURITY DEFINER (iniciar_viaje, finalizar_viaje, cancelar_viaje).
-- 3. Protege la columna 'modo_actual' en 'profiles' para que no pueda cambiarse
--    directamente saltándose la RPC cambiar_modo (que valida posesión de vehículo R3).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Proteger tabla reservas
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "reservas: actualización por conductor o pasajero" ON public.reservas;
COMMENT ON TABLE public.reservas IS 'Reservas de cupos; toda modificación de estado se realiza exclusivamente por RPCs transaccionales SECURITY DEFINER.';

-- ---------------------------------------------------------------------------
-- 2. Proteger tabla viajes
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "viajes: actualización solo por el conductor" ON public.viajes;
COMMENT ON TABLE public.viajes IS 'Viajes publicados; el ciclo de vida e inventario de cupos se gestionan exclusivamente por RPCs SECURITY DEFINER.';

-- ---------------------------------------------------------------------------
-- 3. Proteger modo_actual en profiles
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_proteger_modo_actual_perfil()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Si el usuario autenticado intenta alterar modo_actual directamente sin pasar por cambiar_modo
  IF NEW.modo_actual IS DISTINCT FROM OLD.modo_actual AND current_user = 'authenticated' THEN
    RAISE EXCEPTION 'sin_permiso'
      USING ERRCODE = 'P0001',
            MESSAGE = 'El modo actual no se puede modificar directamente. Usa la función cambiar_modo.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_proteger_modo_actual_perfil ON public.profiles;
CREATE TRIGGER trg_proteger_modo_actual_perfil
  BEFORE UPDATE OF modo_actual ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_proteger_modo_actual_perfil();

