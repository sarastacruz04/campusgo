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
| __tests__/lib/validators.test.ts | Validadores puros: fecha DD/MM/AAAA, hora HH:MM, salida futura con margen de 5 min, cupos según vehículo y precio. | E4, E6 | Aprobado |
| __tests__/screens/driver.test.tsx | Inicio del conductor (pantalla 17), crear viaje con errores y éxito (pantalla 18), viajes creados (pantalla 19), solicitudes (aceptar/rechazar) y en curso (pantalla 14). | E6 | Aprobado |
| __tests__/components/trips.test.tsx | TripCard como un solo foco con etiqueta compuesta, ReservationCard (papelera aparte, viaje oculto por RLS), filtros, lista de sectores modal y pestañas internas. | E5 | Aprobado |
| __tests__/hooks/passenger-hooks.test.tsx | Debounce, punto del mapa con dirección, respuesta vieja ignorada, sin permiso y dirección solo escrita. | E5 | Aprobado |
| __tests__/screens/chat.test.tsx | Chat del viaje: estado vacío, botón de enviar de 48 dp deshabilitado sin texto, lista invertida con cada mensaje como un solo foco, límite y contador de 500, envío con anuncio, anuncio del mensaje nuevo de otra persona por Realtime (y no del historial), ajeno sin acceso, viaje cancelado solo lectura, cleanup de la suscripción y botón "Abrir chat" de ReservationCard. | E7 | Aprobado |
| __tests__/features/domains.test.ts (chat) | Acceso denegado sin cargar mensajes, nombres de autores, orden del más nuevo al más antiguo, respuesta vieja ignorada y nombres sin pedir dos veces. | E3, E7 | Aprobado |
| __tests__/screens/passenger.test.tsx | Inicio (búsqueda, filtro con debounce, error y Reintentar), reserva (validación, mapa, solo texto, éxito, duplicada), reservas por estado, cancelación con confirmación y viajes en curso. | E5 | Aprobado |

Última ejecución: 2026-11-09, `npm test` con 26 archivos y 196 de 196 pruebas aprobadas, ejecutado por Antigravity en Windows (Node 24.18.0). Los servicios se simulan solo dentro de las pruebas.

Ejecución de la Etapa 7 (chat): 2026-11-10, rama e7-chat, `npm test` con 27 archivos y 210 de 210 pruebas aprobadas, ejecutado por Claude Code en WSL (Node 22).

Pendientes por etapa: calificaciones y notificaciones (E7, Samuel), y verificación en Supabase de pruebas SQL de RLS (supabase/tests/rls.sql).

## 2. Casos funcionales

