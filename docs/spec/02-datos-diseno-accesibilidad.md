## 5. Modelo de datos y reglas de negocio (Supabase / PostgreSQL)

Migraciones en supabase/migrations (0001_..., comentadas). Las reglas se aplican en la base de datos, no solo en la app.

Tablas:
- profiles: id (uuid, PK, FK a auth.users, on delete cascade), nombre, apellido, id_universidad (10 dígitos, único), email (único, termina en @unisabana.edu.co), telefono (10 dígitos), avatar_path, modo_actual ('pasajero' o 'conductor', por defecto 'pasajero'), registro_completo (boolean), created_at.
- sectores: id, nombre (único). Semilla en supabase/seed.sql (por ejemplo Colina, Calle 116, Usaquén, Calle 100, Cedritos, Chapinero, Suba, Niza, Chía, Cajicá, Zipaquirá). El Figma usa "Colina" y "Calle 116" como títulos de tarjeta.
- vehiculos: id, propietario_id (FK a profiles, único: un carro por conductor), placa (única, ^[A-Z]{3}[0-9]{3}$), capacidad (entero de 1 a 8, cupos de pasajeros), marca, modelo, foto_path, soat_path, created_at.
- viajes: id, conductor_id, vehiculo_id, sector_id, origen_texto, origen_lat, origen_lng, destino_texto, destino_lat, destino_lng, salida_at (timestamptz), valor_por_cupo (entero en COP, 0 o más), cupos_totales (de 1 hasta la capacidad), cupos_disponibles, estado ('abierto', 'lleno', 'en_curso', 'finalizado', 'cancelado'), created_at.
- reservas: id, viaje_id, pasajero_id, punto_recogida_texto, punto_lat, punto_lng, estado ('pendiente', 'aceptada', 'rechazada', 'cancelada'), created_at; único (viaje_id, pasajero_id).
- calificaciones: id, viaje_id, autor_id, destinatario_id, estrellas (1 a 5), comentario (máximo 280), created_at; único (viaje_id, autor_id, destinatario_id). Vista promedio_calificaciones (usuario_id, promedio, total).
- notificaciones: id, usuario_id, tipo, titulo, cuerpo, datos (jsonb), leida, created_at.
- mensajes: id, viaje_id, autor_id, contenido (máximo 500), created_at.

Reglas:
- R1 Solo se registran correos @unisabana.edu.co: bloquéalo en el servidor (hook o trigger de Auth si Supabase lo permite; verifica su documentación; si no, restricción CHECK en profiles) y también en la app.
- R2 Al crearse un usuario en Auth, un trigger crea su fila en profiles con los datos de raw_user_meta_data.
- R3 El modo conductor exige un carro registrado (función RPC cambiar_modo).
- R4 Crear viaje: solo conductores con carro; salida en el futuro; cupos_totales no mayor que la capacidad; valor de 0 o más.
- R5 Reservar (RPC crear_reserva): no puedes reservar tu propio viaje ni el mismo viaje dos veces; el viaje debe estar 'abierto', con cupos y con salida futura.
- R6 Aceptar (RPC aceptar_reserva, transaccional con bloqueo de fila, solo el conductor del viaje): descuenta un cupo; si cupos_disponibles llega a 0 el viaje pasa a 'lleno' (cierre automático de reservas) y deja de aparecer en la búsqueda. Rechazar (RPC rechazar_reserva).
- R7 Cancelar reserva (solo el pasajero): si estaba aceptada devuelve el cupo y el viaje 'lleno' vuelve a 'abierto'.
- R8 Ciclo del viaje: el conductor lo inicia ('en_curso', con al menos una reserva aceptada) y lo finaliza ('finalizado'); puede cancelarlo ('cancelado', cancela las reservas y notifica).
- R9 Calificar: solo con el viaje 'finalizado', entre el conductor y los pasajeros con reserva aceptada, una vez por par.
- R10 Chat: solo el conductor y los pasajeros con reserva aceptada, mientras el viaje no esté 'cancelado'.
- R11 Notificaciones: las crean triggers (nueva solicitud, reserva aceptada o rechazada, viaje iniciado, finalizado o cancelado, mensaje nuevo) y se leen por Realtime.
- R12 Storage: buckets privados avatars, vehiculos y soat con ruta {user_id}/archivo; el dueño escribe; avatars y vehiculos los leen usuarios autenticados; soat solo su dueño.
- R13 RLS activado en TODAS las tablas, sin acceso anónimo; funciones SECURITY DEFINER con search_path fijo; cada política lleva un comentario que explica quién puede qué.
- R14 Índices: viajes(estado, salida_at), viajes(sector_id), reservas(viaje_id), reservas(pasajero_id, estado), mensajes(viaje_id, created_at), notificaciones(usuario_id, leida).
- R15 Genera los tipos con `supabase gen types typescript` en types/database.ts y documenta cada función del cliente en docs/API_CONTRATOS.md (entrada, salida, errores).
- R16 Configuración manual de Auth (la hace el usuario en el panel; tú le das los pasos exactos en la Etapa 2): confirmación de correo por código de 6 dígitos (plantilla "Confirm signup" con el token), contraseña mínima de 6, SMTP propio (el SMTP por defecto de Supabase es muy limitado: verifícalo en su documentación y propón una alternativa gratuita) y creación de los buckets.
- R17 La semilla solo lleva datos ficticios (sectores). No crees usuarios con claves en el repositorio.

