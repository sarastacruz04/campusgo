-- =============================================================================
-- Limpieza de desarrollo: deja solo 10 viajes de prueba
-- Autora: Sara Santacruz
-- Fecha: 2026-11-11
--
-- Borra los viajes que creó supabase/dev_seed_viajes.sql (origen "Sector de
-- prueba N" y destino "Universidad de La Sabana") y deja los 10 con la salida
-- futura más próxima, para que la lista de la app no quede enterrada en viajes
-- de prueba.
--
-- No toca:
--   - ningún viaje creado desde la app (su origen nunca empieza así);
--   - ningún viaje de prueba que tenga reservas: borrarlo borraría en cascada sus
--     reservas, mensajes y calificaciones, que pueden ser evidencia de pruebas.
--
-- Uso: pegar completo en el SQL Editor de Supabase y tocar Run. Al final muestra
-- cuántos viajes de prueba quedaron.
-- =============================================================================

BEGIN;

WITH de_prueba AS (
  SELECT v.id, v.salida_at
  FROM public.viajes v
  WHERE v.origen_texto LIKE 'Sector de prueba %'
    AND v.destino_texto = 'Universidad de La Sabana'
    AND NOT EXISTS (SELECT 1 FROM public.reservas r WHERE r.viaje_id = v.id)
),
se_quedan AS (
  -- Los 10 que salen más pronto (y todavía no han salido)
  SELECT id FROM de_prueba
  WHERE salida_at > NOW()
  ORDER BY salida_at
  LIMIT 10
)
DELETE FROM public.viajes
WHERE id IN (SELECT id FROM de_prueba)
  AND id NOT IN (SELECT id FROM se_quedan);

COMMIT;

-- Resultado (es lo que muestra el SQL Editor):
SELECT
  count(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM public.reservas r WHERE r.viaje_id = v.id))
    AS viajes_de_prueba_sin_reservas,
  count(*) FILTER (WHERE EXISTS (SELECT 1 FROM public.reservas r WHERE r.viaje_id = v.id))
    AS viajes_de_prueba_con_reservas_conservados
FROM public.viajes v
WHERE v.origen_texto LIKE 'Sector de prueba %'
  AND v.destino_texto = 'Universidad de La Sabana';
