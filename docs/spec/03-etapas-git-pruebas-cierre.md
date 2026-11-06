## 8. Etapas de trabajo

Ejecuta SOLO la etapa que pida el usuario. Al terminar cada etapa: corre typecheck, lint y tests, corre `npx expo-doctor`, haz commits pequeños, resume lo hecho en máximo 15 líneas, actualiza docs/GUIA_DEFENSA.md y docs/MATRIZ_ACCESIBILIDAD.md, marca en docs/CHECKLIST.md solo lo que tiene evidencia real (archivo, prueba o captura) y espera confirmación. Los responsables son los sugeridos; quien ejecute dirá quién es.

E0 — Preparación (Sara)
- Crea el proyecto Expo SDK 58 en TypeScript con Expo Router (npx create-expo-app@latest; borra el código de ejemplo, con el script reset-project si existe) y verifica que `npx expo start` abre en Expo Go.
- tsconfig con strict y alias "@/*" a la raíz; ESLint (con el plugin de accesibilidad) y Prettier; scripts npm: start, typecheck, lint, test y a11y:contrast.
- jest-expo y Testing Library configurados con una prueba de humo.
- .gitignore (incluye .env, node_modules, .expo, dist, ios, android y keystores), .env.example y cero secretos.
- Estructura de carpetas de la sección 4; crea docs/DECISIONES.md, docs/GUIA_DEFENSA.md, docs/MATRIZ_ACCESIBILIDAD.md (los 26 IDs en estado "Pendiente"), docs/API_CONTRATOS.md, docs/PRUEBAS.md y docs/AUDITORIA_ACCESIBILIDAD.md.
- README inicial (qué es, instalar y correr); se completa en E9.
- Hecho cuando: la app vacía abre en Expo Go sin errores, expo-doctor sale limpio y Sara hizo el primer push para que Samuel clone.

E1 — Sistema de diseño y accesibilidad base (Sara)
- theme/colors.ts (tres temas), theme/typography.ts (Noto Sans, escalas, lineHeight), theme/layout.ts (TOUCH_MIN, espaciado, radios) y theme/ThemeProvider.tsx (Sistema, Claro, Oscuro, Alto contraste, escala de texto y persistencia).
- hooks/useAnnounce.ts, useHaptics.ts, useReduceMotion.ts y useScreenFocus.ts.
- components/ui: Logo, Button (primary y secondary, con loading), IconButton (label obligatorio y hitSlop), TextField (etiqueta visible, error, pista, mostrar u ocultar), SegmentedToggle, ConfirmDialog, StatusBanner, ScreenTitle, PhotoPicker, StepIndicator y LoadingState, más el layout común de pantalla (encabezado, selector, banda y barra inferior).
- app/settings/accessibility.tsx y scripts/check-contrast.ts con `npm run a11y:contrast`.
- Pantalla de catálogo app/dev/catalogo.tsx, solo en desarrollo (__DEV__), con todos los componentes en los tres temas para probarlos con TalkBack.
- Pruebas unitarias por componente: roles, labels, estados, tamaño mínimo (TOUCH_MIN), lineHeight y label obligatorio.
- Hecho cuando: ningún componente incumple S-01 a S-09, V-01 a V-09 y T-01 a T-05 en el catálogo, el script de contraste pasa y la matriz tiene los archivos y las pruebas.

E2 — Base de datos en Supabase (Samuel)
- Migraciones 0001 en adelante con todo lo de la sección 5: tablas, restricciones, índices, vistas, RPC (cambiar_modo, crear_reserva, aceptar_reserva, rechazar_reserva, cancelar_reserva, iniciar_viaje, finalizar_viaje, cancelar_viaje), triggers (handle_new_user, notificaciones, cierre automático), RLS y políticas, Storage (buckets y políticas) y supabase/seed.sql con los sectores. Para probar rendimiento, un supabase/dev_seed_viajes.sql aparte con datos ficticios.
- Dile a Samuel paso a paso cómo: crear el proyecto en supabase.com (plan gratuito), obtener la URL y la anon key, aplicar las migraciones (SQL Editor o Supabase CLI), configurar Auth (R16) y crear los buckets si las migraciones no lo hacen.
- types/database.ts generado, docs/API_CONTRATOS.md con el contrato de cada RPC y tabla expuesta, y supabase/tests/rls.sql con las pruebas de políticas (qué puede y qué no puede hacer cada rol).
- Hecho cuando: Samuel aplicó las migraciones en su proyecto, las pruebas SQL de RLS pasan, no hay claves en el repositorio y Samuel compartió la URL y la anon key con Sara por mensaje privado.

