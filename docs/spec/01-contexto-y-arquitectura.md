# CampusGo — Especificación 1 de 3: contexto y arquitectura (Entrega Final, Fase 3)

Este archivo es parte de tu contexto permanente (AGENTS.md te indica los otros dos). Léelo completo antes de actuar y vuelve a él cuando tengas dudas. Cuando el usuario diga "Ejecuta la Etapa N", haz solo esa etapa (sección 8). Responde siempre en español. Todo texto visible de la app va en español de Colombia.

## 0. Modo de trabajo

0.1 Rol. Eres ingeniero(a) senior de React Native. Construyes CampusGo con dos estudiantes de Ingeniería de la Universidad de La Sabana: Sara Santacruz Corredor y Samuel Borda Munevar (curso Desarrollo de Aplicaciones Móviles, profesor Santiago Rivadereina). Cada uno defenderá oralmente TODO el código ante el profesor, y esa defensa vale el 40 % de la nota. Por eso:
- Escribe código simple, tipado y modular, con patrones estándar (Redux Toolkit, hooks, servicios) y sin abstracciones ingeniosas.
- Comenta en español el porqué de las decisiones no obvias (no lo que el código ya dice).
- Al final de cada etapa explica en máximo 15 líneas qué hiciste, dónde está y cómo funciona, y actualiza docs/GUIA_DEFENSA.md (sección 12).

0.2 Quién ejecuta. El usuario te dirá "Soy Sara" o "Soy Samuel". Antes del primer commit verifica `git config user.name` y `git config user.email`: deben ser de esa persona; si faltan, pídeselos. NUNCA cambies la identidad de Git, NUNCA uses --author para atribuir commits a otra persona y NUNCA reescribas historial (sin push --force ni rebase de ramas compartidas).

0.3 Preguntas. Pregunta solo lo que bloquea, todo junto y en máximo 5 preguntas. Si no bloquea, decide, anótalo en docs/DECISIONES.md (fecha, decisión, motivo, alternativa descartada) y sigue.

0.4 Honestidad. Nunca inventes resultados de pruebas, capturas, mediciones, citas ni referencias. Lo que deba ejecutarse en un teléfono (TalkBack, escalado de fuente, Accessibility Scanner) lo ejecutan Sara y Samuel: tú dejas el protocolo paso a paso y la fila en estado "Pendiente". Si no pudiste verificar algo, dilo.

0.5 Calidad antes de cada commit: `npm run typecheck`, `npm run lint` y `npm test` deben pasar. Commits pequeños en Conventional Commits en español (feat:, fix:, docs:, test:, refactor:, chore:), uno por unidad lógica; nunca un commit gigante por etapa.

0.6 Verifica en la documentación oficial antes de usar una API de Expo SDK 58 o de una librería, porque las APIs cambian entre SDK. Fuente de verdad: https://docs.expo.dev/versions/v58.0.0 y el changelog del SDK 58. Si una librería no funciona en Expo Go, no la uses.

## 1. Producto

- Nombre: CampusGo. Lema: "Conectando estudiantes, compartiendo trayectos". Marca: "By Sara y Samuel" (el Figma dice "Diego": usa SIEMPRE "Samuel").
- Propósito: app móvil de carpooling para estudiantes de la Universidad de La Sabana. Conecta conductores y pasajeros para compartir trayectos hacia y desde el campus: más económicos, sociales y sostenibles. Red cerrada: solo correo institucional @unisabana.edu.co. Sin comisiones: el valor por cupo es una referencia que fija el conductor y el pago ocurre fuera de la app (la app no procesa pagos).
- Problema validado en la Fase 1: muchos estudiantes viven fuera del campus y dependen de taxis o de transporte público irregular (gasto de 100.000 a 200.000 COP al mes), lo que genera congestionamiento y contaminación. En La Sabana ya existe el sistema informal "Wheels" por grupos de WhatsApp (desde 2015): hay demanda, pero faltan plataforma, escalabilidad, seguridad y transparencia.
- Evidencia citada en la propuesta: Rey-Merchán et al. (2022), el carpooling mitiga contaminación y congestión; Javid et al. (2025), más del 60 % de los estudiantes usaría carpool con incentivos y las barreras son la desconfianza y la pérdida de independencia; MinTIC (2025), 91 % de acceso a internet móvil; URJC con Hoop CarPool (2023), ahorro de CO2. No copies cifras sin verificarlas en la fuente (la propuesta tiene un posible error de digitación en el número de trayectos de la URJC).
- Usuarios: pregrado de 18 a 25 años (principales) y docentes o administrativos jóvenes (secundarios). Dos modos con un selector: pasajero y conductor (el modo conductor exige un carro registrado).
- User personas con necesidades de accesibilidad (úsalas en la documentación): Valentina (19, baja visión), Andrés (21, ceguera, usa TalkBack), Camila (22, daltonismo rojo-verde), Julián (20, movilidad reducida, usa el celular con una mano), Mariana (18, TDAH y ansiedad).
- Competencia analizada en la Fase 1:

| Competidor | Enfoque | Verificación institucional | Carpool | Precio |
| --- | --- | --- | --- | --- |
| Uber / Didi | Público general, bajo demanda | No | Ocasional | Tarifas altas con comisión |
| BlaBlaCar | Viajes interurbanos de larga distancia | No | Sí, largo recorrido | Bajo (solo costo) |
| TRIBBU | Comunidades universitarias | Sí (correo institucional) | Sí | Gratis, sin comisiones; base de usuarios limitada y requiere acuerdos institucionales |
| CampusGo | Una universidad | Sí (correo institucional) | Sí | Gratis, colaborativo |

- Brecha que cubre CampusGo: red universitaria cerrada, con verificación institucional, trayectos recurrentes y cero comisiones. Diferenciadores construidos: verificación institucional, comunidad exclusiva, cero comisiones, cierre automático de cupos, calificaciones, caché sin conexión y accesibilidad WCAG 2.1/2.2 AA.
- Modelo de negocio (solo documental): licencia institucional (suscripción de la universidad) que mantiene la app gratis para estudiantes; alianzas o publicidad como ingreso complementario.

## 2. Qué se evalúa (Fase 3, entrega final)

Pesos: documento final 20 %, aplicación y repositorio 30 %, presentación y demo 10 %, defensa técnica individual 40 %. Fecha límite: 12/11/2026 (la hora exacta la confirma el equipo; una entrega con un minuto de retraso no se acepta, así que la meta interna es entregar el 11/11 en la noche).

- App funcional de extremo a extremo: los flujos de la Fase 1 y las mejoras de accesibilidad de la Fase 2 operan en tiempo real, sin datos simulados injustificados y sin cierres inesperados. Fidelidad visual al Figma y navegación fluida.
- Repositorio Git: estructura limpia, código tipado y modular, cero credenciales en el historial, commits continuos y equitativos de ambos integrantes, README completo (instalación, variables de entorno, arquitectura, guía de ejecución y resumen de accesibilidad).
- Documento final: PDF o Markdown con diagramas renderizados, en /docs o en la raíz; 5 a 8 páginas sin portada ni referencias; referencias en IEEE o APA; cinco secciones (sección 11).
- Presentación y demo en vivo sobre dispositivo o emulador: flujo de negocio completo y accesibilidad en acción (navegación asistida, etiquetas semánticas, contraste y temas, áreas táctiles, respuesta de la interfaz).
- Defensa individual: el profesor pregunta al azar a cada integrante; puede pedir abrir el repo, ubicar un archivo, explicarlo línea por línea o hacer un ajuste en vivo. Temas: arquitectura de React Native, manejo de estado, consumo de APIs y base de datos, accesibilidad (accessibilityRole, accessibilityLabel, manejo de foco, lineHeight, Pressable) y decisiones de las Fases 1, 2 y 3.

## 3. Stack (decisiones cerradas)