## 6. Diseño (Figma)

design/Work.png es el mapa completo (unas 30 pantallas con marcos de unos 440 pt de ancho). Ábrelo con tu lectura de imágenes (es muy grande: recórtalo por zonas con una herramienta) y respétalo. Si algo del Figma contradice la accesibilidad (sección 7), gana la accesibilidad y lo registras en docs/DECISIONES.md.

6.1 Tokens (theme/colors.ts, con tres temas verificados por script).
- Claro: primary #334259 (botones, bordes, diálogos, textos); onPrimary #FFFFFF; superficie #FFFFFF; bandaTitulo #C1C9D7; panel #B2BBC9; encabezadoTarjeta #A9ACB0 (solo con texto grande y en negrita de color primary); placeholder #5F6B7A; textoSecundarioSobrePrimary #E3E8F0; enlace #1A4FD6; fondo del signo "?" #AF0000 (con signo blanco); texto de error #B3261E; texto de éxito #1E7B34; check de éxito #3EE700 solo sobre primary.
- Oscuro: fondo #0F1623, superficie #1B2536, texto #F2F5FA, acento #9DB2D6, placeholder #A3AEC2, borde #7F8EA8.
- Alto contraste: fondo #FFFFFF, texto #000000, primary #1B2433, bordes de 2 px.
- Define todos los tokens en los tres temas y compruébalos con scripts/check-contrast.ts.

6.2 Tipografía: Noto Sans (la del Figma parece ser Noto Sans; si no coincide, avisa). Títulos de pantalla 24 a 28 en negrita; subtítulos 18 a 20 semibold; cuerpo y campos 16; secundario 14; etiquetas de la barra inferior 12 como mínimo; lineHeight de al menos 1,4 veces el tamaño; letterSpacing de 0 o más (el Figma usa espaciado negativo en los títulos: no lo copies).

6.3 Forma: botones y campos con radio de 4 a 6, tarjetas de 8 a 12, diálogos de 12; base de 4 pt. Botón principal relleno de primary con texto blanco; secundario con borde primary sobre blanco. Campos blancos con borde de 1 px (2 px al enfocar). Todo control mide 48 como mínimo (TOUCH_MIN) aunque el Figma lo dibuje de 31 a 42.

6.4 Estructura común de las pantallas internas: encabezado blanco con el logo a la izquierda y el botón de perfil (avatar circular gris claro con ícono de persona) a la derecha; debajo, el selector Pasajero/Conductor (píldora centrada con segmentos de persona y carro, con texto visible); banda de título #C1C9D7 con el título centrado en negrita; zona de contenido #B2BBC9; barra inferior blanca de tres pestañas con ícono y etiqueta (Inicio, Reservas o Creados, Curso), la activa subrayada. Diálogos: tarjeta primary centrada con ícono arriba, título blanco en negrita, texto secundario y dos botones (uno blanco relleno y otro con borde blanco).

6.5 Logo (components/ui/Logo.tsx): el texto "Campus" + "G" + un pin de ubicación en lugar de la "O" (SVG con react-native-svg: relleno primary y círculo interior blanco), en Noto Sans negrita de color primary, y debajo a la derecha "By Sara y Samuel" en tamaño pequeño. Recréalo; no uses imágenes del Figma. Dos tamaños: grande (bienvenida y autenticación) y pequeño (encabezado).

6.6 Íconos (@expo/vector-icons): casa (Inicio), mapa con pin (Reservas o Creados), camino (Curso), persona, carro, lupa, papelera, lápiz, power (cerrar sesión), más, subir archivo, ubicación, calendario, reloj, asiento y moneda.

