import { fireEvent, screen } from '@testing-library/react-native';

import { ReservationCard } from '@/components/trips/ReservationCard';
import { TripCard, tripAccessibilityLabel } from '@/components/trips/TripCard';
import { TripFilters } from '@/components/trips/TripFilters';
import { InnerTabs } from '@/components/ui/InnerTabs';
import { TOUCH_MIN } from '@/theme/layout';
import { makeReservation, makeTrip } from '@/test-utils/factories';
import { flatStyle, renderWithProviders } from '@/test-utils/render';

jest.mock('@/hooks/useScreenFocus', () => ({
  useScreenFocus: jest.fn(() => ({ current: null })),
  SCREEN_FOCUS_DELAY_MS: 0,
}));

const noRating = { ratingAverage: null, ratingTotal: 0 };

describe('TripCard (S-04)', () => {
  const trip = makeTrip({
    sector_nombre: 'Colina',
    conductor_nombre: 'Miguel Ordóñez',
    cupos_disponibles: 2,
    valor_por_cupo: 5000,
  });

  it('es un solo foco con una etiqueta compuesta', async () => {
    await renderWithProviders(<TripCard trip={trip} {...noRating} onPress={jest.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    const label = buttons[0].props.accessibilityLabel as string;
    expect(label).toContain('Colina');
    expect(label).toContain('Conductor Miguel Ordóñez');
    expect(label).toContain('Valor 5.000 pesos');
    expect(label).toContain('2 cupos');
  });

  it('muestra las líneas del Figma y avisa con el id al tocarla', async () => {
    const onPress = jest.fn();
    await renderWithProviders(<TripCard trip={trip} {...noRating} onPress={onPress} />);
    expect(screen.getByText('Hora salida:', { exact: false })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledWith(trip.id);
  });

  it('lee la calificación con coma decimal o avisa que no tiene', () => {
    expect(tripAccessibilityLabel(trip, { ratingAverage: 4.5, ratingTotal: 2 })).toContain(
      'Calificación: 4,5 de 5 (2)',
    );
    expect(tripAccessibilityLabel(trip, noRating)).toContain('Sin calificaciones');
  });
});

describe('ReservationCard', () => {
  it('la papelera es un foco aparte con nombre y entrega su referencia', async () => {
    const onPressCancel = jest.fn();
    const reservation = makeReservation({ id: 'r1' });
    await renderWithProviders(
      <ReservationCard reservation={reservation} {...noRating} onPressCancel={onPressCancel} />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar reserva de Colina' }));
    expect(onPressCancel).toHaveBeenCalledWith(
      'r1',
      expect.objectContaining({ current: expect.anything() }),
    );
    expect(screen.getByLabelText(/^Reserva pendiente\. Colina/)).toBeOnTheScreen();
  });

  it('sin onPressCancel no muestra la papelera', async () => {
    await renderWithProviders(<ReservationCard reservation={makeReservation()} {...noRating} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('si RLS oculta el viaje, avisa en lugar de romperse', async () => {
    await renderWithProviders(
      <ReservationCard reservation={makeReservation({ viaje: null })} {...noRating} />,
    );
    expect(screen.getByText('Viaje no disponible')).toBeOnTheScreen();
    expect(screen.getByLabelText(/ya no están disponibles/)).toBeOnTheScreen();
  });
});

describe('TripFilters y SelectField', () => {
  const sectores = [
    { id: 1, nombre: 'Colina' },
    { id: 2, nombre: 'Chía' },
  ];
  const props = {
    sectores,
    sectorId: null,
    onChangeSector: jest.fn(),
    cupos: '',
    onChangeCupos: jest.fn(),
    onSearch: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('abre la lista como modal y devuelve el sector elegido (S-08)', async () => {
    await renderWithProviders(<TripFilters {...props} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Sectores: Todos los sectores' }));

    expect(screen.getByTestId('select-dialog')).toHaveProp('accessibilityViewIsModal', true);
    expect(screen.getByRole('header', { name: 'Sectores' })).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Todos los sectores' })).toBeChecked();

    await fireEvent.press(screen.getByRole('radio', { name: 'Chía' }));
    expect(props.onChangeSector).toHaveBeenCalledWith(2);
  });

  it('"Todos los sectores" quita el filtro', async () => {
    await renderWithProviders(<TripFilters {...props} sectorId={1} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Sectores: Colina' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Todos los sectores' }));
    expect(props.onChangeSector).toHaveBeenCalledWith(null);
  });

  it('el campo de puestos tiene etiqueta visible y la lupa tiene nombre (S-02, V-02)', async () => {
    await renderWithProviders(<TripFilters {...props} />);
    expect(screen.getByText('Cantidad de puestos disponibles')).toBeOnTheScreen();
    const field = screen.getByLabelText('Cantidad de puestos disponibles');
    expect(field).toHaveProp('inputMode', 'numeric');
    await fireEvent.press(screen.getByRole('button', { name: 'Buscar viajes' }));
    expect(props.onSearch).toHaveBeenCalled();
  });
});

describe('InnerTabs', () => {
  it('es un tablist con la pestaña activa seleccionada y en negrita (S-06, V-05)', async () => {
    const onChange = jest.fn();
    await renderWithProviders(
      <InnerTabs
        accessibilityLabel="Estado de las reservas"
        tabs={[
          { key: 'a', label: 'Pendientes' },
          { key: 'b', label: 'Aceptados' },
        ]}
        activeKey="a"
        onChange={onChange}
      />,
    );
    expect(screen.getByLabelText('Estado de las reservas')).toHaveProp(
      'accessibilityRole',
      'tablist',
    );
    const active = screen.getByRole('tab', { name: 'Pendientes' });
    expect(active).toBeSelected();
    expect(flatStyle(active.props.style).minHeight).toBeGreaterThanOrEqual(TOUCH_MIN);
    expect(flatStyle(screen.getByText('Pendientes').props.style).fontFamily).toBe(
      'NotoSans_700Bold',
    );
    await fireEvent.press(screen.getByRole('tab', { name: 'Aceptados' }));
    expect(onChange).toHaveBeenCalledWith('b');
  });
});