| ID | Descripción | Pasos | Resultado esperado | Resultado real | Evidencia | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | Registro con carro | Por definir (E4) | — | — | — | Pendiente |
| TC-02 | Registro sin carro | Por definir (E4) | — | — | — | Pendiente |
| TC-03 | Inicio de sesión correcto | Por definir (E4) | — | — | — | Pendiente |
| TC-04 | Credenciales incorrectas | Por definir (E4) | — | — | — | Pendiente |
| TC-05 | Correo de otro dominio rechazado | Por definir (E4) | — | — | — | Pendiente |
| TC-06 | Filtro por sector y por cupos | 1. En Inicio (modo pasajero), abrir "Sectores" y elegir uno. 2. Escribir 3 en "Cantidad de puestos disponibles". 3. Elegir "Todos los sectores" y borrar los puestos. | Paso 1: solo viajes de ese sector. Paso 2: solo viajes con 3 cupos o más. Paso 3: vuelve la lista completa. TalkBack anuncia cuántos viajes se cargaron | Sí sucede | Prueba manual de Sara en su teléfono | Aprobado |
| TC-07 | Reservar viaje | 1. Tocar una tarjeta. 2. Tocar el mapa y revisar que se llene la dirección. 3. Tocar "Reservar". 4. Tocar "¡Listo!". | Paso 3: "Reserva realizada con éxito" y vibración. Paso 4: la reserva aparece en Reservas > Pendientes | Sí sucede | Prueba manual de Sara en su teléfono | Aprobado |
| TC-08 | Reserva duplicada rechazada | 1. Abrir otra vez el viaje ya reservado. 2. Escribir una dirección y tocar "Reservar". | Mensaje "Ya tienes una reserva en este viaje." con "Reintentar"; no se crea otra reserva | Sí sucede | Prueba manual de Sara en su teléfono | Aprobado |
| TC-09 | Cancelar reserva | 1. En Reservas > Pendientes tocar la papelera. 2. Tocar "No, volver". 3. Tocar la papelera y "Sí, cancelar reserva". | Paso 2: la reserva sigue. Paso 3: desaparece de la lista y se anuncia "Reserva cancelada." | Sí sucede | Prueba manual de Sara en su teléfono | Aprobado |
| TC-10 | Crear viaje | 1. En modo conductor, pulsar "+ Crea un viaje". 2. Indicar origen con mapa o texto, seleccionar sector, fecha futura, hora, cupos y valor por cupo. 3. Pulsar "Publicar viaje". 4. Confirmar en el modal de éxito. | Paso 3: modal "¡Viaje creado con éxito!". Paso 4: redirige a "Viajes creados" mostrando el viaje en estado 'abierto'. | — | Protocolo listo para Samuel en su teléfono | Pendiente |
| TC-11 | Crear viaje con campos faltantes | 1. Entrar a "Crea tu viaje". 2. Borrar el punto de partida y dejar fecha en blanco. 3. Pulsar "Publicar viaje". | Aparecen errores inline bajo los campos faltantes, banner de resumen superior con advertencia accesible y vibración háptica de error. | — | Protocolo listo para Samuel en su teléfono | Pendiente |
| TC-12 | Aceptar reservas hasta llenar los cupos (cierre automático) | 1. En modo conductor, entrar a Solicitudes pendientes. 2. Aceptar solicitudes sucesivas hasta agotar los cupos disponibles. | Al aceptar la última solicitud que agote cupos, el viaje pasa a estado 'lleno' y deja de mostrarse en la búsqueda de pasajeros. | — | Protocolo listo para Samuel en su teléfono | Pendiente |
| TC-13 | Rechazar reserva | 1. En Solicitudes pendientes, presionar "Rechazar" en una reserva. 2. Verificar que se mueva a la pestaña "Rechazadas". | La reserva desaparece de pendientes y pasa a la pestaña Rechazadas; se actualiza en tiempo real. | — | Protocolo listo para Samuel en su teléfono | Pendiente |
| TC-14 | Iniciar y finalizar viaje | 1. En "Viajes creados", cuando haya al menos 1 reserva aceptada, presionar "Iniciar viaje". 2. Confirmar inicio. 3. En la pestaña "En curso", presionar "Finalizar viaje" y confirmar. | Paso 1: el viaje pasa a estado 'en_curso'. Paso 3: el viaje pasa a estado 'finalizado' y las reservas asociadas a 'completada'. | — | Protocolo listo para Samuel en su teléfono | Pendiente |
| TC-15 | Calificar viaje | Por definir (E7) | — | — | — | Pendiente |
| TC-16 | Chat en tiempo real | Con dos teléfonos (o un teléfono y un emulador): el conductor y un pasajero con reserva aceptada. 1. Ambos abren "Abrir chat" del mismo viaje. 2. El pasajero escribe "Hola" y toca "Enviar mensaje". 3. El conductor responde. | Paso 2: el mensaje aparece abajo en el teléfono del pasajero (con "Tú") y, sin recargar, en el del conductor con el nombre del pasajero. Paso 3: igual en sentido contrario | — | — | Pendiente |
| TC-17 | Sin conexión, con caché y banner | 1. En "Sesión de prueba", con sesión iniciada y red, tocar "Recargar datos". 2. Activar el modo avión. 3. Cerrar la app por completo y abrirla de nuevo. 4. Entrar a "Sesión de prueba". | Se ven nombre, sectores, viajes y reservas de la última carga, y el banner "Sin conexión: mostrando datos guardados (guardados a las HH:MM)", que TalkBack anuncia | Sí lo hace | Prueba manual de Sara en su teléfono | Aprobado |
| TC-18 | Error de red y "Reintentar" | 1. Cerrar sesión. 2. Activar el modo avión. 3. Escribir correo y contraseña y tocar "Iniciar Sesión". 4. Quitar el modo avión y tocar "Reintentar". | Paso 3: mensaje "Sin conexión a internet. Revisa tu red e intenta de nuevo." con botón "Reintentar". Paso 4: la sesión se inicia | Sí lo hace | Prueba manual de Sara en su teléfono | Aprobado |
| TC-19 | Cambio a modo conductor sin carro bloqueado | Por definir (E4) | — | — | — | Pendiente |
| TC-20 | Eliminar carro | Por definir (E4) | — | — | — | Pendiente |
| TC-21 | Cerrar sesión limpia la sesión segura | Por definir (E4) | — | — | — | Pendiente |
| TC-22 | La sesión persiste al reiniciar la app | 1. Iniciar sesión en "Sesión de prueba" con el usuario creado a mano. 2. Cerrar la app por completo (quitarla de recientes) o recargar Expo Go. 3. Abrirla y entrar a "Sesión de prueba". | Sigue con la sesión iniciada y no pide el correo otra vez | Sí lo hace | Prueba manual de Sara en su teléfono | Aprobado |
| TC-23 | RLS: un usuario no lee datos ajenos | Por definir (E2) | — | — | — | Pendiente |

## 3. Verificaciones en vivo de la Etapa 5

Lo que la Etapa 5 exige además de los casos TC. Mientras no exista la pantalla del conductor (Etapa 6), aceptar y rechazar se hace con las RPC reales desde el SQL Editor.

