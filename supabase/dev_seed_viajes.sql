-- =============================================================================
-- Semilla de desarrollo: viajes ficticios para pruebas (E5)
-- Autor: Samuel Borda (2026-11-06)
-- Ajuste: Sara Santacruz (2026-11-11): 10 viajes por defecto en vez de 200, la
-- conductora se busca por correo y los cupos no pasan de la capacidad del carro
-- (la migración 0009 lo exige en la base).
--
-- SOLO para desarrollo. NUNCA aplicar en producción.
-- Uso:
--   1. Cambia el correo de v_conductor_email por el de tu cuenta conductora
--      (debe tener carro registrado).
--   2. Deja v_cantidad en 10. Para medir el rendimiento con una lista larga
--      (R-01 en docs/PRUEBAS.md) ponlo en 200 y, al terminar, vuelve a 10 viajes
--      con supabase/dev_limpiar_viajes.sql.
--   3. Ejecuta este archivo en el SQL Editor de Supabase.
-- Los viajes quedan con origen "Sector de prueba N"; así los reconoce el script
-- de limpieza.
-- =============================================================================

DO $$
DECLARE
  v_conductor_email TEXT    := 'tu-conductora@unisabana.edu.co';
  v_cantidad        INTEGER := 10;
  v_conductor_id    UUID;
  v_vehiculo_id     UUID;
  v_capacidad       INTEGER;
  v_cupos           INTEGER;
  v_sector_id       BIGINT;
  i                 INTEGER;
  v_salida          TIMESTAMPTZ;
BEGIN
  SELECT id INTO v_conductor_id FROM public.profiles WHERE email = v_conductor_email;
  IF v_conductor_id IS NULL THEN
    RAISE EXCEPTION 'No existe un perfil con el correo %.', v_conductor_email;
  END IF;

  -- Obtener el vehículo del conductor de prueba
  SELECT id, capacidad INTO v_vehiculo_id, v_capacidad
  FROM public.vehiculos WHERE propietario_id = v_conductor_id;
  IF v_vehiculo_id IS NULL THEN
    RAISE EXCEPTION 'El conductor de prueba no tiene vehículo registrado.';
  END IF;
  -- Hasta 4 cupos, sin pasar la capacidad del carro (R4)
  v_cupos := LEAST(4, v_capacidad);

  -- Viajes distribuidos en los 11 sectores
  FOR i IN 1..v_cantidad LOOP
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
      v_cupos,
      v_cupos,
      'abierto'
    );
  END LOOP;

  RAISE NOTICE '% viajes de prueba creados correctamente.', v_cantidad;
END;
$$;
