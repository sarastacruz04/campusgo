# Auditoría de accesibilidad en dispositivo — CampusGo

La revisión del catálogo (Etapa 1) la ejecutó Sara Santacruz. El protocolo de la Etapa 8 (abajo) también lo ejecuta Sara. Ningún resultado se escribe sin haberlo ejecutado en el teléfono.

## Alcance y limitaciones

- Dispositivos: solo Android (el equipo no tiene iPhone).
- No ejecutados por falta de dispositivo: VoiceOver y Accessibility Inspector de iOS. Las propiedades específicas de iOS (accessibilityViewIsModal, accessibilityElementsHidden, onAccessibilityEscape, accessibilityLanguage) se cubren con pruebas unitarias.

## Revisión del catálogo (Etapa 1)

Objetivo: comprobar en un Android real que los componentes base cumplen antes de usarlos en pantallas. Lo ejecuta Sara (o Samuel) y escribe aquí el resultado real.

Preparación:
1. `npx expo start` y abrir la app en Expo Go SDK 58. En la pantalla inicial tocar "Catálogo de componentes" (solo aparece en desarrollo).
2. Activar TalkBack: Ajustes del teléfono > Accesibilidad > TalkBack > activar (o mantener las dos teclas de volumen 3 segundos si el atajo está configurado). Gestos: deslizar a la derecha o a la izquierda para pasar de elemento; doble toque para activar; deslizar hacia abajo y luego a la izquierda para "Atrás".
3. Instalar Accessibility Scanner desde Google Play, activarlo y tocar el botón flotante sobre el catálogo.

Primera ronda: ejecutada por Sara Santacruz el 2026-11-06 en un teléfono Android con TalkBack en español. Teléfono: Samsung Galaxy A35 5G con Android 16.

Nota sobre la redacción de TalkBack: según la versión, TalkBack dice "botón de selección" para un radio, "se marcó el elemento…" o "marcado" para el estado checked, "seleccionado" para selected, y agrega al final la pista estándar "tocar dos veces para activar" o "para alternar". Eso es lo esperado. Por eso C-03, C-04 y C-09 se reclasificaron de Fallido a Aprobado: el resultado real anotado por Sara no cambia, cambia la lectura del criterio, que estaba redactado con frases demasiado literales.

| # | Qué hacer | Qué debe pasar | Tema | Resultado real | Estado |
| --- | --- | --- | --- | --- | --- |
| C-01 | Entrar al catálogo con TalkBack activo | El foco cae solo en el título y se oye "Catálogo de componentes, encabezado" (S-01, T-03) | Claro | Se oyó "Catálogo de componentes, encabezado" | Aprobado |
| C-02 | Recorrer el encabezado | "Volver, botón"; "Perfil, botón"; el logo pequeño no recibe foco (S-02, S-09) | Claro | Entre el perfil y el logo, solo vibra pero no se mueve ni dice nada. Al deslizar hacia atrás desde "Perfil" nunca se oye "Volver" | Fallido. Corregido en ui/Logo.tsx; aprobado en C-02b |
| C-03 | Recorrer el selector de modo y cambiarlo | Se oye el nombre ("Modo pasajero"), el rol de radio ("botón de selección" o "botón de opción") y el estado marcado solo en la opción activa; doble toque cambia (S-03) | Claro | En pasajero dice "se marcó el elemento Modo pasajero, botón de selección, tocar dos veces para alternar" y en conductor "Modo conductor, botón de selección, tocar dos veces para alternar" | Aprobado (reclasificado) |
| C-04 | Recorrer los íconos de la sección Botones | Cada uno se oye con su nombre (Reservar viaje, Buscar viajes, Cancelar reserva, Editar perfil, Cerrar sesión) y el rol botón, sin "botón sin etiqueta" (S-02) | Claro | En todos dice el nombre del ícono y al final "botón, tocar dos veces para activar" | Aprobado (reclasificado) |
| C-05 | Tocar "Iniciar Sesión" | Se oye "Enviando", el botón queda deshabilitado con indicador y luego vibra y se oye "Envío terminado" (T-04, T-05) | Claro | Sí sucede | Aprobado |
| C-06 | Escribir 3 dígitos en "ID de la Universidad" | Aparece y se anuncia el error sin mover el foco; borde de 2 px e ícono (S-05, S-07, V-05) | Claro | Al escribir 354 TalkBack dice "354 reemplazó 354, 354" y no lee el error. El mensaje, el ícono y el borde rojo grueso sí se ven en pantalla | Fallido (solo el anuncio). Ver C-06b y C-06c |
| C-07 | En la contraseña, usar "Mostrar contraseña" | Cambia a "Ocultar contraseña" y el texto se ve (T-08) | Claro | Sí sucede | Aprobado |
| C-08 | Abrir "Diálogo de confirmación" | Foco en el título; siguiente elemento "No, volver"; gesto Atrás lo cierra y el foco vuelve al botón que lo abrió (S-08, T-06) | Claro | Sí sucede | Aprobado |
| C-09 | Recorrer la barra inferior | La pestaña activa se anuncia como seleccionada ("seleccionado" o "seleccionada"); las otras no (S-06) | Claro | Recorriendo Inicio dice "seleccionado, Inicio, pestaña, tocar dos veces para activar" | Aprobado (reclasificado) |
| C-10 | Cambiar a Oscuro y a Alto contraste en la sección Tema y repetir C-02 a C-09 | Todo legible; en alto contraste los bordes se ven de 2 px (V-08) | Oscuro y alto contraste | Si sucede | Aprobado |
| C-11 | Tamaño de fuente y de pantalla al máximo (Ajustes > Pantalla) | Ningún texto se corta ni se solapa; tildes, Ñ, ¿ y ¡ completas (V-06, V-07) | Claro | Si sucede | Aprobado |
| C-12 | Activar "Quitar animaciones" en Accesibilidad del teléfono y abrir un diálogo | El diálogo aparece sin animación (V-09) | Claro | Si sucede | Aprobado |
| C-13 | Accessibility Scanner sobre el catálogo | Sin avisos de tamaño táctil, contraste ni etiquetas (T-01, V-01, S-02). Anotar cualquier aviso | Claro | Sí sucede (sin avisos) | Aprobado |

