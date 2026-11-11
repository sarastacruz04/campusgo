# docs/API_CONTRATOS.md — Contratos de servicio de CampusGo

Generado en: Etapa 2 (2026-11-06). Actualizar en cada etapa que agregue o modifique RPCs o tablas.

Convención: los errores devueltos por las RPC son objetos `{ code: string; message: string }` (tipo `AppError` definido en la Etapa 3). Los `code` corresponden exactamente al `SQLSTATE` o al `RAISE EXCEPTION` name de la función.

---

## Tablas expuestas (PostgREST)

### `profiles`

| Operación | Quién | Columnas de entrada | Resultado | Errores |
|-----------|-------|---------------------|-----------|---------|
| SELECT    | Cualquier autenticado | — | Todas las columnas de la fila propia o ajena | — |
| UPDATE    | El dueño (`id = auth.uid()`) | `nombre`, `apellido`, `id_universidad`, `telefono`, `avatar_path`, `registro_completo` | Fila actualizada | `RLS_violation` si intenta editar ajeno |

Desde la migración 0004, `id_universidad` y `telefono` pueden ser `NULL` mientras `registro_completo = false` (perfil creado sin datos, por ejemplo desde el panel de Supabase). Un valor presente debe tener 10 dígitos (D-40).
| INSERT    | Prohibido por RLS | — | — | `RLS_violation` |

### `sectores`

| Operación | Quién | Resultado |
|-----------|-------|-----------|
| SELECT    | Cualquier autenticado | Lista completa de sectores |

### `vehiculos`

| Operación | Quién | Columnas de entrada | Resultado | Errores |
|-----------|-------|---------------------|-----------|---------|
| SELECT    | Cualquier autenticado | — | Vehículo por `propietario_id` | — |
| INSERT    | El propietario | `propietario_id`, `placa`, `capacidad`, `marca`, `modelo`, `foto_path`?, `soat_path`? | Vehículo creado | `unique_violation` (placa o propietario duplicado), `check_violation` (formato de placa, rango de capacidad) |
| UPDATE    | El propietario | `placa`, `capacidad`, `marca`, `modelo`, `foto_path`, `soat_path` | Vehículo actualizado | `RLS_violation` si ajeno |
| DELETE    | El propietario | — | — | `RLS_violation` si ajeno |

### `viajes`

| Operación | Quién | Columnas de entrada | Resultado | Errores |
|-----------|-------|---------------------|-----------|---------|
| SELECT    | Conductor (todos sus viajes) o pasajero (`abierto` o `lleno` con salida futura, o con reserva aceptada) | — | Filas visibles según RLS | — |
| INSERT    | Conductor en modo conductor con vehículo | `conductor_id`, `vehiculo_id`, `sector_id`, `origen_*`, `destino_*`, `salida_at`, `valor_por_cupo`, `cupos_totales`, `cupos_disponibles` | Viaje creado con `estado='abierto'` | `RLS_violation`, `check_violation` (cupos, valor), `foreign_key_violation` |

### `notificaciones`

| Operación | Quién | Resultado |
|-----------|-------|-----------|
| SELECT    | El destinatario (`usuario_id = auth.uid()`) | Sus notificaciones ordenadas por `created_at DESC` |
| UPDATE    | El destinatario | Marcar `leida = true` |

### `mensajes`

| Operación | Quién | Columnas de entrada | Resultado | Errores |
|-----------|-------|---------------------|-----------|---------|
| SELECT    | Participante del viaje | — | Mensajes del viaje ordenados por `created_at` | — |
| INSERT    | Participante, viaje no cancelado | `viaje_id`, `autor_id`, `contenido` | Mensaje guardado | `RLS_violation`, `check_violation` (contenido vacío o > 500 chars) |

---

## Funciones RPC

### `cambiar_modo(p_nuevo_modo TEXT) → void`

Cambia el `modo_actual` del usuario autenticado.

**Entrada:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `p_nuevo_modo` | `TEXT` | `'pasajero'` o `'conductor'` |

**Salida:** `void` (sin retorno; la fila de `profiles` queda actualizada).

**Errores:**