E3 — Capa de cliente (Sara)
- services/supabase.ts (cliente con adaptador seguro de sesión y autoRefresh ligado a AppState), un servicio por dominio y AppError tipado; store/store.ts con hooks tipados; slices y thunks de auth, profile, vehicle, trips, reservations, notifications, chat, ratings y settings; selectores memoizados.
- db/: SQLite con migración inicial y funciones de caché (guardar y leer viajes, reservas y perfil con cachedAt); NetInfo; banner accesible "Sin conexión: mostrando datos guardados".
- Suscripciones Realtime (viajes, reservas, notificaciones y mensajes) en hooks con cleanup.
- Pruebas unitarias de reducers, selectores y thunks (servicios simulados SOLO dentro de las pruebas).
- Hecho cuando: con un usuario creado a mano en Supabase se inicia sesión desde una pantalla temporal, la sesión persiste al reiniciar la app y los datos se leen y se guardan en caché.

E4 — Autenticación, registro y perfil (Samuel)
- Pantallas 1 a 9 de la sección 6.7 (bienvenida, inicio de sesión, error, registro por pasos con verificación por código, foto, carro y fotos), guardia de sesión en app/_layout.tsx, retomar un registro incompleto y subida de imágenes a Storage.
- Perfil (pantalla 15) con edición y cierre de sesión, cambio de modo (pantalla 16) y registro y eliminación del carro.
- lib/validators.ts con pruebas, errores por campo, anuncios al lector y "Paso x de y".
- Hecho cuando: un correo @unisabana.edu.co se registra, se verifica por código, completa el registro con y sin carro, inicia y cierra sesión; un correo de otro dominio es rechazado; y todo cumple los compromisos de accesibilidad que aplican.

E5 — Flujo de pasajero (Sara)
- Pantallas 10 a 14: inicio con filtros reales y paginación, TripCard, reserva con mapa, éxito, reservas por estado, cancelación con confirmación y viajes en curso; caché y estados de carga, vacío y error; cupos actualizados en tiempo real.
- Hecho cuando: un pasajero busca, reserva, ve su reserva pasar de pendiente a aceptada o rechazada, cancela y ve cambiar el cupo en vivo; la lista se mueve fluida con 200 viajes de prueba (usa dev_seed_viajes.sql).

E6 — Flujo de conductor (Samuel)
- Pantallas 17 a 19: inicio de conductor, crear viaje con mapa y validación por campo, solicitudes (aceptar y rechazar), viajes creados, iniciar, finalizar y cancelar viaje, y viajes en curso.
- Hecho cuando: un conductor crea un viaje que aparece al pasajero, acepta reservas hasta llenar los cupos (el viaje pasa a 'lleno' y desaparece de la búsqueda), lo inicia y lo finaliza.

E7 — Calificaciones, notificaciones y chat (Samuel: calificaciones y notificaciones; Sara: chat)
- Calificar viaje (estrellas accesibles: cada estrella es un botón con etiqueta "3 de 5 estrellas" y accessibilityState selected, o un control ajustable), promedio visible en TripCard y en el perfil; bandeja de notificaciones con Realtime, contador y anuncio; chat del viaje (FlatList invertida, botón de enviar de 48 dp, anuncio del mensaje nuevo, estado vacío y límite de 500 caracteres).
- Prioridad si falta tiempo: calificaciones, luego notificaciones, luego chat. No sacrifiques pruebas, accesibilidad ni documento por el chat.
- Hecho cuando: los flujos se pueden demostrar de punta a punta y con RLS verificado (alguien ajeno al viaje no puede leer el chat).

