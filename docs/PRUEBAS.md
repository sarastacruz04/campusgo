# Pruebas — CampusGo

Estados: Pendiente, Aprobado o Fallido. Solo se escribe un resultado real cuando alguien ejecutó la prueba; la evidencia es un archivo, una salida de consola o una captura hecha por el equipo.

## 1. Pruebas automáticas

Se ejecutan con `npm test` (jest-expo y Testing Library).

| Archivo | Qué comprueba | Etapa | Último resultado |
| --- | --- | --- | --- |
| __tests__/smoke.test.tsx | La pantalla inicial renderiza con un encabezado accesible; jest-expo, Testing Library y el alias `@/` funcionan. | E0 | Aprobado (2026-11-06, `npm test`: 1 de 1) |

Pendientes por etapa: validators, reducers, selectores, thunks con servicios simulados, componentes ui, flujos de pantalla, `npm run a11y:contrast` y pruebas SQL de RLS (sección 10).

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
