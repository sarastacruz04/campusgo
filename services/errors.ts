// Errores tipados de CampusGo. Todo servicio lanza un AppError y todo thunk lo
// entrega con rejectWithValue, así la pantalla siempre recibe { code, message }
// con un mensaje en español listo para mostrar y anunciar.

/** Error de la app: un objeto plano (no una clase) para poder guardarlo en Redux. */
export type AppError = {
  /** Código estable para decidir en el código (por ejemplo, 'sin_conexion'). */
  code: string;
  /** Mensaje en español para la persona usuaria. */
  message: string;
};

// Mensajes de los códigos que lanzan las funciones RPC y los triggers con RAISE
// EXCEPTION (supabase/migrations/0001 y 0009, y docs/API_CONTRATOS.md).
const RPC_MESSAGES: Record<string, string> = {
  modo_invalido: 'El modo debe ser pasajero o conductor.',
  sin_vehiculo:
    'No tienes un carro registrado. Debes registrar un carro para cambiar a modo conductor.',
  viaje_no_encontrado: 'El viaje no existe o ya no está disponible.',
  reserva_propia: 'No puedes reservar tu propio viaje.',
  viaje_no_abierto: 'Este viaje ya no acepta reservas.',
  sin_cupos: 'No quedan cupos disponibles en este viaje.',
  viaje_pasado: 'La hora de salida de este viaje ya pasó.',
  reserva_duplicada: 'Ya tienes una reserva en este viaje.',
  reserva_no_encontrada: 'La reserva no existe.',
  sin_permiso: 'No tienes permiso para hacer esta acción.',
  reserva_no_pendiente: 'Solo se pueden responder reservas pendientes.',
  reserva_no_cancelable: 'Esta reserva ya fue rechazada o cancelada.',
  viaje_no_iniciable: 'El viaje ya fue iniciado, finalizado o cancelado.',
  sin_pasajeros: 'Debes tener al menos una reserva aceptada para iniciar el viaje.',
  viaje_no_en_curso: 'Solo se puede finalizar un viaje que esté en curso.',
  viaje_ya_cerrado: 'El viaje ya fue finalizado o cancelado.',
  // Trigger fn_validar_viaje_nuevo (R4, migración 0009). La app ya valida lo mismo
  // antes de enviar; estos mensajes solo salen si algo se salta esa validación.
  vehiculo_ajeno: 'El viaje debe usar tu carro registrado.',
  salida_pasada: 'La fecha y hora de salida deben estar en el futuro.',
  cupos_excede_capacidad: 'Los cupos no pueden superar la capacidad de tu carro.',
  viaje_inicial_invalido: 'Un viaje nuevo debe empezar abierto y con todos sus cupos disponibles.',
};

// Códigos de Supabase Auth (AuthApiError.code) que la app muestra con texto propio.
const AUTH_MESSAGES: Record<string, string> = {
  invalid_credentials: 'El correo o la contraseña no son correctos.',
  email_not_confirmed: 'Tu correo aún no está verificado. Revisa el código que te enviamos.',
  user_already_exists: 'Ya existe una cuenta con este correo.',
  email_exists: 'Ya existe una cuenta con este correo.',
  weak_password: 'La contraseña debe tener al menos 6 caracteres.',
  otp_expired: 'El código venció o no es correcto. Pide uno nuevo.',
  over_email_send_rate_limit:
    'Pediste demasiados correos seguidos. Espera un momento e intenta de nuevo.',
  over_request_rate_limit: 'Hiciste demasiados intentos. Espera un momento e intenta de nuevo.',
};

// Códigos de PostgreSQL y PostgREST más comunes.
const POSTGRES_MESSAGES: Record<string, AppError> = {
  '23505': { code: 'duplicado', message: 'Ese dato ya está registrado.' },
  '23514': { code: 'datos_invalidos', message: 'Algún dato no tiene el formato correcto.' },
  '23503': { code: 'referencia_invalida', message: 'Uno de los datos relacionados no existe.' },
  '42501': { code: 'sin_permiso', message: 'No tienes permiso para hacer esta acción.' },
  PGRST116: { code: 'no_encontrado', message: 'No se encontró la información solicitada.' },
};

