import { formatTime } from '@/lib/format';

describe('formatTime', () => {
  it('usa el formato de 12 horas de Colombia', () => {
    expect(formatTime(new Date(2026, 10, 7, 7, 5))).toBe('7:05 a. m.');
    expect(formatTime(new Date(2026, 10, 7, 15, 40))).toBe('3:40 p. m.');
    expect(formatTime(new Date(2026, 10, 7, 0, 0))).toBe('12:00 a. m.');
    expect(formatTime(new Date(2026, 10, 7, 12, 30))).toBe('12:30 p. m.');
  });
});