| code | Mensaje en español |
|------|--------------------|
| `modo_invalido` | El modo debe ser pasajero o conductor. |
| `sin_vehiculo` | Debes registrar un vehículo antes de cambiar a modo conductor. |

---

### `crear_reserva(p_viaje_id UUID, p_punto_recogida_texto TEXT, p_punto_lat FLOAT8, p_punto_lng FLOAT8) → UUID`

Crea una reserva verificando todas las reglas de negocio (R5) de forma transaccional.

**Entrada:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `p_viaje_id` | `UUID` | Viaje a reservar |
| `p_punto_recogida_texto` | `TEXT` | Dirección del punto de recogida |
| `p_punto_lat` | `FLOAT8` | Latitud del punto de recogida |
| `p_punto_lng` | `FLOAT8` | Longitud del punto de recogida |

**Salida:** `UUID` del id de la reserva recién creada.

**Errores:**

| code | Mensaje en español |
|------|--------------------|
| `viaje_no_encontrado` | El viaje solicitado no existe. |
| `reserva_propia` | No puedes reservar tu propio viaje. |
| `viaje_no_abierto` | Este viaje ya no acepta reservas. |
| `sin_cupos` | No quedan cupos disponibles en este viaje. |
| `viaje_pasado` | La hora de salida ya pasó. |
| `reserva_duplicada` | Ya tienes una reserva en este viaje. |

---

### `aceptar_reserva(p_reserva_id UUID) → void`

Acepta una reserva pendiente, descuenta un cupo y cierra el viaje si llega a cero (R6).

**Entrada:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `p_reserva_id` | `UUID` | Reserva a aceptar |

**Salida:** `void`.

**Errores:**

| code | Mensaje en español |
|------|--------------------|
| `reserva_no_encontrada` | La reserva no existe. |
| `sin_permiso` | Solo el conductor del viaje puede aceptar reservas. |
| `reserva_no_pendiente` | Solo se pueden aceptar reservas pendientes. |
| `sin_cupos` | No quedan cupos disponibles en el viaje. |

---

### `rechazar_reserva(p_reserva_id UUID) → void`

Rechaza una reserva pendiente.

**Entrada / Salida:** igual que `aceptar_reserva`.

**Errores:** `reserva_no_encontrada`, `sin_permiso`, `reserva_no_pendiente`.

---

### `cancelar_reserva(p_reserva_id UUID) → void`

El pasajero cancela su reserva. Si estaba aceptada, devuelve el cupo (R7).

**Entrada:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `p_reserva_id` | `UUID` | Reserva a cancelar |

**Errores:**

| code | Mensaje en español |
|------|--------------------|
| `reserva_no_encontrada` | La reserva no existe. |
| `sin_permiso` | Solo el pasajero puede cancelar su propia reserva. |
| `reserva_no_cancelable` | La reserva ya fue rechazada o cancelada. |

---

### `iniciar_viaje(p_viaje_id UUID) → void`

El conductor pone el viaje en estado `'en_curso'`. Exige al menos una reserva aceptada (R8).

**Errores:**

| code | Mensaje en español |
|------|--------------------|
| `viaje_no_encontrado` | El viaje no existe. |
| `sin_permiso` | Solo el conductor puede iniciar el viaje. |
| `viaje_no_iniciable` | El viaje ya fue iniciado, finalizado o cancelado. |
| `sin_pasajeros` | Debes tener al menos una reserva aceptada para iniciar el viaje. |

---

### `finalizar_viaje(p_viaje_id UUID) → void`

El conductor pone el viaje en estado `'finalizado'` (R8).

**Errores:** `viaje_no_encontrado`, `sin_permiso`, `viaje_no_en_curso`.

---

### `cancelar_viaje(p_viaje_id UUID) → void`

El conductor cancela el viaje. El trigger cancela las reservas y notifica a los pasajeros (R8).

**Errores:** `viaje_no_encontrado`, `sin_permiso`, `viaje_ya_cerrado`.

---

