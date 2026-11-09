import { act, renderHook } from '@testing-library/react-native';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useLocationPoint } from '@/hooks/useLocationPoint';
import { forwardGeocode, getCurrentCoordinates, reverseGeocode } from '@/lib/location';
import { deferred } from '@/test-utils/factories';

jest.mock('@/lib/location', () => ({
  reverseGeocode: jest.fn(),
  forwardGeocode: jest.fn(),
  getCurrentCoordinates: jest.fn(),
}));

const here = { latitude: 4.8, longitude: -74 };
const there = { latitude: 4.9, longitude: -74.1 };

beforeEach(() => jest.clearAllMocks());

describe('useDebouncedValue', () => {
  it('solo cambia cuando el valor lleva el tiempo indicado sin cambiar', async () => {
    jest.useFakeTimers();
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'a' } },
    );
    await rerender({ value: 'ab' });
    await act(() => jest.advanceTimersByTime(200));
    await rerender({ value: 'abc' });
    await act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe('a');
    await act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe('abc');
    jest.useRealTimers();
  });
});

describe('useLocationPoint', () => {
  it('al elegir un punto escribe la dirección', async () => {
    jest.mocked(reverseGeocode).mockResolvedValue('Calle 1, Chía');
    const { result } = await renderHook(() => useLocationPoint());
    await act(() => result.current.selectPoint(here));
    expect(result.current.point).toEqual(here);
    expect(result.current.address).toBe('Calle 1, Chía');
    expect(result.current.notice).toBeNull();
  });

  it('si no obtiene la dirección avisa y deja el punto', async () => {
    jest.mocked(reverseGeocode).mockResolvedValue(null);
    const { result } = await renderHook(() => useLocationPoint());
    await act(() => result.current.selectPoint(here));
    expect(result.current.point).toEqual(here);
    expect(result.current.notice).toContain('Escríbela en el campo');
  });

  it('ignora la dirección de un toque viejo que llega tarde', async () => {
    const slow = deferred<string | null>();
    jest
      .mocked(reverseGeocode)
      .mockImplementationOnce(() => slow.promise)
      .mockResolvedValueOnce('Punto nuevo');
    const { result } = await renderHook(() => useLocationPoint());

    let first: Promise<void> = Promise.resolve();
    await act(async () => {
      first = result.current.selectPoint(here);
      await result.current.selectPoint(there);
    });
    await act(async () => {
      slow.resolve('Punto viejo');
      await first;
    });

    expect(result.current.address).toBe('Punto nuevo');
    expect(result.current.point).toEqual(there);
  });

  it('sin permiso de ubicación avisa con otra forma de hacerlo', async () => {
    jest.mocked(getCurrentCoordinates).mockResolvedValue(null);
    const { result } = await renderHook(() => useLocationPoint());
    await act(() => result.current.locateMe());
    expect(result.current.resolving).toBe(false);
    expect(result.current.notice).toContain('toca el mapa o escribe la dirección');
  });

  it('usa el punto del mapa o, si solo hay texto, busca la dirección', async () => {
    jest.mocked(reverseGeocode).mockResolvedValue('Calle 1');
    jest.mocked(forwardGeocode).mockResolvedValue(there);

    const withMap = await renderHook(() => useLocationPoint());
    await act(() => withMap.result.current.selectPoint(here));
    await expect(withMap.result.current.resolveCoordinates()).resolves.toEqual(here);
    expect(forwardGeocode).not.toHaveBeenCalled();

    const typed = await renderHook(() => useLocationPoint());
    await act(async () => typed.result.current.setAddress(' Portería '));
    await expect(typed.result.current.resolveCoordinates()).resolves.toEqual(there);
    expect(forwardGeocode).toHaveBeenCalledWith('Portería');
  });
});
