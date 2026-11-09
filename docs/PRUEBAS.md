# Pruebas — CampusGo

Estados: Pendiente, Aprobado o Fallido. Solo se escribe un resultado real cuando alguien ejecutó la prueba; la evidencia es un archivo, una salida de consola o una captura hecha por el equipo.

## 1. Pruebas automáticas

Se ejecutan con `npm test` (jest-expo y Testing Library).

| Archivo | Qué comprueba | Etapa | Último resultado |
| --- | --- | --- | --- |
| __tests__/smoke.test.tsx | La pantalla inicial renderiza con el logo accesible, un título header y el acceso a Ajustes. | E0, E1 | Aprobado |
| __tests__/theme/contrast.test.ts | Fórmula de contraste de WCAG (contra los valores medidos en el Corte 2), mismos tokens en los tres temas y todos los pares en AA. | E1 | Aprobado |
| __tests__/theme/typography-layout.test.ts | lineHeight ≥ 1,4 y letterSpacing ≥ 0 en todas las variantes y tamaños; tamaños mínimos; TOUCH_MIN; hitSlopFor; bordes de 2 px en alto contraste. | E1 | Aprobado |
| __tests__/theme/ThemeProvider.test.tsx | Carga y guarda preferencias, tolera datos corruptos, error fuera del provider y la pantalla de Ajustes (tema, tamaño, reducir movimiento, vibración). | E1 | Aprobado |
| __tests__/components/Button.test.tsx | Rol, nombre, TOUCH_MIN, lineHeight, carga (busy y deshabilitado) y label obligatorio en TypeScript. | E1 | Aprobado |
| __tests__/components/IconButton.test.tsx | Nombre accesible, TOUCH_MIN, hitSlop en modo compacto, ícono oculto y label obligatorio en TypeScript. | E1 | Aprobado |
| __tests__/components/TextField.test.tsx | Etiqueta visible, pista, TOUCH_MIN sin altura fija, error en texto y anunciado, "Mostrar contraseña" y label obligatorio. | E1 | Aprobado |
| __tests__/components/selection.test.tsx | SegmentedToggle (radiogroup, checked, TOUCH_MIN), RadioGroup, SwitchRow (un solo foco) y BottomTabBar (tab, selected, subrayado). | E1 | Aprobado |
| __tests__/components/feedback.test.tsx | ConfirmDialog (orden seguro, modal, escape, foco al título), StatusBanner (anuncio, un solo foco, Reintentar), LoadingState y StepIndicator. | E1 | Aprobado |
| __tests__/components/identity.test.tsx | Logo (con nombre o decorativo), AppText (escalado, tamaño de Ajustes, alto contraste), ScreenTitle (foco), PhotoPicker ("foto cargada") y orden de foco de ScreenLayout. | E1 | Aprobado |
| __tests__/hooks/hooks.test.tsx | useAnnounce (anuncia en Android y en iOS), useReduceMotion (sistema, preferencia y cleanup del listener) y useHaptics (Android, iOS y apagado). | E1 | Aprobado |
| __tests__/services/errors.test.ts | Traducción de errores: códigos de las RPC (P0001), Supabase Auth, falta de red, correo de otro dominio (R1), códigos de PostgreSQL y `unwrap`. | E3 | Aprobado |
| __tests__/db/cache.test.ts | Caché SQLite (con una base falsa en memoria): guardar, leer y borrar por usuario; `loadWithCache` con red, sin red, con fallo de red, sin copia (sin_conexion) y sin tapar errores que no son de red. | E3 | Aprobado |
| __tests__/features/auth.test.ts | signIn (éxito y error en español), signUp (correo pendiente), restoreSession (inicializa con y sin sesión) y signOut (borra la caché y limpia todos los slices). | E3 | Aprobado |
| __tests__/features/trips.test.ts | Búsqueda paginada, condición de "no hay más", respuesta obsoleta ignorada, caché sin conexión, error sin conexión, cierre automático en vivo (viaje lleno sale de la búsqueda), crear viaje, error de RPC y selector memoizado. | E3 | Aprobado |
| __tests__/features/reservations.test.ts | Reservas por estado, cambio de estado en vivo, crear, reserva duplicada (error de RPC), cancelar y solicitudes pendientes del conductor. | E3 | Aprobado |
| __tests__/features/domains.test.ts | Perfil (nombre completo, error sin carro al cambiar de modo), vehículo (registrar y eliminar), notificaciones (no leídas, en vivo, marcar todas), chat (orden, sin duplicados, largo máximo), calificaciones (promedio numérico) y conexión. | E3 | Aprobado |
| __tests__/hooks/realtime.test.tsx | Las suscripciones Realtime se abren con sesión y se cierran en el cleanup; la notificación nueva entra al store y se anuncia; useConnectivity escucha NetInfo y deja de escuchar; banner "Sin conexión" con la hora. | E3 | Aprobado |
| __tests__/lib/format.test.ts | Hora, fecha de salida, pesos, cupos y calificación en formato de Colombia. | E3, E5 | Aprobado |
| __tests__/components/trips.test.tsx | TripCard como un solo foco con etiqueta compuesta, ReservationCard (papelera aparte, viaje oculto por RLS), filtros, lista de sectores modal y pestañas internas. | E5 | Aprobado |
| __tests__/hooks/passenger-hooks.test.tsx | Debounce, punto del mapa con dirección, respuesta vieja ignorada, sin permiso y dirección solo escrita. | E5 | Aprobado |
| __tests__/screens/passenger.test.tsx | Inicio (búsqueda, filtro con debounce, error y Reintentar), reserva (validación, mapa, solo texto, éxito, duplicada), reservas por estado, cancelación con confirmación y viajes en curso. | E5 | Aprobado |

