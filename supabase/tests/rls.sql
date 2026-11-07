-- =============================================================================
-- Pruebas de políticas RLS — CampusGo
-- Autor: Samuel Borda
-- Fecha: 2026-11-06
--
-- Ejecuta estas pruebas en el SQL Editor de Supabase con un usuario de prueba
-- activo (set_config). Cada bloque tiene un comentario "ESPERADO: ..." que
-- indica el resultado correcto. Si una consulta devuelve filas cuando no debería
-- (o viceversa), la política tiene un error.
--
-- CONFIGURACIÓN PREVIA:
--   1. Crea usuario_a y usuario_b en Auth (correos @unisabana.edu.co).
--   2. Crea un vehículo para usuario_a.
--   3. Crea un viaje del conductor usuario_a.
--   4. Crea una reserva pendiente de usuario_b en ese viaje.
--   5. Reemplaza los UUIDs de las variables con los reales.
-- =============================================================================

-- Reemplaza estos UUIDs con los de tu entorno de prueba
-- \set usuario_a '11111111-1111-1111-1111-111111111111'
-- \set usuario_b '22222222-2222-2222-2222-222222222222'
-- \set id_viaje  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
-- \set id_reserva 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'

-- =============================================================================
-- BLOQUE 1: Perfil — el usuario solo ve/edita el suyo
-- =============================================================================

-- RP-01: usuario_a puede leer todos los perfiles (política: lectura por autenticados)
-- ESPERADO: devuelve filas (al menos el perfil de usuario_a y usuario_b)
-- SET LOCAL role TO 'authenticated';
-- SET LOCAL "request.jwt.claims" TO '{"sub": "<usuario_a>"}';
-- SELECT id FROM public.profiles;  -- debe devolver registros

-- RP-02: usuario_a NO puede insertar un perfil directamente
-- ESPERADO: error de política (el trigger lo hace, no el usuario)
-- INSERT INTO public.profiles (id, nombre, ...) VALUES (...);  -- debe fallar

-- RP-03: usuario_a puede actualizar su propio perfil
-- ESPERADO: 1 fila actualizada
-- UPDATE public.profiles SET telefono = '3001112233' WHERE id = '<usuario_a>';

-- RP-04: usuario_a NO puede actualizar el perfil de usuario_b
-- ESPERADO: 0 filas actualizadas (RLS filtra la fila)
-- UPDATE public.profiles SET telefono = '3009999999' WHERE id = '<usuario_b>';

-- =============================================================================
-- BLOQUE 2: Viajes — solo se ven los abiertos (pasajero) o propios (conductor)
-- =============================================================================

-- RV-01: usuario_b (pasajero) solo ve viajes con estado 'abierto' y salida futura
-- ESPERADO: solo viajes abiertos
-- SET LOCAL "request.jwt.claims" TO '{"sub": "<usuario_b>"}';
-- SELECT estado FROM public.viajes;  -- solo 'abierto'

-- RV-02: usuario_a (conductor) ve todos sus viajes sin importar estado
-- ESPERADO: todos los estados de sus viajes
-- SET LOCAL "request.jwt.claims" TO '{"sub": "<usuario_a>"}';
-- SELECT estado FROM public.viajes WHERE conductor_id = '<usuario_a>';

-- RV-03: usuario_b no puede crear un viaje (no es conductor con vehículo)
-- ESPERADO: error de política
-- INSERT INTO public.viajes (...) VALUES (...);  -- debe fallar

-- =============================================================================
-- BLOQUE 3: Reservas
-- =============================================================================

-- RR-01: usuario_b puede leer su propia reserva
-- ESPERADO: 1 fila
-- SET LOCAL "request.jwt.claims" TO '{"sub": "<usuario_b>"}';
-- SELECT id FROM public.reservas WHERE pasajero_id = '<usuario_b>';

-- RR-02: usuario_a (conductor) puede leer las reservas de su viaje
-- ESPERADO: filas de su viaje
-- SET LOCAL "request.jwt.claims" TO '{"sub": "<usuario_a>"}';
-- SELECT id FROM public.reservas WHERE viaje_id = '<id_viaje>';

