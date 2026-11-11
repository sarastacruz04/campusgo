import { fireEvent, screen } from '@testing-library/react-native';

import { StarRating } from '@/components/ratings/StarRating';
import { TOUCH_MIN } from '@/theme/layout';
import { flatStyle, renderWithProviders } from '@/test-utils/render';

describe('StarRating (accesibilidad E7)', () => {
  it('expone 5 botones con etiqueta "N de 5 estrellas", estado selected y área táctil >= TOUCH_MIN', async () => {
    const onChange = jest.fn();
    await renderWithProviders(<StarRating value={3} onChange={onChange} />);

    for (let n = 1; n <= 5; n++) {
      const btn = screen.getByRole('button', { name: `${n} de 5 estrellas` });
      expect(btn.props.accessibilityState).toMatchObject({ selected: n <= 3, disabled: false });
      const style = flatStyle(btn.props.style);
      expect(style.minWidth).toBeGreaterThanOrEqual(TOUCH_MIN);
      expect(style.minHeight).toBeGreaterThanOrEqual(TOUCH_MIN);
    }

    expect(screen.getByText('Calificación seleccionada: 3 de 5 estrellas')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: '4 de 5 estrellas' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('respeta disabled y muestra el mensaje de error si se pasa', async () => {
    const onChange = jest.fn();
    await renderWithProviders(
      <StarRating
        value={0}
        onChange={onChange}
        disabled
        error="Selecciona una calificación entre 1 y 5 estrellas."
      />,
    );

    const star1 = screen.getByRole('button', { name: '1 de 5 estrellas' });
    expect(star1.props.accessibilityState).toMatchObject({ selected: false, disabled: true });
    await fireEvent.press(star1);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('Selecciona una calificación entre 1 y 5 estrellas.')).toBeTruthy();
  });
});
