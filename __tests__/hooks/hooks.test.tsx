import { act, renderHook } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

import { useAnnounce } from '@/hooks/useAnnounce';
import { useHaptics } from '@/hooks/useHaptics';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { DEFAULT_PREFERENCES, ThemeProvider, type Preferences } from '@/theme/ThemeProvider';

// Solo dentro de las pruebas se simula el motor de vibración (no existe en Node).
jest.mock('expo-haptics', () => ({
  ...jest.requireActual('expo-haptics'),
  notificationAsync: jest.fn(() => Promise.resolve()),
  performAndroidHapticsAsync: jest.fn(() => Promise.resolve()),
}));

function wrapperWith(preferences: Partial<Preferences> = {}) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ThemeProvider initialPreferences={{ ...DEFAULT_PREFERENCES, ...preferences }}>
        {children}
      </ThemeProvider>
    );
  };
}

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe('useAnnounce (S-07)', () => {
  it('anuncia el mensaje al lector de pantalla', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    const { result } = await renderHook(() => useAnnounce());
    result.current('Reserva cancelada');
    expect(announce).toHaveBeenCalledWith('Reserva cancelada');
  });

  it('también anuncia en Android, donde la región viva no se oyó (C-06, D-27)', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    const { result } = await renderHook(() => useAnnounce());
    result.current('Error de red');
    expect(announce).toHaveBeenCalledWith('Error de red');
  });

  it('no anuncia mensajes vacíos', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    const { result } = await renderHook(() => useAnnounce());
    result.current('');
    expect(announce).not.toHaveBeenCalled();
  });
});

describe('useReduceMotion (V-09)', () => {
  it('lee el ajuste del sistema y quita el listener al desmontar', async () => {
    const remove = jest.fn();
    let listener: ((enabled: boolean) => void) | undefined;
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation((_event, handler) => {
      listener = handler as (enabled: boolean) => void;
      return { remove } as unknown as ReturnType<typeof AccessibilityInfo.addEventListener>;
    });

    const { result, unmount } = await renderHook(() => useReduceMotion(), {
      wrapper: wrapperWith(),
    });
    expect(result.current).toBe(true);

    await act(() => listener?.(false));
    expect(result.current).toBe(false);

    await unmount();
    expect(remove).toHaveBeenCalled();
  });

  it('también respeta la preferencia de la app', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    const { result } = await renderHook(() => useReduceMotion(), {
      wrapper: wrapperWith({ reduceMotion: true }),
    });
    expect(result.current).toBe(true);
  });
});

describe('useHaptics (T-04)', () => {
  it('en Android usa performAndroidHapticsAsync', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const { result } = await renderHook(() => useHaptics(), { wrapper: wrapperWith() });
    result.current.error();
    expect(Haptics.performAndroidHapticsAsync).toHaveBeenCalledWith(Haptics.AndroidHaptics.Reject);
  });

  it('en iOS usa notificationAsync', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const { result } = await renderHook(() => useHaptics(), { wrapper: wrapperWith() });
    result.current.success();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success,
    );
  });

  it('no vibra si el usuario apagó la vibración en Ajustes', async () => {
    const { result } = await renderHook(() => useHaptics(), {
      wrapper: wrapperWith({ haptics: false }),
    });
    result.current.error();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    expect(Haptics.performAndroidHapticsAsync).not.toHaveBeenCalled();
  });
});
