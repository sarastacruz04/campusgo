import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { StarRating } from '@/components/ratings/StarRating';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { LoadingState } from '@/components/ui/LoadingState';
import { RadioGroup, type RadioOption } from '@/components/ui/RadioGroup';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { TextField } from '@/components/ui/TextField';
import { selectUserId } from '@/features/auth/selectors';
import { selectTripRatingContext } from '@/features/ratings/selectors';
import { fetchTripRatingContext, submitRating } from '@/features/ratings/thunks';
import { useAnnounce } from '@/hooks/useAnnounce';
import { useHaptics } from '@/hooks/useHaptics';
import { formatDeparture } from '@/lib/format';
import {
  MAX_RATING_COMMENT_LENGTH,
  validateRatingComment,
  validateRatingStars,
} from '@/lib/validators';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Pantalla "Calificar viaje" (pantalla 20, R9, E7):
 * valida que el viaje esté finalizado y permite al pasajero calificar al conductor,
 * o al conductor calificar a cada pasajero con reserva aceptada (una vez por par).
 */
export default function RateTripScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const tripId = Array.isArray(params.id) ? params.id[0] : params.id;

  const dispatch = useAppDispatch();
  const announce = useAnnounce();
  const haptics = useHaptics();
  const { colors, borders } = useTheme();

  const currentUserId = useAppSelector(selectUserId);
  const context = useAppSelector(selectTripRatingContext);
  const submitState = useAppSelector((state) => state.ratings.submit);

  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [starsError, setStarsError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [formSummaryError, setFormSummaryError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!tripId) return;
    setSelectedTargetId('');
    setSuccessMessage(null);
    dispatch(fetchTripRatingContext(tripId));
  }, [dispatch, tripId]);
  useFocusEffect(load);

  const targetOptions = useMemo<RadioOption<string>[]>(
    () =>
      context.targets.map((target) => ({
        value: target.userId,
        label: target.existingRating
          ? `${target.fullName} (calificado con ${target.existingRating.estrellas} de 5)`
          : `${target.fullName} (pendiente por calificar)`,
      })),
    [context.targets],
  );

  // Selecciona el destinatario elegido o, por defecto, el primero pendiente por calificar.
  const activeTarget = useMemo(() => {
    if (context.targets.length === 0) return null;
    const explicit = context.targets.find((t) => t.userId === selectedTargetId);
    if (explicit) return explicit;
    return context.targets.find((t) => t.existingRating === null) ?? context.targets[0];
  }, [context.targets, selectedTargetId]);

  const handleSelectTarget = useCallback((nextId: string) => {
    setSelectedTargetId(nextId);
    setStars(0);
    setComment('');
    setStarsError(null);
    setCommentError(null);
    setFormSummaryError(null);
    setSuccessMessage(null);
  }, []);

  const handleStarsChange = useCallback(
    (nextStars: number) => {
      setStars(nextStars);
      setStarsError(null);
      setFormSummaryError(null);
      announce(`Calificación seleccionada: ${nextStars} de 5 estrellas.`);
    },
    [announce],
  );

  const handleCommentChange = useCallback((nextComment: string) => {
    setComment(nextComment);
    setCommentError(null);
    setFormSummaryError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!context.trip || !activeTarget || activeTarget.existingRating) return;

    const nextStarsError = validateRatingStars(stars);
    const nextCommentError = validateRatingComment(comment);
    setStarsError(nextStarsError);
    setCommentError(nextCommentError);

    if (nextStarsError || nextCommentError) {
      const problems: string[] = [];
      if (nextStarsError) problems.push('Estrellas');
      if (nextCommentError) problems.push('Comentario');
      const summary = `Revisa los campos con error: ${problems.join(', ')}.`;
      setFormSummaryError(summary);
      haptics.error();
      announce(summary);
      return;
    }

    setFormSummaryError(null);
    const result = await dispatch(
      submitRating({
        viajeId: context.trip.id,
        destinatarioId: activeTarget.userId,
        estrellas: stars,
        comentario: comment.trim() || undefined,
      }),
    );

    if (submitRating.fulfilled.match(result)) {
      const msg = `Calificaste a ${activeTarget.fullName} con ${stars} de 5 estrellas.`;
      haptics.success();
      announce(msg);
      setStars(0);
      setComment('');
      setSuccessMessage(msg);
    } else {
      haptics.error();
    }
  }, [context.trip, activeTarget, stars, comment, dispatch, haptics, announce]);

  const firstLoad = context.load.status === 'loading' && !context.trip;
  const isSubmitting = submitState.status === 'loading';
  const allTargetsRated =
    context.targets.length > 0 && context.targets.every((target) => target.existingRating !== null);

  return (
    <ScreenLayout title="Calificar viaje" onBack={() => router.back()}>
      <View style={styles.content}>
        {!tripId ? (
          <StatusBanner tone="error" message="No se encontró el identificador del viaje." />
        ) : firstLoad ? (
          <LoadingState message="Cargando información del viaje…" />
        ) : context.load.error ? (
          <StatusBanner
            tone={context.load.error.code === 'sin_conexion' ? 'offline' : 'error'}
            message={context.load.error.message}
            onRetry={load}
          />
        ) : context.trip ? (
          <>
            {/* Resumen del viaje */}
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <View style={styles.cardHeader}>
                <Icon name="car" size={22} color={colors.primary} />
                <AppText variant="cardTitle" color="primary" style={styles.flex}>
                  {context.trip.sector_nombre || 'Viaje finalizado'}
                </AppText>
              </View>
              <AppText variant="body" color="text">
                Salida:{' '}
                <AppText variant="bodyStrong">{formatDeparture(context.trip.salida_at)}</AppText>
              </AppText>
              <AppText variant="body" color="text">
                Desde: <AppText variant="bodyStrong">{context.trip.origen_texto}</AppText>
              </AppText>
              <AppText variant="body" color="text">
                Para: <AppText variant="bodyStrong">{context.trip.destino_texto}</AppText>
              </AppText>
            </View>

            {context.trip.estado !== 'finalizado' ? (
              <StatusBanner
                tone="info"
                message="Solo puedes calificar viajes que ya hayan finalizado."
              />
            ) : context.targets.length === 0 ? (
              <StatusBanner
                tone="info"
                message={
                  currentUserId === context.trip.conductor_id
                    ? 'Este viaje no tuvo pasajeros con reserva aceptada para calificar.'
                    : 'Solo el conductor y los pasajeros con reserva aceptada pueden calificar este viaje.'
                }
              />
            ) : (
              <>
                {successMessage ? <StatusBanner tone="success" message={successMessage} /> : null}

                {context.targets.length > 1 ? (
                  <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <RadioGroup
                      label="Pasajero a calificar"
                      options={targetOptions}
                      value={activeTarget?.userId ?? ''}
                      onChange={handleSelectTarget}
                    />
                  </View>
                ) : null}

                {activeTarget ? (
                  <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <View
                      style={[
                        styles.targetHeader,
                        { borderBottomColor: colors.border, borderBottomWidth: borders.thin },
                      ]}
                    >
                      <AppText variant="subtitle" color="primary">
                        {activeTarget.role === 'conductor'
                          ? `Conductor: ${activeTarget.fullName}`
                          : `Pasajero: ${activeTarget.fullName}`}
                      </AppText>
                    </View>

                    {activeTarget.existingRating ? (
                      <View style={styles.ratedBox}>
                        <View style={styles.ratedRow}>
                          <Icon name="check-circle" size={22} color={colors.success} />
                          <AppText variant="subtitle" color="success">
                            Ya calificaste a {activeTarget.fullName}
                          </AppText>
                        </View>
                        <AppText variant="body" color="text">
                          Puntuación enviada:{' '}
                          <AppText variant="bodyStrong">
                            {activeTarget.existingRating.estrellas} de 5 estrellas
                          </AppText>
                        </AppText>
                        {activeTarget.existingRating.comentario ? (
                          <AppText variant="secondary" color="textMuted">
                            Comentario: {activeTarget.existingRating.comentario}
                          </AppText>
                        ) : null}

                        {allTargetsRated ? (
                          <Button
                            label="Volver"
                            variant="secondary"
                            onPress={() => router.back()}
                          />
                        ) : null}
                      </View>
                    ) : (
                      <View style={styles.form}>
                        {formSummaryError ? (
                          <StatusBanner tone="error" message={formSummaryError} haptic={false} />
                        ) : null}

                        {submitState.error ? (
                          <StatusBanner
                            tone={submitState.error.code === 'sin_conexion' ? 'offline' : 'error'}
                            message={submitState.error.message}
                          />
                        ) : null}

                        <StarRating
                          label={`¿Cómo fue el viaje con ${activeTarget.fullName}?`}
                          value={stars}
                          onChange={handleStarsChange}
                          error={starsError ?? undefined}
                          disabled={isSubmitting}
                        />

                        <TextField
                          label="Comentario (opcional)"
                          hint={`Máximo ${MAX_RATING_COMMENT_LENGTH} caracteres (${comment.trim().length}/${MAX_RATING_COMMENT_LENGTH})`}
                          placeholder="Cuéntanos cómo fue tu experiencia"
                          value={comment}
                          onChangeText={handleCommentChange}
                          error={commentError ?? undefined}
                          maxLength={MAX_RATING_COMMENT_LENGTH}
                          multiline
                          numberOfLines={3}
                          textAlignVertical="top"
                          editable={!isSubmitting}
                        />

                        <Button
                          label="Enviar calificación"
                          variant="primary"
                          loading={isSubmitting}
                          onPress={handleSubmit}
                        />
                      </View>
                    )}
                  </View>
                ) : null}
              </>
            )}
          </>
        ) : null}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  card: {
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  flex: {
    flex: 1,
  },
  targetHeader: {
    paddingBottom: spacing.sm,
    marginBottom: spacing.xs,
  },
  ratedBox: {
    gap: spacing.sm,
  },
  ratedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  form: {
    gap: spacing.md,
  },
});
