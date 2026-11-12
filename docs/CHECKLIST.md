# CampusGo — Checklist de cobertura (Fase 3)

Reglas: marca [x] solo con evidencia real (archivo, prueba o captura). Lo que no se cumpla queda sin marcar y con una nota al lado. "→ §" indica la sección de la especificación (docs/spec) donde se cumple; "E" es la etapa.

## A. Documento final (20 %)

Formato y entrega
- [ ] PDF (o Markdown con diagramas renderizados) ubicado en /docs o en la raíz del repositorio → §11, E9
- [ ] Extensión de 5 a 8 páginas, sin contar portada ni referencias → §11
- [ ] Exactamente cinco secciones, en el orden de la Fase 3 → §11
- [ ] Referencias en APA o IEEE, verificadas y sin inventar ninguna → §11
- [ ] Diagramas y tablas dentro del documento → §11
- [ ] Documento subido también a la plataforma del curso → §11, sección E de este checklist

Sección 1: Visión del producto, problema y estado del arte (evolución Fase 1)
- [ ] Resumen ejecutivo y UVP: nombre definitivo, tagline, propósito central → §1, §11
- [ ] User personas, incluidas las de necesidades de accesibilidad → §1, §11
- [ ] Síntesis del problema validado → §1, §11
- [ ] Tabla comparativa con los competidores de la Fase 1 que demuestre las brechas superadas → §1, §11
- [ ] Innovación lograda: justificación técnica de cada diferenciador implementado → §1, §11

Sección 2: Arquitectura e implementación técnica
- [ ] Diagrama de arquitectura end-to-end (Expo y React Native, Redux Toolkit, servicios, Supabase, SQLite, mapas) → §4, §11
- [ ] Organización modular y estructura de componentes → §4, §11
- [ ] Flujo de navegación con Expo Router → §3, §4, §11
- [ ] Manejo de estado asíncrono (thunks, estados de carga y error) → §3, §4, §11, E3
- [ ] Almacenamiento seguro de la sesión → §3, §5 (R16), §11, E3
- [ ] Optimización de rendimiento en listas y vistas complejas → §6, §11, E5, E8
- [ ] Modelo de datos (diagrama entidad-relación) → §5, §11
- [ ] Contratos de servicio y flujos de datos principales (registro, reserva con cierre automático, creación de viaje) → §5, §11, docs/API_CONTRATOS.md

Sección 3: Implementación y auditoría de accesibilidad móvil (consolidación Fase 2)
- [ ] Semántica para lectores de pantalla (accessible, accessibilityLabel, accessibilityHint, accessibilityRole, accessibilityState) con evidencia en el código → §7, §11, E1
- [ ] Agrupamiento correcto de contenedores táctiles, sin focos fragmentados → §7, §11
- [ ] Contraste verificado de 4,5:1 o más en texto normal, con el script y su resultado → §7, §11, E1
- [ ] lineHeight correcto, sin recorte de caracteres, y escalado dinámico de fuentes → §7, §11, E1
- [ ] Alternativas que no dependan solo del color → §7, §11
- [ ] Áreas táctiles de 44×44 pt y 48×48 dp, y hitSlop donde corresponda → §7, §11, E1
- [ ] Orden lógico de foco → §7, §11
- [ ] Retroalimentación háptica, auditiva y visual ante errores y cargas → §7, §11
- [ ] Matriz trazable: cada mejora del Corte 2, archivo o componente exacto y prueba realizada → §7, §11, docs/MATRIZ_ACCESIBILIDAD.md

Sección 4: Pruebas y validación
- [ ] Casos de prueba ejecutados: caminos felices y errores de red o validación (TC-01 a TC-23) con resultado real → §10, E8
- [ ] Pruebas automáticas ejecutadas (unitarias, componentes, contraste, RLS) → §10, E8 (evidencia parcial: 241 de 241 pruebas y 66 de 66 pares de contraste en docs/PRUEBAS.md, sección 1; supabase/tests/rls.sql validado solo en un PostgreSQL local: 79 de 82 con tres hallazgos, corregidos en la migración 0009, y luego 92 de 92 (TC-23). Falta aplicar 0009 y ejecutarlo en Supabase)
- [ ] Auditoría de accesibilidad en dispositivo (TalkBack y Accessibility Scanner) con resultados reales → §10, E8, docs/AUDITORIA_ACCESIBILIDAD.md
- [ ] Limitación declarada: iOS, VoiceOver y Accessibility Inspector no se probaron (solo Android) → §7.1, §11

