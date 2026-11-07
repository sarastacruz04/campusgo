import { ERRORS, isAppError, toAppError, unwrap } from '@/services/errors';

describe('toAppError', () => {
  it('traduce los códigos de las RPC (RAISE EXCEPTION llega como P0001)', () => {
    expect(toAppError({ code: 'P0001', message: 'reserva_propia' })).toEqual({
      code: 'reserva_propia',
      message: 'No puedes reservar tu propio viaje.',
    });
    expect(toAppError({ code: 'P0001', message: 'sin_vehiculo' }).code).toBe('sin_vehiculo');
  });

  it('traduce los errores de Supabase Auth', () => {
    expect(
      toAppError({ code: 'invalid_credentials', message: 'Invalid login credentials' }),
    ).toEqual({
      code: 'invalid_credentials',
      message: 'El correo o la contraseña no son correctos.',
    });
    expect(toAppError({ code: 'email_not_confirmed', message: 'x' }).code).toBe(
      'email_not_confirmed',
    );
  });

  it('reconoce la falta de red', () => {
    expect(toAppError(new TypeError('Network request failed'))).toEqual(ERRORS.sinConexion);
    expect(toAppError({ name: 'AuthRetryableFetchError', message: 'Failed to fetch' })).toEqual(
      ERRORS.sinConexion,
    );
  });

  it('reconoce el rechazo de un correo de otro dominio en la base (R1)', () => {
    expect(toAppError({ message: 'Database error saving new user' })).toEqual(
      ERRORS.correoNoInstitucional,
    );
  });

  it('traduce códigos de PostgreSQL', () => {
    expect(toAppError({ code: '23505', message: 'duplicate key' }).code).toBe('duplicado');
    expect(toAppError({ code: '42501', message: 'rls' }).code).toBe('sin_permiso');
  });

  it('deja pasar un AppError y usa "desconocido" para lo demás', () => {
    expect(toAppError(ERRORS.sinSesion)).toBe(ERRORS.sinSesion);
    expect(toAppError({ code: 'XX000', message: 'raro' })).toEqual(ERRORS.desconocido);
    expect(toAppError('texto')).toEqual(ERRORS.desconocido);
    expect(isAppError(new Error('x'))).toBe(false);
  });
});

describe('unwrap', () => {
  it('devuelve data si no hay error', () => {
    expect(unwrap({ data: [1, 2], error: null })).toEqual([1, 2]);
  });

  it('lanza el AppError si hay error', () => {
    expect(() => unwrap({ data: null, error: { code: 'P0001', message: 'sin_cupos' } })).toThrow(
      expect.objectContaining({ code: 'sin_cupos' }),
    );
  });
});