E8 — Pruebas, rendimiento y auditoría (ambos)
- Sección 10. Automatiza lo que se pueda; para lo manual deja protocolos listos y quienes ejecuten registran resultados reales.
- Rendimiento: lista de 200 elementos fluida; sin renders innecesarios en TripCard (verifícalo con el Profiler de React DevTools y documéntalo); imágenes con tamaño razonable; sin warnings en consola.
- Auditoría del repositorio: búsqueda de secretos en todo el historial y README ejecutable desde un clon limpio.
- Hecho cuando: docs/PRUEBAS.md y docs/AUDITORIA_ACCESIBILIDAD.md tienen protocolos completos y resultados reales ejecutados, y los fallos encontrados están corregidos o documentados como limitación.

E9 — Documento final, README, presentación y guía de defensa (ambos)
- docs/DOCUMENTO_FINAL.md y su PDF (sección 11), README.md completo, docs/PRESENTACION.md (guion), docs/GUIA_DEFENSA.md completa (sección 12) y docs/CHECKLIST.md verificado ítem por ítem.

## 9. Repositorio y Git

- Ramas: main solo recibe cambios por pull request. Una rama por etapa y persona (por ejemplo e1-sistema-diseno, e2-base-datos). Cada etapa termina con un PR que revisa la otra persona: esa revisión sirve para que ambos conozcan todo el código.
- Commits: Conventional Commits en español, pequeños, uno por unidad lógica, con mensajes que expliquen el porqué; cada persona commitea con su propia identidad. Meta: commits repartidos en todos los días del corte, no concentrados al final.
- Sin secretos: .env ignorado; antes de cada push revisa `git diff --staged` en busca de claves; si hay gitleaks, úsalo. Si una clave se sube por error, rotála en Supabase de inmediato (borrar el commit no basta).
- Estructura limpia: sin archivos muertos, sin código comentado, sin console.log en producción, sin any ni @ts-ignore salvo con una justificación en el comentario.
- README.md: qué es CampusGo y capturas; requisitos (Node 22.13 o superior, Expo Go SDK 58, cuenta de Supabase); instalación paso a paso; variables de entorno (tabla con nombre, descripción y dónde se obtiene, sin valores reales); cómo aplicar las migraciones; cómo ejecutar (`npx expo start` y escanear el QR con Expo Go); scripts npm; arquitectura con diagrama; resumen de accesibilidad (los 26 compromisos y dónde viven); pruebas; reparto del equipo y limitaciones conocidas.

## 10. Pruebas

Automáticas (jest-expo con Testing Library): validators; reducers y selectores; thunks con servicios simulados; componentes ui (roles, labels, estados, tamaños mínimos, lineHeight); flujos clave de pantalla (login con error, registro con validación, reserva, crear viaje con campos faltantes); `npm run a11y:contrast`; pruebas SQL de RLS.

Casos funcionales en docs/PRUEBAS.md, con tabla (ID, descripción, pasos, resultado esperado, resultado real, evidencia y estado Pendiente, Aprobado o Fallido):
- TC-01 registro con carro. TC-02 registro sin carro. TC-03 inicio de sesión correcto. TC-04 credenciales incorrectas. TC-05 correo de otro dominio rechazado.
- TC-06 filtro por sector y por cupos. TC-07 reservar viaje. TC-08 reserva duplicada rechazada. TC-09 cancelar reserva.
- TC-10 crear viaje. TC-11 crear viaje con campos faltantes. TC-12 aceptar reservas hasta llenar los cupos (cierre automático). TC-13 rechazar reserva. TC-14 iniciar y finalizar viaje.
- TC-15 calificar viaje. TC-16 chat en tiempo real. TC-17 sin conexión, con caché y banner. TC-18 error de red y "Reintentar".
- TC-19 cambio a modo conductor sin carro bloqueado. TC-20 eliminar carro. TC-21 cerrar sesión limpia la sesión segura. TC-22 la sesión persiste al reiniciar la app. TC-23 RLS: un usuario no lee datos ajenos.

