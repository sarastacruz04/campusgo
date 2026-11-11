import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export type PickedImage = {
  uri: string;
  mimeType: string;
  fileName: string;
};

/**
 * Lado mayor máximo de una foto subida. Una foto de cámara de 12 MP mide unos
 * 4000 px y pesa varios MB; 1280 px basta para el avatar, el carro y leer el
 * SOAT, y sube mucho más rápido con datos móviles (E8, rendimiento).
 */
export const MAX_IMAGE_SIDE = 1280;
const JPEG_QUALITY = 0.7;

/**
 * Abre la galería del dispositivo para que el usuario seleccione una imagen.
 * Devuelve la URI local de una copia reducida (JPEG de máximo MAX_IMAGE_SIDE
 * px por lado), el tipo MIME y el nombre de archivo, o null si el usuario canceló.
 */
export async function pickImageFromLibrary(options?: {
  aspect?: [number, number];
}): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: options?.aspect ?? [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  // El selector de imágenes no tiene opción de tamaño: se reduce después con
  // expo-image-manipulator (incluido en Expo Go). Solo se toca el lado mayor.
  const landscape = asset.width >= asset.height;
  const context = ImageManipulator.manipulate(asset.uri);
  if (Math.max(asset.width, asset.height) > MAX_IMAGE_SIDE) {
    context.resize(
      landscape ? { width: MAX_IMAGE_SIDE, height: null } : { width: null, height: MAX_IMAGE_SIDE },
    );
  }
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY });

  return { uri: saved.uri, mimeType: 'image/jpeg', fileName: `upload_${Date.now()}.jpg` };
}
