# Guía del código de CampusGo

Guía para entender qué hay en el código, cómo funciona y dónde tocar si en la defensa piden un cambio. Se actualiza al terminar cada etapa (la tuya o la de Samuel).

- **Incluye hasta:** Etapa 5 (flujo de pasajero). Las secciones 12 a 15 explican las Etapas 2, 3, 4 y 5.
- **Todavía no existe:** crear viajes y aceptar solicitudes (Etapa 6), y las pantallas de calificaciones, notificaciones y chat (Etapa 7). Su lógica de datos ya está en los slices y servicios (sección 13).
- Las preguntas de defensa con respuesta modelo están en [GUIA_DEFENSA.md](GUIA_DEFENSA.md). Esta guía explica el código; aquella, cómo responder.

---

## 1. La idea en una frase

Hasta ahora CampusGo tiene tres capas listas:
- **Abajo, la base de datos (Etapa 2):** Supabase guarda usuarios, carros, viajes y reservas, y aplica las reglas del negocio.
- **En el medio, la capa de cliente (Etapa 3):** servicios que hablan con Supabase, Redux que guarda el estado, caché para usar la app sin internet y Realtime para recibir cambios en vivo.
- **Arriba, las piezas accesibles (Etapa 1):** colores, letras, botones, campos, diálogos y el esqueleto de las pantallas.

Las pantallas de autenticación y perfil (Etapa 4) y las del pasajero (Etapa 5) ya unen las tres capas. Faltan las del conductor (Etapa 6) y las de calificaciones, notificaciones y chat (Etapa 7).

---

## 2. Mapa de carpetas (lo que tiene contenido)

```
campusgo/
├── app/                  Pantallas. Cada archivo es una ruta (Expo Router).
│   ├── _layout.tsx       Envuelve toda la app: fuentes, tema y navegación.
│   ├── index.tsx         Pantalla inicial provisional (ruta "/").
│   ├── settings/accessibility.tsx   Ajustes de accesibilidad.
│   ├── dev/catalogo.tsx  Catálogo de componentes (solo en desarrollo).
│   └── dev/sesion.tsx    Sesión de prueba de la Etapa 3 (solo en desarrollo).
├── components/ui/        Las piezas reutilizables (botones, campos, diálogos…).
├── components/ConnectionBanner.tsx   Banner "Sin conexión" (lee Redux).
├── hooks/                Accesibilidad (anunciar, vibrar, foco…) y conexión con el
│                         exterior (sesión, internet, Realtime).
├── theme/                Colores, letras, medidas y el "proveedor" del tema.
├── services/             Lo único que habla con Supabase (uno por tema).
├── store/                El store de Redux y sus ayudas.
├── features/             Un dominio por carpeta: slice, thunks y selectores.
├── db/                   La caché local en SQLite.
├── types/                Tipos de la base de datos y de la app.
├── lib/                  Contraste y formatos de texto.
├── supabase/             Migraciones SQL, semilla y pruebas de RLS.
├── scripts/check-contrast.ts   El script que revisa los colores.
├── __tests__/            Pruebas automáticas.
├── test-utils/           Ayudas y datos de ejemplo SOLO para las pruebas.
└── docs/                 Documentación (esta guía, decisiones, matriz, etc.).
```

Desde la Etapa 4 existen `app/(auth)/`, `app/(tabs)/` y `app/profile.tsx`. Desde la Etapa 5, `app/trip/[id]/reserve.tsx`, `components/trips/` (tarjetas, filtros y lista) y `components/maps/` (mapa).

---

## 3. Cómo arranca la app (el recorrido completo)