Auditoría de accesibilidad en dispositivo (docs/AUDITORIA_ACCESIBILIDAD.md): protocolo para activar TalkBack en Android (Ajustes, Accesibilidad), sus gestos básicos, instalar Accessibility Scanner y subir al máximo el tamaño de fuente y de pantalla. Para cada flujo (F1 registro con foto y carro, F2 inicio de sesión con error, F3 buscar y reservar, F4 crear viaje con error y éxito, F5 cancelar reserva y eliminar carro, F6 cambio de modo y cierre de sesión): pasos, qué debe anunciar TalkBack y una tabla por cada ID de la matriz con el resultado real, que llenan Sara y Samuel (tú la dejas en "Pendiente"). Incluye pruebas con tema oscuro, alto contraste y reducción de animaciones.

## 11. Documento final (docs/DOCUMENTO_FINAL.md y su PDF)

Extensión: 5 a 8 páginas sin portada ni referencias; referencias en APA; diagramas renderizados como imágenes en docs/img.
- Portada: título CampusGo, equipo (Sara Santacruz Corredor y Samuel Borda Munevar), Universidad de La Sabana, Desarrollo de Aplicaciones Móviles, profesor Santiago Rivadereina y fecha.
- Sección 1. Visión, problema y estado del arte (evolución de la Fase 1): resumen ejecutivo y UVP (nombre, lema, propósito y personas, incluidas las de accesibilidad); síntesis del problema y tabla comparativa con Uber/Didi, BlaBlaCar y TRIBBU que demuestre cómo el producto construido supera las brechas; innovación lograda frente al estado del arte, con la justificación técnica de cada diferenciador implementado.
- Sección 2. Arquitectura e implementación: diagrama de arquitectura de extremo a extremo (cliente Expo y React Native, Redux Toolkit, servicios, Supabase con Auth, Postgres, Realtime y Storage, SQLite, mapas); decisiones arquitectónicas (modularidad, navegación con Expo Router, estado asíncrono con thunks, almacenamiento seguro de la sesión, optimización de listas); modelo de datos (diagrama entidad-relación) y contratos de servicio de los flujos principales (registro, reserva con cierre automático, creación de viaje).
- Sección 3. Accesibilidad: cumplimiento de WCAG 2.1 y 2.2 AA en móvil con evidencia en el código de (a) semántica para lectores de pantalla (accessible, accessibilityLabel, accessibilityHint, accessibilityRole, accessibilityState y agrupamiento), (b) diseño visual con contraste de 4,5:1 o más, lineHeight, escalado dinámico y alternativas al color, y (c) ergonomía táctil (44×44 pt y 48×48 dp, hitSlop, orden de foco, retroalimentación háptica, auditiva y visual); y la matriz trazable (ID, mejora prometida en el Corte 2, archivo y componente donde se implementó, prueba de validación y resultado) tomada de docs/MATRIZ_ACCESIBILIDAD.md.
- Sección 4. Pruebas y validación: casos de prueba ejecutados (caminos felices y errores de red o validación) y auditoría de accesibilidad en dispositivo, con los resultados reales de docs/PRUEBAS.md y docs/AUDITORIA_ACCESIBILIDAD.md. Si algo no se ejecutó, dilo.
- Sección 5. Conclusiones, limitaciones y trabajo futuro: lecciones aprendidas, retos de ingeniería superados y alcance logrado; limitaciones (iOS sin probar, sin pagos, sin push remotas, límites del SMTP); hoja de ruta (push remotas con development build, división de gastos o pagos, aprendizaje automático para el emparejamiento y mapas de calor de tráfico del estado del arte, SSO institucional, rutas recurrentes y publicación en tiendas).
- Referencias (APA): CITEGO (2023); Conexión Sabana 360 (2025); Green Earth (2024); Javid, Al-Shehhi y Al-Youqabi (2025); Liftango (2026); MinTIC (2025); Rey-Merchán, López-Arquillos y Pires Rosa (2022); Universidad Complutense de Madrid (2026, TRIBBU); Universidad Rey Juan Carlos (2023); más WCAG 2.1 y 2.2 (W3C), la documentación de React Native, Expo y Supabase. Verifica cada referencia y cada enlace antes de citarla y no inventes ninguna.
- Exportación: genera el PDF con la herramienta que funcione en el entorno (pandoc, md-to-pdf u otra) y guárdalo en docs/. Si no puedes, deja el Markdown con las imágenes de los diagramas y explica cómo exportarlo.

