# Guía de defensa — CampusGo

Se actualiza al cerrar cada etapa. Objetivo: que Sara y Samuel puedan ubicar cualquier archivo, explicarlo línea por línea y hacer ajustes en vivo (sección 12 de la especificación).

## 1. Mapa de archivos

### Configuración (Etapa 0)

| Ruta | Qué hace | Autor (etapa) |
| --- | --- | --- |
| package.json | Dependencias (versiones del SDK 58) y scripts: `start`, `android`, `typecheck`, `lint`, `format`, `test`, `test:watch` y `a11y:contrast`. El bloque `jest` define el preset, el archivo de setup, dónde están las pruebas y qué paquetes de node_modules se transforman. `overrides` permite usar el plugin de accesibilidad con ESLint 9. | Sara (E0, E1) |
| app.json | Configuración de Expo: nombre, ícono, splash, `userInterfaceStyle: automatic` (tema oscuro), rutas tipadas y React Compiler desactivados (D-05, D-14). | Sara (E0, E1) |
| tsconfig.json | TypeScript estricto, alias `@/*` a la raíz y tipos de Jest. | Sara (E0) |
| eslint.config.js | Reglas de Expo + Prettier + `eslint-plugin-react-native-a11y` y `no-console`. | Sara (E0) |
| jest.setup.ts | Simulacro oficial de AsyncStorage para las pruebas. | Sara (E1) |
| test-utils/render.tsx | `renderWithProviders`: renderiza con ThemeProvider y SafeAreaProvider, como en la app. | Sara (E1) |

### Sistema de diseño (Etapa 1)

| Ruta | Qué hace | Autor (etapa) |
| --- | --- | --- |
| theme/colors.ts | Tokens de color de los tres temas y la lista `CONTRAST_PAIRS` de combinaciones que se verifican. | Sara (E1) |
| theme/typography.ts | Noto Sans, escala de textos con lineHeight ≥ 1,4, factor de tamaño de Ajustes y `MAX_FONT_SIZE_MULTIPLIER`. | Sara (E1) |
| theme/layout.ts | `TOUCH_MIN`, `TOUCH_GAP`, espaciado, radios, grosor de bordes por tema y `hitSlopFor`. | Sara (E1) |
| theme/ThemeProvider.tsx | Contexto con el tema efectivo, tipografía escalada y preferencias guardadas en AsyncStorage. Hook `useTheme`. | Sara (E1) |
| lib/contrast.ts | Fórmula de contraste de WCAG (luminancia relativa y razón). | Sara (E1) |
| scripts/check-contrast.ts | `npm run a11y:contrast`: imprime cada par por tema y sale con error si alguno incumple. | Sara (E1) |
| hooks/useAnnounce.ts | Anuncia mensajes al lector sin mover el foco (S-07). | Sara (E1) |
| hooks/useHaptics.ts | Vibración de éxito, advertencia y error, respetando Ajustes (T-04). | Sara (E1) |
| hooks/useReduceMotion.ts | Lee "reducir movimiento" del sistema con listener y lo combina con Ajustes (V-09). | Sara (E1) |
| hooks/useScreenFocus.ts | Mueve el foco del lector a un elemento (el título) al montar (T-03). | Sara (E1) |
| components/ui/AppText.tsx | Texto base: fuente, lineHeight, escalado y color del tema. | Sara (E1) |
| components/ui/Icon.tsx | Ícono siempre decorativo (oculto para el lector). | Sara (E1) |
| components/ui/Logo.tsx | Logo en SVG ("Campus G" + pin) con "By Sara y Samuel"; con nombre o decorativo. | Sara (E1) |
| components/ui/Button.tsx | Botón con variantes, carga, foco con teclado y label obligatorio. | Sara (E1) |
| components/ui/IconButton.tsx | Botón de ícono con accessibilityLabel obligatorio y hitSlop. | Sara (E1) |
| components/ui/TextField.tsx | Campo con etiqueta visible, pista, error, mostrar contraseña y ref. | Sara (E1) |
| components/ui/SegmentedToggle.tsx | Selector en píldora (Pasajero/Conductor) como radiogroup. | Sara (E1) |
| components/ui/RadioGroup.tsx y SwitchRow.tsx | Opciones excluyentes e interruptores de Ajustes. | Sara (E1) |
| components/ui/ConfirmDialog.tsx | Diálogo modal accesible del Figma. | Sara (E1) |
| components/ui/StatusBanner.tsx y LoadingState.tsx | Mensajes de error, éxito y sin conexión con "Reintentar"; estado de carga. | Sara (E1) |
| components/ui/ScreenTitle.tsx, StepIndicator.tsx y PhotoPicker.tsx | Título con foco, "Paso x de y" y zona de foto. | Sara (E1) |
| components/ui/AppHeader.tsx, BottomTabBar.tsx y ScreenLayout.tsx | Layout común de las pantallas internas (sección 6.4). | Sara (E1) |
| app/_layout.tsx | Carga las fuentes, mantiene el splash hasta tener tema y fuentes, y envuelve la app con los providers. | Sara (E0, E1) |
| app/index.tsx | Pantalla inicial provisional (D-23). | Sara (E0, E1) |
| app/settings/accessibility.tsx | Ajustes de accesibilidad (V-08). | Sara (E1) |
| app/dev/catalogo.tsx | Catálogo de componentes, solo en desarrollo, para revisar con TalkBack. | Sara (E1) |
| \_\_tests\_\_/ | Pruebas: theme/, components/, hooks/ y smoke.test.tsx. | Sara (E0, E1) |

## 2. Flujo de datos

Se documenta paso a paso en la Etapa 3: pantalla → `dispatch(thunk)` → servicio → Supabase → reducer → selector → pantalla.

Flujo del tema (Etapa 1): Ajustes llama a `setPreference('theme', 'dark')` → ThemeProvider actualiza su estado y guarda en AsyncStorage → `useMemo` crea un nuevo valor de contexto → cada componente que usa `useTheme()` (por ejemplo AppText) se vuelve a renderizar con `themes.dark`.

## 3. Preguntas probables (se acumulan por etapa hasta llegar a 40)

### Arquitectura de React Native y Expo Router

