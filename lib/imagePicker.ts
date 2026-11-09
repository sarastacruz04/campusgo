import * as ImagePicker from 'expo-image-picker';

export type PickedImage = {
  uri: string;
  mimeType: string;
  fileName: string;
};

/**
 * Abre la galería del dispositivo para que el usuario seleccione una imagen.
 * Devuelve la URI local, el tipo MIME y el nombre de archivo sugerido,
 * o null si el usuario canceló la selección.
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
  const uri = asset.uri;
  const mimeType = asset.mimeType ?? 'image/jpeg';
  const extension = mimeType.split('/')[1] ?? 'jpg';
  const fileName = asset.fileName ?? `upload_${Date.now()}.${extension}`;

  return { uri, mimeType, fileName };
}
