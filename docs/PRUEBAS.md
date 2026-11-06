# Pruebas — CampusGo

Estados: Pendiente, Aprobado o Fallido. Solo se escribe un resultado real cuando alguien ejecutó la prueba; la evidencia es un archivo, una salida de consola o una captura hecha por el equipo.

## 1. Pruebas automáticas

Se ejecutan con `npm test` (jest-expo y Testing Library).

| Archivo | Qué comprueba | Etapa | Último resultado |
| --- | --- | --- | --- |
| __tests__/smoke.test.tsx | La pantalla inicial renderiza con el logo accesible, un título header y el acceso a Ajustes. | E0, E1 | Aprobado |
| __tests__/theme/contrast.test.ts | Fórmula de contraste de WCAG (contra los valores medidos en el Corte 2), mismos tokens en los tres temas y todos los pares en AA. | E1 | Aprobado |
| __tests__/theme/typography-layout.test.ts | lineHeight ≥ 1,4 y letterSpacing ≥ 0 en todas las variantes y tamaños; tamaños mínimos; TOUCH_MIN; hitSlopFor; bordes de 2 px en alto contraste. | E1 | Aprobado |
| __tests__/theme/ThemeProvider.test.tsx | Carga y guarda preferencias, tolera datos corruptos, error fuera del provider y la pantalla de Ajustes (tema, tamaño, reducir movimiento, vibración). | E1 | Aprobado |
| __tests__/components/Button.test.tsx | Rol, nombre, TOUCH_MIN, lineHeight, carga (busy y deshabilitado) y label obligatorio en TypeScript. | E1 | Aprobado |
| __tests__/components/IconButton.test.tsx | Nombre accesible, TOUCH_MIN, hitSlop en modo compacto, ícono oculto y label obligatorio en TypeScript. | E1 | Aprobado |
| __tests__/components/TextField.test.tsx | Etiqueta visible, pista, TOUCH_MIN sin altura fija, error en texto y anunciado, "Mostrar contraseña" y label obligatorio. | E1 | Aprobado |
| __tests__/components/selection.test.tsx | SegmentedToggle (radiogroup, checked, TOUCH_MIN), RadioGroup, SwitchRow (un solo foco) y BottomTabBar (tab, selected, subrayado). | E1 | Aprobado |
| __tests__/components/feedback.test.tsx | ConfirmDialog (orden seguro, modal, escape, foco al título), StatusBanner (anuncio, un solo foco, Reintentar), LoadingState y StepIndicator. | E1 | Aprobado |
| __tests__/components/identity.test.tsx | Logo (con nombre o decorativo), AppText (escalado, tamaño de Ajustes, alto contraste), ScreenTitle (foco), PhotoPicker ("foto cargada") y orden de foco de ScreenLayout. | E1 | Aprobado |
| __tests__/hooks/hooks.test.tsx | useAnnounce (anuncia en Android y en iOS), useReduceMotion (sistema, preferencia y cleanup del listener) y useHaptics (Android, iOS y apagado). | E1 | Aprobado |
| `npm run a11y:contrast` | 22 pares de color por tema en claro, oscuro y alto contraste. | E1 | Aprobado: 66 de 66 pares cumplen WCAG AA |

Última ejecución: 2026-11-06, `npm test` con 11 archivos y 73 de 73 pruebas aprobadas, ejecutado por Claude Code en WSL (Node 22.20.0).

Pendientes por etapa: validators, reducers, selectores, thunks con servicios simulados, flujos de pantalla y pruebas SQL de RLS (sección 10).

## 2. Casos funcionales

| ID | Descripción | Pasos | Resultado esperado | Resultado real | Evidencia | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | Registro con carro | Por definir (E4) | — | — | — | Pendiente |
| TC-02 | Registro sin carro | Por definir (E4) | — | — | — | Pendiente |
| TC-03 | Inicio de sesión correcto | Por definir (E4) | — | — | — | Pendiente |
| TC-04 | Credenciales incorrectas | Por definir (E4) | — | — | — | Pendiente |
| TC-05 | Correo de otro dominio rechazado | Por definir (E4) | — | — | — | Pendiente |
| TC-06 | Filtro por sector y por cupos | Por definir (E5) | — | — | — | Pendiente |
| TC-07 | Reservar viaje | Por definir (E5) | — | — | — | Pendiente |
| TC-08 | Reserva duplicada rechazada | Por definir (E5) | — | — | — | Pendiente |
| TC-09 | Cancelar reserva | Por definir (E5) | — | — | — | Pendiente |
| TC-10 | Crear viaje | Por definir (E6) | — | — | — | Pendiente |
| TC-11 | Crear viaje con campos faltantes | Por definir (E6) | — | — | — | Pendiente |
| TC-12 | Aceptar reservas hasta llenar los cupos (cierre automático) | Por definir (E6) | — | — | — | Pendiente |
| TC-13 | Rechazar reserva | Por definir (E6) | — | — | — | Pendiente |
| TC-14 | Iniciar y finalizar viaje | Por definir (E6) | — | — | — | Pendiente |
| TC-15 | Calificar viaje | Por definir (E7) | — | — | — | Pendiente |
| TC-16 | Chat en tiempo real | Por definir (E7) | — | — | — | Pendiente |
| TC-17 | Sin conexión, con caché y banner | Por definir (E3) | — | — | — | Pendiente |
| TC-18 | Error de red y "Reintentar" | Por definir (E3) | — | — | — | Pendiente |
| TC-19 | Cambio a modo conductor sin carro bloqueado | Por definir (E4) | — | — | — | Pendiente |
| TC-20 | Eliminar carro | Por definir (E4) | — | — | — | Pendiente |
| TC-21 | Cerrar sesión limpia la sesión segura | Por definir (E4) | — | — | — | Pendiente |
| TC-22 | La sesión persiste al reiniciar la app | Por definir (E3) | — | — | — | Pendiente |
| TC-23 | RLS: un usuario no lee datos ajenos | Por definir (E2) | — | — | — | Pendiente |
