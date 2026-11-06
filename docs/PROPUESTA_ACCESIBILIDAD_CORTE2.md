# CampusGo — Propuesta de Accesibilidad y Mejora de UX/UI (Corte 2)

Sara Santacruz Corredor y Samuel Borda Munevar · 6 de noviembre de 2026

## 1. Resumen y alcance

CampusGo se compromete a cumplir WCAG 2.1 y 2.2 nivel AA adaptado a móvil, verificable con VoiceOver (iOS) y TalkBack (Android), y este documento fija las mejoras exactas que se implementarán en la Fase 3.

**Objetivo.** Que un estudiante con baja visión, ceguera, movilidad reducida, daltonismo o sobrecarga cognitiva pueda registrarse, publicar o reservar un viaje y calificarlo sin ayuda de terceros.

**Estándares aplicados.**

- WCAG 2.1 y 2.2, nivel AA, interpretados para aplicaciones nativas (los criterios hablan de "CSS px"; en móvil se leen como pt en iOS y dp en Android).
- Para áreas táctiles se adopta el umbral más estricto que exige el curso (44×44 pt en iOS y 48×48 dp en Android), por encima del mínimo AA de WCAG 2.2 (criterio 2.5.8, 24×24 px).
- Las guías de accesibilidad de React Native para `accessible`, `accessibilityLabel`, `accessibilityHint`, `accessibilityRole` y `accessibilityState`.

**Plataformas objetivo.** iOS y Android mediante Expo Go (SDK 58, React Native 0.88). Cada mejora se valida con VoiceOver en iPhone y TalkBack en Android, además de herramientas de inspección (sección 7).

**Alcance.** Todas las pantallas del diseño de Figma (bienvenida, inicio de sesión, registro por pasos con datos del carro, inicio de pasajero y de conductor, reserva, viajes reservados, crear viaje, viajes en curso y creados, perfil y diálogos de confirmación), más una pantalla nueva de ajustes de accesibilidad.

**Fuera de alcance.** Subtítulos y audiodescripción (la app no tiene video) y accesibilidad web (la app es solo móvil).

## 2. Usuarios con necesidades de accesibilidad

Cinco personas ficticias representan las discapacidades que más afectan el uso de una app táctil, y cada barrera que enfrentan en el diseño actual se resuelve con mejoras numeradas de las secciones 4 a 6.

| Persona | Rol | Necesidad | Barrera en el diseño actual | Mejoras |
| --- | --- | --- | --- | --- |
| Valentina, 19 | Pasajera | Baja visión; usa texto al 200 % y a veces alto contraste | Textos de ≈ 9–11 pt en diálogos y formularios; placeholder de "Datos del viaje" a 2,45:1 | V-02, V-06, V-07, V-08 |
| Andrés, 21 | Pasajero | Ceguera; usa TalkBack | Íconos sin nombre (perfil, "+", lupa); tarjeta de viaje con siete textos y un botón sueltos; mapa sin alternativa | S-02, S-04, S-07, S-09 |
| Camila, 22 | Conductora | Daltonismo rojo-verde | Ícono "?" rojo sobre azul oscuro a 1,37:1; éxito y error que se distinguen sobre todo por el color del ícono | V-04, V-05 |
| Julián, 20 | Conductor | Movilidad reducida en la mano dominante; usa el celular con una mano | Campos de 31–36 pt de alto, lupa y papelera de ≈ 16 pt, botones Cancelar y Aceptar de ≈ 30 pt de alto y pegados | T-01, T-02, T-06, T-07 |
| Mariana, 18 | Pasajera | TDAH y ansiedad; necesita pasos cortos y mensajes claros | Registro de hasta seis pantallas sin indicador de progreso; error genérico que no dice qué campo falta | S-05, T-05, T-08 |

Estas personas pasarán al documento final de la Fase 3 como user personas con necesidades de accesibilidad.

## 3. Auditoría del diseño actual en Figma

El diseño móvil (unas 30 pantallas) tiene una base sólida de contraste, pero 16 hallazgos incumplen WCAG AA o los umbrales táctiles de la Fase 3, y todos quedan cubiertos por una mejora de las secciones 4 a 6.