Última ejecución: 2026-11-09, `npm test` con 25 archivos y 185 de 185 pruebas aprobadas, ejecutado por Claude Code en WSL (Node 22.20.0). Los servicios se simulan solo dentro de las pruebas.

Pendientes por etapa: flujos de conductor (E6), calificaciones, notificaciones y chat (E7), y pruebas SQL de RLS (supabase/tests/rls.sql).

## 2. Casos funcionales

| ID | Descripción | Pasos | Resultado esperado | Resultado real | Evidencia | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | Registro con carro | Por definir (E4) | — | — | — | Pendiente |
| TC-02 | Registro sin carro | Por definir (E4) | — | — | — | Pendiente |
| TC-03 | Inicio de sesión correcto | Por definir (E4) | — | — | — | Pendiente |
| TC-04 | Credenciales incorrectas | Por definir (E4) | — | — | — | Pendiente |
| TC-05 | Correo de otro dominio rechazado | Por definir (E4) | — | — | — | Pendiente |
| TC-06 | Filtro por sector y por cupos | 1. En Inicio (modo pasajero), abrir "Sectores" y elegir uno. 2. Escribir 3 en "Cantidad de puestos disponibles". 3. Elegir "Todos los sectores" y borrar los puestos. | Paso 1: solo viajes de ese sector. Paso 2: solo viajes con 3 cupos o más. Paso 3: vuelve la lista completa. TalkBack anuncia cuántos viajes se cargaron | — | — | Pendiente |
| TC-07 | Reservar viaje | 1. Tocar una tarjeta. 2. Tocar el mapa y revisar que se llene la dirección. 3. Tocar "Reservar". 4. Tocar "¡Listo!". | Paso 3: "Reserva realizada con éxito" y vibración. Paso 4: la reserva aparece en Reservas > Pendientes | — | — | Pendiente |
| TC-08 | Reserva duplicada rechazada | 1. Abrir otra vez el viaje ya reservado. 2. Escribir una dirección y tocar "Reservar". | Mensaje "Ya tienes una reserva en este viaje." con "Reintentar"; no se crea otra reserva | — | — | Pendiente |
| TC-09 | Cancelar reserva | 1. En Reservas > Pendientes tocar la papelera. 2. Tocar "No, volver". 3. Tocar la papelera y "Sí, cancelar reserva". | Paso 2: la reserva sigue. Paso 3: desaparece de la lista y se anuncia "Reserva cancelada." | — | — | Pendiente |
| TC-10 | Crear viaje | Por definir (E6) | — | — | — | Pendiente |
| TC-11 | Crear viaje con campos faltantes | Por definir (E6) | — | — | — | Pendiente |
| TC-12 | Aceptar reservas hasta llenar los cupos (cierre automático) | Por definir (E6) | — | — | — | Pendiente |
| TC-13 | Rechazar reserva | Por definir (E6) | — | — | — | Pendiente |
| TC-14 | Iniciar y finalizar viaje | Por definir (E6) | — | — | — | Pendiente |
| TC-15 | Calificar viaje | Por definir (E7) | — | — | — | Pendiente |
| TC-16 | Chat en tiempo real | Por definir (E7) | — | — | — | Pendiente |
| TC-17 | Sin conexión, con caché y banner | 1. En "Sesión de prueba", con sesión iniciada y red, tocar "Recargar datos". 2. Activar el modo avión. 3. Cerrar la app por completo y abrirla de nuevo. 4. Entrar a "Sesión de prueba". | Se ven nombre, sectores, viajes y reservas de la última carga, y el banner "Sin conexión: mostrando datos guardados (guardados a las HH:MM)", que TalkBack anuncia | Sí lo hace | Prueba manual de Sara en su teléfono | Aprobado |
| TC-18 | Error de red y "Reintentar" | 1. Cerrar sesión. 2. Activar el modo avión. 3. Escribir correo y contraseña y tocar "Iniciar Sesión". 4. Quitar el modo avión y tocar "Reintentar". | Paso 3: mensaje "Sin conexión a internet. Revisa tu red e intenta de nuevo." con botón "Reintentar". Paso 4: la sesión se inicia | Sí lo hace | Prueba manual de Sara en su teléfono | Aprobado |
| TC-19 | Cambio a modo conductor sin carro bloqueado | Por definir (E4) | — | — | — | Pendiente |
| TC-20 | Eliminar carro | Por definir (E4) | — | — | — | Pendiente |
| TC-21 | Cerrar sesión limpia la sesión segura | Por definir (E4) | — | — | — | Pendiente |
| TC-22 | La sesión persiste al reiniciar la app | 1. Iniciar sesión en "Sesión de prueba" con el usuario creado a mano. 2. Cerrar la app por completo (quitarla de recientes) o recargar Expo Go. 3. Abrirla y entrar a "Sesión de prueba". | Sigue con la sesión iniciada y no pide el correo otra vez | Sí lo hace | Prueba manual de Sara en su teléfono | Aprobado |
| TC-23 | RLS: un usuario no lee datos ajenos | Por definir (E2) | — | — | — | Pendiente |
