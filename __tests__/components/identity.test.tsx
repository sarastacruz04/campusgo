import { act, fireEvent, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Text } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Logo, LOGO_LABEL } from '@/components/ui/Logo';
import { PhotoPicker } from '@/components/ui/PhotoPicker';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { SCREEN_FOCUS_DELAY_MS } from '@/hooks/useScreenFocus';
import { MAX_FONT_SIZE_MULTIPLIER } from '@/theme/typography';
import { flatStyle, renderWithProviders } from '@/test-utils/render';

describe('Logo', () => {
  it('en bienvenida es una sola imagen con nombre (S-09)', async () => {
    await renderWithProviders(<Logo size="large" />);
    expect(screen.getByRole('image', { name: LOGO_LABEL })).toBeOnTheScreen();
    expect(screen.getByText('By Sara y Samuel', { includeHiddenElements: true })).toBeTruthy();
  });

  it('en el encabezado es decorativo y el lector lo salta', async () => {
    await renderWithProviders(<Logo size="small" decorative />);
    expect(screen.queryByRole('image', { name: LOGO_LABEL })).toBeNull();
    expect(screen.getByTestId('logo', { includeHiddenElements: true })).not.toBeVisible();
  });
});

describe('AppText', () => {
  it('escala con el sistema hasta 200 % y define lineHeight (V-06, V-07)', async () => {
    await renderWithProviders(<AppText>Ñandú</AppText>);
    const text = screen.getByText('Ñandú');
    expect(text.props.allowFontScaling).toBe(true);
    expect(text.props.maxFontSizeMultiplier).toBe(MAX_FONT_SIZE_MULTIPLIER);
    const style = flatStyle(text.props.style);
    expect(style.lineHeight).toBeGreaterThanOrEqual((style.fontSize ?? 0) * 1.4);
  });

  it('el tamaño "Extra grande" de Ajustes agranda el texto', async () => {
    await renderWithProviders(<AppText>Hola</AppText>, { textSize: 'extraLarge' });
    expect(flatStyle(screen.getByText('Hola').props.style).fontSize).toBeGreaterThan(16);
  });

  it('el tema de alto contraste usa texto negro', async () => {
    await renderWithProviders(<AppText>Contraste</AppText>, { theme: 'highContrast' });
    expect(flatStyle(screen.getByText('Contraste').props.style).color).toBe('#000000');
  });
});

describe('ScreenTitle', () => {
  it('tiene rol header y recibe el foco al montarse (S-01, T-03)', async () => {
    jest.useFakeTimers();
    const sendEvent = jest.spyOn(AccessibilityInfo, 'sendAccessibilityEvent').mockImplementation();
    await renderWithProviders(<ScreenTitle>Viajes reservados</ScreenTitle>);
    expect(screen.getByRole('header', { name: 'Viajes reservados' })).toBeOnTheScreen();
    expect(sendEvent).not.toHaveBeenCalled();
    await act(() => jest.advanceTimersByTime(SCREEN_FOCUS_DELAY_MS));
    expect(sendEvent).toHaveBeenCalledWith(expect.anything(), 'focus');
    sendEvent.mockRestore();
    jest.useRealTimers();
  });
});

describe('PhotoPicker', () => {
  it('es un botón con etiqueta y pista; anuncia "foto cargada" (S-09)', async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <PhotoPicker
        label="Foto del SOAT vigente"
        hint="Abre la galería o la cámara"
        onPress={onPress}
      />,
    );
    const button = screen.getByRole('button', { name: 'Foto del SOAT vigente' });
    expect(button.props.accessibilityHint).toBe('Abre la galería o la cámara');
    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalled();
  });

  it('con una foto elegida, la etiqueta incluye el estado', async () => {
    await renderWithProviders(
      <PhotoPicker
        label="Foto de perfil"
        hint="Abre la galería o la cámara"
        imageUri="file:///foto.jpg"
        variant="avatar"
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Foto de perfil, foto cargada' })).toBeOnTheScreen();
  });
});

describe('ScreenLayout', () => {
  it('ordena encabezado, selector de modo y título como en el Figma (T-03)', async () => {
    await renderWithProviders(
      <ScreenLayout
        title="¡Buen viaje Sara!"
        mode="pasajero"
        onChangeMode={jest.fn()}
        onPressProfile={jest.fn()}
      >
        <Text>Contenido</Text>
      </ScreenLayout>,
    );
    // getAllByRole devuelve los elementos en el orden del árbol, que es el orden de foco.
    const focusOrder = screen
      .getAllByRole(/^(button|radio|header)$/)
      .map((node) => node.props.accessibilityLabel ?? node.props.children);
    expect(focusOrder).toEqual(['Perfil', 'Modo pasajero', 'Modo conductor', '¡Buen viaje Sara!']);
  });

  it('con botón de volver, "Volver" va antes que "Perfil" y el logo no es foco (C-02)', async () => {
    await renderWithProviders(
      <ScreenLayout title="Ajustes" onBack={jest.fn()} onPressProfile={jest.fn()}>
        <Text>Contenido</Text>
      </ScreenLayout>,
    );
    const focusOrder = screen
      .getAllByRole(/^(button|header|image)$/)
      .map((node) => node.props.accessibilityLabel ?? node.props.children);
    expect(focusOrder).toEqual(['Volver', 'Perfil', 'Ajustes']);
    // El logo decorativo no usa no-hide-descendants (afectaba al botón vecino en Android).
    expect(screen.getByTestId('logo', { includeHiddenElements: true })).toHaveProp(
      'importantForAccessibility',
      'no',
    );
  });
});
