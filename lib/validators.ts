// =============================================================================
// lib/validators.ts — Validadores puros para autenticación, registro y vehículos
//
// Reglas de negocio validadas:
// - R1: Correo institucional @unisabana.edu.co obligatorio.
// - ID universitario: exactamente 10 dígitos numéricos.
// - Teléfono: exactamente 10 dígitos numéricos.
// - Contraseña: mínimo 6 caracteres (según D-12 y R16).
// - Placa colombiana: exactamente 3 letras mayúsculas seguidas de 3 números.
// - Capacidad de vehículo: número entero entre 1 y 8.
// - Código de verificación: exactamente 6 dígitos numéricos.
// =============================================================================

export const INSTITUTIONAL_DOMAIN = '@unisabana.edu.co';

/**
 * Valida un correo electrónico.
 * Retorna null si es válido, o un mensaje de error en español si no lo es.
 */
export function validateEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    return 'Por favor ingresa tu correo electrónico.';
  }

  // Comprobación de formato general de correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return 'Por favor ingresa un formato de correo electrónico válido.';
  }

  // Regla R1: solo correos de la Universidad de La Sabana
  if (!trimmed.endsWith(INSTITUTIONAL_DOMAIN)) {
    return `Solo se permiten correos institucionales terminados en ${INSTITUTIONAL_DOMAIN}.`;
  }

  return null;
}

/**
 * Valida la contraseña para registro o inicio de sesión.
 * Supabase Auth exige mínimo 6 caracteres por defecto (D-12, R16).
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Por favor ingresa tu contraseña.';
  }
  if (password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  return null;
}

/**
 * Valida el ID universitario de La Sabana (exactamente 10 dígitos).
 */
export function validateIdUniversidad(id: string): string | null {
  const trimmed = id.trim();
  if (!trimmed) {
    return 'Por favor ingresa tu ID universitario.';
  }
  if (!/^[0-9]{10}$/.test(trimmed)) {
    return 'El ID universitario debe tener exactamente 10 dígitos numéricos.';
  }
  return null;
}

/**
 * Valida el teléfono móvil en Colombia (exactamente 10 dígitos, ej: 3001234567).
 */
export function validatePhone(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) {
    return 'Por favor ingresa tu número de teléfono.';
  }
  if (!/^[0-9]{10}$/.test(trimmed)) {
    return 'El teléfono debe tener exactamente 10 dígitos numéricos.';
  }
  return null;
}

/**
 * Valida un campo de texto obligatorio (nombre, apellido, marca, modelo).
 */
export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || !value.trim()) {
    return `Por favor completa el campo ${fieldName}.`;
  }
  return null;
}

/**
 * Valida la placa de un vehículo en Colombia: 3 letras mayúsculas + 3 números (ej: ABC123).
 */
export function validatePlaca(placa: string): string | null {
  const trimmed = placa.trim().toUpperCase();
  if (!trimmed) {
    return 'Por favor ingresa la placa del vehículo.';
  }
  if (!/^[A-Z]{3}[0-9]{3}$/.test(trimmed)) {
    return 'La placa debe tener 3 letras seguidas de 3 números (ejemplo: ABC123).';
  }
  return null;
}

/**
 * Valida la capacidad de pasajeros del vehículo (entero entre 1 y 8).
 */
export function validateCapacidad(capacidad: string | number): string | null {
  const parsed = typeof capacidad === 'number' ? capacidad : parseInt(capacidad.trim(), 10);
  if (isNaN(parsed) || !Number.isInteger(parsed)) {
    return 'La capacidad debe ser un número entero.';
  }
  if (parsed < 1 || parsed > 8) {
    return 'La capacidad debe ser entre 1 y 8 puestos.';
  }
  return null;
}

/**
 * Valida el código de verificación OTP de 6 dígitos.
 */
export function validateVerificationCode(code: string): string | null {
  const trimmed = code.trim();
  if (!trimmed) {
    return 'Por favor ingresa el código de verificación.';
  }
  if (!/^[0-9]{6}$/.test(trimmed)) {
    return 'El código de verificación debe tener exactamente 6 dígitos.';
  }
  return null;
}