### Segunda ronda: repruebas después de las correcciones

Ejecutada por Sara Santacruz el 2026-11-06, mismo teléfono. (Sara escribió estos resultados sobre las filas C-02 y C-06; se movieron aquí para conservar el historial de la primera ronda.)

| # | Qué hacer | Qué debe pasar | Tema | Resultado real | Estado |
| --- | --- | --- | --- | --- | --- |
| C-02b | Con TalkBack, ir a "Perfil" y deslizar a la izquierda. Después, tocar directamente la flecha de la izquierda | Se oye "Volver, botón" en los dos casos; el logo no recibe foco | Claro | Sí sucede | Aprobado |
| C-06b | Con TalkBack, borrar el ID y escribir un solo dígito en "ID de la Universidad" (región viva siempre montada, D-25) | Después del eco del dígito escrito, TalkBack lee "Debe tener exactamente 10 dígitos." sin que el foco salga del campo | Claro | Al escribir 2 TalkBack dice "2 reemplazó 2" y no lee el error. El mensaje, el ícono y el borde rojo grueso sí se ven en pantalla | Fallido. La región viva no se anuncia en este teléfono; se cambia a announceForAccessibility (D-27) |

### Tercera ronda

| # | Qué hacer | Qué debe pasar | Tema | Resultado real | Estado |
| --- | --- | --- | --- | --- | --- |
| C-06c | Con TalkBack, borrar el ID y escribir un solo dígito en "ID de la Universidad" (anuncio con announceForAccessibility, D-27) | Después del eco del dígito, TalkBack lee "ID de la Universidad: Debe tener exactamente 10 dígitos." sin que el foco salga del campo | Claro | "1 reemplazó 1" y luego dice "ID de la Universidad: Debe tener exactamente 10 dígitos." | Aprobado |

Los anuncios de StatusBanner y LoadingState usan el mismo mecanismo (useAnnounce) y se verifican en pantallas reales en las Etapas 3 y 5: en el catálogo se montan cuatro mensajes a la vez y sus anuncios se pisarían.

## Protocolo de la Etapa 8: auditoría sobre las pantallas reales

Ejecuta: Sara Santacruz (en la Etapa 8 Samuel no ejecuta pruebas). Cada resultado se escribe solo después de hacerlo en el teléfono, con las palabras que dijo TalkBack. Lo que no se alcance a ejecutar queda "No ejecutado" y se declara como limitación en el documento final.