-- RR-03: usuario_a NO puede leer reservas de viajes ajenos (si existieran)
-- ESPERADO: 0 filas para un viaje que no es suyo

-- RR-04: usuario_b puede crear una reserva en un viaje abierto
-- ESPERADO: INSERT exitoso (si no existe ya una del mismo pasajero)

-- RR-05: usuario_a (conductor) NO puede crear una reserva en su propio viaje
-- ESPERADO: error (la política exige pasajero_id = auth.uid() y la RPC bloquea reserva propia)

-- =============================================================================
-- BLOQUE 4: Mensajes — solo participantes del viaje
-- =============================================================================

-- RM-01: usuario_c (tercero sin reserva) NO puede leer el chat del viaje
-- ESPERADO: 0 filas
-- SET LOCAL "request.jwt.claims" TO '{"sub": "<usuario_c>"}';
-- SELECT id FROM public.mensajes WHERE viaje_id = '<id_viaje>';

-- RM-02: usuario_b (con reserva aceptada) SÍ puede leer el chat
-- ESPERADO: filas del chat
-- SET LOCAL "request.jwt.claims" TO '{"sub": "<usuario_b>"}';
-- SELECT id FROM public.mensajes WHERE viaje_id = '<id_viaje>';

-- RM-03: usuario_c NO puede enviar mensajes al chat del viaje
-- ESPERADO: error de política
-- INSERT INTO public.mensajes (viaje_id, autor_id, contenido)
-- VALUES ('<id_viaje>', '<usuario_c>', 'mensaje intruso');

-- =============================================================================
-- BLOQUE 5: Notificaciones — solo el destinatario
-- =============================================================================

-- RN-01: usuario_b NO puede leer las notificaciones de usuario_a
-- ESPERADO: 0 filas
-- SET LOCAL "request.jwt.claims" TO '{"sub": "<usuario_b>"}';
-- SELECT id FROM public.notificaciones WHERE usuario_id = '<usuario_a>';

-- RN-02: usuario_b puede leer sus propias notificaciones
-- ESPERADO: filas propias
-- SELECT id FROM public.notificaciones WHERE usuario_id = '<usuario_b>';

-- RN-03: nadie puede insertar notificaciones directamente
-- ESPERADO: error de política (lo hacen los triggers con SECURITY DEFINER)
-- INSERT INTO public.notificaciones (usuario_id, tipo, titulo, cuerpo)
-- VALUES ('<usuario_b>', 'test', 'Test', 'cuerpo');

-- =============================================================================
-- BLOQUE 6: Calificaciones — solo con viaje finalizado y participantes
-- =============================================================================

-- RC-01: usuario_b NO puede calificar si el viaje aún no está 'finalizado'
-- ESPERADO: error de política
-- INSERT INTO public.calificaciones (viaje_id, autor_id, destinatario_id, estrellas)
-- VALUES ('<id_viaje>', '<usuario_b>', '<usuario_a>', 5);

-- RC-02: usuario_c (tercero) NO puede calificar aunque el viaje esté finalizado
-- ESPERADO: error de política (no es participante)

-- =============================================================================
-- BLOQUE 7: Storage — SOAT solo lo lee el dueño
-- =============================================================================

-- RS-01: usuario_b NO puede leer el SOAT de usuario_a
-- ESPERADO: 0 objetos (la carpeta del SOAT es {usuario_a}/...)
-- SELECT name FROM storage.objects WHERE bucket_id = 'soat' AND name LIKE '<usuario_a>/%';
-- (consultado como usuario_b, debe devolver 0 filas)

-- RS-02: usuario_b SÍ puede ver el avatar de usuario_a (bucket avatars es compartido)
-- ESPERADO: 1 objeto si existe
-- SELECT name FROM storage.objects WHERE bucket_id = 'avatars' AND name LIKE '<usuario_a>/%';

