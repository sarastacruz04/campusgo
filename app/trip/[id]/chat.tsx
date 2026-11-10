import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';

import { MessageBubble } from '@/components/chat/MessageBubble';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { TextField } from '@/components/ui/TextField';
import {
  makeSelectMessagesNewestFirst,
  selectAuthorNames,
  selectChatLoad,
  selectChatSend,
} from '@/features/chat/selectors';
import { fetchAuthorNames, fetchMessages, sendMessage } from '@/features/chat/thunks';
import { selectTripById } from '@/features/trips/selectors';
import { fetchTrip } from '@/features/trips/thunks';
import { useAnnounce } from '@/hooks/useAnnounce';
import { useHaptics } from '@/hooks/useHaptics';
import { useRealtimeMessages } from '@/hooks/useRealtime';
import { formatDeparture } from '@/lib/format';
import { MAX_MESSAGE_LENGTH } from '@/services/chatService';
import { toAppError, type AppError } from '@/services/errors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';
import type { Mensaje } from '@/types/database';

const keyExtractor = (message: Mensaje) => message.id;

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/(tabs)');
}

/**
 * Chat del viaje (pantalla 20, R10). Lo usan el conductor y los pasajeros con
 * reserva aceptada. Los mensajes llegan en vivo por Realtime y los nuevos de
 * otras personas se anuncian al lector de pantalla sin mover el foco (S-07).
 */
