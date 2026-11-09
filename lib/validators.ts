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