Cuentas: las mismas de docs/PRUEBAS.md, sección 2.1 (P pasajera sin carro, C conductora con carro, X ajena, N cuenta nueva de TC-01). Nunca se elimina el carro de la cuenta C: eso borra en cascada sus viajes.

### 1. Preparación del teléfono

| Paso | Cómo se hace (Samsung con One UI; en otros Android los nombres cambian poco) |
| --- | --- |
| P-1 Abrir la app | `npx expo start` en el computador y escanear el QR con Expo Go SDK 58. Teléfono y computador en la misma red. |
| P-2 Activar TalkBack | Ajustes > Accesibilidad > TalkBack > activar y aceptar. Atajo recomendado: en la misma pantalla, "Acceso directo a TalkBack" con las dos teclas de volumen; así se activa o desactiva manteniendo las dos teclas 3 segundos. |
| P-3 Gestos básicos | Deslizar un dedo a la derecha: siguiente elemento. A la izquierda: anterior. Doble toque en cualquier parte: activar el elemento con foco. Deslizar con dos dedos: desplazar la lista. Deslizar hacia abajo y luego a la izquierda (o el botón Atrás del sistema): Atrás. Tocar una vez un elemento: llevar el foco ahí sin activarlo. Para escribir: doble toque en el campo y usar el teclado (se desliza hasta la tecla y se suelta para escribirla). |
| P-4 Accessibility Scanner | Instalar "Accessibility Scanner" de Google desde Google Play, abrirlo y activarlo en Ajustes > Accesibilidad > Aplicaciones instaladas. Aparece un botón flotante azul: en cada pantalla, tocarlo y elegir "Instantánea". Anotar cada aviso (tamaño táctil, contraste, etiqueta) con la pantalla donde salió. Apagar TalkBack antes de usar el Scanner. |
| P-5 Fuente y pantalla al máximo | Ajustes > Pantalla > Tamaño y estilo de fuente > tamaño al máximo. Ajustes > Pantalla > Zoom de pantalla > al máximo. Volver a Expo Go y recargar la app (agitar el teléfono > Reload). |
| P-6 Mostrar toques (para ver las áreas táctiles y para la demo) | Opciones de desarrollador > "Mostrar toques". Si no aparecen: Ajustes > Acerca del teléfono > Información de software > tocar 7 veces "Número de compilación". |
| P-7 Tema de la app | Perfil > "Ajustes de accesibilidad" > Tema: Sistema, Claro, Oscuro o Alto contraste. "Sistema" sigue el modo oscuro del teléfono (Ajustes > Pantalla > Oscuro). |
| P-8 Reducir animaciones | Ajustes > Accesibilidad > Mejoras de visibilidad > "Eliminar animaciones" (en otros Android: "Quitar animaciones"). |
| P-9 Cómo anotar | Para cada fila: qué dijo TalkBack (literal, entre comillas), qué se vio y el estado (Aprobado, Fallido o No ejecutado). Si falla, una captura de pantalla con el nombre del ID (por ejemplo `F3-04.png`). |

Nota de redacción (la misma de la revisión del catálogo): TalkBack agrega por su cuenta el rol ("botón", "botón de opción", "encabezado", "pestaña"), el estado ("marcado", "seleccionado", "no disponible") y la pista estándar ("tocar dos veces para activar"). Eso es lo esperado y no cuenta como fallo.

### 2. Flujos con TalkBack

En cada flujo, TalkBack activo y tema Claro, salvo que la fila diga otra cosa. Al entrar a cada pantalla, el foco debe caer solo en su título (T-03).

#### F1. Registro con foto y carro (cuenta N, correo nuevo; se hace junto con TC-01)