Sección 5: Conclusiones, limitaciones y trabajo futuro
- [ ] Lecciones aprendidas y retos de ingeniería superados → §11
- [ ] Alcance logrado frente al planeado → §11
- [ ] Limitaciones reales → §11
- [ ] Hoja de ruta para futuras versiones → §11

## B. Funcionalidad y repositorio (30 %)

Aplicación
- [ ] Flujos principales de la Fase 1 funcionando de extremo a extremo → §5, §6, E2 a E7
- [ ] Operan en tiempo real (cupos, solicitudes, notificaciones, chat) → §5, E3, E5 a E7
- [ ] Cero datos simulados injustificados (solo los sectores sembrados) → §14, §13
- [ ] Cero crashes en los flujos de la demo → §13, E8
- [ ] Fidelidad visual con el Figma (20 pantallas) → §6, E1, E4 a E7
- [ ] Fluidez en animaciones y navegación, con respeto a "reducir animaciones" → §6, §7, E1, E8
- [ ] Atributos de accesibilidad aplicados de verdad en las pantallas → §7, E1, E4 a E7
- [ ] Estados de carga, vacío, error y sin conexión → §6, §7, E3, E5
- [ ] Los flujos de accesibilidad de la Fase 2 operan en la app → §7, E1

Repositorio
- [x] Estructura de carpetas limpia → §4, §9, E0 (evidencia: carpetas de la sección 4 en la raíz, sin src ni código de ejemplo; `npx expo-doctor` 20/20 el 2026-11-06)
- [ ] Código tipado (TypeScript estricto) y modularizado → §3, §4, §14
- [x] Cero credenciales o secretos en el historial → §9, §13, §14, E8 (evidencia: docs/AUDITORIA_REPOSITORIO.md, sección 1: patrones y valores reales del .env buscados en los 99 commits de todas las ramas, 0 coincidencias, el 2026-11-11 por Sara; sin gitleaks, declarado como limitación)
- [ ] Commits de ambos integrantes, continuos y equitativos a lo largo del corte → §0.2, §9, §13
- [ ] Pull requests revisados por la otra persona → §9
- [ ] README.md completo: instalación → §9, E9
- [ ] README.md: variables de entorno requeridas → §9, E9
- [ ] README.md: arquitectura del proyecto → §9, E9
- [ ] README.md: guía de ejecución → §9, E9
- [ ] README.md: resumen de las características de accesibilidad → §9, E9
- [ ] README reproducible desde un clon limpio, comprobado → §13, E8 (evidencia parcial: docs/AUDITORIA_REPOSITORIO.md, sección 2: clon limpio con install, typecheck, lint, 241 pruebas, contraste y bundle de Android correctos; se agregó "Preparar Supabase" al README. Falta abrir la app en Expo Go desde un clon y repetirlo con el README de la Etapa 9)

## C. Presentación y demo (10 %)

- [ ] Pitch: problema, solución construida, arquitectura y diferenciadores de accesibilidad → §12, E9
- [ ] Claridad y estructura del pitch, con material de apoyo de buena calidad visual → §12, E9
- [ ] Manejo del tiempo dentro del bloque estricto del profesor (hora y duración por confirmar) → §12
- [ ] Demo en vivo sobre dispositivo: flujo de negocio completo → §12
- [ ] Demo en vivo: navegación asistida con TalkBack y etiquetas semánticas → §12
- [ ] Demo en vivo: contraste y temas, áreas táctiles y respuesta de la interfaz → §12
- [ ] Plan B ante fallas de red o dispositivo → §12
- [ ] Ambos integrantes presentan → §12

## D. Defensa técnica individual (40 %)

- [ ] Cada integrante ubica cualquier componente o archivo en el repositorio → §12, docs/GUIA_DEFENSA.md
- [ ] Cada integrante explica línea por línea los archivos clave, también los del otro → §9 (revisión cruzada), §12
- [ ] Preparado: arquitectura de React Native y Expo Router → §12
- [ ] Preparado: manejo de estado (Redux Toolkit, thunks, selectores) → §12
- [ ] Preparado: consumo de APIs y base de datos (Supabase, RLS, RPC, Realtime) → §12
- [ ] Preparado: ciclo de vida de hooks y manejo de asincronía → §12
- [ ] Preparado: accessibilityRole, accessibilityLabel, manejo de foco, lineHeight y Pressable → §7.3, §12
- [ ] Preparado: decisiones documentadas de las Fases 1, 2 y 3 → docs/DECISIONES.md, §12
- [ ] 40 preguntas probables con respuesta modelo y 10 ejercicios de ajuste en vivo → §12
- [ ] Lista de "mis archivos" y "archivos del otro que debo dominar" por persona → §12