## Vista `promedio_calificaciones`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `usuario_id` | `UUID` | Destinatario de las calificaciones |
| `promedio` | `NUMERIC(5,2)` | Promedio redondeado a 2 decimales |
| `total` | `BIGINT` | Número total de calificaciones recibidas |

**Acceso:** `SELECT` libre para cualquier usuario autenticado (hereda las políticas de `calificaciones`).

---

## Servicios del cliente (Etapa 3)

Los servicios en `services/` son las únicas funciones que hablan con Supabase. No usan React. Cada una devuelve datos tipados (`types/database.ts` y `types/domain.ts`) o **lanza un `AppError`** `{ code, message }` con el mensaje en español.

Los thunks (`features/*/thunks.ts`) llaman a los servicios, atrapan el error y lo entregan con `rejectWithValue`. Las pantallas nunca llaman a los servicios directamente.

### Errores (`services/errors.ts`)

`toAppError(error)` traduce cualquier error. Si aparece un error nuevo, se agrega allí.

| Origen | Cómo llega | `code` del AppError |
|--------|-----------|---------------------|
| RPC con `RAISE EXCEPTION 'x'` | `{ code: 'P0001', message: 'x' }` | `x` (por ejemplo `reserva_duplicada`), con el mensaje de la tabla de RPC de arriba |
| Supabase Auth | `AuthApiError.code` | `invalid_credentials`, `email_not_confirmed`, `user_already_exists`, `email_exists`, `weak_password`, `otp_expired`, `over_email_send_rate_limit`, `over_request_rate_limit` |
| CHECK de correo en el trigger `handle_new_user` (R1) | `"Database error saving new user"` | `correo_no_institucional` |
| PostgreSQL y PostgREST | `23505`, `23514`, `23503`, `42501`, `PGRST116` | `duplicado`, `datos_invalidos`, `referencia_invalida`, `sin_permiso`, `no_encontrado` |
| Sin red | `"Network request failed"` o `AuthRetryableFetchError` | `sin_conexion` |
| Propios de la app | — | `sin_sesion`, `mensaje_invalido`, `chat_sin_acceso`, `desconocido` |

### `authService`

| Función | Entrada | Salida | Errores principales |
|---------|---------|--------|---------------------|
| `signIn(email, password)` | correo y contraseña | `{ userId, email }` | `invalid_credentials`, `email_not_confirmed`, `sin_conexion` |
| `signUp(input)` | `{ email, password, nombre, apellido, idUniversidad, telefono }`; los datos van en `options.data` con las claves que lee `handle_new_user` | `void` (Supabase envía el código de 6 dígitos) | `correo_no_institucional` (se revisa en la app y en la base), `user_already_exists`, `weak_password` |
| `verifySignUpCode(email, token)` | correo y código de 6 dígitos (`verifyOtp`, tipo `email`) | `{ userId, email }` | `otp_expired` |
| `resendSignUpCode(email)` | correo | `void` | `over_email_send_rate_limit` |
| `signOut()` | — | `void`; borra la sesión cifrada y su llave | sin red no bloquea el cierre |
| `getCurrentUser()` | — | `{ userId, email }` o `null` (lee la sesión guardada, sin red) | — |
| `onSessionChange(callback)` | función | función para dejar de escuchar | — |

### `profileService`

| Función | Entrada | Salida | Errores |
|---------|---------|--------|---------|
| `getProfile(userId)` | id | `Profile` | `no_encontrado` |
| `updateProfile(userId, changes)` | `nombre`, `apellido`, `telefono`, `avatar_path`, `registro_completo` | `Profile` | `datos_invalidos` (teléfono que no tiene 10 dígitos) |
| `changeMode(modo)` | `'pasajero'` o `'conductor'` (RPC `cambiar_modo`) | `void` | `sin_vehiculo`, `modo_invalido` |

### `vehicleService`

| Función | Entrada | Salida | Errores |
|---------|---------|--------|---------|
| `getMyVehicle(userId)` | id | `Vehiculo` o `null` | — |
| `createVehicle(input)` | fila de `vehiculos`; la placa se pasa a mayúsculas | `Vehiculo` | `duplicado` (placa o segundo carro), `datos_invalidos` |
| `updateVehicle(id, changes)` | cambios | `Vehiculo` | `sin_permiso` |
| `deleteVehicle(id)` | id | `void` | `sin_permiso` |

