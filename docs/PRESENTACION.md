# Presentación y demo — CampusGo

Duración por defecto: **12 minutos**. Si el profesor fija otro bloque, se recorta primero la sección 3 y nunca la demo. Hablan los dos. El reparto de abajo es una propuesta: Sara y Samuel lo ajustan antes de ensayar.

## 1. Guion con tiempos

| Min. | Parte | Quién | Qué se dice (puntos clave) |
| --- | --- | --- | --- |
| 0:00 – 1:00 | Problema | Samuel | Muchos estudiantes viven fuera del campus y gastan entre 100.000 y 200.000 COP al mes en taxis o buses irregulares. Ya existe "Wheels" por WhatsApp: hay demanda, pero no hay plataforma, reglas ni seguridad |
| 1:00 – 3:00 | Solución y diferenciadores | Samuel | CampusGo: red cerrada `@unisabana.edu.co`, sin comisiones, cierre automático de cupos, tiempo real, sin conexión y accesible. Comparación con Uber/Didi, BlaBlaCar y TRIBBU (tabla del documento, sección 1.2) |
| 3:00 – 5:00 | Arquitectura | Sara | Diagrama de extremo a extremo: Expo Router → Redux Toolkit (thunks) → servicios → Supabase (Auth, PostgreSQL con RLS, Realtime, Storage) y SQLite. Las reglas viven en la base: `aceptar_reserva` con bloqueo de fila. La prueba de RLS encontró tres huecos y la migración 0009 los cerró (de 79 de 82 a 92 de 92) |
| 5:00 – 7:00 | Accesibilidad | Sara | 26 compromisos del Corte 2, trazados archivo por archivo. Etiqueta obligatoria por tipos, `TOUCH_MIN` de 48 dp, contraste verificado por script en tres temas, `lineHeight` de 1,4. Auditoría con TalkBack: 45 filas aprobadas y Accessibility Scanner sin avisos |
| 7:00 – 11:00 | Demo en vivo | Sara maneja el teléfono, Samuel narra | Ver la sección 3 |
| 11:00 – 12:00 | Cierre y trabajo futuro | Samuel | Limitaciones honestas: verificación del correo apagada (D-68), solo Android, sin pagos. Hoja de ruta: SSO institucional, push con *development build*, rutas recurrentes |

## 2. Diapositivas

Sin imágenes inventadas: solo capturas reales de la app tomadas por el equipo y los diagramas de `docs/img/`.

| # | Título | Contenido |
| --- | --- | --- |
| 1 | CampusGo | Logo, lema "Conectando estudiantes, compartiendo trayectos", nombres, curso y profesor |
| 2 | El problema | Gasto mensual en transporte, "Wheels" por WhatsApp, congestión. Personas: Valentina, Andrés, Camila, Julián y Mariana |
| 3 | La solución | Qué hace en modo pasajero y en modo conductor (tabla del README); captura de Inicio |
| 4 | Frente a la competencia | Tabla comparativa con Uber/Didi, BlaBlaCar y TRIBBU (documento, sección 1.2) |
| 5 | Arquitectura | `docs/img/arquitectura.png` y el flujo pantalla → thunk → servicio → Supabase → reducer → selector |
| 6 | Datos y reglas | `docs/img/modelo-datos.png`; cierre automático con `docs/img/flujo-reserva.png` |
| 7 | Seguridad | RLS en todas las tablas; 92 de 92; los tres hallazgos y cómo se corrigieron |
| 8 | Accesibilidad | Los tres grupos (semántica, visual y táctil) con un ejemplo de código de cada uno (`IconButton` con `accessibilityLabel` obligatorio, `TOUCH_MIN`, `lineHeight`) |
| 9 | Pruebas | 259 pruebas automáticas, TC-01 a TC-23 aprobados, auditoría con TalkBack, 66 de 66 pares de contraste |
| 10 | Demo | (en vivo) |
| 11 | Limitaciones y futuro | D-68, iOS, pagos y push; hoja de ruta |
| 12 | Gracias | Repositorio y preguntas |

## 3. Guion de la demo (4 minutos, Android con Expo Go)

**Antes de empezar:**
- Metro corriendo y la app cargada.
- Brillo alto y "Mostrar toques" encendido.
- Tema Claro y fuente normal.
- Dos cuentas listas: P (pasajera sin carro) y C (conductora con carro).
- Un viaje de C abierto con **1 cupo**.
- TalkBack apagado, con el atajo de las teclas de volumen configurado.

| Tiempo | Paso | Qué se muestra |
| --- | --- | --- |
| 0:00 | Con P, Inicio: filtrar por sector | Búsqueda real en Supabase; tarjeta con sector, conductor, hora, valor, cupos y calificación |
| 0:30 | Reservar: tocar el mapa | La dirección se llena sola; "Reserva realizada con éxito" con vibración |
| 1:00 | Cerrar sesión y entrar con C: "Ver más" > "Aceptar reserva" | El viaje pasa a "Lleno" y desaparece de la búsqueda (cierre automático) |
| 1:45 | Activar TalkBack (teclas de volumen). Recorrer Inicio | Se oyen "Inicio, encabezado", el selector "Modo conductor, marcado" y la tarjeta leída como un solo foco |
| 2:30 | Con TalkBack, abrir "Crea tu viaje" y tocar "¡Listo!" vacío | Anuncia "Revisa los campos con error: …"; error en texto, ícono y borde bajo cada campo |
| 3:00 | Apagar TalkBack. Ajustes de accesibilidad: Alto contraste y luego Oscuro | Bordes de 2 px y contraste alto; tema oscuro |
| 3:30 | Fuente del teléfono al máximo | Nada se corta; las tildes y la Ñ se ven completas |
| 3:50 | Volver a tema Claro y fuente normal | — |

## 4. Plan B

- **Sin internet:** abrir la app con datos ya cargados y activar el modo avión para mostrar la caché y el banner "Sin conexión: mostrando datos guardados". Esto es parte de las pruebas (TC-17).
- **Si Expo Go falla:** usar las grabaciones de pantalla de respaldo hechas por el equipo antes de la presentación (pendiente: grabarlas con el teléfono real).
- **Si TalkBack no responde:** mostrar el recorrido grabado y la tabla de resultados de `docs/AUDITORIA_ACCESIBILIDAD.md`.

## 5. Antes del día

- [ ] Ensayar con cronómetro dos veces.
- [ ] Grabar el video de respaldo de la demo (pantalla del teléfono con audio de TalkBack).
- [ ] Revisar que el viaje de demostración tenga salida futura ese día.
- [ ] Repasar `docs/GUIA_DEFENSA.md`: cada uno, sus archivos y los del otro.
