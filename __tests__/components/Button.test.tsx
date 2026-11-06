import { fireEvent, screen } from '@testing-library/react-native';

import { Button } from '@/components/ui/Button';
import { TOUCH_MIN } from '@/theme/layout';
import { flatStyle, renderWithProviders } from '@/test-utils/render';

describe('Button', () => {
  it('tiene rol button y su texto como nombre accesible (S-01)', async () => {
    const onPress = jest.fn();
    await renderWithProviders(<Button label="Iniciar Sesión" onPress={onPress} />);

    const button = screen.getByRole('button', { name: 'Iniciar Sesión' });
    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('mide al menos TOUCH_MIN de alto y de ancho (T-01)', async () => {
    await renderWithProviders(<Button label="Siguiente" onPress={jest.fn()} />);
    const style = flatStyle(screen.getByRole('button', { name: 'Siguiente' }).props.style);
    expect(style.minHeight).toBeGreaterThanOrEqual(TOUCH_MIN);
    expect(style.minWidth).toBeGreaterThanOrEqual(TOUCH_MIN);
    expect(style.height).toBeUndefined();
  });

  it('su texto tiene lineHeight de al menos 1,4 veces el tamaño (V-07)', async () => {
    await renderWithProviders(<Button label="Registrarse" onPress={jest.fn()} />);
    const style = flatStyle(screen.getByText('Registrarse').props.style);
    expect(style.lineHeight).toBeGreaterThanOrEqual((style.fontSize ?? 0) * 1.4);
  });

  it('mientras carga anuncia busy, se deshabilita y no responde al toque (T-05)', async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <Button label="Guardar" loading loadingLabel="Guardando…" onPress={onPress} />,
    );

    const button = screen.getByRole('button', { name: 'Guardando…' });
    expect(button).toBeBusy();
    expect(button).toBeDisabled();
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('deshabilitado anuncia disabled (S-06)', async () => {
    await renderWithProviders(<Button label="Enviar" disabled onPress={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
  });

  it('exige un label en TypeScript', () => {
    // @ts-expect-error: label es obligatorio, no puede existir un botón sin nombre.
    const element = <Button onPress={jest.fn()} />;
    expect(element).toBeTruthy();
  });
});