6.7 Pantallas (cada una con estados de carga, vacío y error):
1. Bienvenida: logo grande centrado; botón "Iniciar Sesión" (relleno) y "Registrarse" (con borde).
2. Inicio de sesión: título "Inicio Sesión"; campos "Correo electrónico" y "Contraseña" (con botón mostrar u ocultar); botón "Iniciar Sesión"; "¿No tienes una cuenta?" con el enlace "Regístrate". Error de inicio: la pantalla del diseño (ícono de error, "ERROR", mensaje y botón "Volver") pero con el mensaje específico (credenciales incorrectas, correo sin verificar, sin conexión) anunciado por el lector de pantalla.
3. Registro, paso 1: título "Registro"; Nombre y Apellido en una fila, "ID de la Universidad", "Correo Electrónico", "Teléfono" y "Contraseña"; botón "Registrarse"; "¿Ya tienes una cuenta?" con el enlace "Inicia Sesión". Validaciones con el error en texto bajo cada campo: ID de exactamente 10 dígitos; correo válido y de @unisabana.edu.co; teléfono de exactamente 10 dígitos; contraseña de al menos 6 caracteres.
4. Verifica tu correo (pantalla nueva con el mismo estilo): campo del código de 6 dígitos (se puede pegar y autocompletar), botón "Verificar" y "Reenviar código" con la espera visible.
5. "Agrega tu foto": avatar circular con botón "+" que abre la galería o la cámara; "Anterior" y "Siguiente" (la foto es opcional).
6. "¿Quieres Registrar un Carro?": opciones "No" y "Si" (radios) y "Siguiente". Con "No" entra a la app en modo pasajero.
7. "¡Registra tu carro!": "Placa" (3 letras y 3 números), "Cupos vehículo" (entero), "Marca" y "Modelo"; "Siguiente".
8. "¡Agrega una foto de tu carro!": zona de carga con ícono de subir; "Anterior" y "Siguiente".
9. "¡Agrega una foto de tu SOAT vigente!": igual; "Anterior" y "¡Listo!". Todas las pantallas del registro muestran "Paso x de y".
10. Inicio de pasajero: encabezado y selector (pasajero activo); banda "¡Buen viaje {Nombre}!" con los filtros: lista desplegable "Sectores" (datos reales de la tabla sectores) y campo numérico "Cantidad de puestos disponibles" con lupa; lista de tarjetas de viaje (título = sector, por ejemplo "Colina"; líneas "Conductor:", "Desde:", "Para:", "Hora salida:", "Valor:", "Cupos:" y la calificación promedio del conductor; botón circular "+" abajo a la derecha que abre la reserva).
11. "Reserva tu viaje": tarjeta primary con "Selecciona el punto de recogida", mapa real (react-native-maps, se elige tocando), campo "Describe la dirección del punto de recogida" (se rellena con geocodificación inversa) y botón "Reservar".
12. "Reserva realizada con éxito": tarjeta con check verde, "Tu reserva quedó pendiente de la confirmación del conductor." (el Figma dice "confirmada"; se ajusta porque el conductor debe aceptar) y botón "¡Listo!".
13. "Viajes reservados" (pestaña Reservas): pestañas internas Pendientes, Aceptados y Rechazados (la activa con subrayado y negrita); tarjetas como las de inicio con papelera en el encabezado para cancelar; diálogo "¿Está seguro que desea cancelar esta reserva?" con "Sí, cancelar reserva" y "No, volver".
14. "Viajes en curso" (pestaña Curso): el pasajero ve sus reservas aceptadas de viajes en curso (con acceso al chat); el conductor ve sus viajes en curso con el botón "Finalizar viaje". Estado vacío con texto claro.
15. Perfil (botón del encabezado): tarjeta primary con avatar, nombre completo, "ID universidad", "Correo electrónico" y "Teléfono" (solo lectura); lápiz para editar (diálogo con Nombre, Apellido y Teléfono, y los botones "Cancelar" y "Guardar"); "Cerrar Sesión" con ícono de power (con diálogo de confirmación); y debajo el selector "Pasajero | Carro" que alterna entre el perfil y el perfil del carro (placa como título, "Capacidad del vehículo", "Marca", "Modelo", papelera para eliminar con el diálogo "¿Está seguro de que desea eliminar este carro?" y "Esta acción no se puede deshacer.", o el botón "Registrar Carro" si no hay carro). Desde aquí también se accede a Notificaciones y a Ajustes de accesibilidad.
16. Cambio de modo: diálogo "¿Está seguro que desea cambiar a modo Conductor?" con "Esta acción afectará la manera en que usa la app."; sin carro, el diálogo "No tienes un carro registrado. Debes registrar un carro para cambiar a modo conductor" que lleva al registro del carro.
17. Inicio de conductor: banda "¡Buen viaje {Nombre}!"; tarjeta primary "Crea un viaje" con botón "+" que abre la creación; tarjeta primary "Viajes Pendientes" con "Ver más", que lleva a requests (solicitudes de reserva con los botones "Aceptar reserva" y "Rechazar reserva").
18. "Crea tu viaje": mapa real para elegir origen y destino; tarjeta "Datos del viaje" con "Punto de partida", "Punto de llegada", fecha (DD/MM/AA), hora, cupos, valor por cupo en COP y sector; botón "¡Listo!". El diseño muestra "Por favor, complete todos los campos requeridos.": mejóralo con un error por campo y un resumen que nombre los campos faltantes. Éxito: "Viaje realizado con éxito. Tu viaje ha sido creado. ¡Maneja con cuidado!" y "¡Listo!".
19. "Viajes creados" (pestaña Creados): viajes del conductor con su estado y acciones (Iniciar viaje, Cancelar viaje, abrir chat) y las solicitudes de cada uno.
20. Pantallas que NO están en el Figma y que diseñas tú con los mismos tokens, componentes y patrones: Notificaciones (bandeja y marcar como leída), Chat del viaje, Calificar viaje (cinco estrellas accesibles, comentario opcional) y Ajustes de accesibilidad.

