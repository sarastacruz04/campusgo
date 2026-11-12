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
- [x] Casos de prueba ejecutados: caminos felices y errores de red o validación (TC-01 a TC-23) con resultado real → §10, E8 (evidencia: docs/PRUEBAS.md, sección 2.2: TC-01 a TC-23 aprobados en el teléfono de Sara entre el 2026-11-11 y el 12, con las corridas fallidas y sus correcciones registradas (TC-03, TC-05, TC-10 y TC-01 por el SMTP))
- [x] Pruebas automáticas ejecutadas (unitarias, componentes, contraste, RLS) → §10, E8 (evidencia: 246 de 246 pruebas y 66 de 66 pares de contraste en docs/PRUEBAS.md, sección 1; supabase/tests/rls.sql ejecutado por Sara en Supabase el 2026-11-11 con las migraciones 0001 a 0009: 92 de 92 (TC-23, paso 1). Antes, en local, había dado 79 de 82 con tres hallazgos corregidos en la 0009)
- [x] Auditoría de accesibilidad en dispositivo (TalkBack y Accessibility Scanner) con resultados reales → §10, E8, docs/AUDITORIA_ACCESIBILIDAD.md (evidencia: docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12: F1 a F6 con TalkBack (45 filas aprobadas, F1-08 no aplica, F3-05 no ejecutada) y VA-01 a VA-08 aprobadas, Accessibility Scanner sin avisos)
- [x] Limitación declarada: iOS, VoiceOver y Accessibility Inspector no se probaron (solo Android) → §7.1, §11 (evidencia: docs/AUDITORIA_ACCESIBILIDAD.md, "Alcance y limitaciones")

Sección 5: Conclusiones, limitaciones y trabajo futuro
- [ ] Lecciones aprendidas y retos de ingeniería superados → §11
- [ ] Alcance logrado frente al planeado → §11
- [ ] Limitaciones reales → §11
- [ ] Hoja de ruta para futuras versiones → §11

## B. Funcionalidad y repositorio (30 %)

Aplicación
- [x] Flujos principales de la Fase 1 funcionando de extremo a extremo → §5, §6, E2 a E7 (evidencia: TC-01 a TC-23 aprobados con datos reales de Supabase)
- [x] Operan en tiempo real (cupos, solicitudes, notificaciones, chat) → §5, E3, E5 a E7 (evidencia: TC-12, TC-13 y TC-16 aprobados; V5-01 a V5-03 en la sección 3 de docs/PRUEBAS.md)
- [x] Cero datos simulados injustificados (solo los sectores sembrados) → §14, §13 (evidencia: la app lee todo de Supabase; los únicos datos sembrados son los sectores (supabase/seed.sql) y los viajes de prueba de supabase/dev_seed_viajes.sql, que solo se cargan para pruebas (D-67); los simulados están solo dentro de __tests__)
- [x] Cero crashes en los flujos de la demo → §13, E8 (evidencia: ningún cierre de la app en TC-01 a TC-23 ni en F1 a F6 (reportes de Sara, 2026-11-11 y 12))
- [ ] Fidelidad visual con el Figma (20 pantallas) → §6, E1, E4 a E7
- [x] Fluidez en animaciones y navegación, con respeto a "reducir animaciones" → §6, §7, E1, E8 (evidencia: VA-04 aprobada (reducir animaciones) y R-01 (V5-04))
- [x] Atributos de accesibilidad aplicados de verdad en las pantallas → §7, E1, E4 a E7 (evidencia: docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12, F1 a F6)
- [x] Estados de carga, vacío, error y sin conexión → §6, §7, E3, E5 (evidencia: TC-17 y TC-18 aprobados; pruebas de pantalla en __tests__/screens)
- [x] Los flujos de accesibilidad de la Fase 2 operan en la app → §7, E1 (evidencia: docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12 y docs/MATRIZ_ACCESIBILIDAD.md)