1. **package.json** dice `"main": "expo-router/entry"`. Expo Router es quien arranca.
2. Expo Router mira la carpeta **app/** y convierte cada archivo en una pantalla: `app/index.tsx` es `/`, `app/settings/accessibility.tsx` es `/settings/accessibility`.
3. Antes de cualquier pantalla se ejecuta **app/_layout.tsx**, que hace esto en orden:
   - Deja visible la pantalla de carga nativa (splash) con `SplashScreen.preventAutoHideAsync()`.
   - Envuelve todo con `SafeAreaProvider` (para no dibujar debajo de la cámara o la barra de estado), con el `Provider` de Redux (el estado global, Etapa 3) y con `ThemeProvider` (el tema y las preferencias).
   - Carga la fuente Noto Sans en tres pesos: normal, semi negrita y negrita (`useFonts`).
   - Arranca tres conexiones que viven en toda la app (sección 13.5): la sesión (`useAuthSession`), el estado de internet (`useConnectivity`) y Realtime (`useRealtime…`).
   - Espera tres cosas: que carguen las fuentes, que el ThemeProvider haya leído las preferencias guardadas (`ready`) y que se haya leído la sesión guardada (`authInitialized`). Mientras tanto devuelve `null` y se sigue viendo el splash.
   - Cuando todo está listo, oculta el splash y muestra la navegación (`Stack`) sin encabezado nativo. Si el usuario activó "reducir movimiento", el cambio de pantalla es un fundido de 150 ms en lugar de deslizar.
   - Si la fuente fallara, la app sigue con la del sistema en vez de quedarse trabada.
4. Se muestra **app/index.tsx**.

**Por qué esperar el splash:** sin eso se vería un instante la letra del sistema o el tema claro antes del oscuro (un parpadeo feo).

---

## 4. El sistema de diseño (carpeta theme/)

### 4.1 Colores: theme/colors.ts

Un **token** es un nombre para un color según su uso, por ejemplo `primary` en lugar de `#334259`. Ninguna pantalla escribe un hexadecimal: siempre pide el token al tema activo con `useTheme().colors.primary`. Así, cambiar el tema cambia todos los colores a la vez.

Hay **tres temas** con exactamente los mismos nombres de token: `light` (claro), `dark` (oscuro) y `highContrast` (alto contraste).

Tokens principales del tema claro:

| Token | Color | Dónde se ve |
| --- | --- | --- |
| `background` | #B2BBC9 | Fondo gris azulado de la zona de contenido |
| `surface` | #FFFFFF | Encabezado, tarjetas, campos y barra inferior |
| `titleBand` | #C1C9D7 | Banda donde va el título de cada pantalla |
| `cardHeader` | #A9ACB0 | Encabezado gris de las tarjetas de viaje (solo texto grande en negrita) |
| `text` | #334259 | Texto principal |
| `textMuted` | #5F6B7A | Texto secundario (14) |
| `placeholder` | #5F6B7A | Texto de ejemplo dentro de los campos |
| `primary` | #334259 | Botón principal y bordes |
| `primaryPressed` | #24303F | Botón principal mientras se presiona |
| `onPrimary` | #FFFFFF | Texto sobre el botón principal |
| `brandSurface` | #334259 | Tarjetas y diálogos azules |
| `onBrand` | #FFFFFF | Texto sobre tarjetas azules |
| `onBrandMuted` | #E3E8F0 | Texto secundario sobre azul |
| `border` | #334259 | Borde de campos (1 px; 2 px al enfocar) |
| `focus` y `link` | #1A4FD6 | Borde de foco con teclado y enlaces |
| `error` | #B3261E | Mensajes de error |
| `success` | #1E7B34 | Mensajes de éxito |
| `successOnBrand` | #3EE700 | Check verde dentro de un diálogo azul |
| `alertBadge` + `onAlertBadge` | #AF0000 + #FFFFFF | Círculo rojo con "?" blanco de los diálogos |
| `avatarBackground` + `avatarIcon` | #E3E8F0 + #334259 | Avatar vacío del botón de perfil |

Al final del archivo está **`CONTRAST_PAIRS`**: la lista de combinaciones (qué texto va sobre qué fondo) que de verdad usa la interfaz. El script de contraste revisa cada una en los tres temas.

### 4.2 La revisión de contraste: lib/contrast.ts y scripts/check-contrast.ts

- **lib/contrast.ts** tiene la fórmula de WCAG. `relativeLuminance` calcula qué tan clara es un color de 0 (negro) a 1 (blanco). `contrastRatio` compara dos colores y da un número de 1 a 21.
- Los mínimos son 4,5 para texto normal, 3 para texto grande y 3 para bordes e íconos (`MIN_RATIO`).
- **`npm run a11y:contrast`** recorre los 22 pares en los 3 temas (66 en total), imprime cada razón con OK o FALLA y **termina con error si alguno falla**. Hoy pasan los 66.

### 4.3 Letras: theme/typography.ts

La fuente es Noto Sans, con una familia por peso (`fontFamilies.regular`, `semibold`, `bold`). No se usa `fontWeight` porque en Android, con fuentes propias, haría que el sistema cambie la fuente.

| Variante | Tamaño | Alto de línea | Para qué |
| --- | --- | --- | --- |
| `title` | 26 | 38 | Títulos de pantalla |
| `subtitle` | 19 | 28 | Subtítulos y título de diálogos |
| `cardTitle` | 22 | 32 | Título de tarjetas ("Colina") |
| `body` | 16 | 24 | Texto normal y campos |
| `bodyStrong` | 16 | 24 | Texto normal en negrita |
| `label` | 16 | 24 | Etiquetas de campos |
| `button` | 16 | 24 | Texto de botones |
| `secondary` | 14 | 20 | Texto secundario y errores |
| `tab` | 12 | 18 | Etiquetas de la barra inferior |

Reglas de este archivo:
- **Alto de línea de al menos 1,4 veces el tamaño** (`MIN_LINE_HEIGHT_RATIO`), para que no se corten las tildes, la Ñ, la ¿ ni la ¡.
- **Espaciado entre letras 0.** El Figma usaba negativo y pegaba las palabras.
- **`MAX_FONT_SIZE_MULTIPLIER = 2`**: el texto crece con el ajuste del teléfono hasta 200 %.
- **`TEXT_SIZE_FACTORS`**: el tamaño elegido en Ajustes (Sistema 1, Grande 1,15, Extra grande 1,3).
- **`scaleTypography(factor)`** multiplica toda la tabla por ese factor y redondea el alto de línea hacia arriba, para no bajar nunca del 1,4.

### 4.4 Medidas: theme/layout.ts

| Nombre | Valor | Para qué |
| --- | --- | --- |
| `TOUCH_MIN` | 44 en iOS, 48 en Android | Alto y ancho mínimo de todo lo que se toca |
| `TOUCH_GAP` | 8 | Separación mínima entre dos cosas que se tocan |
| `spacing` | xs 4, sm 8, md 12, lg 16, xl 24, xxl 32 | Márgenes y espacios (base de 4) |
| `radius` | control 6, card 10, dialog 12, pill 999 | Esquinas redondeadas |
| `borderWidths(tema)` | 1 px (2 px en alto contraste) | Grosor de bordes; el foco y el error siempre 2 px |
| `hitSlopFor(tamaño)` | Calcula el margen invisible | Para que un ícono pequeño alcance TOUCH_MIN |

Ejemplo de `hitSlopFor`: un ícono de 32 en Android necesita 8 de margen invisible por lado (32 + 8 + 8 = 48).

### 4.5 El proveedor del tema: theme/ThemeProvider.tsx

Aquí está **la lógica más importante de la Etapa 1**.

Un **Context** de React es una forma de compartir datos con todos los componentes sin pasarlos uno por uno. El ThemeProvider es ese Context para el tema.

**Qué guarda:** las preferencias del usuario (`Preferences`):
- `theme`: `'system' | 'light' | 'dark' | 'highContrast'`
- `textSize`: `'system' | 'large' | 'extraLarge'`
- `reduceMotion`: sí o no
- `haptics` (vibración): sí o no

Los valores por defecto (`DEFAULT_PREFERENCES`) son Sistema, Sistema, no y sí.

**Cómo funciona, paso a paso:**
1. Al arrancar, lee las preferencias guardadas en el teléfono con AsyncStorage, bajo la clave `campusgo:preferencias`.
2. Si no hay nada o el dato está dañado, usa los valores por defecto (`parsePreferences`).
3. Mientras lee, `ready` es `false`. Por eso `_layout` espera antes de mostrar la app.
4. Calcula el **tema efectivo**: si la preferencia es "Sistema", pregunta al teléfono si está en modo oscuro (`useColorScheme`); si no, usa la elegida.
5. Entrega a toda la app un objeto con `themeName`, `colors` (del tema efectivo), `typography` (escalada por el tamaño de texto), `borders`, `preferences`, `setPreference` y `ready`.
6. `setPreference('theme', 'dark')` cambia una preferencia, actualiza la pantalla al instante y la guarda en el teléfono.

**Detalles que pueden preguntar:**
- **`useMemo`**: el objeto que se entrega solo se vuelve a crear si algo cambió. Sin él, todos los componentes se redibujarían en cada render.
- **La bandera `active`**: si el componente se desmonta antes de que AsyncStorage responda, no se intenta actualizar un estado que ya no existe.
- **¿Por qué AsyncStorage y no SecureStore?** Las preferencias no son secretas. SecureStore se reserva para la sesión (Etapa 3).
- **`useTheme()`**: es como cualquier componente pide el tema. Si se usa fuera del proveedor, lanza un error claro.

---

## 5. Los hooks de accesibilidad (carpeta hooks/)

Un **hook** es una función de React que empieza con `use` y guarda lógica reutilizable.

| Hook | Qué hace | Lógica clave |
| --- | --- | --- |
| `useAnnounce` | Hace que TalkBack diga un mensaje **sin mover el foco** | Llama a `AccessibilityInfo.announceForAccessibility(mensaje)` en Android y en iOS. Ignora mensajes vacíos. |
| `useHaptics` | Vibra en éxito, advertencia o error | En Android usa `performAndroidHapticsAsync` (Confirm, Long_Press, Reject); en iOS, `notificationAsync`. No vibra si el usuario apagó "Vibración". Si el teléfono no puede vibrar, lo ignora. |
| `useReduceMotion` | Dice si hay que evitar animaciones | Devuelve `true` si el teléfono tiene "Quitar animaciones" **o** el usuario lo activó en Ajustes. Se suscribe a cambios del sistema y **se desuscribe al desmontar** (`subscription.remove()`). |
| `useScreenFocus` | Lleva el foco de TalkBack a un elemento (el título) | Espera 500 ms para que termine la transición y envía `sendAccessibilityEvent(ref, 'focus')`. Si cambia `focusKey` (por ejemplo, el paso del registro), lo repite. Cancela el temporizador al desmontar. |

**Una decisión importante (D-27):** la propuesta pedía `accessibilityLiveRegion` en Android para anunciar errores. En tu Samsung no funcionó (pruebas C-06 y C-06b), mientras que `announceForAccessibility` sí (C-05 y C-06c). Por eso toda la app usa solo `useAnnounce`. Es un buen ejemplo para la defensa: una decisión tomada con una prueba real.

---

## 6. Las piezas (carpeta components/ui/)

Regla de todas: **no conocen Redux ni Supabase**. Reciben datos por props y avisan con funciones como `onPress` u `onChange`.

### 6.1 Texto e íconos

- **AppText**: el texto de toda la app. Aplica la variante de letra, el color del tema (`color="error"`, por ejemplo), el escalado del sistema y el límite de 200 %. Si un texto no usa AppText, pierde estas garantías.
- **Icon**: dibuja un ícono de Material Design Icons y **siempre lo oculta de TalkBack**. El significado lo da el botón que lo contiene o el texto de al lado. Los nombres de íconos se buscan en https://pictogrammers.com/library/mdi/.
- **Logo**: "Campus G" + un pin dibujado con SVG + "By Sara y Samuel".
  - `size`: `large` (bienvenida) o `small` (encabezado).
  - `decorative`: en el encabezado el logo no recibe foco. En bienvenida es una imagen llamada "CampusGo, by Sara y Samuel".
  - No crece con la fuente: es un logotipo y al 200 % rompería el encabezado (D-21).

### 6.2 Botones

- **Button**: botón con texto.
  - `label` es obligatorio (TypeScript no compila sin él).
  - `variant`: `primary` (azul relleno), `secondary` (borde azul sobre blanco), `onBrand` (blanco sobre tarjeta azul), `onBrandOutline` (borde blanco sobre tarjeta azul).
  - `loading`: muestra el indicador, cambia el texto a `loadingLabel`, anuncia "ocupado" y **se deshabilita** para evitar el doble toque.
  - Mide como mínimo TOUCH_MIN; cambia de color al presionar; con teclado externo muestra un borde de 2 px.
- **IconButton**: botón de solo ícono (lupa, papelera, lápiz, perfil, +).
  - `accessibilityLabel` es obligatorio: un ícono sin texto no tiene nombre para TalkBack.
  - `variant`: `plain` (ícono suelto), `filled` (círculo azul, como el "+"), `onBrand` (ícono blanco), `avatar` (círculo gris del perfil).
  - `compact`: mantiene el tamaño visual pequeño del Figma y completa el área con `hitSlop`.

### 6.3 Formularios y selección

- **TextField**: campo de texto.
  - `label` obligatorio, visible encima del campo (no se depende del placeholder).
  - `hint`: el formato ("10 dígitos"), visible y leído por TalkBack.
  - `error`: el texto rojo con ícono debajo, el borde de 2 px rojo y el anuncio por TalkBack ("ID de la Universidad: Debe tener…"). El error también se suma a la pista para oírlo al volver al campo.
  - `password`: agrega el botón "Mostrar contraseña" / "Ocultar contraseña".
  - `ref`: permite saltar al siguiente campo con la tecla "siguiente".
- **SegmentedToggle**: la píldora Pasajero / Conductor. Para TalkBack es un grupo de opciones (radiogroup) y cada lado es una opción con estado marcado. La activa es blanca con texto en negrita; la otra, azul. Solo avisa el cambio si tocas la opción que no estaba elegida.
- **RadioGroup**: lista de opciones excluyentes (tema en Ajustes; "¿Quieres registrar un carro?" en el registro). La fila completa es lo que se toca.
- **SwitchRow**: fila con interruptor (Vibración, Reducir movimiento). Toda la fila es **un solo foco** con rol de interruptor; el Switch de dentro está oculto para no anunciarse dos veces.

### 6.4 Mensajes y estados

- **ConfirmDialog**: el diálogo azul del Figma.
  - `tone`: `question` ("?" blanco en círculo rojo), `error` (X) o `success` (check verde).
  - Botones: `cancelLabel` (opción segura, va **primero**, botón blanco) y `confirmLabel` (acción, con borde). Si no hay `cancelLabel`, tiene un solo botón.
  - Accesibilidad: TalkBack no puede salir del diálogo; el foco empieza en el título; el botón Atrás de Android o el gesto de escape cancelan; al cerrarse, el foco vuelve al botón que lo abrió (`returnFocusRef`). Con "reducir movimiento" aparece sin animación.
- **StatusBanner**: mensaje con ícono + texto + borde. `tone` puede ser `error`, `success`, `info` u `offline` ("Sin conexión…"). Se anuncia al aparecer y vibra en error o éxito (`haptic`). Con `onRetry` muestra el botón "Reintentar".
- **LoadingState**: indicador girando + texto ("Cargando viajes…"), anunciado y con estado "ocupado".
- **StepIndicator**: "Paso 2 de 6" en texto, más una barra de progreso que TalkBack no lee para no repetirlo.
- **PhotoPicker**: zona para elegir foto. `variant="avatar"` es el círculo con "+"; `upload` es el recuadro con flecha de subir. Si ya hay foto, TalkBack dice "…, foto cargada". Todavía no abre la galería: eso llega en la Etapa 4.
- **ScreenTitle**: el título de cada pantalla, con rol de encabezado, que **recibe el foco al entrar** (usa `useScreenFocus`).

### 6.5 El esqueleto de las pantallas internas

- **AppHeader**: franja blanca con flecha "Volver" (opcional), logo pequeño decorativo y botón "Perfil".
- **BottomTabBar**: barra inferior con pestañas. Cada una tiene ícono y texto; la activa va subrayada y en negrita y TalkBack dice "seleccionado". Por ahora es una pieza suelta; en la Etapa 4 se conecta a la navegación real.
- **ScreenLayout**: arma una pantalla interna completa en el orden del Figma: encabezado → selector de modo (si se pasa `mode`) → banda con el título → contenido con scroll → barra inferior (si se pasa `bottomBar`). Ese orden es también el orden en que TalkBack lo recorre. Incluye `KeyboardAvoidingView` para que el teclado no tape el campo.

---

## 7. Las pantallas que existen

| Ruta | Archivo | Qué hace |
| --- | --- | --- |
| `/` | app/index.tsx | **Provisional.** Logo grande, título "Te damos la bienvenida", el lema y dos botones: "Ajustes de accesibilidad" y, solo en desarrollo, "Catálogo de componentes". En la Etapa 4 será la bienvenida real con "Iniciar Sesión" y "Registrarse". |
| `/settings/accessibility` | app/settings/accessibility.tsx | Tema (Sistema, Claro, Oscuro, Alto contraste), Tamaño del texto (Sistema, Grande, Extra grande) con una frase de ejemplo, y los interruptores Reducir movimiento y Vibración. Todo se aplica al instante y queda guardado. |
| `/dev/catalogo` | app/dev/catalogo.tsx | Todas las piezas juntas para revisarlas con TalkBack. Arriba tiene un selector de tema. Si la app no está en desarrollo (`__DEV__` falso), redirige a `/`. |
| `/dev/sesion` | app/dev/sesion.tsx | **Temporal (Etapa 3), solo en desarrollo.** Iniciar sesión con un usuario creado a mano; muestra nombre, modo, carro, sectores, viajes abiertos, reservas y notificaciones sin leer, con el banner "Sin conexión" y "Reintentar". Tiene "Recargar datos" y "Cerrar Sesión" (con diálogo). En la Etapa 4 la reemplazan las pantallas reales. |

---

## 8. Pruebas y comandos

| Comando | Qué hace | Estado actual |
| --- | --- | --- |
| `npm start` | Abre el servidor; se escanea el QR con Expo Go | — |
| `npm run typecheck` | Revisa los tipos de TypeScript | Pasa |
| `npm run lint` | Revisa estilo, formato y errores de accesibilidad en el código | Pasa |
| `npm test` | Corre las pruebas automáticas | 185 de 185 |
| `npm run a11y:contrast` | Revisa los colores | 66 de 66 |
| `npm run format` | Ordena el formato del código con Prettier | — |

Qué revisa cada archivo de `__tests__/`:
- **theme/contrast.test.ts**: la fórmula da los mismos valores que la propuesta del Corte 2 (por ejemplo, 10,17 para #334259 sobre blanco) y los tres temas cumplen.
- **theme/typography-layout.test.ts**: alto de línea, tamaños mínimos, TOUCH_MIN y hitSlop.
- **theme/ThemeProvider.test.tsx**: guarda y lee preferencias, tolera datos dañados y la pantalla de Ajustes funciona.
- **components/**: cada pieza tiene su rol, nombre, estado y tamaño mínimo correctos; las que exigen etiqueta no compilan sin ella.
- **hooks/hooks.test.tsx**: anuncia, vibra según la plataforma y el ajuste, y limpia el listener de "reducir movimiento".
- **smoke.test.tsx**: la pantalla inicial abre con el logo y el título.
- **services/errors.test.ts** (E3): cada tipo de error se traduce al mensaje correcto en español.
- **db/cache.test.ts** (E3): la caché guarda, lee y borra por usuario, y `loadWithCache` usa la copia solo cuando falta la red.
- **features/** (E3): los thunks y reducers de cada dominio con servicios simulados. Por ejemplo: la búsqueda paginada, la respuesta vieja ignorada, el viaje lleno que sale de la búsqueda, el error de reserva duplicada y el cierre de sesión que limpia todo.
- **hooks/realtime.test.tsx** (E3): las suscripciones se cierran al desmontar y la notificación nueva se anuncia.

Archivos de apoyo:
- **jest.setup.ts** simula AsyncStorage, NetInfo y el cliente de Supabase, solo en las pruebas.
- **test-utils/render.tsx** (`renderWithProviders`) renderiza con Redux y el tema, como en la app real.
- **test-utils/factories.ts** tiene datos de ejemplo y **test-utils/fakeDatabase.ts** una base SQLite falsa en memoria; los dos se usan solo en las pruebas.

Además, `eslint.config.js` incluye el plugin de accesibilidad: si alguien escribe un rol inválido, `npm run lint` falla. La única regla apagada es la que obligaba a poner pista en todo (D-08).

---

## 9. "Si me piden…": recetas de cambios rápidos

| Si me piden… | Dónde | Qué hago | Cómo verifico |
| --- | --- | --- | --- |
| Cambiar un color (por ejemplo, el azul principal) | theme/colors.ts, tema `light`, token `primary` (y `brandSurface`, `border` y `text` si es el mismo azul) | Cambio el hexadecimal | `npm run a11y:contrast`: si sale FALLA, ese color no cumple |
| Probar que el script detecta un mal color | theme/colors.ts, `placeholder` del tema claro | Lo pongo en `#9FA6B0` | El script falla con 2,45:1; luego lo devuelvo a `#5F6B7A` |
| Cambiar un texto visible | Busco el texto con Ctrl+Shift+F en VS Code (por ejemplo, "Te damos la bienvenida" está en app/index.tsx) | Lo cambio entre las etiquetas | Lo veo en Expo Go; si una prueba buscaba ese texto, la actualizo |
| Cambiar el tamaño de letra del cuerpo | theme/typography.ts, `body` | Cambio `fontSize` **y** `lineHeight` (mínimo 1,4 veces) | `npm test` (typography-layout.test falla si el alto de línea queda corto) |
| Hacer los botones más altos | theme/layout.ts, `TOUCH_MIN` | Cambio 48 (o 44) | Se ve en el catálogo; las pruebas comparan contra la constante |
| Cambiar el nombre que lee TalkBack de un ícono | Donde se usa el `IconButton`, prop `accessibilityLabel` (por ejemplo, "Perfil" en components/ui/AppHeader.tsx) | Cambio el texto (sin la palabra "botón") | TalkBack o `npm test` |
| Agregar una pista a un botón | En el `Button` o `IconButton`, prop `accessibilityHint` | Ejemplo: `accessibilityHint="Abre la galería"` | TalkBack la lee después del nombre |
| Cambiar un ícono | Prop `icon` del componente | Uso un nombre de https://pictogrammers.com/library/mdi/ | TypeScript avisa si el nombre no existe |
| Agregar una opción de tamaño de texto | theme/typography.ts (`TextSizePreference` y `TEXT_SIZE_FACTORS`) y app/settings/accessibility.tsx (`TEXT_SIZE_OPTIONS`) | Agrego el valor y su factor | `npm run typecheck` muestra cada lugar que falta |
| Cambiar el mensaje de un diálogo | Donde se usa `ConfirmDialog`: props `title`, `message`, `confirmLabel` y `cancelLabel` | Cambio el texto | Lo veo en el catálogo, sección Diálogos |
| Cambiar el tiempo antes de mover el foco al título | hooks/useScreenFocus.ts, `SCREEN_FOCUS_DELAY_MS` | Cambio 500 | TalkBack al entrar a una pantalla |
| Que el diálogo no tenga animación nunca | components/ui/ConfirmDialog.tsx, `animationType` | Pongo `'none'` | Abro un diálogo |
| Cambiar los colores del tema oscuro | theme/colors.ts, objeto `dark` | Cambio el valor | `npm run a11y:contrast` y Ajustes > Oscuro |
| Cambiar un mensaje de error (por ejemplo, el de reserva duplicada) | services/errors.ts, mapa `RPC_MESSAGES` (o `AUTH_MESSAGES` para inicio de sesión) | Cambio el texto | `npm test` (errors.test y reservations.test comparan el texto) |
| Traer más o menos viajes por página | services/tripService.ts, `TRIPS_PAGE_SIZE` | Cambio 20 | La búsqueda trae páginas del nuevo tamaño; `hasMore` se ajusta solo |
| Cambiar el orden de la búsqueda | services/tripService.ts, `searchOpenTrips`, línea `.order('salida_at', …)` | Cambio la columna o `ascending` | "Sesión de prueba" o el inicio de pasajero (E5) |
| Agregar un filtro a la búsqueda | types/domain.ts (`TripFilters`), services/tripService.ts (`searchOpenTrips`, un `query = query.eq(…)`) y features/trips/slice.ts (valor inicial de `filters`) | Agrego el campo y su condición | `npm run typecheck` muestra lo que falta; luego `npm test` |
| Guardar otra cosa en la caché | db/cache.ts, tipo `CacheKey`, y el thunk que la lee con `loadWithCache` | Agrego la clave nueva | `npm test`; en el teléfono, con modo avión |
| Cambiar el texto del banner sin conexión | components/ConnectionBanner.tsx | Cambio el mensaje | Modo avión en "Sesión de prueba" |
| Cambiar lo que dice una tarjeta de viaje | components/trips/TripCard.tsx: `TripDetails` (lo que se ve) y `tripAccessibilityLabel` (lo que lee TalkBack) | Cambio los dos | `npm test` (trips.test) y TalkBack |
| Cambiar el tiempo de espera de los filtros | hooks/useTripSearch.ts, `FILTER_DEBOUNCE_MS` | Cambio 300 | Escribo en el filtro y miro cuándo busca |
| Cambiar la zona o el zoom inicial del mapa | components/maps/MapPicker.tsx, `DELTA` (zoom) y la prop `center` | Cambio el valor | Abro una reserva |
| Cambiar el mensaje de confirmación de la reserva | app/trip/[id]/reserve.tsx, `ConfirmDialog` al final | Cambio `title` o `message` | Hago una reserva; passenger.test compara el texto |
| Cambiar la pantalla a la que va "¡Listo!" | app/trip/[id]/reserve.tsx, función `finish` | Cambio la ruta | passenger.test compara la ruta |
| Agregar un estado a las pestañas de reservas | app/(tabs)/reservas.tsx, `TABS` y `EMPTY_TEXT` | Agrego la pestaña | `npm run typecheck` muestra lo que falta |

**Antes de cualquier commit:** `npm run typecheck`, `npm run lint` y `npm test` deben pasar.

---

## 10. Lo que encontramos en el teléfono (Samsung Galaxy A35 5G, Android 16)

| Prueba | Qué pasó | Qué se hizo |
| --- | --- | --- |
| C-02 | TalkBack no llegaba al botón "Volver" | El logo vecino se ocultaba con `no-hide-descendants`; ahora se oculta pieza por pieza (D-26). C-02b aprobada |
| C-06 y C-06b | El error del campo se veía pero TalkBack no lo leía | La "región viva" de Android no funcionó; se cambió a `announceForAccessibility` (D-27). C-06c aprobada |
| C-03, C-04 y C-09 | Parecían fallos | Eran correctos: "botón de selección" y "tocar dos veces para activar" son frases normales de TalkBack |

Resultado: 18 de los 26 compromisos de accesibilidad están aprobados. El detalle está en [MATRIZ_ACCESIBILIDAD.md](MATRIZ_ACCESIBILIDAD.md).

---

## 11. Glosario rápido

- **Expo Go**: la app del teléfono que corre el proyecto sin compilarlo.
- **Expo Router**: navegación donde cada archivo de `app/` es una pantalla.
- **Componente**: una función que devuelve lo que se dibuja (por ejemplo, `Button`).
- **Props**: los datos que se le pasan a un componente (`label`, `onPress`…).
- **Estado (`useState`)**: un dato que, al cambiar, redibuja el componente.
- **`useEffect`**: código que se ejecuta después de dibujar; su `return` es la limpieza.
- **Context / Provider**: forma de compartir datos (el tema) con toda la app.
- **Token**: nombre de un color según su uso.
- **TalkBack**: el lector de pantalla de Android.
- **accessibilityRole**: qué es un elemento para TalkBack (botón, encabezado, pestaña…).
- **accessibilityLabel**: el nombre que lee TalkBack.
- **accessibilityHint**: la explicación extra, solo si el resultado no es obvio.
- **accessibilityState**: el estado (marcado, seleccionado, deshabilitado, ocupado).
- **hitSlop**: área táctil invisible alrededor de un elemento.
- **lineHeight**: alto de cada línea de texto.
- **WCAG AA**: el estándar de accesibilidad que seguimos (contraste de 4,5:1 para texto).
- **Supabase**: el servicio en la nube que da la base de datos (PostgreSQL), los usuarios (Auth), los archivos (Storage) y los cambios en vivo (Realtime).
- **RLS (Row Level Security)**: reglas en la base que deciden qué filas puede leer o cambiar cada usuario.
- **RPC**: una función de la base que la app llama por nombre (por ejemplo, `crear_reserva`).
- **Redux / store**: el lugar único donde vive el estado de la app (sesión, viajes, reservas…).
- **Slice**: la parte del store de un tema, con su estado inicial y sus reducers.
- **Reducer**: la función que recibe una acción y devuelve el nuevo estado.
- **Thunk**: una acción asíncrona; pasa por pending → fulfilled o rejected.
- **Selector**: una función que lee una parte del estado; memoizado = recuerda su resultado.
- **Caché**: copia local de los datos para verlos sin internet.
- **Realtime**: aviso instantáneo de la base cuando cambia una fila.
- **Debounce**: esperar a que la persona deje de escribir antes de buscar.
- **Paginación**: traer la lista por partes (20 viajes cada vez).
- **React.memo**: no volver a dibujar un componente si sus datos no cambiaron.
- **Geocodificación**: convertir un punto del mapa en dirección (inversa) o una dirección en punto.

---

## 12. La base de datos (Etapa 2, Samuel)

Vive en `supabase/`. Los detalles están en [API_CONTRATOS.md](API_CONTRATOS.md).

- **Tablas:** `profiles` (perfil de cada usuario), `sectores` (11 zonas sembradas), `vehiculos` (un carro por conductor), `viajes`, `reservas`, `calificaciones` (más la vista `promedio_calificaciones`), `notificaciones` y `mensajes`.
- **Reglas en la base, no solo en la app:**
  - Correo @unisabana.edu.co (CHECK).
  - Placa con 3 letras y 3 números.
  - Un pasajero no reserva dos veces el mismo viaje (UNIQUE).
  - Los cupos nunca superan el total.
- **Trigger `handle_new_user`:** cuando alguien se registra, crea su fila en `profiles` con los datos que manda la app.
- **RPC (funciones que la app llama por nombre):**
  - `cambiar_modo`: exige carro para ser conductor.
  - `crear_reserva`: bloquea la fila del viaje para que dos personas no tomen el último cupo.
  - `aceptar_reserva`: descuenta un cupo y, si llega a 0, pone el viaje en `lleno`. Ese es el **cierre automático**.
  - `rechazar_reserva` y `cancelar_reserva`: esta última devuelve el cupo.
  - `iniciar_viaje`, `finalizar_viaje` y `cancelar_viaje`.
- **Triggers de notificaciones:** crean una notificación cuando hay una solicitud nueva, una reserva aceptada o rechazada, un viaje iniciado, finalizado o cancelado, o un mensaje nuevo.
- **RLS:** cada tabla tiene reglas de quién lee y quién escribe. Por ejemplo, un pasajero solo ve viajes abiertos con salida futura o en los que tiene una reserva aceptada.
- **Storage:** buckets privados `avatars`, `vehiculos` y `soat`, con la ruta `{id del usuario}/archivo`.
- **Migración 0003 (Sara, Etapa 3):** activa Realtime en viajes, reservas, notificaciones y mensajes.
- **Migración 0004 (Sara, Etapa 3):** permite crear un usuario sin datos de perfil (por ejemplo, desde el panel). `id_universidad` y `telefono` quedan en NULL con `registro_completo = false`. Antes el trigger ponía texto vacío, los CHECK de 10 dígitos lo rechazaban y Supabase no creaba el usuario ("Database error creating new user"). Ver D-40.
- **Migración 0005 (Sara, Etapa 3):** corrige una **recursión infinita** entre políticas. La de `viajes` preguntaba por `reservas`, y la de `reservas` preguntaba por `viajes`. PostgreSQL rechazaba la búsqueda de viajes con el error 42P17. Ahora las dos políticas usan funciones `SECURITY DEFINER` (`tiene_reserva_aceptada` y `es_conductor_del_viaje`), que hacen la comprobación sin pasar por RLS y cortan el ciclo. Quién ve qué no cambió. Ver D-41.

---

## 13. La capa de cliente (Etapa 3)

Es la parte de la app que conecta las pantallas con Supabase. Regla de oro: **la pantalla nunca llama a Supabase**. Todo pasa por este camino:

```
Pantalla → dispatch(thunk) → servicio → Supabase → reducer → selector → Pantalla
```

### 13.1 El cliente y la sesión segura (services/supabase.ts y secureSessionStorage.ts)

- `supabase.ts` crea **un solo cliente** con la URL y la anon key del `.env`. Si faltan, la app muestra un error que dice qué hacer.
- La anon key es pública por diseño: lo que protege los datos es RLS. La `service_role` key nunca entra a la app.
- **Sesión segura:** la sesión (los tokens) se cifra con AES-256. La llave va en SecureStore (el almacén seguro del teléfono) y el texto cifrado en AsyncStorage. Se hace así porque SecureStore puede rechazar valores de más de 2048 bytes y la sesión pesa más (D-33).
- **Refresco del token:** `bindAutoRefreshToAppState` renueva el token solo con la app en primer plano.

### 13.2 Los errores (services/errors.ts)

- Todo error se convierte en un **AppError** `{ code, message }` con el mensaje en español.
- `toAppError` es el único traductor. Ejemplos:
  - Una RPC que falla con `reserva_duplicada` → "Ya tienes una reserva en este viaje.".
  - Sin red → "Sin conexión a internet…".
  - Correo de otro dominio → "Solo se aceptan correos @unisabana.edu.co.".
- `unwrap(respuesta)` devuelve los datos o lanza el AppError. Por eso cada servicio cabe en pocas líneas.

### 13.3 Los servicios (services/*Service.ts)

Uno por tema. Cada uno solo hace consultas a Supabase y devuelve datos tipados.

| Servicio | Lo más importante |
| --- | --- |
| authService | Iniciar sesión, registrarse (manda nombre, apellido, ID y teléfono para el trigger), verificar el código de 6 dígitos, reenviarlo, cerrar sesión, leer la sesión guardada y escuchar sus cambios. |
| tripService | Sectores, búsqueda de viajes abiertos **por páginas de 20** con filtros, mis viajes creados, crear un viaje e iniciar, finalizar o cancelar uno. Cada viaje trae el nombre del sector y del conductor en la misma consulta. |
| reservationService | Reservar (RPC), mis reservas, solicitudes de mis viajes, y aceptar, rechazar o cancelar. |
| profileService y vehicleService | Leer y editar el perfil, cambiar de modo, y registrar o eliminar el carro. |
| storageService, ratingService, notificationService y chatService | Fotos, calificaciones y promedios, notificaciones y chat. |

Los servicios de viajes, reservas, notificaciones y chat también tienen `subscribeTo…`. Abren un canal de Realtime y devuelven la función que lo cierra.

### 13.4 Redux (store/ y features/)

- **store/store.ts** une los 9 slices: `auth`, `profile`, `vehicle`, `trips`, `reservations`, `notifications`, `chat`, `ratings` y `settings`. `makeStore()` permite que cada prueba cree su propio store.
- **store/hooks.ts:** `useAppDispatch` y `useAppSelector` son los hooks tipados que usan las pantallas.
- **Cada carpeta de features/** tiene tres archivos:
  - **thunks.ts:** las acciones que van a la red. Todas siguen el mismo molde: `try { return await servicio(...) } catch (error) { return rejectWithValue(toAppError(error)) }`.
  - **slice.ts:** el estado y cómo cambia en `pending`, `fulfilled` y `rejected`. Cada petición tiene `status` (`idle`, `loading`, `succeeded` o `failed`) y `error`.
  - **selectors.ts:** cómo leer el estado. Los que arman listas usan `createSelector` para no recalcular sin necesidad.
- **Normalización (`createEntityAdapter`):** viajes, reservas, notificaciones y mensajes se guardan como `{ ids, entities }`. Un viaje existe una sola vez aunque esté en la búsqueda y en "Creados".
- **Cerrar sesión limpia todo:** `signOut` borra la sesión y la caché del usuario y despacha `sessionCleared`. Todos los slices escuchan esa acción y vuelven a su estado inicial.

Lógica clave de **features/trips** (la más preguntable):
- **Búsqueda paginada:** `searchTrips({ reset: true })` trae la primera página y `searchTrips({ reset: false })` la siguiente. La `condition` impide pedir otra página si ya está cargando o si no hay más.
- **Respuesta obsoleta:** cada búsqueda tiene un `requestId`. Si llega tarde la respuesta de una búsqueda vieja, el reducer la ignora (D-37).
- **Cierre automático en vivo:** cuando llega por Realtime un viaje `lleno` o sin cupos, `tripChanged` lo saca de la búsqueda. Si solo cambiaron los cupos, actualiza la tarjeta.

### 13.5 La caché y la conexión (db/ y hooks/)

- **db/database.ts** abre SQLite y crea la tabla `cache` (migración con `PRAGMA user_version`).
- **db/cache.ts → `loadWithCache`:**
  - Con red: pide los datos y guarda una copia con la hora.
  - Sin red (o si falla por red): devuelve la copia con `fromCache: true`.
  - Sin copia: error "Sin conexión" con "Reintentar".
  - Se usa para el perfil, la búsqueda de viajes, mis viajes creados y mis reservas.
- **hooks/useConnectivity:** escucha NetInfo y guarda en `settings.isOnline` si hay internet.
- **hooks/useAuthSession:** al abrir la app lee la sesión guardada (por eso la sesión persiste al reiniciar) y escucha sus cambios.
- **hooks/useRealtime:** abre los canales de viajes, reservas y notificaciones con sesión iniciada. Cada notificación nueva se anuncia a TalkBack.
- **Los tres hooks cierran lo que abren** en el `return` de su `useEffect` (cleanup).
- **components/ConnectionBanner:** muestra "Sin conexión: mostrando datos guardados (guardados a las 7:05 a. m.)".

### 13.6 Lo que encontramos al leer la base (para Samuel)

Están en [API_CONTRATOS.md](API_CONTRATOS.md), sección "Hallazgos de la Etapa 3":
- Algunas políticas de UPDATE dejan cambiar directamente el estado de una reserva, el modo del perfil o los cupos de un viaje, sin pasar por las RPC.
- Realtime no avisa al pasajero cuando un viaje que estaba mirando se llena, porque RLS ya no le deja verlo. La Etapa 5 debe volver a consultar al entrar a la pantalla.

---

## 14. Autenticación, registro y perfil (Etapa 4, Samuel)

Usa los thunks de la Etapa 3: no agregó servicios ni slices.

- **Guardia de sesión (app/_layout.tsx):** decide a dónde va la persona según `userId` y `profile`.
  - Sin sesión e intentando entrar a una ruta privada: va a `/`.
  - Con registro incompleto: va a `/register/photo`. Siempre retoma desde la foto, no desde el paso exacto.
  - Con registro completo y en bienvenida o autenticación: va a `/(tabs)`.
- **Registro en 7 pasos (app/(auth)/register/):**
  1. `index`: valida con `lib/validators.ts` y llama a `signUp`. La base crea el perfil con el trigger.
  2. `verify`: confirma el código de 6 dígitos. Aquí nace la sesión.
  3. `photo`: foto opcional en el bucket `avatars`.
  4. `has-car`: con "No" termina en modo pasajero.
  5. `car` y 6. `car-photo`: los datos viajan como parámetros de ruta, sin guardarse todavía.
  7. `soat`: sube las fotos, registra el carro, marca el registro completo y cambia a modo conductor.
- **app/(auth)/login.tsx:** inicio de sesión con la pantalla de error del Figma y el mensaje específico.
- **app/profile.tsx:** datos del perfil, edición, cierre de sesión y carro (ver o eliminar), con diálogos de confirmación.
- **lib/validators.ts:** una función por regla (correo, contraseña, ID, teléfono, placa, capacidad, código). Devuelven el mensaje de error o `null`.
- **lib/imagePicker.ts:** abre la galería y devuelve la imagen elegida.

---

## 15. Flujo de pasajero (Etapa 5)

Recorrido completo: buscar → tocar una tarjeta → elegir el punto → reservar → seguir el estado → cancelar o viajar.

### 15.1 Inicio (app/(tabs)/index.tsx)

- La pantalla elige según el modo: en pasajero muestra `TripFilters` y `TripList`; en conductor, el panel que completa la Etapa 6.
- **hooks/useTripSearch.ts** tiene la lógica:
  - Guarda sector y puestos, y solo deja dígitos en puestos.
  - Con `useDebouncedValue` espera 300 ms sin cambios y busca. La lupa busca de inmediato.
  - Vuelve a buscar al recuperar o perder la red, y al regresar a la pantalla, salvo que la persona haya bajado varias páginas.
  - Anuncia a TalkBack cuántos viajes se cargaron.
- **components/trips/TripList.tsx:** la FlatList. Muestra carga, vacío, error con "Reintentar" y banner sin conexión. `onEndReached` trae la página siguiente.
- **components/trips/TripCard.tsx:** toda la tarjeta es un solo botón con una etiqueta compuesta. El "+" es solo visual.

### 15.2 Reservar (app/trip/[id]/reserve.tsx)

- **MapPicker** muestra el mapa real. Un toque marca el punto.
- **hooks/useLocationPoint.ts** une mapa y dirección:
  - Tocar el mapa escribe la dirección (geocodificación inversa).
  - "Usar mi ubicación actual" pide el permiso y marca la posición.
  - Si se toca dos veces seguidas, solo cuenta la última respuesta.
- **lib/location.ts** nunca lanza errores: sin permiso o sin resultado devuelve `null` y se puede escribir.
- Al tocar "Reservar":
  1. Valida que haya dirección.
  2. Usa las coordenadas del mapa; si solo hay texto, las busca; si no se encuentran, usa las del origen del viaje (D-50).
  3. Llama a la RPC `crear_reserva`. La base revisa todas las reglas.
  4. Si sale bien: vibración y diálogo de éxito. "¡Listo!" lleva a Reservas. Si falla: mensaje de la RPC con "Reintentar".

### 15.3 Reservas y Curso

- **app/(tabs)/reservas.tsx:** pestañas internas Pendientes, Aceptados y Rechazados. Cada una usa su selector memoizado. La papelera abre el diálogo "¿Está seguro…?" con la opción segura primero. Se recarga al entrar.
- **app/(tabs)/curso.tsx:** el pasajero ve sus reservas aceptadas de viajes iniciados, con el botón "Abrir chat" (Etapa 7).
- **En vivo:** cuando el conductor acepta, llega `reservationChanged` y la reserva cambia de pestaña. Cuando cambian los cupos o el viaje inicia, llega `tripChanged`, que actualiza la búsqueda y la copia del viaje dentro de cada reserva.
- **Migración 0006:** un viaje lleno sigue siendo legible, para que Realtime avise y salga de la búsqueda (D-48).

### 15.4 Piezas nuevas reutilizables

- **SelectField** (components/ui): lista desplegable con diálogo y radios. La usará también la creación de viajes.
- **InnerTabs** (components/ui): pestañas internas con subrayado y negrita.
- **useModeSwitch** y **ModeSwitchDialogs:** el cambio de modo, compartido por las pestañas. Al cambiar, vuelve a Inicio.
- **useFocusCounter:** hace que el foco de TalkBack vuelva al título al regresar a una pestaña.

---

## 16. Flujo de conductor (Etapa 6, Samuel)

Recorrido completo: crear un viaje → recibir solicitudes → aceptar o rechazar → iniciar → finalizar.

- **Inicio de conductor (app/(tabs)/index.tsx):** tarjeta "Crea un viaje" con "+" y tarjeta "Viajes Pendientes" con el número de solicitudes y "Ver más", que lleva a app/requests.tsx.
- **Crear viaje (app/trip/create.tsx):** mapa para el punto de partida, campos con error bajo cada uno y un resumen que nombra los que faltan (S-07). Las reglas están en **lib/validators.ts**: `validateDate`, `validateTime`, `validateFutureDeparture`, `validateTripCupos` y `validatePrice`. Al publicar sale el diálogo de éxito con "¡Listo!".
- **Solicitudes (app/requests.tsx):** pestañas internas Pendientes, Aceptadas y Rechazadas. Cada solicitud es una **RequestCard** con "Aceptar reserva" y "Rechazar reserva". Al responder vibra y se anuncia (T-04). Las solicitudes vienen de `fetchRequestsForMyTrips` y del selector `selectAllRequests`.
- **Viajes creados (app/(tabs)/creados.tsx):** una **CreatedTripCard** por viaje con su estado. "Iniciar viaje" solo se activa con al menos una reserva aceptada (R8); "Cancelar viaje" pasa por ConfirmDialog (T-06).
- **Curso (app/(tabs)/curso.tsx), modo conductor:** sus viajes en curso con "Finalizar viaje" y confirmación.
- **Los cambios de estado** van por el thunk `changeTripState({ tripId, action })`, que llama a las RPC `iniciar_viaje`, `finalizar_viaje` o `cancelar_viaje`.
- **Migración 0007:** quita los UPDATE directos sobre `viajes` y `reservas` y protege `profiles.modo_actual` con un trigger. Así todo cambio de estado tiene que pasar por las RPC, que validan las reglas (D-53).

### Si me piden… (Etapa 6)

- **Cambiar el texto de un botón del conductor:** components/trips/CreatedTripCard.tsx (los `label` y `accessibilityLabel` de cada Button).
- **Cambiar una regla de la creación de viajes:** la función correspondiente en lib/validators.ts y su prueba en __tests__/lib/validators.test.ts.

---

## 17. Chat del viaje (Etapa 7, Sara)

Recorrido completo: "Abrir chat" → comprobar acceso → cargar mensajes → escribir y enviar → recibir en vivo.

- **Dónde está el botón "Abrir chat":** en el pasajero, en Reservas > Aceptados y en Curso (`onPressChat` de ReservationCard). En el conductor, en Creados y en Curso, solo si el viaje tiene pasajeros aceptados y no está cancelado (`onOpenChat` de CreatedTripCard). Todos llevan a `/trip/<id>/chat`.
- **Al abrir (app/trip/[id]/chat.tsx):**
  1. `fetchMessages(id)` pregunta a la base con `es_participante_del_viaje` si quien abre es el conductor o un pasajero aceptado.
  2. Si no lo es, falla con `chat_sin_acceso` y la pantalla muestra "No tienes acceso a este chat" sin campo de escribir. Hace falta esta pregunta porque RLS no da error: solo devuelve cero filas (D-56).
  3. Si lo es, trae los mensajes con el nombre de cada autor.
  4. A la vez, `fetchTrip(id)` trae el viaje para el sector, la hora y saber si está cancelado.
- **La lista:** FlatList `inverted`, con los datos del más nuevo al más antiguo, así el más nuevo queda abajo (D-57). Cada mensaje es una **MessageBubble**: un solo foco que dice "Tú, 3:15 p. m.: Hola". Lo propio va a la derecha, en azul y con "Tú", no solo con color (V-05).
- **Escribir:** TextField "Mensaje" con `maxLength` de 500, contador "x de 500 caracteres" y aviso al llegar al límite. El botón "Enviar mensaje" es un IconButton relleno de 48 dp, deshabilitado si el texto está vacío, si se está enviando o si el viaje está cancelado.
- **En vivo:** `useRealtimeMessages(id)` escucha los mensajes nuevos y los mete al store con `messageReceived`. Si llega alguien que no había escrito, `fetchAuthorNames` trae su nombre una sola vez.
- **Anuncios (S-07):** "Mensaje nuevo de X: texto" solo para mensajes de otras personas que llegan después de abrir; "Mensaje enviado." al enviar (D-59).
- **Estados:** cargando ("Cargando mensajes…"), vacío ("Todavía no hay mensajes"), error con "Reintentar", sin acceso y viaje cancelado (se lee, pero no se escribe).
- **RLS verificado:** supabase/tests/chat_rls.sql prueba como pasajero, conductor y ajeno. Corre dentro de una transacción y termina con un error a propósito que dice "6 de 6 correctas" y deshace todo (D-60).
- **Base de datos:** no se cambió nada. Se usan la tabla `mensajes`, sus dos políticas, la función `es_participante_del_viaje` (0001) y Realtime (0003), todo de Samuel.

### Si me piden… (Etapa 7)

- **Cambiar el límite de 500:** `MAX_MESSAGE_LENGTH` en services/chatService.ts y el texto `mensajeInvalido` en services/errors.ts. La base tiene su propio CHECK de 500: subirlo necesita una migración de Samuel.
- **Cambiar el color de mis mensajes:** en components/chat/MessageBubble.tsx, `brandSurface` (fondo) y `onBrand` (texto). Luego correr `npm run a11y:contrast` si se cambia el token.
- **Cambiar el texto del estado vacío:** en app/trip/[id]/chat.tsx, el bloque "Todavía no hay mensajes".

---

## 18. Registro de actualizaciones de esta guía

| Fecha | Etapa | Quién la hizo | Qué se agregó a la guía |
| --- | --- | --- | --- |
| 2026-11-06 | E0 y E1 | Sara | Primera versión: arranque de la app, sistema de diseño, hooks, componentes, pantallas, pruebas, recetas y hallazgos en el teléfono |
| 2026-11-07 | E2 y E3 | Samuel (E2) y Sara (E3) | Resumen de la base de datos (sección 12), la capa de cliente (sección 13), la pantalla de sesión de prueba, las pruebas nuevas, 6 recetas más y términos de Supabase y Redux en el glosario |
| 2026-11-09 | E4 y E5 | Samuel (E4) y Sara (E5) | Secciones 14 y 15, 6 recetas más y términos nuevos en el glosario |
| 2026-11-10 | E6 y E7 (chat) | Samuel (E6) y Sara (E7, chat) | Secciones 16 (flujo de conductor) y 17 (chat del viaje), con sus recetas "Si me piden…" |
