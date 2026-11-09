import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import type { Coordinates } from '@/lib/location';
import { radius, spacing } from '@/theme/layout';

const DELTA = 0.04;
const MAP_HEIGHT = 240;

type MapPickerProps = {
  /** Qué se está eligiendo, para el lector: "punto de recogida". */
  purpose: string;
  /** Dónde se centra el mapa al abrir. */
  center: Coordinates;
  value: Coordinates | null;
  onSelect: (coordinates: Coordinates) => void;
  onLocateMe: () => void;
  locating: boolean;
};

/**
 * Mapa real para elegir un punto con un solo toque (T-07). Para el lector es un solo
 * elemento con nombre (S-09): la alternativa al mapa es el campo de dirección, que
 * quien usa este componente siempre debe mostrar debajo.
 */
export function MapPicker({
  purpose,
  center,
  value,
  onSelect,
  onLocateMe,
  locating,
}: MapPickerProps) {
  return (
    <View style={styles.container}>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Mapa para elegir el ${purpose}. También puedes escribir la dirección en el campo de abajo.`}
        style={styles.mapFrame}
      >
        <MapView
          style={styles.map}
          initialRegion={{ ...center, latitudeDelta: DELTA, longitudeDelta: DELTA }}
          onPress={(event) => onSelect(event.nativeEvent.coordinate)}
          zoomControlEnabled
          toolbarEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          {value ? <Marker coordinate={value} /> : null}
        </MapView>
      </View>
      <AppText color="onBrandMuted" variant="secondary">
        Toca el mapa para marcar el punto.
      </AppText>
      <Button
        label="Usar mi ubicación actual"
        loadingLabel="Buscando tu ubicación…"
        variant="onBrandOutline"
        icon="crosshairs-gps"
        loading={locating}
        onPress={onLocateMe}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  mapFrame: {
    height: MAP_HEIGHT,
    borderRadius: radius.control,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
});
