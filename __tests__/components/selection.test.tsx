import { fireEvent, screen } from '@testing-library/react-native';

import { BottomTabBar } from '@/components/ui/BottomTabBar';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { SwitchRow } from '@/components/ui/SwitchRow';
import { TOUCH_MIN } from '@/theme/layout';
import { flatStyle, renderWithProviders } from '@/test-utils/render';

describe('SegmentedToggle (selector Pasajero/Conductor)', () => {
  const options = [
    { value: 'pasajero', label: 'Pasajero', accessibilityLabel: 'Modo pasajero' },
    { value: 'conductor', label: 'Conductor', accessibilityLabel: 'Modo conductor' },
  ] as const;

  it('es un radiogroup con dos radio y estado checked (S-03)', async () => {
    await renderWithProviders(
      <SegmentedToggle
        accessibilityLabel="Modo de uso"
        options={[...options]}
        value="pasajero"
        onChange={jest.fn()}
      />,
    );
    // El contenedor no es un foco (sus radios sí), por eso se busca por etiqueta.
    expect(screen.getByLabelText('Modo de uso')).toHaveProp('accessibilityRole', 'radiogroup');
    expect(screen.getByRole('radio', { name: 'Modo pasajero' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Modo conductor' })).not.toBeChecked();
    // Texto visible, no solo ícono (V-03).
    expect(screen.getByText('Pasajero')).toBeOnTheScreen();
  });

  it('avisa el cambio solo al tocar la opción no seleccionada', async () => {
    const onChange = jest.fn();
    await renderWithProviders(
      <SegmentedToggle
        accessibilityLabel="Modo de uso"
        options={[...options]}
        value="pasajero"
        onChange={onChange}
      />,
    );
    await fireEvent.press(screen.getByRole('radio', { name: 'Modo pasajero' }));
    expect(onChange).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('radio', { name: 'Modo conductor' }));
    expect(onChange).toHaveBeenCalledWith('conductor');
  });

  it('cada segmento mide al menos TOUCH_MIN (T-01)', async () => {
    await renderWithProviders(
      <SegmentedToggle
        accessibilityLabel="Modo de uso"
        options={[...options]}
        value="pasajero"
        onChange={jest.fn()}
      />,
    );
    const style = flatStyle(screen.getByRole('radio', { name: 'Modo conductor' }).props.style);
    expect(style.minHeight).toBeGreaterThanOrEqual(TOUCH_MIN);
  });
});

describe('RadioGroup', () => {
  it('marca la opción elegida y notifica el cambio (S-06)', async () => {
    const onChange = jest.fn();
    await renderWithProviders(
      <RadioGroup
        label="¿Quieres registrar un carro?"
        options={[
          { value: 'no', label: 'No' },
          { value: 'si', label: 'Sí' },
        ]}
        value="no"
        onChange={onChange}
      />,
    );
    expect(screen.getByLabelText('¿Quieres registrar un carro?')).toHaveProp(
      'accessibilityRole',
      'radiogroup',
    );
    expect(screen.getByRole('radio', { name: 'No' })).toBeChecked();
    await fireEvent.press(screen.getByRole('radio', { name: 'Sí' }));
    expect(onChange).toHaveBeenCalledWith('si');
  });
});

describe('SwitchRow', () => {
  it('es un solo foco con rol switch y estado checked', async () => {
    const onValueChange = jest.fn();
    await renderWithProviders(<SwitchRow label="Vibración" value onValueChange={onValueChange} />);
    const row = screen.getByRole('switch', { name: 'Vibración' });
    expect(row).toBeChecked();
    // El Switch nativo está oculto: solo hay un elemento con rol switch.
    expect(screen.getAllByRole('switch')).toHaveLength(1);
    await fireEvent.press(row);
    expect(onValueChange).toHaveBeenCalledWith(false);
  });
});

describe('BottomTabBar', () => {
  it('es un tablist con pestañas y la activa tiene selected (S-06)', async () => {
    const onPressTab = jest.fn();
    await renderWithProviders(
      <BottomTabBar
        tabs={[
          { key: 'inicio', label: 'Inicio', icon: 'home-outline' },
          { key: 'reservas', label: 'Reservas', icon: 'map-marker-radius-outline' },
          { key: 'curso', label: 'Curso', icon: 'road-variant' },
        ]}
        activeKey="inicio"
        onPressTab={onPressTab}
      />,
    );
    expect(screen.getByLabelText('Navegación principal')).toHaveProp(
      'accessibilityRole',
      'tablist',
    );
    expect(screen.getByRole('tab', { name: 'Inicio' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Curso' })).not.toBeSelected();
    // La activa se distingue también con subrayado (V-05).
    expect(flatStyle(screen.getByText('Inicio').props.style).textDecorationLine).toBe('underline');
    await fireEvent.press(screen.getByRole('tab', { name: 'Curso' }));
    expect(onPressTab).toHaveBeenCalledWith('curso');
  });
});