| # | Acción | Qué debe anunciar TalkBack o qué debe pasar | IDs | Resultado real | Estado |
| --- | --- | --- | --- | --- | --- |
| F1-01 | Abrir la app sin sesión | "Te damos la bienvenida, encabezado". El logo se lee una sola vez: "CampusGo, by Sara y Samuel" | S-01, S-09, T-03 | — | Pendiente |
| F1-02 | Pasar a "Registrarse" y activarlo | "Registrarse, botón"; al entrar, foco en "Registro, encabezado" y luego "Paso 1 de 7" | S-01, T-08 | — | Pendiente |
| F1-03 | Recorrer el formulario | Cada campo dice su etiqueta visible ("Nombre", "Apellido", "ID de la Universidad", "Correo Electrónico", "Teléfono", "Contraseña") y su pista de formato ("10 dígitos"); el orden es el visual | S-05, V-02, T-03 | — | Pendiente |
| F1-04 | Escribir 3 dígitos en el ID y pasar al siguiente campo | Se anuncia "ID de la Universidad: Debe tener exactamente 10 dígitos." sin mover el foco; se ven ícono, texto y borde de 2 px | S-05, S-07, V-05 | — | Pendiente |
| F1-05 | En el teclado, tecla "Siguiente" | El foco pasa al campo siguiente | T-03 | — | Pendiente |
| F1-06 | "Mostrar contraseña" | Cambia a "Ocultar contraseña" y el texto se ve; la contraseña se puede pegar | T-08 | — | Pendiente |
| F1-07 | Registrarse con datos válidos | Botón con indicador y "Enviando"; luego "Verifica tu correo, encabezado", "Paso 2 de 7" | T-05, T-03, T-08 | — | Pendiente |
| F1-08 | Código de 6 dígitos | El campo "Código de verificación" acepta pegar el código; "Reenviar código en N s" se anuncia como no disponible mientras cuenta | S-05, S-06, T-08 | — | Pendiente |
| F1-09 | "Agrega tu foto" | "Foto de perfil, botón" con su pista; después de elegirla: "Foto de perfil, foto cargada"; "Paso 3 de 7" | S-09, S-02, V-04 | — | Pendiente |
| F1-10 | "Anterior" y volver | Lo escrito y la foto se conservan | T-08 | — | Pendiente |
| F1-11 | "¿Quieres Registrar un Carro?" | Grupo "¿Deseas registrar un carro ahora?" con dos "botón de opción" ("No, quiero ser pasajero" y "Sí, quiero registrar mi carro"); solo la elegida dice "marcado" | S-03, S-06, V-05 | — | Pendiente |
| F1-12 | "¡Registra tu carro!" con placa "AB12" | Error de la placa anunciado sin mover el foco; "Cupos vehículo" abre teclado numérico | S-05, S-07 | — | Pendiente |
| F1-13 | Fotos del carro y del SOAT | "Foto del vehículo" y "Foto del SOAT vigente" con estado "foto cargada"; "Paso 6 de 7" y "Paso 7 de 7" | S-09, T-08, V-04 | — | Pendiente |
| F1-14 | "¡Listo!" | Vibra, se anuncia el resultado y entra a Inicio con el foco en "¡Buen viaje …!, encabezado" | T-04, T-03 | — | Pendiente |

#### F2. Inicio de sesión con error (cuenta P)

| # | Acción | Qué debe anunciar TalkBack o qué debe pasar | IDs | Resultado real | Estado |
| --- | --- | --- | --- | --- | --- |
| F2-01 | Bienvenida > "Iniciar Sesión" | Foco en "Inicio Sesión, encabezado" | S-01, T-03 | — | Pendiente |
| F2-02 | Correo con autocompletar | El teclado ofrece el correo guardado | T-08, S-05 | — | Pendiente |
| F2-03 | Contraseña incorrecta | Pantalla de error: se anuncia "ERROR" y el mensaje "El correo o la contraseña no son correctos."; vibración de error | S-07, T-04, V-05 | — | Pendiente |
| F2-04 | "Volver" | Regresa al formulario con lo escrito | T-03 | — | Pendiente |
| F2-05 | Modo avión y "Iniciar Sesión" | Se anuncia "Sin conexión a internet. Revisa tu red e intenta de nuevo." | S-07, T-05 | — | Pendiente |
| F2-06 | Datos correctos | Indicador "Enviando", botón deshabilitado y luego Inicio | T-05, S-06 | — | Pendiente |

#### F3. Buscar y reservar (cuenta P sobre un viaje de C)

