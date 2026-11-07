// Formatos de texto en español de Colombia. Se hacen a mano (sin Intl) para que el
// resultado sea igual en todos los teléfonos y en las pruebas.

/** "7:05 a. m." / "3:40 p. m." */
export function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const suffix = hours < 12 ? 'a. m.' : 'p. m.';
  const hours12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hours12}:${minutes} ${suffix}`;
}
