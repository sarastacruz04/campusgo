-- =============================================================================
-- Migración 0004: permitir perfiles incompletos al crear un usuario (R2)
-- Autora: Sara Santacruz
-- Fecha: 2026-11-07
--
-- Problema: al crear un usuario sin datos de perfil (por ejemplo, desde el panel
-- de Supabase, Authentication > Users > Add user), el trigger handle_new_user
-- insertaba id_universidad = '' y telefono = ''. Los CHECK de profiles exigen
-- exactamente 10 dígitos, la inserción fallaba y Supabase cancelaba la creación
-- del usuario con "Database error creating new user".
--
-- Solución:
-- 1. id_universidad y telefono aceptan NULL mientras el registro está incompleto.
--    Los CHECK siguen igual: un valor presente debe tener 10 dígitos (en
--    PostgreSQL un CHECK no rechaza NULL). UNIQUE admite varios NULL.
-- 2. El trigger guarda NULL (no '') cuando falta un dato. registro_completo
--    queda en FALSE y la app (Etapa 4) lleva a la persona al paso pendiente.
--
-- El registro desde la app no cambia: siempre manda los cuatro datos y, si un
-- dato tiene un formato inválido, el CHECK lo sigue rechazando.
--
-- Es idempotente: se puede ejecutar varias veces sin error.
-- =============================================================================

ALTER TABLE public.profiles ALTER COLUMN id_universidad DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN telefono DROP NOT NULL;

COMMENT ON COLUMN public.profiles.id_universidad IS
  'Identificador universitario de 10 dígitos, único. NULL solo mientras registro_completo = FALSE.';
COMMENT ON COLUMN public.profiles.telefono IS
  'Teléfono de 10 dígitos. NULL solo mientras registro_completo = FALSE.';

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
    -- nombre y apellido no tienen CHECK de formato: texto vacío si no llegan.
    COALESCE(BTRIM(NEW.raw_user_meta_data->>'nombre'), ''),
    COALESCE(BTRIM(NEW.raw_user_meta_data->>'apellido'), ''),
    -- NULLIF convierte '' en NULL para no chocar con el CHECK de 10 dígitos.
    NULLIF(BTRIM(NEW.raw_user_meta_data->>'id_universidad'), ''),
    NEW.email,
    NULLIF(BTRIM(NEW.raw_user_meta_data->>'telefono'), ''),
    'pasajero',
    FALSE
  );
  RETURN NEW;
END;
$$;

-- Comprobación (después de crear un usuario desde el panel):
-- SELECT id, email, nombre, id_universidad, telefono, registro_completo
-- FROM public.profiles ORDER BY created_at DESC LIMIT 5;
