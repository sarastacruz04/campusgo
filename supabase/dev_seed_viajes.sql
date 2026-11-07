-- =============================================================================
-- Semilla de desarrollo: viajes ficticios para pruebas de rendimiento (E5)
-- Autor: Samuel Borda
-- Fecha: 2026-11-06
--
-- SOLO para usar en entorno de desarrollo. NUNCA aplicar en producción.
-- Requiere que existan al menos un perfil conductor con vehículo en la BD.
-- Uso: 1) Crea un usuario conductor manualmente en Supabase.
--       2) Copia su UUID en la variable v_conductor_id de abajo.
--       3) Aplica este script en el SQL Editor de Supabase (dev).
-- =============================================================================

DO $$
DECLARE
  -- ⚠ Reemplaza con el UUID real del conductor de prueba
  v_conductor_id UUID := '00000000-0000-0000-0000-000000000000';
  v_vehiculo_id  UUID;
  v_sector_id    BIGINT;
  i              INTEGER;
  v_salida       TIMESTAMPTZ;
BEGIN
  -- Obtener el vehículo del conductor de prueba
  SELECT id INTO v_vehiculo_id FROM public.vehiculos WHERE propietario_id = v_conductor_id;
  IF v_vehiculo_id IS NULL THEN
    RAISE EXCEPTION 'El conductor de prueba no tiene vehículo registrado.';
  END IF;

  -- Generar 200 viajes distribuidos en los 11 sectores
  FOR i IN 1..200 LOOP
    -- Sector rotativo entre los disponibles
    SELECT id INTO v_sector_id FROM public.sectores ORDER BY id LIMIT 1 OFFSET ((i - 1) % 11);
    -- Salida entre 1 hora y 7 días en el futuro
    v_salida := NOW() + (INTERVAL '1 hour' * (1 + (i % 168)));

    INSERT INTO public.viajes (
      conductor_id, vehiculo_id, sector_id,
      origen_texto, origen_lat, origen_lng,
      destino_texto, destino_lat, destino_lng,
      salida_at, valor_por_cupo, cupos_totales, cupos_disponibles, estado
    ) VALUES (
      v_conductor_id,
      v_vehiculo_id,
      v_sector_id,
      'Sector de prueba ' || i,
      4.70 + (random() * 0.10),   -- lat aproximada Bogotá/Chía
      -74.05 + (random() * 0.10), -- lng aproximada
      'Universidad de La Sabana',
      4.8647,                     -- lat campus
      -74.0348,                   -- lng campus
      v_salida,
      CASE WHEN i % 3 = 0 THEN 0 ELSE (i % 5 + 1) * 1000 END,
      4,
      4,
      'abierto'
    );
  END LOOP;

  RAISE NOTICE '200 viajes de prueba creados correctamente.';
END;
$$;

