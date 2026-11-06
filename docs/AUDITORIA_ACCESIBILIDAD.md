# Auditoría de accesibilidad en dispositivo — CampusGo

La ejecutan Sara y Samuel en un teléfono Android con TalkBack y Accessibility Scanner. Ningún resultado se escribe sin haberlo ejecutado. El protocolo completo se escribe en la Etapa 8 (sección 10 de la especificación).

## Alcance y limitaciones

- Dispositivos: solo Android (el equipo no tiene iPhone).
- No ejecutados por falta de dispositivo: VoiceOver y Accessibility Inspector de iOS. Las propiedades específicas de iOS (accessibilityViewIsModal, accessibilityElementsHidden, onAccessibilityEscape, accessibilityLanguage) se cubren con pruebas unitarias.

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
