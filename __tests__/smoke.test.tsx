import { render, screen } from '@testing-library/react-native';

import Index from '@/app/index';

// Prueba de humo: confirma que jest-expo, Testing Library y el alias "@/" funcionan.
describe('Pantalla inicial', () => {
  it('muestra el título como encabezado accesible', async () => {
    await render(<Index />);

    expect(screen.getByRole('header', { name: 'CampusGo' })).toBeOnTheScreen();
    expect(screen.getByText('Conectando estudiantes, compartiendo trayectos')).toBeOnTheScreen();
  });
});
