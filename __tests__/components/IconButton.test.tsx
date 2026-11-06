import { fireEvent, screen } from '@testing-library/react-native';

import { IconButton } from '@/components/ui/IconButton';
import { TOUCH_MIN } from '@/theme/layout';
import { flatStyle, renderWithProviders } from '@/test-utils/render';

describe('IconButton', () => {
  it('se encuentra por su etiqueta en español y tiene rol button (S-01, S-02)', async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <IconButton icon="magnify" accessibilityLabel="Buscar viajes" onPress={onPress} />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Buscar viajes' }));
    expect(onPress).toHaveBeenCalled();
  });

  it('sin compact, el área visible mide TOUCH_MIN (T-01)', async () => {
    await renderWithProviders(
      <IconButton icon="power" accessibilityLabel="Cerrar sesión" onPress={jest.fn()} />,
    );
    const style = flatStyle(screen.getByRole('button', { name: 'Cerrar sesión' }).props.style);
    expect(style.minHeight).toBeGreaterThanOrEqual(TOUCH_MIN);
    expect(style.minWidth).toBeGreaterThanOrEqual(TOUCH_MIN);
  });

  it('con compact, el hitSlop completa el área táctil hasta TOUCH_MIN (T-02)', async () => {
    await renderWithProviders(
      <IconButton
        icon="trash-can-outline"
        compact
        iconSize={24}
        accessibilityLabel="Cancelar reserva"
        onPress={jest.fn()}
      />,
    );
    const button = screen.getByRole('button', { name: 'Cancelar reserva' });
    const style = flatStyle(button.props.style);
    const slop = button.props.hitSlop as {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    expect(Number(style.width) + slop.left + slop.right).toBeGreaterThanOrEqual(TOUCH_MIN);
    expect(Number(style.height) + slop.top + slop.bottom).toBeGreaterThanOrEqual(TOUCH_MIN);
  });

  it('el ícono queda oculto para el lector: no hay focos sin nombre', async () => {
    await renderWithProviders(
      <IconButton icon="pencil" accessibilityLabel="Editar perfil" onPress={jest.fn()} />,
    );
    // Con includeHiddenElements: false, solo debe existir el botón con nombre.
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('exige accessibilityLabel en TypeScript (S-02)', () => {
    // @ts-expect-error: un ícono sin texto necesita nombre accesible.
    const element = <IconButton icon="plus" onPress={jest.fn()} />;
    expect(element).toBeTruthy();
  });
});
