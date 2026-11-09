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

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/** "8 de noviembre, 7:05 a. m." */
export function formatDeparture(isoDate: string): string {
  const date = new Date(isoDate);
  return `${date.getDate()} de ${MONTHS[date.getMonth()]}, ${formatTime(date)}`;
}

/** "5.000 pesos" (punto como separador de miles). */
export function formatPesos(value: number): string {
  const withDots = Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withDots} pesos`;
}

/** "1 cupo" / "3 cupos" */
export function formatSeats(seats: number): string {
  return `${seats} ${seats === 1 ? 'cupo' : 'cupos'}`;
}

/** "4,5" (coma decimal, un decimal). */
export function formatRating(average: number): string {
  return average.toFixed(1).replace('.', ',');
}