### `tripService`

| Función | Entrada | Salida | Errores |
|---------|---------|--------|---------|
| `listSectores()` | — | `Sector[]` ordenados por nombre | — |
| `searchOpenTrips(params)` | `{ sectorId, minCupos, offset, excludeConductorId }` | `TripListItem[]` (páginas de 20, `estado = 'abierto'` y salida futura, de la más próxima a la más lejana) | `sin_conexion` |
| `listMyCreatedTrips(conductorId)` | id | `TripListItem[]` | — |
| `getTrip(id)` | id | `TripListItem` | `no_encontrado` |
| `createTrip(input)` | `CreateTripInput`; `cupos_disponibles` empieza en `cupos_totales` | `TripListItem` | `sin_permiso` (RLS: no es conductor o no tiene carro), `datos_invalidos` |
| `startTrip(id)` / `finishTrip(id)` / `cancelTrip(id)` | id (RPC del ciclo del viaje) | `void` | los de las RPC `iniciar_viaje`, `finalizar_viaje` y `cancelar_viaje` |
| `subscribeToTripChanges(onChange)` | función | función que cierra el canal Realtime | — |

`TripListItem` = fila de `viajes` + `sector_nombre` + `conductor_nombre`. Se obtienen en una sola consulta: `select('*, sector:sectores(nombre), conductor:profiles(nombre, apellido)')`.

### `reservationService`

| Función | Entrada | Salida | Errores |
|---------|---------|--------|---------|
| `createReservation(input)` | `{ viajeId, puntoRecogidaTexto, puntoLat, puntoLng }` (RPC `crear_reserva`) | `ReservationItem` | los de `crear_reserva` |
| `getReservation(id)` | id | `ReservationItem` | `no_encontrado` |
| `listMyReservations(pasajeroId)` | id | `ReservationItem[]`, las más recientes primero | — |
| `listRequestsForMyTrips(conductorId)` | id | `ReservationItem[]` de sus viajes | — |
| `acceptReservation` / `rejectReservation` / `cancelReservation` | id de la reserva | `void` | los de las RPC |
| `subscribeToReservationChanges(onChange)` | función | función que cierra el canal | — |

`ReservationItem` = fila de `reservas` + `viaje` (`TripListItem` o `null` si RLS ya no deja verlo) + `pasajero_nombre`.

### Otros servicios

| Servicio | Funciones |
|----------|-----------|
| `storageService` | `uploadImage({ bucket, userId, fileName, uri, contentType })` devuelve la ruta `{userId}/{fileName}`; `getSignedUrl(bucket, path, segundos)`; `removeFile(bucket, path)`. Buckets: `avatars`, `vehiculos`, `soat`. |
| `ratingService` | `submitRating({ viajeId, autorId, destinatarioId, estrellas, comentario })`; `getAverages(userIds)` sobre la vista `promedio_calificaciones`; `getTripRatingContext(viajeId, currentUserId)` (carga viaje, destinatarios elegibles según rol y calificaciones previas del autor). |
| `notificationService` | `listNotifications(userId)` (50 más recientes); `markAsRead(id)`; `markAllAsRead(userId)`; `subscribeToNotifications(userId, onInsert)`. |
| `chatService` | `isParticipant(viajeId, userId)` llama a la función `es_participante_del_viaje` y devuelve boolean; `listMessages(viajeId)` devuelve `{ messages, authorNames }` (mensajes del más antiguo al más nuevo y el nombre de cada autor, con `autor:profiles(nombre, apellido)`); `getAuthorNames(ids)` para autores que llegan por Realtime; `sendMessage(viajeId, autorId, contenido)` (máximo 500 caracteres); `subscribeToMessages(viajeId, onInsert)`. El thunk `fetchMessages` falla con `chat_sin_acceso` si `isParticipant` es false (D-56). |

### Realtime