| # | Acción | Qué debe anunciar TalkBack o qué debe pasar | IDs | Resultado real | Estado |
| --- | --- | --- | --- | --- | --- |
| F3-01 | Recorrer el encabezado de Inicio | "Perfil, botón"; el logo pequeño no recibe foco; selector "Modo pasajero, botón de opción, marcado" y "Modo conductor, botón de opción" | S-02, S-03, S-09 | — | Pendiente |
| F3-02 | Filtro "Sectores" | Se anuncia con su nombre y el sector elegido | S-01, S-05, V-03 | — | Pendiente |
| F3-03 | "Cantidad de puestos disponibles" y lupa | Teclado numérico; la lupa dice "Buscar viajes, botón"; el resultado de la búsqueda se anuncia | S-02, S-07, T-02 | — | Pendiente |
| F3-04 | Pasar por una tarjeta de viaje | Un solo foco con todo: sector, conductor, salida, valor, cupos y calificación (por ejemplo "Colina. Conductor …. Sale 7:00 a. m. Valor 5.000 pesos. 2 cupos."). El "+" no es un foco aparte | S-04 | — | Pendiente |
| F3-05 | Bajar al final de la lista | Se anuncia "Cargando más viajes…" | S-07, T-05 | — | Pendiente |
| F3-06 | Doble toque en la tarjeta | Foco en "Reserva tu viaje, encabezado" | T-03 | — | Pendiente |
| F3-07 | Pasar por el mapa | "Mapa para elegir el punto de recogida. También puedes escribir la dirección en el campo de abajo." | S-09, T-07 | — | Pendiente |
| F3-08 | Escribir solo la dirección, sin tocar el mapa | "Describe la dirección del punto de recogida" acepta el texto y "Reservar" funciona | T-07, S-05 | — | Pendiente |
| F3-09 | "Reservar" | Vibra; diálogo "Reserva realizada con éxito" con foco en el título y el texto "Tu reserva quedó pendiente de la confirmación del conductor."; "¡Listo!" | S-08, T-04 | — | Pendiente |
| F3-10 | Pestaña Reservas | "Reservas, pestaña, seleccionado"; pestañas internas "Pendientes", "Aceptados", "Rechazados" con la activa seleccionada | S-06, V-05 | — | Pendiente |

#### F4. Crear viaje con error y éxito (cuenta C)

| # | Acción | Qué debe anunciar TalkBack o qué debe pasar | IDs | Resultado real | Estado |
| --- | --- | --- | --- | --- | --- |
| F4-01 | Inicio de conductor | "Crea un viaje" y "Crear un nuevo viaje, botón"; "Viajes Pendientes" con "Ver solicitudes pendientes, botón" | S-01, S-02 | — | Pendiente |
| F4-02 | Abrir "Crea tu viaje" | Foco en "Crea tu viaje, encabezado"; el mapa se anuncia con su nombre | T-03, S-09 | — | Pendiente |
| F4-03 | "¡Listo!" con campos vacíos | Se anuncia "Revisa los campos con error: …" con los nombres de los campos; cada campo muestra su error en texto | S-05, S-07, V-05 | — | Pendiente |
| F4-04 | Fecha y hora | Los selectores se abren y se anuncian; la fecha queda escrita en texto | S-05, T-07 | — | Pendiente |
| F4-05 | Completar y "¡Listo!" | Vibra; diálogo "Viaje realizado con éxito" con foco en el título | S-08, T-04 | — | Pendiente |
| F4-06 | Pestaña Creados > tarjeta del viaje | Botones con el sector en la etiqueta ("Iniciar viaje a …", "Cancelar viaje a …", "Ver solicitudes del viaje a …") | S-02, S-04 | — | Pendiente |

#### F5. Cancelar reserva y eliminar carro (P para la reserva; N de TC-01 para el carro)

| # | Acción | Qué debe anunciar TalkBack o qué debe pasar | IDs | Resultado real | Estado |
| --- | --- | --- | --- | --- | --- |
| F5-01 | Reservas > Pendientes > papelera | "Cancelar reserva de …, botón" (foco aparte de la tarjeta) | S-02, S-04, T-02 | — | Pendiente |
| F5-02 | Abrir el diálogo | Foco en "¿Está seguro que desea cancelar esta reserva?, encabezado"; el siguiente elemento es "No, volver" | S-08, T-06 | — | Pendiente |
| F5-03 | Gesto Atrás | Cierra el diálogo y el foco vuelve a la papelera | S-08 | — | Pendiente |
| F5-04 | "Sí, cancelar reserva" | Vibra y se anuncia el resultado; la tarjeta sale de Pendientes | T-04, S-07 | — | Pendiente |
| F5-05 | Cuenta N: Perfil > "Carro" > papelera | "Eliminar este carro, botón"; diálogo "¿Está seguro de que desea eliminar este carro?" con "Esta acción no se puede deshacer." y foco inicial en la opción segura | T-06, S-08 | — | Pendiente |
| F5-06 | "Sí, eliminar carro" | Se anuncia el resultado y aparece "Registrar Carro" | S-07, T-04 | — | Pendiente |