| ID | Descripción | Pasos | Resultado esperado | Resultado real | Evidencia | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| V5-01 | Reserva aceptada en vivo | Con la pestaña Reservas abierta, ejecutar `aceptar_reserva` como el conductor. | La reserva pasa sola de Pendientes a Aceptados | Sí sucede | Prueba manual de Sara en su teléfono | Aprobado |
| V5-02 | Reserva rechazada en vivo | Con la pestaña Reservas abierta, ejecutar `rechazar_reserva` como el conductor. | La reserva pasa sola a Rechazados | Sí sucede | Prueba manual de Sara en su teléfono | Aprobado |
| V5-03 | Cupos en vivo | Con Inicio abierto y la tarjeta a la vista, aceptar una reserva de ese viaje. | La tarjeta pasa de "Cupos: 4" a "Cupos: 3" sin tocar el teléfono | Sí sucede | Prueba manual de Sara en su teléfono | Aprobado |
| V5-04 | Lista de 200 viajes | Cargar supabase/dev_seed_viajes.sql y bajar rápido por la lista de Inicio. | La lista se mueve fluida y sigue cargando páginas | Sí sucede | Prueba manual de Sara en su teléfono | Aprobado |
| V5-05 | Reservar solo escribiendo | Reservar un viaje sin tocar el mapa, escribiendo la dirección. | La reserva se crea y aparece en Pendientes | Sí sucede | Prueba manual de Sara en su teléfono | Aprobado |
| V5-06 | TalkBack en la tarjeta de viaje | Con TalkBack, recorrer las tarjetas de Inicio. | Cada tarjeta se lee como una sola frase; el "+" no es un foco aparte | Sí lo hace | Prueba manual de Sara en su teléfono con TalkBack | Aprobado |
| V5-07 | TalkBack en la papelera | Con TalkBack, recorrer una reserva pendiente. | Los datos son un foco y la papelera otro, con el nombre "Cancelar reserva de …" | Sí lo hace | Prueba manual de Sara en su teléfono con TalkBack | Aprobado |

## 4. Verificaciones en vivo de la Etapa 7 (chat)

Se necesitan tres cuentas: el conductor (A), un pasajero con la reserva ACEPTADA en un viaje de A que no esté cancelado (B) y una cuenta ajena a ese viaje (C).

| ID | Descripción | Pasos | Resultado esperado | Resultado real | Evidencia | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| V7-01 | Entradas al chat | B: Reservas > Aceptados y Curso. A: Creados y Curso. | Cada tarjeta del viaje tiene "Abrir chat" y abre la pantalla "Chat del viaje" con el sector y la hora de salida | — | — | Pendiente |
| V7-02 | Estado vacío | Abrir el chat de un viaje sin mensajes. | Se ve "Todavía no hay mensajes" y el botón de enviar está deshabilitado | — | — | Pendiente |
| V7-03 | Mensajes en vivo | Es TC-16. | Los mensajes llegan sin recargar en ambos teléfonos | — | — | Pendiente |
| V7-04 | TalkBack en la lista | Con TalkBack en B, recorrer los mensajes. | Cada mensaje es un solo foco: "Miguel Ordóñez, 3:15 p. m.: Hola" o "Tú, …". Anotar en qué orden los recorre (del más nuevo al más antiguo o al revés) | — | — | Pendiente |
| V7-05 | Anuncio del mensaje nuevo | Con TalkBack en B y el foco en el campo, A envía un mensaje. | TalkBack dice "Mensaje nuevo de [nombre de A]: [texto]" sin mover el foco | — | — | Pendiente |
| V7-06 | Límite de 500 | Pegar en el campo un texto de más de 500 caracteres. | El campo se queda en 500, el contador dice "500 de 500 caracteres" y TalkBack anuncia el límite | — | — | Pendiente |
| V7-07 | Botón de 48 dp | Accessibility Scanner sobre la pantalla del chat. | Sin avisos de tamaño en "Enviar mensaje" | — | — | Pendiente |
| V7-08 | Ajeno sin acceso (app) | C no tiene botón para entrar. Para probarlo, abrir desde la terminal de Expo la ruta del chat: con el id del viaje, en el teléfono de C escribir en el navegador `exp://<IP>:8081/--/trip/<id_viaje>/chat`. | "No tienes acceso a este chat…" y no aparece el campo de escribir | — | — | Pendiente |
| V7-09 | RLS del chat (base de datos) | En el SQL Editor, poner los tres correos en supabase/tests/chat_rls.sql y ejecutarlo completo. | Error a propósito que empieza con "RESULTADO CHAT RLS: 6 de 6 correctas" | — | — | Pendiente |
| V7-10 | Viaje cancelado | A cancela el viaje (Creados > Cancelar viaje) con el chat abierto en B. | B ve "Este viaje fue cancelado: puedes leer los mensajes, pero ya no enviar nuevos." y no puede enviar | — | — | Pendiente |