## 12. Presentación, demo y defensa

- docs/PRESENTACION.md: guion con tiempos (por defecto 12 minutos; ajústalo al bloque que fije el profesor): problema (1), solución y diferenciadores (2), arquitectura (2), accesibilidad (2), demo en vivo (4) y cierre con trabajo futuro (1). Ambos hablan; indica quién presenta cada parte. Lista de diapositivas con título y contenido (sin imágenes inventadas).
- Guion de demo en vivo en Android con TalkBack: registro o inicio con una cuenta de prueba, reserva de un viaje, aceptación desde la cuenta del conductor y cupos llenos. Accesibilidad en acción: navegación con TalkBack, etiquetas, cambio a alto contraste y tema oscuro, escalado de fuente al 200 %, áreas táctiles (con la opción de mostrar toques), error por campo y háptica. Plan B si falla internet: datos en caché y grabaciones de respaldo hechas por ellos.
- docs/GUIA_DEFENSA.md (la actualizas en cada etapa): mapa de archivos (qué hace cada carpeta y archivo clave y quién lo escribió); flujo de datos paso a paso (pantalla, thunk, servicio, Supabase, reducer, selector); 40 preguntas probables con respuesta modelo de 3 a 5 líneas, agrupadas en: arquitectura de React Native y Expo Router; estado (Redux Toolkit, thunks, selectores); asincronía y ciclo de vida de hooks (useEffect, cleanup, suscripciones, condiciones de carrera); Supabase (RLS, la RPC aceptar_reserva, Realtime, sesión segura); accesibilidad (cada propiedad de la sección 7.3 y por qué: accessibilityRole, accessibilityLabel, accessibilityState, hitSlop, lineHeight y recorte de caracteres, Pressable, foco); rendimiento de listas; y decisiones de las Fases 1 y 2. Agrega 10 ejercicios de "ajuste en vivo" (por ejemplo: cambiar el mínimo de la contraseña, añadir una propiedad de accesibilidad a un botón, cambiar un token de color y verificarlo con el script, agregar un filtro). Para cada persona, una lista de "mis archivos" y otra de "los archivos del otro que también debo dominar".

## 13. Definición de terminado

- Desde un clon limpio: `npm install`, copiar .env.example a .env con las claves, `npx expo start`, y la app abre en Expo Go SDK 58 sin errores.
- Todos los flujos de la sección 6 funcionan con datos reales de Supabase, sin mocks y sin crashes.
- typecheck, lint y tests pasan; expo-doctor sale limpio; `npm run a11y:contrast` pasa en los tres temas.
- docs/CHECKLIST.md con cada ítem marcado [x] y su evidencia (archivo, prueba o captura real); lo que no se pudo cumplir queda sin marcar y explicado.
- Sin secretos en el historial, README ejecutable y PDF del documento final en docs/.
- Los dos integrantes tienen commits repartidos en todos los días del corte.

## 14. Prohibido

- Datos simulados en la app (listas fijas de viajes, usuarios falsos, "API MAPS" como imagen). Los únicos datos iniciales permitidos son los sectores sembrados en la base de datos.
- Secretos en el código o en el historial; la service_role key dentro de la app.
- Resultados, mediciones, capturas, citas o referencias inventados.
- Cambiar la identidad de Git, atribuir commits a otra persona o reescribir historial.
- Módulos nativos o librerías que no funcionen en Expo Go; pagos; push remotas.
- any sin justificación, @ts-ignore, reglas de lint desactivadas, console.log en producción, código muerto o comentado.
- Dejar la accesibilidad "para después": cada componente nace accesible.
- Hacer más de lo que pide la etapa solicitada.
