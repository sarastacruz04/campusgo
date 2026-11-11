import { ImageManipulator } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { MAX_IMAGE_SIDE, pickImageFromLibrary } from '@/lib/imagePicker';

// Galería y manipulador simulados SOLO dentro de estas pruebas.
const mockResize = jest.fn();
const mockSave = jest.fn(async () => ({
  uri: 'file:///cache/reducida.jpg',
  width: 1280,
  height: 960,
}));
jest.mock('expo-image-manipulator', () => ({
  SaveFormat: { JPEG: 'jpeg' },
  ImageManipulator: {
    manipulate: jest.fn(() => ({
      resize: mockResize,
      renderAsync: async () => ({ saveAsync: mockSave }),
    })),
  },
}));
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
  launchImageLibraryAsync: jest.fn(),
}));

const picker = jest.mocked(ImagePicker);

function pickedAsset(width: number, height: number) {
  picker.launchImageLibraryAsync.mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///galeria/foto.jpg', width, height, mimeType: 'image/png' }],
  } as ImagePicker.ImagePickerResult);
}

beforeEach(() => jest.clearAllMocks());

describe('pickImageFromLibrary (imágenes de tamaño razonable, E8)', () => {
  it('reduce una foto horizontal grande a 1280 px de ancho y la guarda como JPEG', async () => {
    pickedAsset(4000, 3000);
    const image = await pickImageFromLibrary();
    expect(ImageManipulator.manipulate).toHaveBeenCalledWith('file:///galeria/foto.jpg');
    expect(mockResize).toHaveBeenCalledWith({ width: MAX_IMAGE_SIDE, height: null });
    expect(mockSave).toHaveBeenCalledWith({ format: 'jpeg', compress: 0.7 });
    expect(image).toMatchObject({ uri: 'file:///cache/reducida.jpg', mimeType: 'image/jpeg' });
    expect(image?.fileName).toMatch(/\.jpg$/);
  });

  it('en una foto vertical reduce el alto', async () => {
    pickedAsset(3000, 4000);
    await pickImageFromLibrary({ aspect: [3, 4] });
    expect(mockResize).toHaveBeenCalledWith({ width: null, height: MAX_IMAGE_SIDE });
  });

  it('no agranda una foto pequeña, solo la comprime', async () => {
    pickedAsset(800, 800);
    await pickImageFromLibrary();
    expect(mockResize).not.toHaveBeenCalled();
    expect(mockSave).toHaveBeenCalled();
  });

  it('devuelve null si se cancela o no hay permiso', async () => {
    picker.launchImageLibraryAsync.mockResolvedValue({ canceled: true, assets: null });
    expect(await pickImageFromLibrary()).toBeNull();
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce({
      granted: false,
    } as Awaited<ReturnType<typeof ImagePicker.requestMediaLibraryPermissionsAsync>>);
    expect(await pickImageFromLibrary()).toBeNull();
    expect(ImageManipulator.manipulate).not.toHaveBeenCalled();
  });
});