#### F6. Cambio de modo y cierre de sesión (cuentas P y C)

| # | Acción | Qué debe anunciar TalkBack o qué debe pasar | IDs | Resultado real | Estado |
| --- | --- | --- | --- | --- | --- |
| F6-01 | P (sin carro): "Modo conductor" | Diálogo "No tienes un carro registrado" con "Debes registrar un carro para cambiar a modo conductor."; foco en el título | S-03, S-08, T-06 | — | Pendiente |
| F6-02 | C: "Modo conductor" | Diálogo "¿Está seguro que desea cambiar a modo Conductor?" con "Esta acción afectará la manera en que usa la app."; "Sí, cambiar a Conductor" | T-06, S-08 | — | Pendiente |
| F6-03 | Después del cambio | El selector anuncia "Modo conductor, …, marcado"; la barra inferior muestra "Creados" en vez de "Reservas" | S-03, S-06 | — | Pendiente |
| F6-04 | Perfil > "Cerrar Sesión" | Ícono de power con texto; diálogo "¿Deseas cerrar sesión?" con foco en la opción segura | S-02, T-06 | — | Pendiente |
| F6-05 | "Sí, cerrar sesión" | Vuelve a la bienvenida con el foco en el título | T-03 | — | Pendiente |

### 3. Variantes: tema oscuro, alto contraste, reducir animaciones y fuente al máximo

| # | Qué hacer | Qué debe pasar | IDs | Resultado real | Estado |
| --- | --- | --- | --- | --- | --- |
| VA-01 | Tema Oscuro (P-7) y recorrer Inicio, una tarjeta, Reserva tu viaje y Perfil | Todo legible; los campos y bordes se distinguen; el mapa y las fotos no quedan tapados | V-08, V-01 | — | Pendiente |
| VA-02 | Tema Alto contraste en las mismas pantallas | Texto negro sobre blanco y bordes de 2 px en botones, campos y tarjetas | V-08, V-01 | — | Pendiente |
| VA-03 | Tema "Sistema" con el modo oscuro del teléfono activo; cerrar y abrir la app | La app pasa sola a oscuro y la preferencia se conserva | V-08 | — | Pendiente |
| VA-04 | "Eliminar animaciones" (P-8); abrir un diálogo y cambiar de pantalla | Los diálogos aparecen sin animación o con un fundido corto | V-09 | — | Pendiente |
| VA-05 | Fuente y pantalla al máximo (P-5) y "Tamaño del texto: Extra grande" en Ajustes de accesibilidad; recorrer F3 | Ningún texto se corta ni se solapa; tildes, Ñ, ¿ y ¡ completas; la tarjeta crece en alto | V-06, V-07 | — | Pendiente |
| VA-06 | Ajustes de accesibilidad > "Vibración" apagada y repetir F3-09 | No vibra, pero el mensaje se ve y se anuncia | T-04, V-08 | — | Pendiente |
| VA-07 | Accessibility Scanner (P-4) en Inicio, Reserva tu viaje, Reservas, Crea tu viaje, Creados, Perfil, Notificaciones, Chat y Calificar viaje | Sin avisos de tamaño táctil, contraste ni etiquetas. Anotar cada aviso con su pantalla | T-01, T-02, V-01, V-04, S-02 | — | Pendiente |
| VA-08 | Con "Mostrar toques" (P-6), tocar la lupa, la papelera y el lápiz por el borde | El toque cuenta aunque caiga un poco fuera del ícono (hitSlop) | T-02 | — | Pendiente |

### 4. Resultado por compromiso de la matriz

Resume en dispositivo cada uno de los 26 IDs de docs/MATRIZ_ACCESIBILIDAD.md. Se llena al terminar los flujos: "Aprobado" solo si todas sus filas salieron bien; si alguna falló, "Fallido" con la fila que falló; si no se ejecutó ninguna, "No ejecutado".

