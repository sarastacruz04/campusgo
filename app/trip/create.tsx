import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { MapPicker } from '@/components/maps/MapPicker';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { SelectField } from '@/components/ui/SelectField';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { TextField } from '@/components/ui/TextField';
import { selectSectores, selectTripMutation } from '@/features/trips/selectors';
import { createTrip, fetchSectores } from '@/features/trips/thunks';
import { selectVehicle } from '@/features/vehicle/selectors';
import { fetchMyVehicle } from '@/features/vehicle/thunks';
import { useAnnounce } from '@/hooks/useAnnounce';
import { useHaptics } from '@/hooks/useHaptics';
import { useLocationPoint } from '@/hooks/useLocationPoint';
import {
  validateDate,
  validateFutureDeparture,
  validatePrice,
  validateRequired,
  validateTime,
  validateTripCupos,
} from '@/lib/validators';
import { toAppError, type AppError } from '@/services/errors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

const SABANA_COORDINATES = { latitude: 4.8647, longitude: -74.0335 };
const SABANA_DEFAULT_TEXT = 'Universidad de La Sabana, Chía';
const INITIAL_MAP_CENTER = { latitude: 4.711, longitude: -74.0721 };

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/(tabs)');
}

/** "Crea tu viaje" (pantalla 18): mapa, tarjeta de datos del viaje y confirmación. */
export default function CreateTripScreen() {
  const dispatch = useAppDispatch();
  const haptics = useHaptics();
  const announce = useAnnounce();
  const { colors } = useTheme();

  const vehicle = useAppSelector(selectVehicle);
  const sectores = useAppSelector(selectSectores);
  const mutation = useAppSelector(selectTripMutation);

  // Ubicación de origen en mapa y texto
  const originPoint = useLocationPoint();

  // Campos del formulario
  const [destinoTexto, setDestinoTexto] = useState(SABANA_DEFAULT_TEXT);
  const [selectedSectorId, setSelectedSectorId] = useState<string>('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [cupos, setCupos] = useState('3');
  const [valorPorCupo, setValorPorCupo] = useState('5000');

  // Errores por campo
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<AppError | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);

  useEffect(() => {
    if (sectores.length === 0) dispatch(fetchSectores());
    if (!vehicle) dispatch(fetchMyVehicle());
  }, [dispatch, sectores.length, vehicle]);

  const effectiveSectorId = selectedSectorId || (sectores.length > 0 ? String(sectores[0].id) : '');

  const maxVehicleCapacity = vehicle?.capacidad ?? 4;

  const handleSubmit = async () => {
    setSummaryError(null);
    setServerError(null);

    // Validar campos requeridos y formatos
    const errOrigen = validateRequired(originPoint.address, 'Punto de partida') ?? undefined;
    const errDestino = validateRequired(destinoTexto, 'Punto de llegada') ?? undefined;
    const errSector = !effectiveSectorId ? 'Por favor selecciona un sector.' : undefined;
    const errDate = validateDate(fecha) ?? undefined;
    const errTime = validateTime(hora) ?? undefined;
    const departure = validateFutureDeparture(fecha, hora);
    // "La salida debe ser en el futuro" solo tiene sentido con fecha y hora válidas.
    // Si no, validateFutureDeparture devuelve el error de formato de la hora y saldría
    // también bajo la fecha (TC-10).
    const errDeparture = !errDate && !errTime ? (departure.error ?? undefined) : undefined;
    const errCupos = validateTripCupos(cupos, maxVehicleCapacity) ?? undefined;
    const errValor = validatePrice(valorPorCupo) ?? undefined;

    const errors: Record<string, string | undefined> = {
      origen: errOrigen,
      destino: errDestino,
      sector: errSector,
      fecha: errDate || errDeparture,
      hora: errTime,
      cupos: errCupos,
      valor: errValor,
    };

    setFieldErrors(errors);

    // Contar cuántos errores hay para el resumen accesible
    const missingFields: string[] = [];
    if (errOrigen) missingFields.push('Punto de partida');
    if (errDestino) missingFields.push('Punto de llegada');
    if (errSector) missingFields.push('Sector');
    if (errDate || errDeparture) missingFields.push('Fecha de salida');
    if (errTime) missingFields.push('Hora de salida');
    if (errCupos) missingFields.push('Cupos');
    if (errValor) missingFields.push('Valor');

    if (missingFields.length > 0) {
      const summary = `Revisa los campos con error: ${missingFields.join(', ')}.`;
      setSummaryError(summary);
      announce(summary);
      haptics.warning();
      return;
    }

    if (!vehicle) {
      const noCarMsg = 'Debes tener un vehículo registrado para publicar un viaje.';
      setSummaryError(noCarMsg);
      announce(noCarMsg);
      return;
    }

    // Resolver coordenadas
    const coords = (await originPoint.resolveCoordinates()) ?? INITIAL_MAP_CENTER;

    try {
      await dispatch(
        createTrip({
          vehiculoId: vehicle.id,
          sectorId: parseInt(effectiveSectorId, 10),
          origenTexto: originPoint.address.trim(),
          origenLat: coords.latitude,
          origenLng: coords.longitude,
          destinoTexto: destinoTexto.trim(),
          destinoLat: SABANA_COORDINATES.latitude,
          destinoLng: SABANA_COORDINATES.longitude,
          salidaAt: departure.iso!,
          valorPorCupo: parseInt(valorPorCupo.trim(), 10),
          cuposTotales: parseInt(cupos.trim(), 10),
        }),
      ).unwrap();

      haptics.success();
      setSuccessVisible(true);
    } catch (error) {
      const appErr = toAppError(error);
      setServerError(appErr);
      announce(appErr.message);
    }
  };

  const handleFinish = () => {
    setSuccessVisible(false);
    router.replace('/(tabs)/creados');
  };

  const sectorOptions = sectores.map((s) => ({
    value: String(s.id),
    label: s.nombre,
  }));

  return (
    <ScreenLayout title="Crea tu viaje" onBack={goBack} scrollable>
      <View style={styles.formContainer}>
        {/* Mapa real para marcar el punto de partida (T-07) */}
        <View style={[styles.card, { backgroundColor: colors.primary }]}>
          <AppText variant="subtitle" color="onPrimary" accessibilityRole="header">
            Punto de partida en el mapa
          </AppText>
          <MapPicker
            purpose="punto de partida del viaje"
            center={INITIAL_MAP_CENTER}
            value={originPoint.point}
            onSelect={originPoint.selectPoint}
            onLocateMe={originPoint.locateMe}
            locating={originPoint.resolving}
          />
        </View>

        {/* Tarjeta Datos del viaje */}
        <View style={[styles.card, { backgroundColor: colors.primary }]}>
          <AppText variant="subtitle" color="onPrimary" accessibilityRole="header">
            Datos del viaje
          </AppText>

          <TextField
            label="Punto de partida"
            hint="Describe la dirección o selecciónala en el mapa"
            value={originPoint.address}
            onChangeText={(text) => {
              originPoint.setAddress(text);
              if (fieldErrors.origen) setFieldErrors((prev) => ({ ...prev, origen: undefined }));
            }}
            error={fieldErrors.origen}
          />

          <TextField
            label="Punto de llegada"
            hint="Destino del viaje hacia el campus"
            value={destinoTexto}
            onChangeText={(text) => {
              setDestinoTexto(text);
              if (fieldErrors.destino) setFieldErrors((prev) => ({ ...prev, destino: undefined }));
            }}
            error={fieldErrors.destino}
          />

          {sectorOptions.length > 0 ? (
            <SelectField
              label="Sector"
              options={sectorOptions}
              value={effectiveSectorId}
              onChange={(val) => {
                setSelectedSectorId(val);
                if (fieldErrors.sector) setFieldErrors((prev) => ({ ...prev, sector: undefined }));
              }}
              tone="brand"
            />
          ) : null}

          <TextField
            label="Fecha de salida"
            hint="Formato DD/MM/AAAA (ej: 15/11/2026)"
            value={fecha}
            onChangeText={(text) => {
              setFecha(text);
              if (fieldErrors.fecha) setFieldErrors((prev) => ({ ...prev, fecha: undefined }));
            }}
            error={fieldErrors.fecha}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />

          <TextField
            label="Hora de salida"
            hint="Formato 24h (ej: 07:30 o 14:00)"
            value={hora}
            onChangeText={(text) => {
              setHora(text);
              if (fieldErrors.hora) setFieldErrors((prev) => ({ ...prev, hora: undefined }));
            }}
            error={fieldErrors.hora}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />

          <TextField
            label="Cupos disponibles"
            hint={`Entre 1 y ${maxVehicleCapacity} cupos según tu vehículo`}
            value={cupos}
            onChangeText={(text) => {
              setCupos(text);
              if (fieldErrors.cupos) setFieldErrors((prev) => ({ ...prev, cupos: undefined }));
            }}
            error={fieldErrors.cupos}
            keyboardType="number-pad"
            maxLength={2}
          />

          <TextField
            label="Valor por cupo (COP)"
            hint="Precio en pesos por cada pasajero (ej: 5000)"
            value={valorPorCupo}
            onChangeText={(text) => {
              setValorPorCupo(text);
              if (fieldErrors.valor) setFieldErrors((prev) => ({ ...prev, valor: undefined }));
            }}
            error={fieldErrors.valor}
            keyboardType="number-pad"
          />

          {/* Resumen de errores o error del servidor */}
          {summaryError ? <StatusBanner tone="error" message={summaryError} /> : null}
          {serverError ? (
            <StatusBanner tone="error" message={serverError.message} onRetry={handleSubmit} />
          ) : null}

          {/* Botón ¡Listo! */}
          <Button
            label="¡Listo!"
            loading={mutation.status === 'loading'}
            loadingLabel="Publicando viaje…"
            variant="onBrand"
            onPress={handleSubmit}
            accessibilityHint="Publica el viaje con los datos ingresados"
          />
        </View>
      </View>

      {/* Diálogo de éxito con el diseño del Figma */}
      <ConfirmDialog
        visible={successVisible}
        title="Viaje realizado con éxito"
        message="Tu viaje ha sido creado. ¡Maneja con cuidado!"
        confirmLabel="¡Listo!"
        tone="success"
        onConfirm={handleFinish}
        onCancel={handleFinish}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
});
