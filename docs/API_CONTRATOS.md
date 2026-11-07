# docs/API_CONTRATOS.md — Contratos de servicio de CampusGo

Generado en: Etapa 2 (2026-11-06). Actualizar en cada etapa que agregue o modifique RPCs o tablas.

Convención: los errores devueltos por las RPC son objetos `{ code: string; message: string }` (tipo `AppError` definido en la Etapa 3). Los `code` corresponden exactamente al `SQLSTATE` o al `RAISE EXCEPTION` name de la función.

---

## Tablas expuestas (PostgREST)

### `profiles`

| Operación | Quién | Columnas de entrada | Resultado | Errores |
|-----------|-------|---------------------|-----------|---------|
| SELECT    | Cualquier autenticado | — | Todas las columnas de la fila propia o ajena | — |
| UPDATE    | El dueño (`id = auth.uid()`) | `nombre`, `apellido`, `telefono`, `avatar_path`, `registro_completo` | Fila actualizada | `RLS_violation` si intenta editar ajeno |
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
| SELECT    | Conductor (todos sus viajes) o pasajero (solo `abierto` y futuro, o con reserva aceptada) | — | Filas visibles según RLS | — |
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

## Servicios del cliente (se completa en la Etapa 3)

Los servicios en `services/` encapsulan las llamadas a Supabase y exponen funciones tipadas.
Cada servicio se documentará aquí con su firma, parámetros, retorno y errores en la Etapa 3.