## 7. Accesibilidad (propuesta aprobada del Corte 2)

7.1 Estándar: WCAG 2.1 y 2.2 nivel AA aplicado a móvil, más el umbral táctil del curso (44×44 pt en iOS y 48×48 dp en Android). El equipo solo tiene Android: las pruebas en dispositivo se hacen con TalkBack y Accessibility Scanner. Las propiedades específicas de iOS (accessibilityViewIsModal, accessibilityElementsHidden, onAccessibilityEscape, accessibilityLanguage) se implementan igual y se cubren con pruebas unitarias; VoiceOver y Accessibility Inspector quedan como "no ejecutados por falta de dispositivo" y se declara en la auditoría.

7.2 Los 26 compromisos. Cada uno debe quedar implementado, probado y trazado en docs/MATRIZ_ACCESIBILIDAD.md (ID, mejora prometida, archivo y líneas donde se implementó, prueba y resultado). El texto completo está en docs/PROPUESTA_ACCESIBILIDAD_CORTE2.md.

Semántica para lectores de pantalla:
- S-01 accessibilityRole correcto en cada elemento interactivo y en los títulos (button, link, header, radio, tab, tablist, search) con Button, IconButton y ScreenTitle.
- S-02 accessibilityLabel en español en todo ícono sin texto (perfil, +, lupa, papelera, lápiz, cerrar sesión), sin repetir el rol; accessibilityHint solo si el resultado no es obvio; íconos decorativos ocultos (importantForAccessibility="no" y accessibilityElementsHidden).
- S-03 Selector Pasajero/Conductor como radiogroup con dos radio y accessibilityState checked; etiqueta "Modo pasajero, seleccionado"; texto visible.
- S-04 TripCard como un solo foco: Pressable con accessible, role button y etiqueta compuesta ("Colina. Conductor Miguel Ordóñez. Sale 7:00 a. m. Valor 5.000 pesos. 2 cupos."); el "+" visual no es otro foco.
- S-05 Formularios: TextField con accessibilityLabel, accessibilityHint con el formato ("10 dígitos"), autoComplete, textContentType e inputMode; error en texto bajo el campo; reglas: ID de 10 dígitos, teléfono de 10, contraseña de al menos 6, placa de 3 letras y 3 números, capacidad numérica.
- S-06 accessibilityState: selected (pestañas internas y barra inferior), disabled, busy y checked.
- S-07 Mensajes dinámicos sin mover el foco: accessibilityLiveRegion (Android) y AccessibilityInfo.announceForAccessibility (iOS), con hooks/useAnnounce.ts.
- S-08 Diálogos modales: Modal con accessibilityViewIsModal, foco inicial en el título (AccessibilityInfo), onAccessibilityEscape y retorno del foco al botón que lo abrió.
- S-09 Alternativas textuales: mapa con etiqueta y alternativa escrita (los campos de dirección); zonas de foto con etiqueta, pista y estado "foto cargada"; logo como una sola imagen con etiqueta "CampusGo, by Sara y Samuel", oculto en las pantallas internas.

