import { screen } from '@testing-library/react-native';

import Index from '@/app/index';
import { LOGO_LABEL } from '@/components/ui/Logo';
import { renderWithProviders } from '@/test-utils/render';

// Prueba de humo: la pantalla inicial renderiza con los providers de la app.
describe('Pantalla inicial', () => {
  it('muestra el logo con nombre accesible y un título como encabezado', async () => {
    await renderWithProviders(<Index />);

    expect(screen.getByRole('image', { name: LOGO_LABEL })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Te damos la bienvenida' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Ajustes de accesibilidad' })).toBeOnTheScreen();
  });
});