export default function TripChatScreen() {
  const dispatch = useAppDispatch();
  const announce = useAnnounce();
  const haptics = useHaptics();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const userId = useAppSelector((state) => state.auth.userId);
  const trip = useAppSelector((state) => selectTripById(state, id));
  // useMemo: un selector memoizado por viaje, creado una sola vez por pantalla.
  const selectMessages = useMemo(() => makeSelectMessagesNewestFirst(id), [id]);
  const messages = useAppSelector(selectMessages);
  const authorNames = useAppSelector(selectAuthorNames);
  const load = useAppSelector(selectChatLoad);
  const send = useAppSelector(selectChatSend);

  const [text, setText] = useState('');
  const [sendError, setSendError] = useState<AppError | null>(null);

  const loadChat = useCallback(() => {
    dispatch(fetchMessages(id));
    // El viaje da el título y dice si está cancelado. A un ajeno RLS no se lo
    // devuelve; ese caso ya lo cubre el error de acceso de fetchMessages.
    dispatch(fetchTrip(id));
  }, [dispatch, id]);
  useEffect(loadChat, [loadChat]);

  // Se escucha desde el inicio para no perder mensajes entre la carga y la suscripción.
  // A un ajeno Realtime no le envía nada: los eventos respetan RLS.
  useRealtimeMessages(id);

  // El estado de carga es de este viaje solo si viajeId coincide.
  const status = load.viajeId === id ? load.status : 'loading';
  const loadError = load.viajeId === id ? load.error : null;
  const denied = loadError?.code === 'chat_sin_acceso';
  const loaded = status === 'succeeded';
  const tripCancelled = trip?.estado === 'cancelado';

  const nameOf = useCallback(
    (autorId: string) =>
      authorNames[autorId] ??
      (trip?.conductor_id === autorId ? trip.conductor_nombre : 'Otro participante'),
    [authorNames, trip],
  );

  // Autores que escribieron por Realtime y cuyo nombre todavía no se conoce.
  const missingAuthors = [...new Set(messages.map((message) => message.autor_id))]
    .filter((autorId) => !(autorId in authorNames))
    .join(',');
  useEffect(() => {
    if (missingAuthors) dispatch(fetchAuthorNames(missingAuthors.split(',')));
  }, [missingAuthors, dispatch]);

  // Anuncia cada mensaje nuevo de otra persona. El primer valor (lo que ya había
  // al abrir) no se anuncia: solo lo que llega después.
  const newest = messages[0];
  const lastSeenId = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (!loaded) return;
    const newestId = newest?.id ?? null;
    if (lastSeenId.current === undefined) {
      lastSeenId.current = newestId;
      return;
    }
    if (!newest || newestId === lastSeenId.current) return;
    lastSeenId.current = newestId;
    if (newest.autor_id !== userId) {
      announce(`Mensaje nuevo de ${nameOf(newest.autor_id)}: ${newest.contenido}`);
    }
  }, [loaded, newest, userId, nameOf, announce]);

  // Avisa una vez al llegar al límite; maxLength impide escribir más (S-05).
  const atLimit = text.length >= MAX_MESSAGE_LENGTH;
  useEffect(() => {
    if (atLimit) announce(`Llegaste al límite de ${MAX_MESSAGE_LENGTH} caracteres.`);
  }, [atLimit, announce]);

  const sending = send.status === 'loading';
  const canSend = text.trim().length > 0 && !sending && !tripCancelled;

  const submit = async () => {
    if (!canSend) return;
    setSendError(null);
    try {
      await dispatch(sendMessage({ viajeId: id, contenido: text })).unwrap();
      setText('');
      announce('Mensaje enviado.');
    } catch (caught) {
      haptics.error();
      setSendError(toAppError(caught));
    }
  };

  const renderItem = useCallback<ListRenderItem<Mensaje>>(
    ({ item }) => (
      <MessageBubble
        authorName={nameOf(item.autor_id)}
        content={item.contenido}
        createdAt={item.created_at}
        mine={item.autor_id === userId}
      />
    ),
    [nameOf, userId],
  );

  const tripInfo = trip ? (
    <AppText variant="secondary" style={styles.centered}>
      {`${trip.sector_nombre}. Sale ${formatDeparture(trip.salida_at)}`}
    </AppText>
  ) : null;

  let body;
  if (denied && loadError) {
    body = (
      <View style={styles.padded}>
        <StatusBanner tone="error" message={loadError.message} />
        <Button label="Volver" variant="secondary" onPress={goBack} />
      </View>
    );
  } else if (loadError) {
    body = (
      <View style={styles.padded}>
        <StatusBanner tone="error" message={loadError.message} onRetry={loadChat} />
      </View>
    );
  } else if (!loaded && messages.length === 0) {
    body = <LoadingState message="Cargando mensajes…" />;
  } else if (messages.length === 0) {
    // El estado vacío va fuera de la lista: dentro de una lista invertida se vería al revés.
    body = (
      <View style={styles.padded}>
        <View style={[styles.empty, { backgroundColor: colors.surface }]}>
          <Icon name="chat-outline" size={32} color={colors.primary} />
          <AppText variant="subtitle" style={styles.centered}>
            Todavía no hay mensajes
          </AppText>
          <AppText style={styles.centered}>
            Escribe el primero para coordinar el punto y la hora de encuentro.
          </AppText>
        </View>
      </View>
    );
  } else {
    body = (
      <FlatList
        inverted
        data={messages}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        initialNumToRender={15}
        windowSize={9}
        keyboardShouldPersistTaps="handled"
      />
    );
  }

  return (
    <ScreenLayout
      title="Chat del viaje"
      onBack={goBack}
      onPressProfile={() => router.push('/profile')}
      scrollable={false}
      bandContent={tripInfo}
    >
      <View style={styles.flex}>{body}</View>

      {denied ? null : (
        <View
          style={[
            styles.composer,
            { backgroundColor: colors.surface, borderTopColor: colors.border },
          ]}
        >
          {tripCancelled ? (
            <StatusBanner
              tone="info"
              haptic={false}
              message="Este viaje fue cancelado: puedes leer los mensajes, pero ya no enviar nuevos."
            />
          ) : null}
          {sendError ? <StatusBanner tone="error" message={sendError.message} /> : null}
          <View style={styles.composerRow}>
            <View style={styles.flex}>
              <TextField
                label="Mensaje"
                hint={`Máximo ${MAX_MESSAGE_LENGTH} caracteres`}
                value={text}
                onChangeText={setText}
                maxLength={MAX_MESSAGE_LENGTH}
                multiline
                editable={!tripCancelled}
                placeholder="Escribe un mensaje"
                accessibilityLanguage="es"
              />
            </View>
            <IconButton
              icon="send"
              variant="filled"
              accessibilityLabel="Enviar mensaje"
              accessibilityState={{ disabled: !canSend, busy: sending }}
              disabled={!canSend}
              onPress={submit}
            />
          </View>
          <AppText variant="secondary" color="textMuted" style={styles.counter}>
            {`${text.length} de ${MAX_MESSAGE_LENGTH} caracteres`}
          </AppText>
        </View>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  padded: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  empty: {
    alignItems: 'center',
    borderRadius: radius.card,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  centered: {
    textAlign: 'center',
  },
  composer: {
    borderTopWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  counter: {
    textAlign: 'right',
  },
});
