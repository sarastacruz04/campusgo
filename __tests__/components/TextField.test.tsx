import { fireEvent, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { TextField } from '@/components/ui/TextField';
import { TOUCH_MIN } from '@/theme/layout';
import { flatStyle, renderWithProviders } from '@/test-utils/render';

describe('TextField', () => {
  it('muestra la etiqueta visible y la usa como nombre accesible (S-05, V-02)', async () => {
    await renderWithProviders(
      <TextField label="Correo electrónico" value="" onChangeText={jest.fn()} />,
    );
    expect(screen.getByText('Correo electrónico')).toBeOnTheScreen();
    expect(screen.getByLabelText('Correo electrónico')).toBeOnTheScreen();
  });

  it('lee la pista de formato como accessibilityHint', async () => {
    await renderWithProviders(
      <TextField label="Teléfono" hint="10 dígitos" value="" onChangeText={jest.fn()} />,
    );
    expect(screen.getByLabelText('Teléfono').props.accessibilityHint).toBe('10 dígitos');
  });

  it('mide al menos TOUCH_MIN y no tiene altura fija (T-01, V-06)', async () => {
    await renderWithProviders(<TextField label="Placa" value="" onChangeText={jest.fn()} />);
    const style = flatStyle(screen.getByLabelText('Placa').props.style);
    expect(style.minHeight).toBeGreaterThanOrEqual(TOUCH_MIN);
    expect(style.height).toBeUndefined();
    expect(style.lineHeight).toBeGreaterThanOrEqual((style.fontSize ?? 0) * 1.4);
  });

  it('muestra el error en texto, lo incluye en la pista y lo anuncia (S-05, S-07, V-05)', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    await renderWithProviders(
      <TextField
        label="ID de la Universidad"
        hint="10 dígitos"
        error="Debe tener exactamente 10 dígitos."
        value="123"
        onChangeText={jest.fn()}
      />,
    );
    expect(screen.getByText('Debe tener exactamente 10 dígitos.')).toBeOnTheScreen();
    expect(screen.getByLabelText('ID de la Universidad').props.accessibilityHint).toContain(
      'Error: Debe tener exactamente 10 dígitos.',
    );
    expect(announce).toHaveBeenCalledWith(
      'ID de la Universidad: Debe tener exactamente 10 dígitos.',
    );
    announce.mockRestore();
  });

  it('el botón "Mostrar contraseña" alterna la visibilidad (T-08)', async () => {
    await renderWithProviders(
      <TextField label="Contraseña" password value="secreta" onChangeText={jest.fn()} />,
    );
    expect(screen.getByLabelText('Contraseña').props.secureTextEntry).toBe(true);

    await fireEvent.press(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(screen.getByLabelText('Contraseña').props.secureTextEntry).toBe(false);
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toBeOnTheScreen();
  });

  it('exige label en TypeScript', () => {
    // @ts-expect-error: un campo sin etiqueta no es accesible (V-02).
    const element = <TextField value="" onChangeText={jest.fn()} />;
    expect(element).toBeTruthy();
  });
});
