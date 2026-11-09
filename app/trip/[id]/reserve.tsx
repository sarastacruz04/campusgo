import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { MapPicker } from '@/components/maps/MapPicker';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { TextField } from '@/components/ui/TextField';
import { selectReservationMutation } from '@/features/reservations/selectors';
import { createReservation } from '@/features/reservations/thunks';
import { selectTripById } from '@/features/trips/selectors';
import { fetchTrip } from '@/features/trips/thunks';
import { useHaptics } from '@/hooks/useHaptics';
import { useLocationPoint } from '@/hooks/useLocationPoint';
import { formatDeparture, formatPesos } from '@/lib/format';
import { validateRequired } from '@/lib/validators';
import type { AppError } from '@/services/errors';
import { toAppError } from '@/services/errors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

const ADDRESS_LABEL = 'Describe la dirección del punto de recogida';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/(tabs)');
}

/** "Reserva tu viaje" (pantallas 11 y 12): punto de recogida, reserva y confirmación. */
export default function ReserveTripScreen() {
  const dispatch = useAppDispatch();
  const haptics = useHaptics();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = useAppSelector((state) => selectTripById(state, id));
  const mutation = useAppSelector(selectReservationMutation);
  const pickup = useLocationPoint();

  const [loadError, setLoadError] = useState<AppError | null>(null);
  const [addressError, setAddressError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<AppError | null>(null);
  const [resolvingSubmit, setResolvingSubmit] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  // Si se llega sin pasar por la búsqueda, el viaje todavía no está en el store.
  const tripMissing = !trip;
  const loadTrip = useCallback(() => {
    dispatch(fetchTrip(id))
      .unwrap()
      .then(() => setLoadError(null))
      .catch((error: unknown) => setLoadError(toAppError(error)));
  }, [dispatch, id]);
  useEffect(() => {
    if (tripMissing) loadTrip();
  }, [tripMissing, loadTrip]);

  const submit = async () => {
    if (!trip) return;
    const error = validateRequired(pickup.address, 'La dirección') ?? undefined;
    setAddressError(error);
    if (error) return;

    setSubmitError(null);
    setResolvingSubmit(true);
    // Si solo se escribió la dirección y no se encuentra en el mapa, se usa el origen
    // del viaje: la reserva no se bloquea y el conductor se guía por el texto (T-07).
    const coordinates = (await pickup.resolveCoordinates()) ?? {
      latitude: trip.origen_lat,
      longitude: trip.origen_lng,
    };
    setResolvingSubmit(false);

    try {
      await dispatch(
        createReservation({
          viajeId: trip.id,
          puntoRecogidaTexto: pickup.address,
          puntoLat: coordinates.latitude,
          puntoLng: coordinates.longitude,
        }),
      ).unwrap();
      haptics.success();
      setSuccessVisible(true);
    } catch (caught) {
      setSubmitError(toAppError(caught));
    }
  };

  const finish = () => {
    setSuccessVisible(false);
    router.replace('/(tabs)/reservas');
  };

  return (
    <ScreenLayout title="Reserva tu viaje" onBack={goBack}>
      {loadError ? (
        <StatusBanner tone="error" message={loadError.message} onRetry={loadTrip} />
      ) : null}
      {tripMissing && !loadError ? <LoadingState message="Cargando el viaje…" /> : null}

      {trip ? (
        <>
          <View accessible style={[styles.card, { backgroundColor: colors.surface }]}>
            <AppText variant="subtitle">{trip.sector_nombre}</AppText>
            <AppText>Conductor: {trip.conductor_nombre}</AppText>
            <AppText>Sale: {formatDeparture(trip.salida_at)}</AppText>
            <AppText>Valor: {formatPesos(trip.valor_por_cupo)}</AppText>
          </View>

          <View style={[styles.card, { backgroundColor: colors.brandSurface }]}>
            <AppText variant="subtitle" color="onBrand" accessibilityRole="header">
              Selecciona el punto de recogida
            </AppText>
            <MapPicker
              purpose="punto de recogida"
              center={{ latitude: trip.origen_lat, longitude: trip.origen_lng }}
              value={pickup.point}
              onSelect={pickup.selectPoint}
              onLocateMe={pickup.locateMe}
              locating={pickup.resolving}
            />
          </View>

          {/* El campo va sobre superficie blanca: el texto de error rojo no tiene
              contraste suficiente sobre la tarjeta azul del Figma (D-47). */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {pickup.notice ? (
              <StatusBanner tone="info" message={pickup.notice} haptic={false} />
            ) : null}
            <TextField
              label={ADDRESS_LABEL}
              hint="Se llena al tocar el mapa; también puedes escribirla"
              value={pickup.address}
              onChangeText={(text) => {
                pickup.setAddress(text);
                if (addressError) setAddressError(undefined);
              }}
              error={addressError}
              autoComplete="street-address"
              textContentType="fullStreetAddress"
              returnKeyType="done"
              multiline
            />
            {submitError ? (
              <StatusBanner tone="error" message={submitError.message} onRetry={submit} />
            ) : null}
            <Button
              label="Reservar"
              loadingLabel="Reservando…"
              loading={resolvingSubmit || mutation.status === 'loading'}
              onPress={submit}
            />
          </View>
        </>
      ) : null}

      <ConfirmDialog
        visible={successVisible}
        tone="success"
        title="Reserva realizada con éxito"
        message="Tu reserva quedó pendiente de la confirmación del conductor."
        confirmLabel="¡Listo!"
        onConfirm={finish}
        onCancel={finish}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
});