**Método.** Se muestrearon los colores del export PNG de Figma y se calcularon las razones de contraste con la fórmula de WCAG. Los tamaños se midieron en píxeles sobre marcos de ≈ 440 pt de ancho (escala ≈ 1×, ±3 pt); son estimaciones que se confirman en la app real con Accessibility Scanner.

| # | Hallazgo | Medición | Criterio WCAG | Mejora |
| --- | --- | --- | --- | --- |
| H1 | Placeholders grises en inicio de sesión y registro | #7F7F7F sobre blanco: 4,00:1 (mínimo 4,5:1) | 1.4.3 | V-02 |
| H2 | Placeholders de "Datos del viaje" | ≈ 2,45:1 sobre blanco y letra muy pequeña | 1.4.3 | V-02, V-06 |
| H3 | Filtros del inicio (Sectores, Cantidad de puestos): texto claro sobre azul oscuro | #99A1AC sobre #334259: 3,90:1 | 1.4.3 | V-03 |
| H4 | Selector Pasajero/Conductor: íconos negros sobre azul oscuro, sin texto; el estado se ve solo por la posición | 2,06:1 | 1.4.11, 1.4.1, 4.1.2 | V-03, S-03 |
| H5 | Ícono "?" rojo en los diálogos de confirmación | #AF0000 sobre #334259: 1,37:1 (mínimo 3:1) | 1.4.11 | V-04 |
| H6 | Ícono gris de subir foto (carro y SOAT) | #A9ACB0 sobre blanco: 2,28:1 | 1.4.11 | V-04 |
| H7 | Áreas táctiles bajo 44 pt / 48 dp | Botones 42 pt de alto; campos 31–36 pt; botones de diálogo ≈ 30 pt; selector de modo ≈ 31 pt; "+" ≈ 39 pt; radios Si/No ≈ 30 pt; lupa y papelera ≈ 16 pt | 2.5.5, 2.5.8 | T-01, T-02 |
| H8 | Íconos sin texto: perfil, "+", lupa, papelera, lápiz, cerrar sesión | Sin nombre accesible en el diseño | 1.1.1, 4.1.2 | S-02 |
| H9 | Tarjeta de viaje: siete textos y un botón "+" independientes | Foco fragmentado con lector de pantalla | 1.3.1, 2.4.3 | S-04 |
| H10 | Error genérico "Por favor, complete todos los campos requeridos" | No indica qué campo falta ni cómo corregirlo | 3.3.1, 3.3.3 | S-05, S-07 |
| H11 | Diálogos con "Cancelar" y "Aceptar": "Aceptar" ejecuta la acción destructiva | Etiquetas ambiguas, botones pequeños y juntos | 3.3.4, 2.4.6 | T-06 |
| H12 | Títulos con espaciado entre letras negativo ("Buenviaje") | Palabras pegadas | 1.4.12 | V-07 |
| H13 | Sin estados de carga, sin retroalimentación táctil ni anuncio de resultado | No hay pantalla ni mensaje de "cargando" | 4.1.3 | T-04, T-05 |
| H14 | Registro de hasta seis pantallas sin indicador de progreso | No muestra "paso x de y" | 3.3.7 | T-08 |
| H15 | Mapa ("API MAPS") sin alternativa textual | Solo bloque gráfico | 1.1.1 | S-09 |
| H16 | Texto secundario pequeño: diálogos, placeholders, etiquetas de navegación | ≈ 9–12 pt (estimado) | 1.4.4 | V-06 |

**Se conserva** lo que ya cumple: azul #334259 sobre blanco (10,17:1), títulos sobre la banda #C1C9D7 (6,11:1), enlaces subrayados, pestañas marcadas con subrayado y negrita, y errores con ícono más texto.

**Cambio de marca.** El logo dice "by Sara y Diego"; la app mostrará "By Sara y Samuel".

## 4. Mejoras de semántica para lectores de pantalla