export const ERRORS = {
  sinConexion: {
    code: 'sin_conexion',
    message: 'Sin conexión a internet. Revisa tu red e intenta de nuevo.',
  },
  correoNoInstitucional: {
    code: 'correo_no_institucional',
    message: 'Solo se aceptan correos @unisabana.edu.co.',
  },
  sinSesion: { code: 'sin_sesion', message: 'Tu sesión terminó. Inicia sesión de nuevo.' },
  // 500 = MAX_MESSAGE_LENGTH de chatService (no se importa para no crear un ciclo).
  mensajeInvalido: {
    code: 'mensaje_invalido',
    message: 'El mensaje debe tener entre 1 y 500 caracteres.',
  },
  // Lo devuelve el chat cuando quien lo abre no es el conductor ni un pasajero aceptado (R10).
  chatSinAcceso: {
    code: 'chat_sin_acceso',
    message:
      'No tienes acceso a este chat. Solo pueden usarlo el conductor y los pasajeros con reserva aceptada.',
  },
  desconocido: { code: 'desconocido', message: 'Ocurrió un error inesperado. Intenta de nuevo.' },
} satisfies Record<string, AppError>;

// Todos los códigos que puede tener un AppError de la app.
const APP_CODES = new Set<string>([
  ...Object.keys(RPC_MESSAGES),
  ...Object.keys(AUTH_MESSAGES),
  ...Object.values(POSTGRES_MESSAGES).map((error) => error.code),
  ...Object.values(ERRORS).map((error) => error.code),
]);

/**
 * true si el valor ya es un AppError de la app. Un error crudo de Supabase también
 * tiene code y message, pero su code no es de la app (por ejemplo, "P0001").
 */
export function isAppError(value: unknown): value is AppError {
  return (
    typeof value === 'object' &&
    value !== null &&
    !(value instanceof Error) &&
    typeof (value as AppError).message === 'string' &&
    APP_CODES.has((value as AppError).code)
  );
}

type ErrorLike = { code?: unknown; message?: unknown; name?: unknown; status?: unknown };

/**
 * Convierte cualquier error (de Supabase, de la red o de JavaScript) en un AppError.
 * Es la única traducción de errores de la app: si aparece un error nuevo, se agrega aquí.
 */
export function toAppError(error: unknown): AppError {
  if (typeof error !== 'object' || error === null) return ERRORS.desconocido;

  const { code, message, name } = error as ErrorLike;
  const text = typeof message === 'string' ? message : '';

  // Sin red: fetch de React Native lanza "Network request failed"; Supabase Auth lo
  // envuelve en AuthRetryableFetchError.
  if (/network request failed|failed to fetch/i.test(text) || name === 'AuthRetryableFetchError') {
    return ERRORS.sinConexion;
  }

  // RAISE EXCEPTION 'codigo' en una RPC llega como SQLSTATE P0001 con el código en message.
  if (code === 'P0001' && RPC_MESSAGES[text]) {
    return { code: text, message: RPC_MESSAGES[text] };
  }

  if (typeof code === 'string' && AUTH_MESSAGES[code]) {
    return { code, message: AUTH_MESSAGES[code] };
  }

  // El CHECK de profiles rechaza correos de otro dominio dentro del trigger
  // handle_new_user, y Supabase Auth lo reporta como este mensaje genérico (R1).
  if (/database error saving new user/i.test(text)) {
    return ERRORS.correoNoInstitucional;
  }

  if (typeof code === 'string' && POSTGRES_MESSAGES[code]) {
    return POSTGRES_MESSAGES[code];
  }

  // Un AppError que ya estaba traducido (por ejemplo, relanzado por un servicio).
  if (isAppError(error)) return error;

  return unknownError(code);
}

/**
 * Error no reconocido. En desarrollo el mensaje incluye el código original para
 * poder diagnosticarlo desde el teléfono (así se encontró el 42P17 de RLS, D-42).
 * En producción la persona solo ve el mensaje genérico.
 */
function unknownError(code: unknown): AppError {
  if (__DEV__ && typeof code === 'string' && code.length > 0) {
    return { ...ERRORS.desconocido, message: `${ERRORS.desconocido.message} (código ${code})` };
  }
  return ERRORS.desconocido;
}

/**
 * Tipo de `data` en la respuesta exitosa de supabase-js. Sus respuestas son uniones
 * { data: T; error: null } | { data: null; error: Error }; esto toma el T del caso
 * sin error (con maybeSingle, T ya incluye null y se conserva).
 */
type SuccessData<R> = Extract<R, { error: null }> extends { data: infer D } ? D : never;

/**
 * Desenvuelve la respuesta { data, error } de supabase-js: devuelve data o lanza
 * el AppError correspondiente. Así cada servicio queda en una línea.
 */
export function unwrap<R extends { data: unknown; error: unknown }>(result: R): SuccessData<R> {
  if (result.error) throw toAppError(result.error);
  return result.data as SuccessData<R>;
}
