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

26. **¿Por qué el trigger `handle_new_user` crea el perfil con datos vacíos si `raw_user_meta_data` no llega?**
    Usa `COALESCE(..., '')` para nunca dejar un `NULL` en columnas `NOT NULL`. La app siempre envía los datos al registro, pero el trigger no debe romperse si alguien crea el usuario desde el panel de Supabase; en ese caso el perfil queda con texto vacío y `registro_completo = FALSE`, y la guarda de sesión de la app dirigirá al usuario al paso pendiente.

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
