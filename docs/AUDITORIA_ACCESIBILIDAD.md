# Auditoría de accesibilidad en dispositivo — CampusGo

La ejecutan Sara y Samuel en un teléfono Android con TalkBack y Accessibility Scanner. Ningún resultado se escribe sin haberlo ejecutado. El protocolo completo se escribe en la Etapa 8 (sección 10 de la especificación).

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

| # | Qué hacer | Qué debe pasar | Tema | Resultado real | Estado |
| --- | --- | --- | --- | --- | --- |
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

## Estructura (se completa en la Etapa 8)

1. Preparación: activar TalkBack (Ajustes, Accesibilidad), gestos básicos, instalar Accessibility Scanner, fuente y pantalla al máximo.
2. Flujos: F1 registro con foto y carro; F2 inicio de sesión con error; F3 buscar y reservar; F4 crear viaje con error y éxito; F5 cancelar reserva y eliminar carro; F6 cambio de modo y cierre de sesión.
3. Variantes: tema oscuro, alto contraste y reducir animaciones.
4. Resultados por ID de la matriz (S-01 a T-08): todos en estado Pendiente.

| Flujo | Dispositivo y versión de Android | Ejecutado por | Fecha | Resultado | Estado |
| --- | --- | --- | --- | --- | --- |
| F1 | — | — | — | — | Pendiente |
| F2 | — | — | — | — | Pendiente |
| F3 | — | — | — | — | Pendiente |
| F4 | — | — | — | — | Pendiente |
| F5 | — | — | — | — | Pendiente |
| F6 | — | — | — | — | Pendiente |