1. **¿Cómo arranca la app?** `package.json` tiene `"main": "expo-router/entry"`. Expo Router lee la carpeta `app/`: cada archivo es una ruta. `app/_layout.tsx` envuelve todas las rutas y `app/index.tsx` es la ruta `/`.
2. **¿Por qué no hay carpeta src?** La especificación pide la estructura en la raíz. La plantilla del SDK 58 trae `src/app`; la movimos a `app/` y el alias `@/*` apunta a la raíz (D-02).
3. **¿Por qué Expo Go y no un development build?** Es un requisito del curso. Por eso cada librería se verifica en la documentación del SDK 58 y se instala con `npx expo install`, que elige la versión compatible.
4. **¿Qué hace `npx expo-doctor`?** Revisa la configuración y que las versiones de las dependencias coincidan con el SDK. En E0 y en E1 pasó 20 de 20 comprobaciones.
5. **¿Por qué el splash se queda hasta cargar las fuentes?** `SplashScreen.preventAutoHideAsync()` en `app/_layout.tsx` evita que se vea un instante la fuente del sistema o el tema equivocado. Se oculta cuando `useFonts` termina y el ThemeProvider leyó las preferencias (`ready`). Si la fuente falla, la app sigue con la del sistema.

### Calidad y herramientas

6. **¿Qué garantiza `strict: true`?** Comprobaciones estrictas como `strictNullChecks` y `noImplicitAny`: no se usa un valor que puede ser `null` sin comprobarlo ni se dejan parámetros sin tipo.
7. **¿Para qué sirve eslint-plugin-react-native-a11y?** Detecta en el código props de accesibilidad inválidas (un rol que no existe, una foto sin `accessibilityIgnoresInvertColors`). Apagamos solo `has-accessibility-hint`, que obligaría a poner pistas redundantes (D-08).
8. **¿Por qué desactivaron React Compiler?** La especificación pide memoización explícita que debemos explicar y medir (D-05).
9. **¿Cómo prueban que un IconButton sin etiqueta no compila?** En IconButton.test hay un `// @ts-expect-error` sobre `<IconButton icon="plus" />`. Si algún día la etiqueta dejara de ser obligatoria, ese comentario sobraría y `npm run typecheck` fallaría.

### Estado y hooks

10. **¿Por qué el tema vive en un Context y no en Redux?** Es estado de presentación que necesitan todos los componentes de `components/ui`, y esos componentes no deben conocer Redux (sección 4). Redux llega en la Etapa 3 para los datos de negocio.
11. **¿Para qué sirve el `useMemo` del ThemeProvider?** Sin él, cada render del provider crearía un objeto nuevo y todos los consumidores se volverían a renderizar aunque nada cambiara.
12. **¿Qué pasa si el componente se desmonta antes de que AsyncStorage responda?** La bandera `active` del `useEffect` evita llamar a `setPreferences` sobre un componente desmontado; el cleanup la pone en `false`.
13. **¿Por qué useReduceMotion devuelve una función de limpieza?** `AccessibilityInfo.addEventListener` deja un listener vivo; si no se llama a `subscription.remove()` al desmontar, queda una fuga de memoria y un `setState` sobre un componente que ya no existe. La prueba de hooks lo verifica.
14. **¿Por qué useScreenFocus espera 500 ms?** Si el foco se envía durante la transición de pantalla, la vista todavía no está y TalkBack lo pierde. El `clearTimeout` del cleanup cancela el envío si la pantalla se desmonta antes.

### Accesibilidad