- La migración `0003_realtime.sql` agrega `viajes`, `reservas`, `notificaciones` y `mensajes` a la publicación `supabase_realtime`. Sin ella, Realtime no envía nada.
- Realtime respeta RLS: cada usuario solo recibe cambios de filas que puede leer.
- Un viaje que pasa a `lleno` sigue siendo legible (migración 0006), así que Realtime avisa y `tripChanged` lo saca de la búsqueda en vivo. Los viajes nuevos no entran por Realtime: aparecen al volver a la pantalla o al deslizar para actualizar.

### Caché sin conexión (`db/`)

| Función | Qué hace |
|---------|----------|
| `loadWithCache({ userId, key, isOnline, fetcher })` | Con red pide los datos y guarda una copia. Sin red, o si falla por red, devuelve la copia con `fromCache: true` y `cachedAt`. Sin copia lanza `sin_conexion`. Los otros errores no se tapan. |
| `saveCache`, `readCache`, `clearUserCache` | Tabla `cache(user_id, clave, datos JSON, cached_at)` en SQLite. Claves: `perfil`, `viajes_busqueda`, `viajes_creados`, `reservas`. |

## Correcciones de la base hechas en la Etapa 3

| Migración | Qué corrige |
|-----------|-------------|
| `0003_realtime.sql` | Habilita Realtime en viajes, reservas, notificaciones y mensajes (D-35). |
| `0004_perfil_incompleto.sql` | Crear un usuario sin datos de perfil fallaba por los CHECK de 10 dígitos; ahora `id_universidad` y `telefono` aceptan NULL mientras el registro está incompleto (D-40). |
| `0005_rls_sin_recursion.sql` | Recursión infinita (42P17) entre las políticas de `viajes` y `reservas`; ahora usan `tiene_reserva_aceptada` y `es_conductor_del_viaje` (`SECURITY DEFINER`) (D-41). |
| `0006_viajes_llenos_visibles.sql` | Los viajes `lleno` con salida futura se pueden leer, para que Realtime avise cuando un viaje se llena (D-48). La búsqueda sigue trayendo solo `abierto`. |
| `0007_proteger_updates_rls.sql` | Resuelve los hallazgos 1, 2 y 3: elimina la política de UPDATE directa en `reservas` y `viajes` (todo cambio de estado pasa por las RPCs SECURITY DEFINER), y protege `profiles.modo_actual` con trigger para forzar el paso por `cambiar_modo` (R3, E6). |
| `0008_calificaciones_rls_pares.sql` | Restringe el `INSERT` en `calificaciones` a pares conductor ↔ pasajero con reserva aceptada en viajes `finalizado`, impidiendo auto-calificaciones y calificaciones entre pasajeros (R9, E7). |

Funciones nuevas (no se llaman desde la app; las usan las políticas):

| Función | Devuelve |
|---------|----------|
| `es_conductor_del_viaje(p_viaje_id, p_user_id)` | `TRUE` si el usuario es el conductor del viaje. |
| `tiene_reserva_aceptada(p_viaje_id, p_user_id)` | `TRUE` si el usuario tiene una reserva aceptada en el viaje. |

## Hallazgos de RLS resueltos en la Etapa 6 (Samuel)

Detectados originalmente en la Etapa 3 y resueltos en la migración `0007_proteger_updates_rls.sql`:

1. **Protección en `reservas` (RESUELTO):** Se eliminó la política de UPDATE directa en PostgREST. Toda mutación de estado pasa por las RPCs transaccionales `aceptar_reserva`, `rechazar_reserva` y `cancelar_reserva`.
2. **Protección en `profiles.modo_actual` (RESUELTO):** Trigger `trg_proteger_modo_actual_perfil` impide que un usuario autenticado modifique `modo_actual` directamente, forzando la validación de vehículo en `cambiar_modo` (R3).
3. **Protección en `viajes` (RESUELTO):** Se eliminó la política de UPDATE directa en PostgREST. Todo avance de estado (`iniciar_viaje`, `finalizar_viaje`, `cancelar_viaje`) se ejecuta por sus respectivas RPCs con validación estricta de reglas de negocio.
4. **`types/database.ts`:** Se mantiene tipado y consistente con las uniones de estado de los dominios (D-32).
