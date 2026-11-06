# Matriz de accesibilidad — CampusGo

Trazabilidad de los 26 compromisos de la propuesta aprobada del Corte 2 (docs/PROPUESTA_ACCESIBILIDAD_CORTE2.md). Cada fila se actualiza en la etapa en que el compromiso se implementa: archivo y líneas exactas, prueba automática o manual y resultado real. Estados: Pendiente, Implementado (falta prueba en dispositivo), Aprobado o Fallido.

| ID | Mejora prometida (Corte 2) | Archivo y líneas | Prueba | Resultado | Estado |
| --- | --- | --- | --- | --- | --- |
| S-01 | accessibilityRole correcto en cada elemento interactivo y en los títulos (button, link, header, radio, tab, tablist, search). | — | — | — | Pendiente |
| S-02 | accessibilityLabel en español en todo ícono sin texto, sin repetir el rol; hint solo si el resultado no es obvio; íconos decorativos ocultos. | — | — | — | Pendiente |
| S-03 | Selector Pasajero/Conductor como radiogroup con dos radio y accessibilityState checked, con texto visible. | — | — | — | Pendiente |
| S-04 | TripCard como un solo foco con etiqueta compuesta; el "+" visual no es otro foco. | — | — | — | Pendiente |
| S-05 | Formularios: etiqueta, pista con el formato, autoComplete, textContentType, inputMode y error en texto bajo el campo. | — | — | — | Pendiente |
| S-06 | accessibilityState selected, disabled, busy y checked. | — | — | — | Pendiente |
| S-07 | Mensajes dinámicos sin mover el foco (accessibilityLiveRegion y announceForAccessibility con useAnnounce). | — | — | — | Pendiente |
| S-08 | Diálogos modales con accessibilityViewIsModal, foco inicial en el título, onAccessibilityEscape y retorno del foco. | — | — | — | Pendiente |
| S-09 | Alternativas textuales: mapa con alternativa escrita, zonas de foto con estado, logo como una sola imagen con etiqueta. | — | — | — | Pendiente |
| V-01 | Tokens con contraste verificado por script (4,5:1 texto, 3:1 interfaz) en los tres temas. | — | — | — | Pendiente |
| V-02 | Placeholder #5F6B7A y etiqueta visible persistente sobre cada campo. | — | — | — | Pendiente |
| V-03 | Controles sobre azul con texto #E3E8F0; selector de modo con segmento activo blanco y texto visible. | — | — | — | Pendiente |
| V-04 | Íconos de estado y de subida con al menos 3:1. | — | — | — | Pendiente |
| V-05 | No depender solo del color: error con ícono, texto y borde de 2 px; éxito con ícono y texto; selección con subrayado o relleno y negrita. | — | — | — | Pendiente |
| V-06 | Escalado de fuente: allowFontScaling, maxFontSizeMultiplier 2, sin alturas fijas, tamaños mínimos; revisado a 200 %. | — | — | — | Pendiente |
| V-07 | lineHeight de al menos 1,4 veces el fontSize y letterSpacing de 0 o más. | — | — | — | Pendiente |
| V-08 | Temas claro, oscuro y alto contraste, tamaño de texto, reducir movimiento y vibración en Ajustes, con persistencia. | — | — | — | Pendiente |
| V-09 | Respeto a reducir movimiento (isReduceMotionEnabled con listener). | — | — | — | Pendiente |
| T-01 | TOUCH_MIN (44 iOS, 48 Android) como minHeight y minWidth de todos los controles. | — | — | — | Pendiente |
| T-02 | hitSlop en íconos pequeños y al menos 8 dp entre objetivos vecinos. | — | — | — | Pendiente |
| T-03 | Orden de foco igual al visual, returnKeyType "next", foco al título al cambiar de pantalla, KeyboardAvoidingView y borde de foco de 2 px. | — | — | — | Pendiente |
| T-04 | Retroalimentación multimodal: háptica, mensaje con ícono y texto, anuncio del lector e interruptor de vibración. | — | — | — | Pendiente |
| T-05 | Carga y errores de red: indicador con texto, busy, botón deshabilitado y "Reintentar". | — | — | — | Pendiente |
| T-06 | Confirmaciones destructivas explícitas con el foco inicial en la opción segura. | — | — | — | Pendiente |
| T-07 | Sin gestos complejos; punto de recogida tocando el mapa o escribiendo; acciones principales en la mitad inferior. | — | — | — | Pendiente |
| T-08 | Registro con "Paso x de y", "Anterior" conserva lo escrito, autocompletado, contraseña y código pegables, "Mostrar contraseña", sin CAPTCHA. | — | — | — | Pendiente |
