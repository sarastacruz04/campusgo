import { act, fireEvent, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingState } from '@/components/ui/LoadingState';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { SCREEN_FOCUS_DELAY_MS } from '@/hooks/useScreenFocus';
import { renderWithProviders } from '@/test-utils/render';

describe('ConfirmDialog', () => {
  const baseProps = {
    title: '¿Está seguro que desea cancelar esta reserva?',
    message: 'Esta acción no se puede deshacer.',
    confirmLabel: 'Sí, cancelar reserva',
    cancelLabel: 'No, volver',
  };

  it('usa etiquetas explícitas y pone la opción segura primero (T-06)', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    await renderWithProviders(
      <ConfirmDialog visible {...baseProps} onConfirm={onConfirm} onCancel={onCancel} />,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.map((b) => b.props.accessibilityLabel)).toEqual([
      'No, volver',
      'Sí, cancelar reserva',
    ]);
    await fireEvent.press(screen.getByRole('button', { name: 'No, volver' }));
    expect(onCancel).toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Sí, cancelar reserva' }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('es modal, tiene título como encabezado y el escape cancela (S-08)', async () => {
    const onCancel = jest.fn();
    await renderWithProviders(
      <ConfirmDialog visible {...baseProps} onConfirm={jest.fn()} onCancel={onCancel} />,
    );
    const title = screen.getByRole('header', { name: baseProps.title });
    expect(title).toBeOnTheScreen();

    const modalContainer = screen.getByTestId('confirm-dialog');
    expect(modalContainer).toHaveProp('accessibilityViewIsModal', true);
    await act(() => modalContainer.props.onAccessibilityEscape());
    expect(onCancel).toHaveBeenCalled();
  });

  it('mueve el foco del lector al título al abrirse (S-08)', async () => {
    jest.useFakeTimers();
    const sendEvent = jest.spyOn(AccessibilityInfo, 'sendAccessibilityEvent').mockImplementation();
    await renderWithProviders(
      <ConfirmDialog visible {...baseProps} onConfirm={jest.fn()} onCancel={jest.fn()} />,
    );
    await act(() => jest.advanceTimersByTime(SCREEN_FOCUS_DELAY_MS));
    expect(sendEvent).toHaveBeenCalledWith(expect.anything(), 'focus');
    sendEvent.mockRestore();
    jest.useRealTimers();
  });

  it('no se muestra si visible es false', async () => {
    await renderWithProviders(
      <ConfirmDialog visible={false} {...baseProps} onConfirm={jest.fn()} onCancel={jest.fn()} />,
    );
    expect(screen.queryByText(baseProps.title)).not.toBeOnTheScreen();
  });
});

describe('StatusBanner', () => {
  it('muestra ícono + texto, se anuncia y ofrece "Reintentar" (S-07, T-05)', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    const onRetry = jest.fn();
    await renderWithProviders(
      <StatusBanner tone="error" message="No se pudieron cargar los viajes." onRetry={onRetry} />,
    );
    expect(screen.getByText('No se pudieron cargar los viajes.')).toBeOnTheScreen();
    expect(announce).toHaveBeenCalledWith('No se pudieron cargar los viajes.');
    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onRetry).toHaveBeenCalled();
    announce.mockRestore();
  });

  it('el mensaje es un solo foco con ícono y texto', async () => {
    await renderWithProviders(<StatusBanner tone="error" message="Error de red." />);
    expect(screen.getByLabelText('Error de red.')).toHaveProp('accessible', true);
  });
});

describe('LoadingState', () => {
  it('muestra texto, anuncia la carga y tiene estado busy (S-07, T-05)', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    await renderWithProviders(<LoadingState message="Cargando viajes…" />);
    expect(screen.getByText('Cargando viajes…')).toBeOnTheScreen();
    expect(screen.getByLabelText('Cargando viajes…')).toBeBusy();
    expect(announce).toHaveBeenCalledWith('Cargando viajes…');
    announce.mockRestore();
  });
});

describe('StepIndicator', () => {
  it('muestra "Paso x de y" (T-08)', async () => {
    await renderWithProviders(<StepIndicator current={2} total={6} />);
    expect(screen.getByText('Paso 2 de 6')).toBeOnTheScreen();
  });
});