Diseño visual, contraste y tipografía adaptativa:
- V-01 Tokens con contraste verificado por script: `npm run a11y:contrast` falla si un par de texto queda bajo 4,5:1 o uno de interfaz bajo 3:1, en los tres temas.
- V-02 Placeholder #5F6B7A (5,43:1) y etiqueta visible persistente sobre cada campo; el placeholder nunca es la única etiqueta.
- V-03 Controles sobre azul: texto #E3E8F0 sobre #334259 (8,27:1); selector de modo con segmento activo blanco e ícono azul, e inactivo azul e ícono blanco, con texto visible.
- V-04 Íconos de estado y de subida con al menos 3:1: "?" blanco dentro de un círculo #AF0000; ícono de subir foto #334259 sobre blanco.
- V-05 No depender solo del color: error = ícono + texto + borde de 2 px; éxito = ícono + texto; selección = subrayado o relleno + negrita + accessibilityState.
- V-06 Escalado de fuente: allowFontScaling activo, maxFontSizeMultiplier de 2 en el contenido, sin alturas fijas en textos (minHeight y padding), tamaños mínimos 16 (cuerpo y campos), 14 (secundario) y 12 (barra inferior); revisado a 200 %.
- V-07 lineHeight de al menos 1,4 veces el fontSize en todo estilo de texto (para no recortar tildes, Ñ, ¿ y ¡) y letterSpacing de 0 o más.
- V-08 Temas claro, oscuro y alto contraste en settings/accessibility: tema (Sistema, Claro, Oscuro, Alto contraste), tamaño de texto (Sistema, Grande, Extra grande), reducir movimiento y vibración; las preferencias persisten.
- V-09 Respeto a reducir movimiento: AccessibilityInfo.isReduceMotionEnabled con listener (hooks/useReduceMotion.ts); sin animación o con un fundido corto.

Ergonomía táctil y navegación:
- T-01 TOUCH_MIN = Platform.select({ ios: 44, default: 48 }) en theme/layout.ts, usado como minHeight y minWidth en Button, IconButton, TextField, radios y SegmentedToggle.
- T-02 hitSlop para completar el área de los íconos pequeños (lupa, papelera, lápiz, cerrar) y al menos 8 dp entre objetivos vecinos.
- T-03 Orden de foco igual al visual; returnKeyType="next" con refs; al cambiar de pantalla o de paso el foco va al título (hooks/useScreenFocus.ts); KeyboardAvoidingView para que el campo enfocado no quede tapado; borde de foco de 2 px visible con teclado externo.
- T-04 Retroalimentación multimodal: expo-haptics (notificationAsync) + mensaje con ícono y texto + anuncio del lector; interruptor de vibración en Ajustes (hooks/useHaptics.ts).
- T-05 Carga y errores de red: ActivityIndicator con texto, accessibilityState busy, botón deshabilitado mientras envía y mensaje de error con "Reintentar".
- T-06 Confirmaciones destructivas explícitas ("Sí, cancelar reserva" y "No, volver"), con el foco inicial en la opción segura; el mismo patrón al eliminar el carro, cerrar sesión y cambiar a modo conductor.
- T-07 Sin gestos complejos (todo con un toque); el punto de recogida se elige tocando el mapa o escribiendo la dirección; acciones principales en la mitad inferior de la pantalla.
- T-08 Registro con "Paso x de y"; "Anterior" conserva lo escrito; autocompletado en correo y contraseña; contraseña y código pegables; botón accesible "Mostrar contraseña"; sin CAPTCHA ni pruebas de memoria.

7.3 Reglas de implementación (salen de la Fase 3):
- Usa Pressable (no TouchableOpacity) para todo lo táctil, con accessibilityRole, accessibilityLabel y accessibilityState explícitos y un estado visual de presionado.
- TypeScript lo obliga: IconButton exige accessibilityLabel, Button exige texto o label, TextField exige label.
- Agrupa los contenedores táctiles (accessible en el contenedor) para evitar focos fragmentados.
- Cada Text define lineHeight y ningún Text ni TextInput usa altura fija.
- No dependas solo del color: ícono + texto.
- Cada pantalla tiene un título con accessibilityRole="header" que recibe el foco al entrar.
- Todo mensaje dinámico (error, éxito, carga, mensaje nuevo, notificación) se anuncia con useAnnounce.
- Toda acción destructiva pasa por ConfirmDialog.
- Las etiquetas y pistas van en español, sin incluir el rol ("botón"), y con accessibilityLanguage="es" donde aplique.