15. **¿Qué diferencia hay entre accessibilityLabel y accessibilityHint?** El label es el nombre ("Buscar viajes"); la pista explica qué pasa si el resultado no es obvio ("Abre tu perfil, notificaciones y ajustes"). Ninguno repite el rol: TalkBack ya dice "botón".
16. **¿Por qué cada Text tiene lineHeight?** En React Native, sin lineHeight y con la fuente agrandada, las tildes, la Ñ, la ¿ y la ¡ se recortan arriba o abajo. Usamos al menos 1,4 veces el tamaño; AppText lo garantiza y una prueba lo revisa en todas las variantes.
17. **¿Qué es TOUCH_MIN y dónde se usa?** `Platform.select({ ios: 44, default: 48 })` en theme/layout.ts: 44 pt de Apple y 48 dp de Material. Es el minHeight y minWidth de botones, campos, radios, pestañas e interruptores.
18. **¿Cuándo usan hitSlop en vez de agrandar el ícono?** Cuando el diseño dibuja un ícono pequeño (lupa, papelera, lápiz): con `compact`, el área visible queda pequeña y `hitSlopFor` agrega el margen invisible hasta 48.
19. **¿Por qué Pressable y no TouchableOpacity?** Pressable es la API actual: da el estado `pressed` para estilos, `onFocus` y `onBlur` para el borde de teclado y acepta todas las props de accesibilidad.
20. **¿Cómo se anuncia un error sin mover el foco?** Con `AccessibilityInfo.announceForAccessibility`, envuelto en el hook useAnnounce, en Android y en iOS. La propuesta pedía `accessibilityLiveRegion` en Android, pero en el teléfono la región viva no se oyó, ni creada junto con el mensaje (C-06) ni siempre montada (C-06b), mientras que announceForAccessibility sí (C-05). Por eso usamos un solo mecanismo, que además evita oír el mensaje dos veces (D-27). Es un buen ejemplo de una decisión tomada con evidencia de una prueba real.
21. **¿Cómo funciona el foco en ConfirmDialog?** `accessibilityViewIsModal` limita el lector al diálogo; `useScreenFocus(visible)` lleva el foco al título; `onAccessibilityEscape` y `onRequestClose` cancelan; al cerrarse, un efecto envía el foco al botón que lo abrió (`returnFocusRef`).
22. **¿Cómo verifican el contraste?** `npm run a11y:contrast` recorre `CONTRAST_PAIRS` en los tres temas con la fórmula de WCAG y falla si un texto queda bajo 4,5:1 o un elemento de interfaz bajo 3:1. La prueba contrast.test reproduce los valores medidos en el Corte 2 (por ejemplo, 10,17:1 de #334259 sobre blanco).
23. **¿Por qué el selector de modo es un radiogroup?** Son dos opciones excluyentes: con rol `radio` y `checked`, TalkBack dice "Modo pasajero, botón de opción, marcado". Antes era solo un ícono negro sobre azul a 2,06:1 (H4 del Corte 2).

## 4. Ejercicios de ajuste en vivo (meta: 10)

1. **Cambiar un token y verificarlo.** En theme/colors.ts cambiar `placeholder` del tema claro a `#9FA6B0` y correr `npm run a11y:contrast`: falla con 2,45:1. Volver a `#5F6B7A`.
2. **Agregar una propiedad de accesibilidad a un botón.** Pasar `accessibilityHint="Abre la galería"` a un `Button` y comprobar con TalkBack que se lee después del nombre.
3. **Cambiar el área táctil mínima.** Cambiar `TOUCH_MIN` a 56 en theme/layout.ts y ver en el catálogo que todos los controles crecen; las pruebas siguen pasando porque comparan contra la constante.
4. **Romper la regla de lineHeight a propósito.** Bajar `lineHeight` de `body` a 18 en theme/typography.ts y correr `npm test`: falla typography-layout.test.
5. **Agregar un tamaño de texto.** Añadir `'enorme'` a `TextSizePreference` y a `TEXT_SIZE_FACTORS` (1,5) y la opción en app/settings/accessibility.tsx; TypeScript señala cada lugar que falta.

## 5. Mis archivos y los del otro

| Persona | Mis archivos | Archivos del otro que debo dominar |
| --- | --- | --- |
| Sara | Configuración (E0) y todo el sistema de diseño (E1): theme/, hooks/, components/ui/, lib/contrast.ts, scripts/check-contrast.ts, app/settings/accessibility.tsx, app/dev/catalogo.tsx | Se completa desde E2 |
| Samuel | Se completa desde E2 | E0: package.json, tsconfig.json, eslint.config.js, app.json. E1: theme/ThemeProvider.tsx, components/ui/Button.tsx, TextField.tsx, ConfirmDialog.tsx, hooks/useAnnounce.ts y useScreenFocus.ts, scripts/check-contrast.ts |

---

## Base de datos (Etapa 2 — Samuel)

### Mapa de archivos nuevos

| Ruta | Qué hace | Autor (etapa) |
| --- | --- | --- |
| supabase/migrations/0001_schema_inicial.sql | Tablas, índices, vista, funciones auxiliares, triggers y políticas RLS del esquema completo. | Samuel (E2) |
| supabase/migrations/0002_storage_buckets.sql | Buckets privados (avatars, vehiculos, soat) con sus políticas de Storage. | Samuel (E2) |
| supabase/seed.sql | 11 sectores geográficos para la semilla de producción. | Samuel (E2) |
| supabase/dev_seed_viajes.sql | 200 viajes ficticios para pruebas de rendimiento; solo desarrollo. | Samuel (E2) |
| supabase/tests/rls.sql | Protocolo de pruebas SQL de políticas RLS (bloques comentados con ESPERADO). | Samuel (E2) |
| types/database.ts | Tipos TypeScript del esquema (placeholder a mano; se reemplaza con `supabase gen types typescript`). | Samuel (E2) |
| docs/API_CONTRATOS.md | Contratos de cada tabla expuesta y de las 7 RPC: entrada, salida y errores. | Samuel (E2) |

### Preguntas probables — Base de datos

24. **¿Por qué las funciones RPC tienen `SECURITY DEFINER` y `SET search_path = public`?**
    Con `SECURITY DEFINER` la función corre con los permisos del dueño (superusuario), no del llamador, lo que permite hacer `UPDATE` atómico sobre filas que el RLS del usuario no permitiría directamente. `SET search_path = public` evita que un atacante cree un esquema propio con tablas de igual nombre y lo inyecte en la función.

25. **¿Cómo funciona el cierre automático de cupos?** (R6, `aceptar_reserva`)
    La función bloquea la fila del viaje con `FOR UPDATE` para evitar condición de carrera (dos conductores aceptando al mismo tiempo). Luego decrementa `cupos_disponibles` y, en el mismo `UPDATE`, si el nuevo valor es 0, cambia `estado` a `'lleno'`. El viaje lleno ya no aparece en la búsqueda de pasajeros (la política RLS solo muestra viajes `'abierto'`).

26. **¿Qué hace el trigger `handle_new_user` si `raw_user_meta_data` no trae los datos del perfil?** (corregida en la Etapa 3, D-40)
    La primera versión ponía `''` en `id_universidad` y `telefono`. Los CHECK de 10 dígitos rechazaban ese texto vacío y Supabase cancelaba la creación del usuario ("Database error creating new user" al crearlo desde el panel). La migración 0004 permite `NULL` en esas dos columnas y el trigger usa `NULLIF(…, '')`. En PostgreSQL un CHECK no rechaza `NULL`, así que el usuario se crea con el perfil incompleto (`registro_completo = FALSE`) y la app lo lleva al paso pendiente (Etapa 4). Cualquier valor que sí llegue debe cumplir los 10 dígitos.

27. **¿Qué pasa si dos pasajeros reservan el último cupo al mismo tiempo?** (condición de carrera)
    `crear_reserva` hace un `SELECT ... FOR UPDATE` sobre la fila del viaje antes de verificar `cupos_disponibles`. PostgreSQL serializa las dos transacciones: la segunda espera a que la primera termine, y cuando llega a la verificación ya ve `cupos_disponibles = 0` y lanza `sin_cupos`.

28. **¿Qué significa `UNIQUE (viaje_id, pasajero_id)` en la tabla `reservas`?**
    Garantiza en la base de datos que un pasajero no puede tener más de una reserva en el mismo viaje, aunque la RPC `crear_reserva` ya lo comprueba a nivel de aplicación (doble seguro, R5).

29. **¿Por qué la vista `promedio_calificaciones` y no calcular el promedio en la app?**
    PostgreSQL ejecuta el `AVG` en la base de datos y devuelve un solo número por usuario. Si lo calculáramos en la app, habría que traer todas las calificaciones de cada usuario solo para promediarlas.

30. **¿Qué hace el trigger `fn_notificar_cambio_viaje` al cancelar un viaje?**
    Actualiza las reservas `pendientes` y `aceptadas` a `cancelada` (R8, D-30) y luego itera sobre los pasajeros con reserva aceptada para insertar una notificación a cada uno. Las inserciones van por `crear_notificacion`, que también tiene `SECURITY DEFINER`.

### Ejercicios de ajuste en vivo (Etapa 2)

6. **Cambiar el límite de un comentario.** En la migración, `char_length(comentario) <= 280`. Cambiar a `<= 140` y volver a aplicar la migración en un entorno de prueba para ver el `CHECK` actualizado.
7. **Agregar un índice.** Proponer `CREATE INDEX IF NOT EXISTS idx_viajes_conductor ON public.viajes (conductor_id)` y explicar cuándo lo usaría el planificador de consultas (cuando el conductor lista sus propios viajes).
8. **Leer una política RLS.** Abrir `supabase/migrations/0001_schema_inicial.sql`, líneas de las políticas de `mensajes`, y explicar por qué `es_participante_del_viaje` evita repetir la misma subselect en cada política.

| Persona | Mis archivos | Archivos del otro que debo dominar |
| --- | --- | --- |
| Samuel | supabase/migrations/, supabase/seed.sql, supabase/dev_seed_viajes.sql, supabase/tests/rls.sql, types/database.ts, docs/API_CONTRATOS.md | E0: package.json, tsconfig.json, app.json. E1: theme/ThemeProvider.tsx, components/ui/Button.tsx, TextField.tsx, ConfirmDialog.tsx, hooks/useAnnounce.ts, scripts/check-contrast.ts |

---

## Capa de cliente (Etapa 3 — Sara)

### Mapa de archivos nuevos

| Ruta | Qué hace | Autor (etapa) |
| --- | --- | --- |
| services/supabase.ts | Cliente único de Supabase con la sesión cifrada y el refresco de token ligado a AppState. | Sara (E3) |
| services/secureSessionStorage.ts | Guarda la sesión: llave AES en SecureStore y sesión cifrada en AsyncStorage (D-33). | Sara (E3) |
| services/errors.ts | `AppError`, `toAppError` (traduce todos los errores al español) y `unwrap`. | Sara (E3) |
| services/*Service.ts | Un servicio por dominio (auth, profile, vehicle, trip, reservation, storage, rating, notification, chat). Solo hablan con Supabase. | Sara (E3) |
| store/store.ts, hooks.ts, createAppAsyncThunk.ts, types.ts | Store de Redux Toolkit, hooks tipados, thunk tipado y tipos de estado de carga. | Sara (E3) |
| features/*/slice.ts, thunks.ts, selectors.ts | Estado, acciones asíncronas y selectores memoizados de los 9 dominios. | Sara (E3) |
| db/database.ts y db/cache.ts | SQLite: migración por `user_version` y caché sin conexión con `loadWithCache`. | Sara (E3) |
| hooks/useAuthSession.ts, useConnectivity.ts, useRealtime.ts | Sesión, conexión y suscripciones Realtime, cada una con su cleanup. | Sara (E3) |
| components/ConnectionBanner.tsx | Banner "Sin conexión: mostrando datos guardados". | Sara (E3) |
| app/dev/sesion.tsx | Pantalla temporal (solo desarrollo) para probar la Etapa 3 (D-38). | Sara (E3) |
| supabase/migrations/0003_realtime.sql | Habilita Realtime en viajes, reservas, notificaciones y mensajes (D-35). | Sara (E3) |
| types/domain.ts | Tipos de la app sobre las filas: `TripListItem`, `ReservationItem`, `CreateTripInput`. | Sara (E3) |

### Flujo de datos paso a paso (ejemplo: reservar un viaje)

1. **Pantalla:** `dispatch(createReservation({ viajeId, puntoRecogidaTexto, puntoLat, puntoLng }))`.
2. **Thunk** (features/reservations/thunks.ts): `createAppAsyncThunk` despacha `pending`. El reducer pone `mutation.status = 'loading'` y el botón muestra carga.
3. **Servicio** (services/reservationService.ts): `supabase.rpc('crear_reserva', …)` y luego `getReservation(id)` para traer la reserva con su viaje.
4. **Supabase:** la RPC valida R5 con bloqueo de fila y el trigger crea la notificación para el conductor.
5. **Reducer:** si salió bien, `fulfilled` hace `upsertOne` y agrega el id a `myIds`. Si falló, el thunk atrapó el error, `toAppError` lo tradujo (por ejemplo, "Ya tienes una reserva en este viaje.") y `rejectWithValue` lo deja en `mutation.error`.
6. **Selector:** `selectMyReservations` y `makeSelectMyReservationsByEstado('pendiente')` recalculan solo si cambiaron las reservas.
7. **Pantalla:** se vuelve a dibujar con la reserva o con el error y "Reintentar".
8. **Realtime:** cuando el conductor acepta, llega el cambio de la fila. `useRealtimeTripsAndReservations` despacha `reservationChanged` y la reserva pasa a la pestaña Aceptados sin recargar.

### Preguntas probables — Capa de cliente

31. **¿Por qué las pantallas no llaman a Supabase directamente?** Para separar responsabilidades (sección 4): la pantalla solo despacha thunks y lee selectores, el servicio solo habla con Supabase y el reducer solo cambia el estado. Así cada parte se prueba sola: en las pruebas se simula el servicio y se comprueba el reducer sin red.
32. **¿Qué es un thunk y por qué `createAsyncThunk`?** Una función que hace trabajo asíncrono antes de cambiar el estado. `createAsyncThunk` despacha `pending`, `fulfilled` y `rejected` por nosotros, y con eso cada slice maneja los estados idle, loading, succeeded y failed que pide la especificación.
33. **¿Qué hace `rejectWithValue`?** Entrega un valor controlado (nuestro `AppError` con el mensaje en español) en lugar del error crudo, y queda en `action.payload` del `rejected`. Además, `createAppAsyncThunk` declara que ese valor siempre es `AppError`, así TypeScript lo sabe en el reducer.
34. **¿Qué es `createEntityAdapter` y por qué lo usan en viajes?** Guarda los viajes normalizados (`ids` + `entities`). Un viaje existe una sola vez aunque esté en la búsqueda y en "Creados", y un cambio por Realtime (`updateOne`) lo actualiza en todas partes.
35. **¿Qué es un selector memoizado y qué gana la FlatList?** `createSelector` recuerda su último resultado y solo recalcula si cambian sus entradas. `selectSearchTrips` devuelve el mismo arreglo si los viajes no cambiaron (hay una prueba de eso), así la FlatList no se vuelve a dibujar por un cambio ajeno, como la conexión.
36. **¿Cómo evitan que una respuesta vieja pise una nueva?** Cada `searchTrips` tiene un `requestId`. En `pending` se guarda el último. En `fulfilled` y `rejected`, si el requestId no es el último, se ignora (D-37). Hay una prueba que hace llegar la respuesta lenta al final.
37. **¿Cómo guardan la sesión de forma segura?** SecureStore puede rechazar valores de más de 2048 bytes. Se cifra la sesión con AES-256 y la llave va en SecureStore (Keystore de Android); el texto cifrado va en AsyncStorage. Sin la llave no se puede leer. Al cerrar sesión se borran las dos partes (D-33).
38. **¿Por qué el refresco del token depende de AppState?** En segundo plano React Native pausa los temporizadores y el refresco fallaría. `bindAutoRefreshToAppState` lo inicia al volver a primer plano y lo detiene al salir; su función de limpieza quita el listener.
39. **¿Cómo funciona la caché sin conexión?** `loadWithCache`: con red pide los datos y guarda una copia JSON en SQLite con la hora (`cachedAt`); sin red (NetInfo) o si la petición falla por red, devuelve la copia y marca `fromCache`. La pantalla muestra el banner "Sin conexión" con la hora. Sin copia, el error "Sin conexión" ofrece "Reintentar".
40. **¿Por qué cada suscripción Realtime está en un `useEffect` con return?** Al montar se abre el canal. El `return` del `useEffect` (cleanup) lo cierra con `removeChannel` al desmontar o cuando cambia el usuario. Sin eso quedarían canales abiertos: fuga de memoria y eventos duplicados. La prueba realtime.test comprueba que la función de cierre se llama al desmontar.

**Pregunta extra (recursión en RLS).** *¿Por qué las políticas de `viajes` y `reservas` usan funciones en lugar de una subconsulta?* La política de `viajes` necesita saber si el pasajero tiene una reserva aceptada, y la de `reservas` necesita saber si el usuario es el conductor del viaje. Si cada una consulta la otra tabla, cada consulta dispara la política de la otra y PostgreSQL corta el ciclo con el error 42P17 ("infinite recursion detected in policy"). Las funciones `SECURITY DEFINER` corren como el dueño de las tablas, sin RLS, así que la comprobación no vuelve a disparar ninguna política (migración 0005, D-41). Lo encontramos en el teléfono gracias a que en desarrollo el error muestra su código (D-42).

### Ejercicios de ajuste en vivo (Etapa 3)

9. **Cambiar el tamaño de página.** En services/tripService.ts cambiar `TRIPS_PAGE_SIZE` de 20 a 10. La búsqueda trae páginas de 10 y `hasMore` se calcula con el nuevo valor sin tocar nada más.
10. **Traducir un error nuevo.** En services/errors.ts agregar un código al mapa `RPC_MESSAGES` (o cambiar el texto de `reserva_duplicada`), correr `npm test` y ver cómo cambia la prueba de errors.test.

### Mis archivos y los del otro (actualizado en la Etapa 3)

| Persona | Mis archivos | Archivos del otro que debo dominar |
| --- | --- | --- |
| Sara | E0, E1 y E3: services/, store/, features/, db/, hooks/useAuthSession, useConnectivity y useRealtime, components/ConnectionBanner.tsx, supabase/migrations/0003_realtime.sql | E2: supabase/migrations/0001 (en especial `aceptar_reserva`, `crear_reserva`, `handle_new_user` y las políticas de viajes y reservas), 0002 (buckets), supabase/tests/rls.sql |
| Samuel | E2 y E4: app/(auth)/, app/(tabs)/, app/profile.tsx, app/index.tsx, lib/validators.ts, lib/imagePicker.ts, __tests__/lib/validators.test.ts, __tests__/screens/ | E3: services/supabase.ts, services/errors.ts, services/tripService.ts, features/trips/ (slice, thunks y selectores), db/cache.ts, hooks/useRealtime.ts |

---

## Autenticación, registro y perfil (Etapa 4 — Samuel)

### Mapa de archivos nuevos

| Ruta | Qué hace | Autor (etapa) |
| --- | --- | --- |
| lib/validators.ts | Validadores puros de datos: correo @unisabana.edu.co, contraseña (≥6 caracteres), ID de 10 dígitos, teléfono de 10 dígitos, placa colombiana (`^[A-Z]{3}[0-9]{3}$`), capacidad (1 a 8 cupos) y código OTP de 6 dígitos. | Samuel (E4) |
| lib/imagePicker.ts | Selector accesible de imágenes con `expo-image-picker` para avatar, foto del vehículo y SOAT, con validación de peso máximo y opciones de compresión. | Samuel (E4) |
| app/index.tsx | Pantalla 1 de bienvenida según Figma: logo grande, "Iniciar Sesión", "Registrarse" y accesos de desarrollo. | Samuel (E4) |
| app/(auth)/login.tsx | Pantalla 2 de inicio de sesión y pantalla ERROR del Figma con mensaje descriptivo y botón "Volver". | Samuel (E4) |
| app/(auth)/register/ | Flujo guiado de registro en 7 pasos accesibles (§6.7, T-08): datos personales (1), código OTP con temporizador de reenvío de 30 s (2), foto de perfil (3), pregunta de vehículo (4), datos del carro (5), foto del carro (6) y foto del SOAT con guardado final (7). | Samuel (E4) |
| app/profile.tsx | Pantalla 15 de Mi Perfil: lectura de datos personales, modal accesible para edición (nombre, apellido, teléfono), pestañas Pasajero/Carro, eliminación de carro con `ConfirmDialog`, cierre de sesión con `ConfirmDialog` y cambio de modo validando carro. | Samuel (E4) |
| app/(tabs)/_layout.tsx | Pestañas inferiores con `BottomTabBar` que oculta dinámicamente "Reservas" en modo conductor y "Creados" en modo pasajero. | Samuel (E4) |
| app/_layout.tsx (actualizado) | Guardia de sesión global: redirige usuarios no autenticados a `/`, usuarios con registro incompleto a su paso pendiente (`/register/photo`), y usuarios autenticados completos a `/(tabs)`. | Samuel (E4) |
| \_\_tests\_\_/lib/validators.test.ts | 17 pruebas unitarias de todos los casos borde de los validadores. | Samuel (E4) |
| \_\_tests\_\_/screens/auth.test.tsx | Pruebas de integración de la pantalla de Login, validación en línea y estado de ERROR. | Samuel (E4) |
| \_\_tests\_\_/screens/profile.test.tsx | Pruebas de renderizado de perfil, cambio de pestañas Pasajero/Carro y diálogos de confirmación de logout y borrado de carro. | Samuel (E4) |

### Preguntas probables — Autenticación y perfil

41. **¿Cómo funciona el guardia de sesión en app/_layout.tsx?** Evalúa `userId` y `profile.registro_completo` contra la ruta actual de `useSegments()`. Si el usuario no tiene sesión y busca una ruta privada, `router.replace('/')` lo envía a la bienvenida. Si tiene sesión pero `registro_completo` es falso, lo redirige al paso pendiente de registro. Si está completo y visita `/` o rutas de auth, lo redirige a `/(tabs)`.
42. **¿Por qué la verificación por código usa un temporizador de 30 segundos?** Para evitar el agotamiento de límites de tasa (rate limiting) de envío de correos de Supabase y dar retroalimentación visual al usuario del tiempo de espera antes de poder solicitar otro código.
43. **¿Cómo se garantiza que un conductor tenga carro antes de cambiar de modo?** En el cliente, tanto `AppHeader` como `ProfileScreen` interceptan el toque del selector de modo: si no existe vehículo registrado en el store, no se llama al thunk sino que se despliega un `ConfirmDialog` informativo que ofrece "Registrar Carro" llevando al flujo de vehículo. En el backend, la RPC `cambiar_modo` exige que el conductor tenga carro mediante una excepción de base de datos (`sin_vehiculo`).
44. **¿Por qué se suben las imágenes antes de marcar el registro como completo?** Para asegurar la atomicidad del flujo: el avatar, la foto del vehículo y el SOAT se envían a sus respectivos buckets de Supabase Storage; una vez registrados los paths en la base de datos se actualiza `registro_completo = true`, garantizando que ningún usuario quede en estado inconsistente.

### Ejercicios de ajuste en vivo (Etapa 4)

11. **Cambiar la validación de capacidad de vehículo.** En `lib/validators.ts`, cambiar el rango permitido en `validateVehicleCapacity` (por ejemplo, de 1 a 6 cupos) y verificar con `npm test -- __tests__/lib/validators.test.ts`.
12. **Modificar el tiempo de espera del temporizador de reenvío de OTP.** En `app/(auth)/register/verify.tsx`, cambiar `countdown` de 30 a 60 segundos y verificar el estado del botón accesible de reenvío.


---

## Flujo de pasajero (Etapa 5 — Sara)

### Mapa de archivos nuevos

| Ruta | Qué hace | Autor (etapa) |
| --- | --- | --- |
| app/(tabs)/index.tsx | Inicio: filtros y lista de viajes en modo pasajero (pantalla 10). | Sara (E5) |
| app/trip/[id]/reserve.tsx | Reserva con mapa y confirmación (pantallas 11 y 12). | Sara (E5) |
| app/(tabs)/reservas.tsx | Reservas por estado y cancelación (pantalla 13). | Sara (E5) |
| app/(tabs)/curso.tsx | Viajes en curso del pasajero (pantalla 14). | Sara (E5) |
| components/trips/ | TripCard, ReservationCard, TripFilters y TripList. | Sara (E5) |
| components/maps/MapPicker.tsx | Mapa real para elegir un punto con un toque. | Sara (E5) |
| components/ui/SelectField.tsx e InnerTabs.tsx | Lista desplegable accesible y pestañas internas. | Sara (E5) |
| hooks/useTripSearch.ts, useDebouncedValue.ts, useLocationPoint.ts, useModeSwitch.ts y useFocusCounter.ts | Búsqueda con debounce, punto del mapa, cambio de modo y foco al volver a una pestaña. | Sara (E5) |
| lib/location.ts | Permiso, posición y geocodificación con expo-location, sin claves. | Sara (E5) |
| supabase/migrations/0006_viajes_llenos_visibles.sql | Permite que Realtime avise cuando un viaje se llena (D-48). | Sara (E5) |

### Preguntas probables — Flujo de pasajero

45. **¿Cómo optimizaron la lista de viajes?** FlatList con `keyExtractor` estable fuera del componente, `renderItem` con `useCallback`, `TripCard` con `React.memo`, `initialNumToRender` y `windowSize` ajustados y paginación por rango con `onEndReached`. Al memo le pasamos el promedio como números sueltos: un objeto nuevo en cada carga rompería la comparación.
46. **¿Para qué sirve el debounce de 300 ms?** Para no lanzar una consulta por cada tecla. `useDebouncedValue` solo actualiza el valor cuando lleva 300 ms sin cambiar; el cleanup del `useEffect` cancela el temporizador anterior. La lupa busca de inmediato.
47. **¿Por qué TripCard es un solo foco y la tarjeta de reserva no?** En la búsqueda toda la tarjeta es una acción: un `Pressable` con etiqueta compuesta (S-04). En la reserva hay dos acciones distintas (leer y cancelar): si la papelera estuviera dentro de un elemento `accessible`, TalkBack no llegaría a ella, así que es un hermano posicionado encima.
48. **¿Cómo se actualizan los cupos en vivo?** Supabase Realtime envía el cambio de la fila, `useRealtimeTripsAndReservations` despacha `tripChanged` y el reducer actualiza el viaje conservando sector y conductor. La reserva guarda una copia de su viaje, y `tripChanged` también la actualiza. Si el viaje ya no es reservable, sale de la búsqueda.
49. **¿Por qué necesitaron la migración 0006?** Realtime respeta RLS y evalúa la fila ya cambiada. Antes, un viaje `lleno` dejaba de ser legible, así que el pasajero no recibía ese cambio. Ahora se puede leer y la búsqueda filtra por `abierto` (D-48).
50. **¿Qué pasa si no doy permiso de ubicación?** En Android la geocodificación necesita el permiso. Sin él, `lib/location.ts` devuelve `null`, la app avisa y la persona escribe la dirección. Si esa dirección no se encuentra, se guardan las coordenadas del origen del viaje y el conductor se guía por el texto (D-50).
51. **¿Cómo evitan que una dirección vieja reemplace a la nueva?** `useLocationPoint` numera cada toque del mapa. Cuando llega la respuesta, solo se usa si su número es el último.

### Ejercicios de ajuste en vivo (Etapa 5)

13. **Cambiar el debounce.** En hooks/useTripSearch.ts cambiar `FILTER_DEBOUNCE_MS` de 300 a 800 y ver en el teléfono que la búsqueda tarda más en dispararse.
14. **Agregar un dato a la tarjeta.** En components/trips/TripCard.tsx agregar una `Line` en `TripDetails` y el mismo dato en `tripAccessibilityLabel`, para que TalkBack también lo lea.

### Mis archivos y los del otro (actualizado en la Etapa 6)

| Persona | Mis archivos | Archivos del otro que debo dominar |
| --- | --- | --- |
| Sara | E0, E1, E3 y E5 | E2, E4, E6 y E7 (calificaciones/notificaciones): app/(tabs)/creados.tsx, app/trip/create.tsx, app/requests.tsx, components/trips/CreatedTripCard.tsx, RequestCard.tsx, supabase/migrations/0007 y 0008, app/notifications.tsx, app/trip/[id]/rate.tsx, components/ratings/StarRating.tsx, components/notifications/NotificationItemCard.tsx |
| Samuel | E2, E4, E6 y E7 (calificaciones y notificaciones): app/(tabs)/creados.tsx, app/(tabs)/curso.tsx (conductor), app/trip/create.tsx, app/requests.tsx, components/trips/CreatedTripCard.tsx, RequestCard.tsx, supabase/migrations/0007 y 0008, components/ratings/StarRating.tsx, components/notifications/NotificationItemCard.tsx, app/notifications.tsx, app/trip/[id]/rate.tsx | E3 y E5: components/trips/TripCard.tsx, TripList.tsx, hooks/useTripSearch.ts, app/trip/[id]/reserve.tsx, app/(tabs)/reservas.tsx, SelectField.tsx, features/notifications/*, hooks/useRealtime.ts |

---

## Flujo de conductor (Etapa 6 — Samuel)

### Mapa de archivos nuevos y modificados

| Ruta | Qué hace | Autor (etapa) |
| --- | --- | --- |
| supabase/migrations/0007_proteger_updates_rls.sql | Cierra brechas de UPDATE directo en `viajes` y `reservas`, y trigger de protección en `profiles.modo_actual` para forzar RPCs atómicas (D-53). | Samuel (E6) |
| lib/validators.ts (actualizado) | Nuevos validadores puros: `validateDate`, `validateTime`, `validateFutureDeparture`, `validateTripCupos`, `validatePrice`. | Samuel (E6) |
| components/trips/CreatedTripCard.tsx | Tarjeta de viaje creado para el conductor con resumen accesible (S-04), botón "Iniciar viaje" condicionado a reservas (R8), y "Cancelar viaje" / "Finalizar viaje" con `ConfirmDialog` (T-06). | Samuel (E6) |
| components/trips/RequestCard.tsx | Tarjeta de solicitud de reserva para el conductor con datos del pasajero, punto de recogida y acciones "Aceptar reserva" y "Rechazar reserva" con indicador de carga. | Samuel (E6) |
| app/(tabs)/index.tsx (actualizado) | Inicio de conductor (pantalla 17): tarjeta "Crea un viaje" con botón "+", tarjeta "Viajes Pendientes" con contador de solicitudes y "Ver más", y caja de vehículo activo. | Samuel (E6) |
| app/trip/create.tsx | Pantalla 18 ("Crea tu viaje"): mapa para punto de partida (T-07), campos con validación en línea (V-05), resumen de errores con anuncio auditivo (S-07), y diálogo modal de confirmación exitosa con botón "¡Listo!". | Samuel (E6) |
| app/requests.tsx | Pantalla de solicitudes de reserva para el conductor con `InnerTabs` (Pendientes, Aceptadas, Rechazadas) y acciones de aceptación y rechazo con retroalimentación háptica y anuncios. | Samuel (E6) |
| app/(tabs)/creados.tsx | Pantalla 19 ("Viajes creados"): lista de viajes del conductor, iniciar viaje con validación, cancelar viaje con confirmación destructiva y enlace a solicitudes. | Samuel (E6) |
| app/(tabs)/curso.tsx (actualizado) | Pantalla 14 adaptada para conductor: lista de viajes en curso propios con acción "Finalizar viaje" mediante confirmación modal. | Samuel (E6) |
| __tests__/screens/driver.test.tsx | 7 pruebas automáticas de integración de todas las pantallas y flujos del conductor. | Samuel (E6) |

### Preguntas probables — Flujo de conductor

52. **¿Por qué se revocaron las políticas de UPDATE directo en `viajes` y `reservas`?**
    Para impedir que un cliente autenticado modifique arbitrariamente el estado de un viaje o reserva mediante llamadas directas a PostgREST sin pasar por las RPCs transaccionales (`aceptar_reserva`, `rechazar_reserva`, `cancelar_reserva`, `iniciar_viaje`, etc.). Al revocar el UPDATE directo, Supabase garantiza que los bloqueos de fila (`FOR UPDATE`), el recuento atómico de cupos, el cierre automático al llegar a 0 y las notificaciones se ejecuten en una única transacción de base de datos protegida (R6, R8, D-53).
53. **¿Cómo se asegura que un viaje solo se inicie si tiene al menos una reserva aceptada?**
    Doble protección: en la base de datos, la RPC `iniciar_viaje` verifica que exista al menos una reserva con `estado = 'aceptada'` asociada al viaje (R8) o lanza la excepción `sin_pasajeros`. En la interfaz, el botón "Iniciar viaje" de `CreatedTripCard` se deshabilita (`disabled={!hasAcceptedReservations}`) y expone la pista `accessibilityHint="Requiere al menos una reserva aceptada para iniciar"` para guiar al usuario antes de pulsar.
54. **¿Cómo funciona la validación accesible en la pantalla "Crea tu viaje"?**
    Cumple con el criterio V-05 y §6.7: no muestra un aviso genérico, sino un error de texto específico debajo de cada campo con error (`TextField` con `error`), y genera un resumen accesible arriba del botón que lista verbalmente los campos faltantes ("Revisa los campos con error: Punto de partida, Fecha de salida..."). Este resumen se anuncia al lector de pantalla mediante `useAnnounce` sin desplazar abruptamente el foco (S-07).
55. **¿Qué retroalimentación recibe el conductor al aceptar o rechazar solicitudes?**
    Retroalimentación multimodal (T-04): auditiva mediante `useAnnounce('Reserva aceptada')`, háptica mediante `useHaptics` (vibración de confirmación en éxito o advertencia en rechazo), visual con el estado de carga (`busy`) en el botón accionado y actualización en tiempo real de la lista sin recargas bruscas.

### Ejercicios de ajuste en vivo (Etapa 6)

15. **Modificar el límite máximo de cupos al crear viaje.**
    En `app/trip/create.tsx` o en `lib/validators.ts`, ajustar la validación de cupos permitidos según la capacidad máxima del carro y ejecutar `npm test -- __tests__/lib/validators.test.ts`.
16. **Probar la protección de inicio de viaje.**
    En `components/trips/CreatedTripCard.tsx`, modificar la condición `disabled={!hasAcceptedReservations}` y verificar con `npm test -- __tests__/screens/driver.test.tsx` que la prueba TC-14 / R8 detecta el comportamiento esperado.

---

## Calificaciones y notificaciones (Etapa 7 — Samuel)

### Mapa de archivos nuevos y modificados

| Ruta | Qué hace | Autor (etapa) |
| --- | --- | --- |
| supabase/migrations/0008_calificaciones_rls_pares.sql | Endurece el `INSERT` en `calificaciones` para exigir `autor_id <> destinatario_id` y pares conductor ↔ pasajero con reserva aceptada en viaje `finalizado` (R9, D-56). | Samuel (E7) |
| services/ratingService.ts, features/ratings/* y lib/validators.ts | Carga contexto del viaje para calificar (`getTripRatingContext`, `fetchTripRatingContext`), valida estrellas `1..5` y comentario ≤ 280 chars y actualiza promedios y estado local al enviar. | Samuel (E7) |
| features/reservations/thunks.ts (actualizado) | Despacha `fetchRatingAverages` para los conductores al cargar reservas con red, completando promedios en `ReservationCard`. | Samuel (E7) |
| components/ratings/StarRating.tsx | Selector de 5 estrellas accesibles (`N de 5 estrellas`, `accessibilityState.selected`, área mínima `TOUCH_MIN`, envoltorio flexible y contraste por borde/relleno/ícono). | Samuel (E7) |
| components/notifications/NotificationItemCard.tsx | Tarjeta accesible con foco único por notificación y distinción de leída/no leída sin depender solo del color (etiqueta "Nueva", ícono y borde grueso). | Samuel (E7) |
| app/notifications.tsx | Bandeja cronológica de notificaciones con contador de no leídas, "Marcar todas como leídas" con anuncio auditivo y navegación contextual segura (D-58). | Samuel (E7) |
| app/trip/[id]/rate.tsx | Pantalla unificada de calificación (R9) para pasajero o conductor con `RadioGroup` cuando hay múltiples pasajeros aceptados (D-57). | Samuel (E7) |
| app/_layout.tsx, app/profile.tsx, app/(tabs)/reservas.tsx, app/(tabs)/creados.tsx, CreatedTripCard.tsx, ReservationCard.tsx | Carga inicial de notificaciones, promedio en perfil, botón a Notificaciones con contador y disparadores de calificación en viajes finalizados. | Samuel (E7) |

### Preguntas probables — Calificaciones y notificaciones

56. **¿Por qué no bastaba `es_participante_del_viaje` en la política INSERT de `calificaciones`?**
    Porque esa función solo confirma que el usuario participa en el viaje, pero no impedía que alguien intentara calificarse a sí mismo o que un pasajero calificara a otro pasajero. La migración `0008` combina `autor_id <> destinatario_id` con `es_conductor_del_viaje` y `tiene_reserva_aceptada` (`SECURITY DEFINER` de `0005`) para garantizar pares estrictos conductor ↔ pasajero sin recursión RLS (D-56).
57. **¿Cómo cumple `StarRating` con accesibilidad visual, motriz y para TalkBack?**
    Cada estrella es un `Pressable` independiente con `accessibilityRole="button"`, etiqueta `"N de 5 estrellas"` y `accessibilityState={{ selected: star <= value, disabled }}`; mantiene `minWidth` y `minHeight >= TOUCH_MIN`, usa `flexWrap: 'wrap'` para no salirse en pantallas angostas al escalar texto (V-06), y combina ícono lleno/contorno, texto numérico y tokens contrastados (V-05).
58. **¿Por qué el acceso a Notificaciones se colocó en `Mi Perfil` y no en el `AppHeader`?**
    Por fidelidad con el Figma (§6.7 #15) y porque `identity.test.tsx` valida el orden de foco exacto del encabezado interno (`Volver`, `Perfil`, `Ajustes`). Cargar notificaciones al autenticar en `app/_layout.tsx` junto con `useRealtimeNotifications` mantiene actualizado `selectUnreadCount` para mostrarlo en el botón de Perfil (D-58).
59. **¿Cómo evita duplicados la UI al calificar un viaje finalizado?**
    `getTripRatingContext` consulta previamente las calificaciones del `autor_id` en ese `viaje_id`. Si un destinatario ya tiene calificación, `rate.tsx` muestra el puntaje y comentario enviado en lugar del formulario; además, en PostgreSQL la restricción `UNIQUE (viaje_id, autor_id, destinatario_id)` rechaza duplicados y `submitRating` traduce el error `duplicado`.

### Ejercicios de ajuste en vivo (Etapa 7)

17. **Cambiar el límite del comentario en calificaciones.** En `lib/validators.ts`, cambiar `MAX_RATING_COMMENT_LENGTH` (por ejemplo de `280` a `200`) y verificar en `__tests__/lib/validators.test.ts` y `__tests__/features/ratings-notifications.test.ts`.
18. **Probar el umbral de un viaje no finalizado en calificaciones.** En `app/trip/[id]/rate.tsx`, cambiar temporalmente la comprobación `context.trip.estado !== 'finalizado'` y confirmar que `__tests__/screens/ratings.test.tsx` detecta la violación a la regla R9.
