import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import AccessibilitySettingsScreen from '@/app/settings/accessibility';
import { AppText } from '@/components/ui/AppText';
import { themes } from '@/theme/colors';
import { PREFERENCES_STORAGE_KEY, ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { renderWithProviders } from '@/test-utils/render';

function ThemeProbe() {
  const { themeName, ready } = useTheme();
  return <AppText>{ready ? `tema:${themeName}` : 'cargando'}</AppText>;
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('ThemeProvider (V-08)', () => {
  it('carga la preferencia guardada al iniciar', async () => {
    await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ theme: 'highContrast' }));
    await render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(await screen.findByText('tema:highContrast')).toBeOnTheScreen();
  });

  it('ignora datos guardados corruptos y usa los valores por defecto', async () => {
    await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, '{no es json');
    await render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(await screen.findByText(/^tema:/)).toBeOnTheScreen();
  });

  it('falla con un mensaje claro si se usa fuera del provider', async () => {
    // React registra el error en consola; se silencia solo en esta prueba.
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(render(<ThemeProbe />)).rejects.toThrow(
      'useTheme debe usarse dentro de <ThemeProvider>.',
    );
    jest.restoreAllMocks();
  });
});

describe('Ajustes de accesibilidad', () => {
  it('cambia el tema, lo aplica y lo guarda', async () => {
    await renderWithProviders(<AccessibilitySettingsScreen />);
    expect(screen.getByRole('header', { name: 'Ajustes de accesibilidad' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('radio', { name: 'Alto contraste' }));
    expect(screen.getByRole('radio', { name: 'Alto contraste' })).toBeChecked();

    await waitFor(async () => {
      const saved = JSON.parse((await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY)) ?? '{}');
      expect(saved.theme).toBe('highContrast');
    });
    // El título ya usa el color de texto del alto contraste.
    const title = screen.getByRole('header', { name: 'Ajustes de accesibilidad' });
    expect(title.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: themes.highContrast.text })]),
    );
  });

  it('ofrece tamaño de texto, reducir movimiento y vibración', async () => {
    await renderWithProviders(<AccessibilitySettingsScreen />);
    expect(screen.getByLabelText('Tamaño del texto')).toHaveProp('accessibilityRole', 'radiogroup');
    expect(screen.getByRole('radio', { name: 'Extra grande' })).toBeOnTheScreen();

    const reduce = screen.getByRole('switch', { name: 'Reducir movimiento' });
    expect(reduce).not.toBeChecked();
    await act(() => fireEvent.press(reduce));
    expect(screen.getByRole('switch', { name: 'Reducir movimiento' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Vibración' })).toBeChecked();
  });
});
