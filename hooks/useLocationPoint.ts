import { useCallback, useRef, useState } from 'react';

import {
  forwardGeocode,
  getCurrentCoordinates,
  reverseGeocode,
  type Coordinates,
} from '@/lib/location';

const NO_ADDRESS_NOTICE = 'No pudimos obtener la dirección de ese punto. Escríbela en el campo.';
const NO_LOCATION_NOTICE =
  'No pudimos obtener tu ubicación. Revisa el permiso, toca el mapa o escribe la dirección.';

/**
 * Estado de un punto elegido en el mapa y su dirección escrita. Lo usa la reserva y
 * lo puede reusar la creación de viajes. El mapa y el campo se llenan entre sí:
 * tocar el mapa escribe la dirección, y escribir la dirección sirve sin tocar el mapa.
 */
export function useLocationPoint() {
  const [point, setPoint] = useState<Coordinates | null>(null);
  const [address, setAddress] = useState('');
  const [resolving, setResolving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  // Si se toca el mapa dos veces seguidas, solo cuenta la respuesta del último toque.
  const lastRequest = useRef(0);

  const selectPoint = useCallback(async (coordinates: Coordinates) => {
    const request = ++lastRequest.current;
    setPoint(coordinates);
    setNotice(null);
    setResolving(true);
    const text = await reverseGeocode(coordinates);
    if (request !== lastRequest.current) return;
    setResolving(false);
    if (text) setAddress(text);
    else setNotice(NO_ADDRESS_NOTICE);
  }, []);

  const locateMe = useCallback(async () => {
    const request = ++lastRequest.current;
    setNotice(null);
    setResolving(true);
    const coordinates = await getCurrentCoordinates();
    if (request !== lastRequest.current) return;
    if (!coordinates) {
      setResolving(false);
      setNotice(NO_LOCATION_NOTICE);
      return;
    }
    await selectPoint(coordinates);
  }, [selectPoint]);

  /**
   * Coordenadas para guardar: las del mapa o, si solo se escribió la dirección, las
   * que resulten de buscarla. null si no se encontró (quien llama decide qué hacer).
   */
  const resolveCoordinates = useCallback(async (): Promise<Coordinates | null> => {
    if (point) return point;
    return forwardGeocode(address.trim());
  }, [point, address]);

  return {
    point,
    address,
    setAddress,
    resolving,
    notice,
    selectPoint,
    locateMe,
    resolveCoordinates,
  };
}
