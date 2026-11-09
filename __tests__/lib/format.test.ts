import { formatDeparture, formatPesos, formatRating, formatSeats, formatTime } from '@/lib/format';

describe('formatos de la tarjeta de viaje', () => {
  it('escribe la salida con el mes en palabras', () => {
    expect(formatDeparture(new Date(2026, 10, 8, 7, 5).toISOString())).toBe(
      '8 de noviembre, 7:05 a. m.',
    );
  });

  it('separa los miles con punto', () => {
    expect(formatPesos(0)).toBe('0 pesos');
    expect(formatPesos(5000)).toBe('5.000 pesos');
    expect(formatPesos(1250000)).toBe('1.250.000 pesos');
  });

  it('usa singular y plural en los cupos', () => {
    expect(formatSeats(1)).toBe('1 cupo');
    expect(formatSeats(3)).toBe('3 cupos');
  });

  it('usa coma decimal en la calificación', () => {
    expect(formatRating(4.5)).toBe('4,5');
    expect(formatRating(5)).toBe('5,0');
  });
});

describe('formatTime', () => {
  it('usa el formato de 12 horas de Colombia', () => {
    expect(formatTime(new Date(2026, 10, 7, 7, 5))).toBe('7:05 a. m.');
    expect(formatTime(new Date(2026, 10, 7, 15, 40))).toBe('3:40 p. m.');
    expect(formatTime(new Date(2026, 10, 7, 0, 0))).toBe('12:00 a. m.');
    expect(formatTime(new Date(2026, 10, 7, 12, 30))).toBe('12:30 p. m.');
  });
});
