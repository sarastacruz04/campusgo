import AsyncStorage from '@react-native-async-storage/async-storage';
import * as aesjs from 'aes-js';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

// Almacenamiento seguro de la sesión de Supabase (patrón "LargeSecureStore" de la
// guía oficial de Supabase para Expo).
//
// Problema: la sesión (tokens JSON) puede pasar de 2048 bytes y SecureStore puede
// rechazar valores grandes. Solución:
// 1. Se genera una llave AES de 256 bits por cada clave y se guarda en SecureStore
//    (llavero de iOS / Keystore de Android), que es pequeño y seguro.
// 2. La sesión se cifra con esa llave (AES-CTR) y el texto cifrado se guarda en
//    AsyncStorage, que no tiene límite de tamaño.
// Sin la llave de SecureStore, lo que hay en AsyncStorage no se puede leer.
//
// Los bytes aleatorios salen de expo-crypto (incluido en Expo Go) en lugar de
// react-native-get-random-values, que usa la guía (D-33).

const KEY_BYTES = 32;

// Las claves de SecureStore solo admiten letras, números, ".", "-" y "_".
function secureKeyName(key: string): string {
  return `campusgo.${key.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
}

async function encrypt(key: string, value: string): Promise<string> {
  const encryptionKey = await Crypto.getRandomBytesAsync(KEY_BYTES);
  // AES-CTR con contador inicial 1, como en la guía de Supabase.
  const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
  const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
  await SecureStore.setItemAsync(secureKeyName(key), aesjs.utils.hex.fromBytes(encryptionKey));
  return aesjs.utils.hex.fromBytes(encryptedBytes);
}

async function decrypt(key: string, value: string): Promise<string | null> {
  const encryptionKeyHex = await SecureStore.getItemAsync(secureKeyName(key));
  if (!encryptionKeyHex) return null;
  const cipher = new aesjs.ModeOfOperation.ctr(
    aesjs.utils.hex.toBytes(encryptionKeyHex),
    new aesjs.Counter(1),
  );
  const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));
  return aesjs.utils.utf8.fromBytes(decryptedBytes);
}

/** Adaptador con la interfaz { getItem, setItem, removeItem } que espera Supabase Auth. */
export const secureSessionStorage = {
  async getItem(key: string): Promise<string | null> {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return null;
    return decrypt(key, encrypted);
  },
  async setItem(key: string, value: string): Promise<void> {
    const encrypted = await encrypt(key, value);
    await AsyncStorage.setItem(key, encrypted);
  },
  async removeItem(key: string): Promise<void> {
    // Cerrar sesión borra las dos mitades: el texto cifrado y la llave (TC-21).
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(secureKeyName(key));
  },
};