## E. Envío

- [ ] Meta interna: todo entregado la noche del 11/11/2026 → §13
- [ ] Fecha límite: 12/11/2026; la hora exacta debe confirmarse con el profesor (un minuto tarde no se acepta)
- [ ] Repositorio privado compartido con el profesor, o enlace entregado según indique el curso
- [ ] Documento y enlace del repositorio cargados en la plataforma del curso
- [ ] Definición de terminado cumplida → §13

## F. Accesibilidad: 26 compromisos del Corte 2

Cada ID queda con archivo exacto, prueba y resultado en docs/MATRIZ_ACCESIBILIDAD.md → §7, E1 y E4 a E8.

- [ ] S-01
- [ ] S-02
- [ ] S-03
- [ ] S-04
- [ ] S-05
- [ ] S-06
- [ ] S-07
- [ ] S-08
- [ ] S-09
- [ ] V-01
- [ ] V-02
- [ ] V-03
- [ ] V-04
- [ ] V-05
- [ ] V-06
- [ ] V-07
- [ ] V-08
- [ ] V-09
- [ ] T-01
- [ ] T-02
- [ ] T-03
- [ ] T-04
- [ ] T-05
- [ ] T-06
- [ ] T-07
- [ ] T-08
- [x] Pantalla de ajustes de accesibilidad (tema, alto contraste, escala de texto, reducir animaciones) → §6, §7, E1 (evidencia: app/settings/accessibility.tsx y __tests__/theme/ThemeProvider.test.tsx; la revisión con TalkBack está en docs/AUDITORIA_ACCESIBILIDAD.md, C-10, Pendiente)
- [ ] Plan de validación del Corte 2 ejecutado: pruebas con lector de pantalla, escalado, contraste y táctil (VoiceOver e Inspector declarados como no ejecutados) → §7.1, §10, E8

## G. Pila tecnológica y requisitos de las fases previas

- [x] React Native con Expo SDK 58, que abre en Expo Go → §3, E0 (evidencia: proyecto en SDK 58, bundle de Android compilado con `expo export` y Sara confirmó el 2026-11-06 que la app abre en Expo Go en su teléfono)
- [x] Navegación con Expo Router → §3, §4 (evidencia: app/_layout.tsx con guardia de sesión, app/index.tsx, app/(auth)/login.tsx, app/(auth)/register/*, app/(tabs)/* y app/profile.tsx)
- [x] Estado global con Redux Toolkit → §3, E3 (evidencia: store/store.ts con 9 slices en features/ y pruebas en __tests__/features/, 2026-11-07)
- [ ] Backend y persistencia en Supabase (Auth, Postgres, Realtime, Storage, RLS) → §3, §5, E2, E6, E7 (evidencia parcial: migraciones 0001 a 0008 listas con tests en supabase/tests/rls.sql; Samuel debe aplicar 0008 en su proyecto y confirmar)
- [x] Caché sin conexión con SQLite → §3, E3 (evidencia: db/cache.ts, __tests__/db/cache.test.ts y TC-17 aprobado en el teléfono)
- [x] Sesión guardada en almacenamiento seguro → §3, E3 (evidencia: services/secureSessionStorage.ts y TC-22 aprobado en el teléfono)
- [x] Mapas y ubicación sin claves de Google ni servicios de pago → §3, §6 (evidencia: components/maps/MapPicker.tsx, lib/location.ts y TC-07 aprobado en el teléfono)
- [ ] Regla de negocio: cierre automático de reservas cuando los cupos llegan a cero → §5, E2, E6 (evidencia parcial: RPC `aceptar_reserva` implementada en 0001 y protegida contra bypass en 0007; verificación funcional pendiente de aplicar en Supabase)
- [x] Verificación por código con correo institucional @unisabana.edu.co → §5 (R16), E4 (evidencia: app/(auth)/register/verify.tsx, lib/validators.ts y __tests__/lib/validators.test.ts)
- [ ] Todo funciona en Expo Go, sin módulos nativos ajenos → §3, §14
- [x] Créditos "By Sara y Samuel" en las pantallas del Figma → §6 (evidencia: components/ui/Logo.tsx en app/index.tsx, login.tsx y register/index.tsx, probado en __tests__/components/identity.test.tsx)
- [ ] Competidores y brechas de la Fase 1 reflejados en el producto → §1
