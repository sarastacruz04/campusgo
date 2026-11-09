import { unwrap } from './errors';
import { supabase } from './supabase';

// Fotos en Supabase Storage (R12). Los buckets son privados: para mostrar una foto
// se pide una URL firmada que vence. La ruta siempre empieza por el id del usuario
// ({user_id}/archivo), que es lo que revisan las políticas de Storage.

export type Bucket = 'avatars' | 'vehiculos' | 'soat';

type UploadInput = {
  bucket: Bucket;
  userId: string;
  /** Nombre del archivo dentro de la carpeta del usuario, por ejemplo "avatar.jpg". */
  fileName: string;
  /** URI local que devuelve expo-image-picker. */
  uri: string;
  contentType: string;
};

/** Sube (o reemplaza) un archivo y devuelve su ruta para guardarla en la base. */
export async function uploadImage(input: UploadInput): Promise<string> {
  const path = `${input.userId}/${input.fileName}`;
  // En React Native se lee el archivo local como ArrayBuffer con fetch.
  const response = await fetch(input.uri);
  const body = await response.arrayBuffer();
  unwrap(
    await supabase.storage
      .from(input.bucket)
      .upload(path, body, { contentType: input.contentType, upsert: true }),
  );
  return path;
}

/** URL temporal para mostrar una foto privada con expo-image. */
export async function getSignedUrl(bucket: Bucket, path: string, expiresInSeconds = 3600) {
  const data = unwrap(await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds));
  return data.signedUrl;
}

export async function removeFile(bucket: Bucket, path: string): Promise<void> {
  unwrap(await supabase.storage.from(bucket).remove([path]));
}
