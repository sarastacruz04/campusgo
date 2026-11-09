import * as Location from 'expo-location';

// Ubicación y geocodificación con expo-location, sin claves de Google (sección 3).
// En Android hay que pedir el permiso antes de geocodificar (documentación del SDK 58).
// Ninguna función lanza errores: si falla o no hay permiso devuelven null y la
// persona siempre puede escribir la dirección a mano (T-07).

export type Coordinates = { latitude: number; longitude: number };

async function hasForegroundPermission(): Promise<boolean> {
  try {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    return granted;
  } catch {
    return false;
  }
}

/** Convierte coordenadas en una dirección legible, o null si no se pudo. */
export async function reverseGeocode(coordinates: Coordinates): Promise<string | null> {
  if (!(await hasForegroundPermission())) return null;
  try {
    const [place] = await Location.reverseGeocodeAsync(coordinates);
    if (!place) return null;
    // formattedAddress solo existe en Android; en iOS se arma con las partes.
    if (place.formattedAddress) return place.formattedAddress;
    const street = [place.street, place.streetNumber].filter(Boolean).join(' ');
    return [street || place.name, place.city].filter(Boolean).join(', ') || null;
  } catch {
    return null;
  }
}

/** Busca las coordenadas de una dirección escrita, o null si no se encontró. */
export async function forwardGeocode(address: string): Promise<Coordinates | null> {
  if (!(await hasForegroundPermission())) return null;
  try {
    const [result] = await Location.geocodeAsync(`${address}, Colombia`);
    return result ? { latitude: result.latitude, longitude: result.longitude } : null;
  } catch {
    return null;
  }
}

/** Posición actual del teléfono, o null si no hay permiso o no se pudo obtener. */
export async function getCurrentCoordinates(): Promise<Coordinates | null> {
  if (!(await hasForegroundPermission())) return null;
  try {
    const { coords } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { latitude: coords.latitude, longitude: coords.longitude };
  } catch {
    return null;
  }
}
