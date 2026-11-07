-- =============================================================================
-- Semilla: sectores de CampusGo (R17)
-- Autor: Samuel Borda
-- Fecha: 2026-11-06
--
-- Solo datos ficticios de sectores geográficos; sin usuarios reales.
-- Aplica después de la migración 0001.
-- =============================================================================

INSERT INTO public.sectores (nombre) VALUES
  ('Colina'),
  ('Calle 116'),
  ('Usaquén'),
  ('Calle 100'),
  ('Cedritos'),
  ('Chapinero'),
  ('Suba'),
  ('Niza'),
  ('Chía'),
  ('Cajicá'),
  ('Zipaquirá')
ON CONFLICT (nombre) DO NOTHING;

