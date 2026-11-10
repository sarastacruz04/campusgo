import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { formatTime } from '@/lib/format';
import { radius, spacing } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

type MessageBubbleProps = {
  authorName: string;
  content: string;
  createdAt: string;
  /** true si lo escribió quien usa la app: va a la derecha y en azul. */
  mine: boolean;
};

/**
 * Un mensaje del chat. Es un solo foco para el lector (S-04): "Tú, 3:15 p. m.: Hola".
 * Lo propio y lo ajeno no se distinguen solo por el color: también por el lado
 * y por el nombre escrito ("Tú") (V-05).
 */
export const MessageBubble = memo(function MessageBubble({
  authorName,
  content,
  createdAt,
  mine,
}: MessageBubbleProps) {
  const { colors, borders } = useTheme();
  const time = formatTime(new Date(createdAt));
  const author = mine ? 'Tú' : authorName;

  return (
    <View
      accessible
      accessibilityLabel={`${author}, ${time}: ${content}`}
      style={[
        styles.bubble,
        mine
          ? [styles.mine, { backgroundColor: colors.brandSurface }]
          : [
              styles.theirs,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: borders.thin,
              },
            ],
      ]}
    >
      <AppText variant="label" color={mine ? 'onBrand' : 'text'}>
        {author}
      </AppText>
      <AppText color={mine ? 'onBrand' : 'text'}>{content}</AppText>
      <AppText variant="secondary" color={mine ? 'onBrandMuted' : 'textMuted'} style={styles.time}>
        {time}
      </AppText>
    </View>
  );
});

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '85%',
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  mine: {
    alignSelf: 'flex-end',
  },
  theirs: {
    alignSelf: 'flex-start',
  },
  time: {
    alignSelf: 'flex-end',
  },
});