| ID | Compromiso | Dónde se comprueba | Ejecutó | Fecha | Resultado real | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| S-01 | Roles correctos (botón, encabezado, pestaña, opción) | F1-01, F1-02, F2-01, F3-02, F4-01 | — | — | — | Pendiente |
| S-02 | Etiquetas en íconos sin texto; decorativos ocultos | F1-09, F3-01, F3-03, F4-01, F5-01, F6-04, VA-07 | — | — | — | Pendiente |
| S-03 | Selector de modo como grupo de opciones con estado | F1-11, F3-01, F6-01, F6-03 | — | — | — | Pendiente |
| S-04 | TripCard como un solo foco | F3-04, F4-06, F5-01 | — | — | — | Pendiente |
| S-05 | Formularios con etiqueta, pista y error en texto | F1-03, F1-04, F1-08, F1-12, F3-08, F4-03, F4-04 | — | — | — | Pendiente |
| S-06 | Estados selected, disabled, busy y checked | F1-08, F1-11, F2-06, F3-10, F6-03 | — | — | — | Pendiente |
| S-07 | Mensajes dinámicos anunciados sin mover el foco | F1-04, F1-12, F2-03, F2-05, F3-03, F3-05, F4-03, F5-04, F5-06 | — | — | — | Pendiente |
| S-08 | Diálogos modales: foco al título, Atrás y retorno del foco | F3-09, F4-05, F5-02, F5-03, F5-05, F6-01, F6-02 | — | — | — | Pendiente |
| S-09 | Alternativas textuales: mapa, fotos y logo | F1-01, F1-09, F1-13, F3-01, F3-07, F4-02 | — | — | — | Pendiente |
| V-01 | Contraste verificado en los tres temas | VA-01, VA-02, VA-07 | — | — | — | Pendiente |
| V-02 | Placeholder legible y etiqueta visible persistente | F1-03 | — | — | — | Pendiente |
| V-03 | Controles sobre azul legibles | F3-02 | — | — | — | Pendiente |
| V-04 | Íconos de estado y de subida con 3:1 | F1-09, F1-13, VA-07 | — | — | — | Pendiente |
| V-05 | No depender solo del color | F1-04, F1-11, F2-03, F3-10, F4-03 | — | — | — | Pendiente |
| V-06 | Escalado de fuente al máximo sin cortes | VA-05 | — | — | — | Pendiente |
| V-07 | lineHeight suficiente (tildes, Ñ, ¿, ¡) | VA-05 | — | — | — | Pendiente |
| V-08 | Temas, tamaño de texto y vibración con persistencia | VA-01, VA-02, VA-03, VA-06 | — | — | — | Pendiente |
| V-09 | Respeto a reducir movimiento | VA-04 | — | — | — | Pendiente |
| T-01 | Áreas táctiles de 48 dp | VA-07 | — | — | — | Pendiente |
| T-02 | hitSlop y separación de 8 dp | F3-03, F5-01, VA-07, VA-08 | — | — | — | Pendiente |
| T-03 | Orden de foco, foco al título y "Siguiente" del teclado | F1-01, F1-02, F1-03, F1-05, F1-07, F1-14, F2-01, F2-04, F3-06, F4-02, F6-05 | — | — | — | Pendiente |
| T-04 | Háptica + mensaje + anuncio; interruptor de vibración | F1-14, F2-03, F3-09, F4-05, F5-04, F5-06, VA-06 | — | — | — | Pendiente |
| T-05 | Carga y errores de red con texto, busy y "Reintentar" | F1-07, F2-05, F2-06, F3-05 | — | — | — | Pendiente |
| T-06 | Confirmaciones destructivas con foco en la opción segura | F5-02, F5-05, F6-01, F6-02, F6-04 | — | — | — | Pendiente |
| T-07 | Sin gestos complejos; dirección escrita como alternativa al mapa | F3-07, F3-08, F4-04 | — | — | — | Pendiente |
| T-08 | Registro por pasos, "Anterior" conserva, autocompletar y pegar | F1-02, F1-06, F1-07, F1-08, F1-10, F2-02 | — | — | — | Pendiente |

### 5. Resumen por flujo

| Flujo | Dispositivo y versión de Android | Ejecutó | Fecha | Resultado | Estado |
| --- | --- | --- | --- | --- | --- |
| F1 | — | — | — | — | Pendiente |
| F2 | — | — | — | — | Pendiente |
| F3 | — | — | — | — | Pendiente |
| F4 | — | — | — | — | Pendiente |
| F5 | — | — | — | — | Pendiente |
| F6 | — | — | — | — | Pendiente |
| Variantes (VA-01 a VA-08) | — | — | — | — | Pendiente |
