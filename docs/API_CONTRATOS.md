# Contratos de la API — CampusGo

Contrato de cada función del cliente (services/) y de cada RPC y tabla expuesta en Supabase: entrada, salida y errores (AppError con `code` y `message` en español). Se llena en la Etapa 2 (RPC y tablas) y en la Etapa 3 (servicios del cliente).

## Convenciones

- Todos los servicios devuelven datos tipados con `types/database.ts` (generado con `supabase gen types typescript`).
- Los errores se devuelven como `AppError { code: string; message: string }`; los thunks los pasan a la interfaz con `rejectWithValue`.

## RPC de PostgreSQL

Pendiente (Etapa 2): cambiar_modo, crear_reserva, aceptar_reserva, rechazar_reserva, cancelar_reserva, iniciar_viaje, finalizar_viaje, cancelar_viaje.

## Tablas expuestas

Pendiente (Etapa 2): profiles, sectores, vehiculos, viajes, reservas, calificaciones, notificaciones, mensajes y la vista promedio_calificaciones.

## Servicios del cliente

Pendiente (Etapa 3): authService, profileService, vehicleService, tripService, reservationService, storageService, ratingService, notificationService y chatService.