Nueve mejoras garantizan que VoiceOver y TalkBack anuncien el nombre, el rol, el estado y el orden de cada control, usando las propiedades nativas de React Native (`accessible` marca el elemento como detectable por lectores de pantalla y teclados físicos; ver la [documentación de accesibilidad](https://reactnative.dev/docs/accessibility)).

| ID | Mejora | Cómo se implementa en React Native |
| --- | --- | --- |
| S-01 | Rol correcto en cada elemento interactivo y en los títulos | `accessibilityRole` = `button`, `link`, `header`, `radio`, `tab`, `tablist` o `search`; componentes base `Button`, `IconButton` y `ScreenTitle` |
| S-02 | Nombre accesible en todo ícono sin texto (perfil, "+", lupa, papelera, lápiz, cerrar sesión) | `accessibilityLabel` en español sin repetir el rol ("Reservar viaje a Colina", no "botón reservar"); `accessibilityHint` solo si el resultado no es obvio; íconos decorativos con `importantForAccessibility="no"` y `accessibilityElementsHidden` |
| S-03 | Selector Pasajero/Conductor accesible | `accessibilityRole="radiogroup"` con dos `radio` y `accessibilityState={{ checked }}`; etiqueta "Modo pasajero, seleccionado"; texto visible junto al ícono |
| S-04 | Tarjeta de viaje como un solo foco | Contenedor `Pressable` con `accessible`, `accessibilityRole="button"` y etiqueta compuesta ("Colina. Conductor Miguel Ordóñez. Sale 7:00 a. m. Valor 5.000 pesos. 2 cupos"); el "+" visual deja de ser un foco aparte |
| S-05 | Formularios con etiqueta persistente, pista de formato y error asociado | Cada `TextInput` con `accessibilityLabel`, `accessibilityHint` ("10 dígitos"), `autoComplete`, `textContentType` e `inputMode`; error en texto bajo del campo; reglas del diseño: ID de 10 dígitos, teléfono de 10 dígitos, contraseña de al menos 5 caracteres, placa de 3 letras y 3 núemeros, capacidad numérica |
| S-06 | Estados anunciados | `accessibilityState` con `selected` (pestañas Pendientes, Aceptados y Rechazados; barra inferior), `disabled`, `busy` y `checked` |
| S-07 | Mensajes dinámicos anunciados sin mover el foco | `accessibilityLiveRegion` (Android) en errores y éxitos, y `AccessibilityInfo.announceForAccessibility` en iOS |
| S-08 | Diálogos modales accesibles | `Modal` con `accessibilityViewIsModal` (iOS; hace que VoiceOver ignore los elementos hermanos); foco inicial en el título con `AccessibilityInfo`; cierre con el gesto de escape (`onAccessibilityEscape`) y retorno del foco al botón que lo abrió |
| S-09 | Alternativas textuales para mapa, fotos y logo | Mapa con etiqueta y alternativa escrita ("Punto de partida", "Punto de llegada", "Describe la dirección del punto de recogida"); zonas de subir foto con etiqueta, pista ("Subir foto del SOAT vigente") y estado "foto cargada"; logo como una sola imagen con etiqueta "CampusGo, by Sara y Samuel", oculta en las pantallas internas |

## 5. Mejoras de diseño visual, contraste y tipografía adaptativa

Nueve mejoras llevan todos los pares de color a 4,5:1 en texto y 3:1 en íconos y bordes, dejan que el texto escale hasta 200 % sin recortes y añaden temas verificados. Los colores propuestos ya fueron calculados con la fórmula de WCAG.

| ID | Mejora | Cómo se implementa |
| --- | --- | --- |
| V-01 | Tokens de color con contraste verificado por script | `theme/colors.ts` define cada par texto/fondo; `npm run a11y:contrast` falla si un par de texto queda bajo 4,5:1 o uno de interfaz bajo 3:1, en los tres temas |
| V-02 | Placeholders legibles y etiqueta siempre visible | Placeholder #5F6B7A sobre blanco (5,43:1) en lugar de #7F7F7F (4,00:1) y #9FA6B0 (2,45:1); etiqueta fija sobre cada campo, de modo que el placeholder nunca es la única etiqueta |
| V-03 | Controles sobre azul oscuro con contraste suficiente | Filtros del inicio con texto #E3E8F0 sobre #334259 (8,27:1); selector de modo con segmento activo blanco e ícono azul, segmento inactivo azul e ícono blanco (10,17:1), y texto "Pasajero" o "Conductor" visible |
| V-04 | Íconos de estado y de subida con contraste ≥ 3:1 | "?" en blanco dentro de un círculo #AF0000 (7,44:1 entre sí) en lugar de rojo sobre azul (1,37:1); ícono de subir foto en #334259 sobre blanco (10,17:1) en lugar de gris (2,28:1) |
| V-05 | No depender solo del color | Error = ícono + texto + borde de 2 px; éxito = ícono + texto; selección en pestañas y modo = subrayado o relleno + negrita + `accessibilityState` |
| V-06 | Escalado dinámico de fuente | `allowFontScaling` activo y `maxFontSizeMultiplier` de 2 en textos de contenido; sin alturas fijas en textos (se usa `minHeight` y padding); tamaños mínimos: cuerpo y campos 16 sp, secundario 14 sp, etiquetas de la barra inferior 12 sp; pantallas revisadas a 200 % |
| V-07 | `lineHeight` y espaciado de letras | Todo estilo de texto define `lineHeight` de al menos 1,4 veces el `fontSize`, para no recortar tildes, Ñ, ¿ y ¡; `letterSpacing` de 0 o más en títulos (hoy es negativo) |
| V-08 | Temas claro, oscuro y alto contraste, con pantalla de Ajustes de accesibilidad | `useColorScheme` más preferencia guardada; tema oscuro con texto #F2F5FA sobre #0F1623 (16,58:1); alto contraste con #000000 sobre #FFFFFF (21:1) y bordes de 2 px; Ajustes: tema, tamaño de texto (Sistema, Grande, Extra grande), reducir movimiento y vibración |
| V-09 | Respeto a "reducir movimiento" | `AccessibilityInfo.isReduceMotionEnabled` con su listener; si está activo, las transiciones pasan a un fundido corto o desaparecen |

## 6. Mejoras de ergonomía táctil y navegación

Ocho mejoras llevan todo control a 44×44 pt en iOS y 48×48 dp en Android, que es el umbral que exige el curso y el que recomienda Android para [el tamaño de los objetivos táctiles](https://developer.android.com/guide/topics/ui/accessibility/apps), y hacen que cada error, éxito y carga se perciba por la vista, el oído y el tacto.

| ID | Mejora | Cómo se implementa |
| --- | --- | --- |
| T-01 | Áreas táctiles mínimas de 44×44 pt (iOS) y 48×48 dp (Android) | Constante `TOUCH_MIN = Platform.select({ ios: 44, default: 48 })` aplicada como `minHeight` y `minWidth` en `Button`, `IconButton`, `TextField`, radios y selector de modo |
| T-02 | `hitSlop` y separación entre objetivos | `hitSlop` para completar el área de íconos pequeños (lupa, papelera, lápiz, cerrar) sin alterar el diseño; al menos 8 dp entre objetivos vecinos, como en Cancelar y Aceptar |
| T-03 | Orden de foco lógico y manejo del teclado | Orden de lectura igual al visual; `returnKeyType="next"` y referencias para saltar de campo en campo; al cambiar de pantalla o de paso el foco va al título; `KeyboardAvoidingView` para que el campo enfocado no quede tapado; borde de foco de 2 px visible con teclado externo |
| T-04 | Retroalimentación háptica, auditiva y visual | En éxito, error y advertencia: `expo-haptics` (`notificationAsync`), mensaje con ícono y texto, y anuncio por el lector de pantalla; interruptor de vibración en Ajustes |
| T-05 | Estados de carga y de error de red | `ActivityIndicator` con texto ("Cargando viajes…"), `accessibilityState={{ busy: true }}`, botón deshabilitado mientras envía para evitar doble toque, y mensaje de error con botón "Reintentar" |
| T-06 | Confirmaciones explícitas en acciones destructivas | Botones "Sí, cancelar reserva" y "No, volver" en lugar de Aceptar y Cancelar; la opción segura recibe el foco inicial; mismo patrón al eliminar un carro, cerrar sesión y cambiar a modo conductor |
| T-07 | Sin gestos complejos y alcance con una mano | Toda acción se hace con un toque simple (sin arrastrar, pellizcar ni mantener presionado); el punto de recogida se elige tocando el mapa o escribiendo la dirección; acciones principales en la mitad inferior y barra de tres pestañas abajo |
| T-08 | Formularios y acceso con poca carga cognitiva | Indicador "Paso 2 de 6"; "Anterior" conserva lo escrito (ver [3.3.7 Entrada redundante](https://alphagov.github.io/guide-to-wcag/sc/3.3.7.html)); `autoComplete` y `textContentType` en correo y contraseña; contraseña y códigos de verificación que se pueden pegar (ver [3.3.8 Autenticación accesible](https://alphagov.github.io/guide-to-wcag/sc/3.3.8.html)); botón "Mostrar contraseña" accesible; sin CAPTCHA ni pruebas de memoria |

## 7. Plan de validación

Cada una de las 26 mejoras se valida con al menos una prueba automática o en dispositivo, y los resultados quedan en `docs/auditoria-accesibilidad.md` con captura o grabación de pantalla, que es la evidencia de la sección 4 del documento final.

| Código | Prueba | Herramienta | Qué demuestra |
| --- | --- | --- | --- |
| VO | Recorrido con VoiceOver en iPhone (Expo Go) | VoiceOver | Nombre, rol, estado y orden de foco |
| TB | Recorrido con TalkBack en Android (Expo Go) | TalkBack | Lo mismo en Android |
| AS | Escaneo de la app en Android | [Accessibility Scanner](https://support.google.com/accessibility/android/answer/7101858) | Contraste, tamaño táctil y etiquetas faltantes |
| AI | Inspección en iOS (solo si hay un Mac) | Accessibility Inspector de Xcode | Etiquetas, roles y tamaños |
| CC | Contraste automático | `npm run a11y:contrast` | Pares de color ≥ 4,5:1 (texto) y ≥ 3:1 (interfaz) en los tres temas |
| UT | Pruebas unitarias | jest-expo y React Native Testing Library | Props de accesibilidad (`getByRole`, `getByLabelText`), tamaño mínimo y `lineHeight` |
| FS | Escalado de fuente | Tamaño de texto del sistema al máximo (≈ 200 %) | Sin recortes ni solapamientos |
| MN | Revisión manual guiada | Lista de verificación | Foco, háptica, gestos, estados de carga y reducción de movimiento |

**Flujos que se recorren con lector de pantalla.**

1. Registro con foto y datos del vehículo (hasta seis pantallas).
2. Inicio de sesión con error.
3. Buscar un viaje y reservarlo.
4. Crear un viaje, con el error por campos vacíos y con el éxito.
5. Cancelar una reserva y eliminar un carro.
6. Cambiar de modo y cerrar sesión.

**Criterio de aprobación.** Cada flujo se completa solo con el lector de pantalla y sin mirar la pantalla, ningún control se anuncia sin nombre, y ningún par de color ni área táctil queda bajo los umbrales de las secciones 5 y 6.

## 8. Matriz de compromisos

Estos 26 compromisos son la base de la matriz trazable de la Fase 3: allí cada fila añade el archivo real donde se implementó y el resultado de la prueba. Las rutas son relativas a la raíz del código y pueden ajustarse con la arquitectura final.

| ID | Criterios WCAG | Componente o archivo previsto | Prueba |
| --- | --- | --- | --- |
| S-01 | 4.1.2, 1.3.1, 2.4.6 | `components/ui/Button.tsx`, `IconButton.tsx`, `ScreenTitle.tsx` | VO, TB, UT |
| S-02 | 1.1.1, 2.5.3, 4.1.2 | `components/ui/IconButton.tsx`, `components/trips/TripCard.tsx` | VO, TB, UT, AS |
| S-03 | 4.1.2, 1.3.1, 1.4.1 | `components/ui/SegmentedToggle.tsx` | VO, TB, UT |
| S-04 | 1.3.1, 2.4.3 | `components/trips/TripCard.tsx` | VO, TB, UT |
| S-05 | 1.3.1, 1.3.5, 3.3.1, 3.3.2, 3.3.3 | `components/ui/TextField.tsx`, `lib/validators.ts` | VO, TB, UT |
| S-06 | 4.1.2 | `app/(tabs)/_layout.tsx`, `SegmentedToggle.tsx`, `Button.tsx` | VO, TB, UT |
| S-07 | 4.1.3 | `hooks/useAnnounce.ts`, `components/ui/StatusBanner.tsx` | VO, TB, MN |
| S-08 | 2.4.3, 2.1.2, 4.1.2 | `components/ui/ConfirmDialog.tsx` | VO, TB, UT |
| S-09 | 1.1.1, 4.1.2 | `components/maps/MapPicker.tsx`, `components/ui/PhotoPicker.tsx`, `components/ui/Logo.tsx` | VO, TB |
| V-01 | 1.4.3, 1.4.11 | `theme/colors.ts`, `scripts/check-contrast.ts` | CC |
| V-02 | 1.4.3, 3.3.2 | `components/ui/TextField.tsx` | CC, AS |
| V-03 | 1.4.3, 1.4.11 | `components/ui/SegmentedToggle.tsx`, `components/trips/TripFilters.tsx` | CC, AS |
| V-04 | 1.4.11, 1.1.1 | `components/ui/ConfirmDialog.tsx`, `components/ui/PhotoPicker.tsx` | CC, AS |
| V-05 | 1.4.1, 3.3.1 | `TextField.tsx`, `StatusBanner.tsx`, `app/(tabs)/reservas.tsx` | UT, MN |
| V-06 | 1.4.4, 1.4.10 | `theme/typography.ts` y todos los `Text` | FS, AS |
| V-07 | 1.4.12, 1.4.4 | `theme/typography.ts` | UT, FS |
| V-08 | 1.4.3, 1.4.11 | `theme/ThemeProvider.tsx`, `app/settings/accessibility.tsx` | CC, MN |
| V-09 | 2.3.3 (AAA, buena práctica) | `hooks/useReduceMotion.ts` | MN |
| T-01 | 2.5.5, 2.5.8 | `theme/layout.ts` (TOUCH\_MIN), `Button`, `IconButton`, `TextField`, `SegmentedToggle` | UT, AS |
| T-02 | 2.5.5, 2.5.8 | `components/ui/IconButton.tsx` (`hitSlop`) | UT, AS |
| T-03 | 2.4.3, 2.4.7, 2.4.11 | `components/ui/TextField.tsx`, `hooks/useScreenFocus.ts` | VO, TB, MN |
| T-04 | 3.3.1, 4.1.3 | `hooks/useHaptics.ts`, `components/ui/StatusBanner.tsx` | MN |
| T-05 | 4.1.3, 3.3.1 | `components/ui/Button.tsx` (carga), `components/ui/LoadingState.tsx` | VO, TB, MN |
| T-06 | 3.3.4, 2.4.6 | `components/ui/ConfirmDialog.tsx` | VO, TB, UT |
| T-07 | 2.5.1, 2.5.2, 2.5.7 | `components/maps/MapPicker.tsx`, `app/(tabs)/_layout.tsx` | MN |
| T-08 | 1.3.5, 3.3.7, 3.3.8 | `app/(auth)/register/*`, `components/ui/StepIndicator.tsx`, `TextField.tsx` | VO, TB, MN |

## 9. Referencias

- Android Developers. (s. f.). *Accessibility guidelines for apps*. https://developer.android.com/guide/topics/ui/accessibility/apps
- Google. (s. f.). *Touch target size*. Accessibility Help. https://support.google.com/accessibility/android/answer/7101858
- GOV.UK. (s. f.). *3.3.7 Redundant Entry (A)*. Guide to WCAG 2.2. https://alphagov.github.io/guide-to-wcag/sc/3.3.7.html
- GOV.UK. (s. f.). *3.3.8 Accessible Authentication (Minimum) (AA)*. Guide to WCAG 2.2. https://alphagov.github.io/guide-to-wcag/sc/3.3.8.html
- Meta Platforms. (s. f.). *Accessibility*. React Native. https://reactnative.dev/docs/accessibility
- Universidad de La Sabana. (2026). *Proyecto de curso: Fase 3 (entrega final definitiva): Despliegue de producto, accesibilidad móvil y defensa técnica* \[Documento del curso Desarrollo de Aplicaciones Móviles\].
- W3C. (2018). *Web content accessibility guidelines (WCAG) 2.1*. https://www.w3.org/TR/WCAG21/
- W3C. (2023). *Web content accessibility guidelines (WCAG) 2.2*. https://www.w3.org/TR/WCAG22/
- W3C. (s. f.). *Understanding SC 2.5.8: Target size (minimum) (Level AA)*. https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
