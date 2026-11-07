-- =============================================================================
-- Migración 0002: Storage — buckets y políticas (R12)
-- Autor: Samuel Borda
-- Fecha: 2026-11-06
--
-- NOTA: si Supabase ya tiene Storage activado, este SQL crea los buckets y
-- sus políticas. Si prefieres crearlo desde el panel, sigue los pasos que
-- están en docs/ y salta esta migración.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Buckets privados
-- Los tres buckets son privados (public = false): ningún objeto es público por URL.
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars',   'avatars',   FALSE, 5242880,  ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('vehiculos', 'vehiculos', FALSE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('soat',      'soat',      FALSE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Políticas de Storage para el bucket "avatars"
-- Ruta esperada: {user_id}/avatar.jpg
-- Regla: el dueño escribe; cualquier autenticado lee (para mostrar avatares en tarjetas)
-- ---------------------------------------------------------------------------
CREATE POLICY "avatars: subida solo por el dueño"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "avatars: actualización solo por el dueño"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "avatars: eliminación solo por el dueño"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "avatars: lectura por usuarios autenticados"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');

-- ---------------------------------------------------------------------------
-- Políticas de Storage para el bucket "vehiculos"
-- Ruta esperada: {user_id}/vehiculo.jpg
-- Regla: el dueño escribe; cualquier autenticado lee (para mostrar foto del carro)
-- ---------------------------------------------------------------------------
CREATE POLICY "vehiculos: subida solo por el dueño"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'vehiculos'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "vehiculos: actualización solo por el dueño"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'vehiculos'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "vehiculos: eliminación solo por el dueño"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'vehiculos'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "vehiculos: lectura por usuarios autenticados"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'vehiculos');

-- ---------------------------------------------------------------------------
-- Políticas de Storage para el bucket "soat"
-- Ruta esperada: {user_id}/soat.pdf o soat.jpg
-- Regla: el dueño escribe Y lee (el SOAT es privado; nadie más lo ve)
-- ---------------------------------------------------------------------------
CREATE POLICY "soat: subida solo por el dueño"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'soat'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "soat: actualización solo por el dueño"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'soat'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "soat: eliminación solo por el dueño"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'soat'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Solo el dueño puede leer su SOAT
CREATE POLICY "soat: lectura solo por el dueño"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'soat'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