/**
 * Valida formato de fecha DD/MM/AAAA. Acepta día y mes de un dígito (1/12/2026):
 * es como la gente escribe la fecha y no cambia su significado (TC-10).
 */
export function validateDate(dateStr: string): string | null {
  const trimmed = dateStr.trim();
  if (!trimmed) {
    return 'Por favor ingresa la fecha del viaje.';
  }
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (!match) {
    return 'La fecha debe tener el formato DD/MM/AAAA (ej: 15/11/2026).';
  }
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return 'La fecha ingresada no es válida.';
  }
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return 'La fecha ingresada no existe en el calendario.';
  }
  return null;
}

/**
 * Valida formato de hora HH:MM (24 horas). Acepta la hora de un dígito ("6:00"),
 * que la gente escribe así; los minutos sí van siempre con dos dígitos (TC-10).
 */
export function validateTime(timeStr: string): string | null {
  const trimmed = timeStr.trim();
  if (!trimmed) {
    return 'Por favor ingresa la hora de salida.';
  }
  const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (!match) {
    return 'La hora debe tener el formato HH:MM (ej: 07:30 o 14:15).';
  }
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return 'La hora ingresada no es válida.';
  }
  return null;
}

/**
 * Valida que la salida combinada (fecha y hora) sea en el futuro (R4).
 */
export function validateFutureDeparture(
  dateStr: string,
  timeStr: string,
): { error: string | null; iso: string | null } {
  const errDate = validateDate(dateStr);
  if (errDate) return { error: errDate, iso: null };
  const errTime = validateTime(timeStr);
  if (errTime) return { error: errTime, iso: null };

  const [d, m, y] = dateStr
    .trim()
    .split('/')
    .map((n) => parseInt(n, 10));
  const [h, min] = timeStr
    .trim()
    .split(':')
    .map((n) => parseInt(n, 10));
  const departureDate = new Date(y, m - 1, d, h, min, 0, 0);

  if (departureDate.getTime() <= Date.now()) {
    return {
      error: 'La hora de salida debe ser en el futuro.',
      iso: null,
    };
  }

  return { error: null, iso: departureDate.toISOString() };
}

/**
 * Valida los cupos ofertados por el conductor para el viaje (R4: entero de 1 hasta la capacidad del vehículo).
 */
export function validateTripCupos(cupos: string | number, maxCapacidad = 8): string | null {
  const parsed = typeof cupos === 'number' ? cupos : parseInt(cupos.trim(), 10);
  if (isNaN(parsed) || !Number.isInteger(parsed)) {
    return 'Los cupos deben ser un número entero.';
  }
  if (parsed < 1) {
    return 'Debes ofrecer al menos 1 cupo.';
  }
  if (parsed > maxCapacidad) {
    return `Los cupos no pueden superar la capacidad de tu vehículo (${maxCapacidad} puestos).`;
  }
  return null;
}

/**
 * Valida el valor por cupo en pesos colombianos (R4: 0 o más).
 */
export function validatePrice(price: string | number): string | null {
  const parsed = typeof price === 'number' ? price : parseInt(price.trim(), 10);
  if (isNaN(parsed) || !Number.isInteger(parsed)) {
    return 'El valor por cupo debe ser un número entero en pesos.';
  }
  if (parsed < 0) {
    return 'El valor no puede ser negativo.';
  }
  return null;
}

export const MAX_RATING_COMMENT_LENGTH = 280;

/**
 * Valida la puntuación de estrellas para calificar un viaje (R9: entero entre 1 y 5).
 */
export function validateRatingStars(stars: number): string | null {
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return 'Selecciona una calificación entre 1 y 5 estrellas.';
  }
  return null;
}

/**
 * Valida el comentario opcional de una calificación (R9: máximo 280 caracteres).
 */
export function validateRatingComment(comment: string): string | null {
  if (comment.trim().length > MAX_RATING_COMMENT_LENGTH) {
    return `El comentario no puede superar ${MAX_RATING_COMMENT_LENGTH} caracteres.`;
  }
  return null;
}
