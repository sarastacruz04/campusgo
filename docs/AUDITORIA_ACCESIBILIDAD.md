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

| # | Qué hacer | Qué debe pasar | Tema | Resultado real | Estado |
| --- | --- | --- | --- | --- | --- |
| C-01 | Entrar al catálogo con TalkBack activo | El foco cae solo en el título y se oye "Catálogo de componentes, encabezado" (S-01, T-03) | Claro | — | Pendiente |
| C-02 | Recorrer el encabezado | "Volver, botón"; "Perfil, botón"; el logo pequeño no recibe foco (S-02, S-09) | Claro | — | Pendiente |
| C-03 | Recorrer el selector de modo y cambiarlo | "Modo pasajero, botón de opción, marcado" y luego "Modo conductor…, no marcado"; doble toque cambia (S-03) | Claro | — | Pendiente |
| C-04 | Recorrer los íconos de la sección Botones | Cada uno se oye con su nombre (Reservar viaje, Buscar viajes, Cancelar reserva, Editar perfil, Cerrar sesión), sin "botón sin etiqueta" (S-02) | Claro | — | Pendiente |
| C-05 | Tocar "Iniciar Sesión" | Se oye "Enviando", el botón queda deshabilitado con indicador y luego vibra y se oye "Envío terminado" (T-04, T-05) | Claro | — | Pendiente |
| C-06 | Escribir 3 dígitos en "ID de la Universidad" | Aparece y se anuncia el error sin mover el foco; borde de 2 px e ícono (S-05, S-07, V-05) | Claro | — | Pendiente |
| C-07 | En la contraseña, usar "Mostrar contraseña" | Cambia a "Ocultar contraseña" y el texto se ve (T-08) | Claro | — | Pendiente |
| C-08 | Abrir "Diálogo de confirmación" | Foco en el título; siguiente elemento "No, volver"; gesto Atrás lo cierra y el foco vuelve al botón que lo abrió (S-08, T-06) | Claro | — | Pendiente |
| C-09 | Recorrer la barra inferior | "Inicio, pestaña, seleccionada"; las otras sin "seleccionada" (S-06) | Claro | — | Pendiente |
| C-10 | Cambiar a Oscuro y a Alto contraste en la sección Tema y repetir C-02 a C-09 | Todo legible; en alto contraste los bordes se ven de 2 px (V-08) | Oscuro y alto contraste | — | Pendiente |
| C-11 | Tamaño de fuente y de pantalla al máximo (Ajustes > Pantalla) | Ningún texto se corta ni se solapa; tildes, Ñ, ¿ y ¡ completas (V-06, V-07) | Claro | — | Pendiente |
| C-12 | Activar "Quitar animaciones" en Accesibilidad del teléfono y abrir un diálogo | El diálogo aparece sin animación (V-09) | Claro | — | Pendiente |
| C-13 | Accessibility Scanner sobre el catálogo | Sin avisos de tamaño táctil, contraste ni etiquetas (T-01, V-01, S-02). Anotar cualquier aviso | Claro | — | Pendiente |

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