- Expo SDK 58 (React Native 0.88, React 19.2, Node 22.13 o superior), TypeScript con strict activado, ejecución en Expo Go. Nada de development builds ni módulos nativos propios.
- Navegación: Expo Router (rutas por archivos, grupos (auth) y (tabs), guardas de sesión).
- Estado global: Redux Toolkit (createSlice, createAsyncThunk, createEntityAdapter, selectores memoizados) con react-redux. La asincronía vive en thunks que llaman a la capa de servicios.
- Backend y datos: Supabase (PostgreSQL, Auth, Realtime, Storage, RLS) con @supabase/supabase-js. No construyas un servidor propio.
- Sesión segura: expo-secure-store como almacenamiento del cliente de Auth, con un adaptador que respete los límites de tamaño de SecureStore (verifica el patrón que recomienda Supabase para React Native). Preferencias no sensibles: @react-native-async-storage/async-storage.
- Caché sin conexión: expo-sqlite (lectura de viajes, reservas y perfil con la hora de última actualización) y @react-native-community/netinfo.
- Mapas: react-native-maps (funciona en Expo Go) y expo-location (permiso en primer plano y geocodificación inversa sin clave). No uses claves de Google Maps ni la API de Directions.
- Medios: expo-image-picker (fotos de perfil, carro y SOAT) y expo-image para mostrarlas con caché.
- Interfaz: @expo/vector-icons, react-native-svg (logo), expo-font con @expo-google-fonts/noto-sans, @react-native-community/datetimepicker y expo-haptics.
- Calidad: ESLint con eslint-plugin-react-native-a11y, Prettier, jest-expo y @testing-library/react-native.
- Instala siempre con `npx expo install` para obtener las versiones del SDK 58. Al terminar cada etapa corre `npx expo-doctor` y `npx expo install --check`.
- Sin pagos y sin notificaciones push remotas (no son confiables en Expo Go): las notificaciones son dentro de la app, con Supabase Realtime.
- Contraseñas: Supabase Auth exige 6 caracteres como mínimo por defecto y el Figma dice 5. Usa 6 y registra la desviación en docs/DECISIONES.md.

## 4. Arquitectura

Estructura en la raíz del repo (no uses carpeta src):
- app/ (Expo Router) con las rutas de la sección de navegación de abajo.
- components/ui (Button, IconButton, TextField, SegmentedToggle, ConfirmDialog, StatusBanner, ScreenTitle, Logo, PhotoPicker, StepIndicator, LoadingState), components/trips (TripCard, TripFilters), components/maps (MapPicker).
- features/ (auth, profile, vehicle, trips, reservations, notifications, chat, ratings, settings), cada una con slice.ts, thunks.ts y selectors.ts.
- services/ (supabase.ts, authService, profileService, vehicleService, tripService, reservationService, storageService, ratingService, notificationService, chatService): solo hablan con Supabase, sin React.
- store/ (store.ts y hooks tipados), db/ (SQLite), hooks/, theme/, lib/ (validators.ts, format.ts), types/ (database.ts generado), scripts/, supabase/ (migrations y seed.sql), docs/ (incluye docs/spec con esta especificación en tres archivos), design/ y __tests__/, además de AGENTS.md y CLAUDE.md en la raíz.

Flujo de datos: pantalla, dispatch(thunk), servicio, Supabase, reducer, selector, pantalla. Realtime actualiza el store por la misma vía de reducers.

Reglas:
- Las pantallas no llaman a Supabase: solo usan thunks y selectores.
- Los componentes de components/ui no conocen Redux: reciben props.
- Navegación: app/index.tsx (bienvenida o redirección según la sesión); (auth): login, register/ (index, verify, photo, has-car, car, car-photo, soat); (tabs): index (Inicio, según el modo), reservas (solo modo pasajero), creados (solo modo conductor; el otro modo oculta la pestaña con href: null) y curso; fuera de las pestañas: trip/create, trip/[id]/reserve, trip/[id]/chat, trip/[id]/rate, requests, notifications, profile y settings/accessibility.
- El guardia de sesión vive en app/_layout.tsx: sin sesión va a (auth), con sesión va a (tabs) y con registro incompleto retoma el paso pendiente.
- Rendimiento: FlatList con keyExtractor estable, renderItem memoizado (React.memo y useCallback), paginación por rango con onEndReached, debounce de 300 ms en los filtros, initialNumToRender y windowSize ajustados, imágenes con expo-image y selectores memoizados.
- Asincronía: ignora respuestas obsoletas (AbortController o comparación de requestId), limpia las suscripciones Realtime en el cleanup de useEffect y maneja los estados idle, loading, succeeded y failed en cada slice.
- Errores: los servicios devuelven errores tipados (AppError con code y message en español); los thunks usan rejectWithValue; la interfaz muestra el mensaje específico y ofrece "Reintentar".
- Variables de entorno: EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en .env (ignorado por Git) y un .env.example sin valores reales. La service_role key NUNCA entra a la app ni al repositorio.
