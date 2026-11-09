import {
  validateCapacidad,
  validateEmail,
  validateIdUniversidad,
  validatePassword,
  validatePhone,
  validatePlaca,
  validateRequired,
  validateVerificationCode,
} from '@/lib/validators';

describe('lib/validators', () => {
  describe('validateEmail', () => {
    it('acepta correos válidos terminados en @unisabana.edu.co (R1)', () => {
      expect(validateEmail('sborda@unisabana.edu.co')).toBeNull();
      expect(validateEmail('sara.santacruz@unisabana.edu.co')).toBeNull();
      expect(validateEmail(' ESTUDIANTE@UNISABANA.EDU.CO ')).toBeNull();
    });

    it('rechaza correos vacíos o mal formados', () => {
      expect(validateEmail('')).toMatch(/ingresa tu correo/i);
      expect(validateEmail('   ')).toMatch(/ingresa tu correo/i);
      expect(validateEmail('correo-invalido')).toMatch(/formato.*válido/i);
      expect(validateEmail('usuario@gmail')).toMatch(/formato.*válido/i);
    });

    it('rechaza correos de otros dominios (R1)', () => {
      expect(validateEmail('usuario@gmail.com')).toMatch(
        /solo se permiten correos institucionales/i,
      );
      expect(validateEmail('profesor@uniandes.edu.co')).toMatch(
        /solo se permiten correos institucionales/i,
      );
      expect(validateEmail('alguien@unisabana.com')).toMatch(
        /solo se permiten correos institucionales/i,
      );
    });
  });

  describe('validatePassword', () => {
    it('acepta contraseñas de al menos 6 caracteres (R16, D-12)', () => {
      expect(validatePassword('123456')).toBeNull();
      expect(validatePassword('miClaveSegura2026')).toBeNull();
    });

    it('rechaza contraseñas vacías o de menos de 6 caracteres', () => {
      expect(validatePassword('')).toMatch(/ingresa tu contraseña/i);
      expect(validatePassword('12345')).toMatch(/al menos 6 caracteres/i);
    });
  });

  describe('validateIdUniversidad', () => {
    it('acepta IDs de exactamente 10 dígitos numéricos', () => {
      expect(validateIdUniversidad('0000123456')).toBeNull();
      expect(validateIdUniversidad('1234567890')).toBeNull();
    });

    it('rechaza IDs vacíos, con letras o de longitud distinta a 10', () => {
      expect(validateIdUniversidad('')).toMatch(/ingresa tu ID/i);
      expect(validateIdUniversidad('123456789')).toMatch(/exactamente 10 dígitos/i);
      expect(validateIdUniversidad('12345678901')).toMatch(/exactamente 10 dígitos/i);
      expect(validateIdUniversidad('12345abcde')).toMatch(/exactamente 10 dígitos/i);
    });
  });

  describe('validatePhone', () => {
    it('acepta teléfonos colombianos de exactamente 10 dígitos', () => {
      expect(validatePhone('3001234567')).toBeNull();
      expect(validatePhone('3159876543')).toBeNull();
    });

    it('rechaza teléfonos vacíos, con letras o longitud distinta', () => {
      expect(validatePhone('')).toMatch(/ingresa tu número de teléfono/i);
      expect(validatePhone('300123456')).toMatch(/exactamente 10 dígitos/i);
      expect(validatePhone('30012345678')).toMatch(/exactamente 10 dígitos/i);
      expect(validatePhone('300-123-45')).toMatch(/exactamente 10 dígitos/i);
    });
  });

  describe('validateRequired', () => {
    it('acepta valores de texto con contenido', () => {
      expect(validateRequired('Samuel', 'Nombre')).toBeNull();
      expect(validateRequired('Toyota', 'Marca')).toBeNull();
    });

    it('rechaza cadenas vacías o con solo espacios', () => {
      expect(validateRequired('', 'Nombre')).toMatch(/completa el campo Nombre/i);
      expect(validateRequired('   ', 'Apellido')).toMatch(/completa el campo Apellido/i);
    });
  });

  describe('validatePlaca', () => {
    it('acepta placas en formato colombiano (3 letras + 3 números)', () => {
      expect(validatePlaca('ABC123')).toBeNull();
      expect(validatePlaca('xyz789')).toBeNull(); // Se pasa a mayúsculas
      expect(validatePlaca(' UUS456 ')).toBeNull();
    });

    it('rechaza formatos incorrectos de placa', () => {
      expect(validatePlaca('')).toMatch(/ingresa la placa/i);
      expect(validatePlaca('AB123')).toMatch(/3 letras seguidas de 3 números/i);
      expect(validatePlaca('ABCD12')).toMatch(/3 letras seguidas de 3 números/i);
      expect(validatePlaca('123ABC')).toMatch(/3 letras seguidas de 3 números/i);
      expect(validatePlaca('ABC-123')).toMatch(/3 letras seguidas de 3 números/i);
    });
  });

  describe('validateCapacidad', () => {
    it('acepta enteros entre 1 y 8', () => {
      expect(validateCapacidad(1)).toBeNull();
      expect(validateCapacidad(4)).toBeNull();
      expect(validateCapacidad(8)).toBeNull();
      expect(validateCapacidad('4')).toBeNull();
    });

    it('rechaza valores fuera del rango 1 a 8 o no enteros', () => {
      expect(validateCapacidad(0)).toMatch(/entre 1 y 8/i);
      expect(validateCapacidad(9)).toMatch(/entre 1 y 8/i);
      expect(validateCapacidad('abc')).toMatch(/número entero/i);
    });
  });

  describe('validateVerificationCode', () => {
    it('acepta códigos de exactamente 6 dígitos', () => {
      expect(validateVerificationCode('123456')).toBeNull();
      expect(validateVerificationCode('000123')).toBeNull();
    });

    it('rechaza códigos incompletos o con caracteres no numéricos', () => {
      expect(validateVerificationCode('')).toMatch(/ingresa el código/i);
      expect(validateVerificationCode('12345')).toMatch(/exactamente 6 dígitos/i);
      expect(validateVerificationCode('1234567')).toMatch(/exactamente 6 dígitos/i);
      expect(validateVerificationCode('12345a')).toMatch(/exactamente 6 dígitos/i);
    });
  });
});