Repositorio
- [x] Estructura de carpetas limpia → §4, §9, E0 (evidencia: carpetas de la sección 4 en la raíz, sin src ni código de ejemplo; `npx expo-doctor` 20/20 el 2026-11-06)
- [x] Código tipado (TypeScript estricto) y modularizado → §3, §4, §14 (evidencia: tsconfig con strict; `npm run typecheck` y `npm run lint` pasan en cada commit)
- [x] Cero credenciales o secretos en el historial → §9, §13, §14, E8 (evidencia: docs/AUDITORIA_REPOSITORIO.md, sección 1: patrones y valores reales del .env buscados en los 99 commits de todas las ramas, 0 coincidencias, el 2026-11-11 por Sara; sin gitleaks, declarado como limitación)
- [ ] Commits de ambos integrantes, continuos y equitativos a lo largo del corte → §0.2, §9, §13 (nota: Samuel no tiene commits en la Etapa 8 (no pudo por parciales); la Etapa 8 completa la hizo Sara. No se atribuye trabajo a quien no lo hizo)
- [ ] Pull requests revisados por la otra persona → §9 (nota: los PR de las etapas 0 a 7 se revisaron entre los dos; los de la Etapa 8 (PR #10 a #12 y el de resultados) los revisó y unió Sara, porque Samuel no estaba disponible)
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

- [x] S-01 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] S-02 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] S-03 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] S-04 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] S-05 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] S-06 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] S-07 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md; aprobado en lo ejecutado, F3-05 sin ejecutar con TalkBack)
- [x] S-08 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] S-09 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] V-01 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] V-02 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] V-03 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] V-04 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] V-05 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] V-06 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] V-07 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] V-08 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] V-09 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] T-01 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] T-02 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] T-03 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] T-04 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] T-05 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md; aprobado en lo ejecutado, F3-05 sin ejecutar con TalkBack)
- [x] T-06 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] T-07 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] T-08 (evidencia: docs/MATRIZ_ACCESIBILIDAD.md y docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12)
- [x] Pantalla de ajustes de accesibilidad (tema, alto contraste, escala de texto, reducir animaciones) → §6, §7, E1 (evidencia: app/settings/accessibility.tsx y __tests__/theme/ThemeProvider.test.tsx; revisión en el teléfono: C-10 y VA-01 a VA-03 aprobadas en docs/AUDITORIA_ACCESIBILIDAD.md)
- [x] Plan de validación del Corte 2 ejecutado: pruebas con lector de pantalla, escalado, contraste y táctil (VoiceOver e Inspector declarados como no ejecutados) → §7.1, §10, E8 (evidencia: docs/AUDITORIA_ACCESIBILIDAD.md, ejecutada por Sara el 2026-11-12; VoiceOver e Inspector de iOS declarados como no ejecutados)

## G. Pila tecnológica y requisitos de las fases previas

- [x] React Native con Expo SDK 58, que abre en Expo Go → §3, E0 (evidencia: proyecto en SDK 58, bundle de Android compilado con `expo export` y Sara confirmó el 2026-11-06 que la app abre en Expo Go en su teléfono)
- [x] Navegación con Expo Router → §3, §4 (evidencia: app/_layout.tsx con guardia de sesión, app/index.tsx, app/(auth)/login.tsx, app/(auth)/register/*, app/(tabs)/* y app/profile.tsx)
- [x] Estado global con Redux Toolkit → §3, E3 (evidencia: store/store.ts con 9 slices en features/ y pruebas en __tests__/features/, 2026-11-07)
- [x] Backend y persistencia en Supabase (Auth, Postgres, Realtime, Storage, RLS) → §3, §5, E2, E6, E7 (evidencia: migraciones 0001 a 0009 aplicadas; RLS 92 de 92 (TC-23); TC-01 a TC-22 aprobados con Auth, Postgres, Realtime y Storage reales)
- [x] Caché sin conexión con SQLite → §3, E3 (evidencia: db/cache.ts, __tests__/db/cache.test.ts y TC-17 aprobado en el teléfono)
- [x] Sesión guardada en almacenamiento seguro → §3, E3 (evidencia: services/secureSessionStorage.ts y TC-22 aprobado en el teléfono)
- [x] Mapas y ubicación sin claves de Google ni servicios de pago → §3, §6 (evidencia: components/maps/MapPicker.tsx, lib/location.ts y TC-07 aprobado en el teléfono)
- [x] Regla de negocio: cierre automático de reservas cuando los cupos llegan a cero → §5, E2, E6 (evidencia: TC-12 aprobado en el teléfono (el viaje pasa a "Lleno" y sale de la búsqueda))
- [ ] Verificación por código con correo institucional @unisabana.edu.co → §5 (R16), E4 (nota: implementada (app/(auth)/register/verify.tsx, verifyOtp), pero apagada desde D-68 porque el SMTP no entregaba los correos; el dominio @unisabana.edu.co se sigue validando en la app y en la base (TC-05))
- [x] Todo funciona en Expo Go, sin módulos nativos ajenos → §3, §14 (evidencia: todas las pruebas de la Etapa 8 se hicieron en Expo Go SDK 58; npx expo-doctor 20 de 20)
- [x] Créditos "By Sara y Samuel" en las pantallas del Figma → §6 (evidencia: components/ui/Logo.tsx en app/index.tsx, login.tsx y register/index.tsx, probado en __tests__/components/identity.test.tsx)
- [ ] Competidores y brechas de la Fase 1 reflejados en el producto → §1
