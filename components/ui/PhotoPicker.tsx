import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing, TOUCH_MIN } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeProvider';

import { AppText } from './AppText';
import { Icon } from './Icon';

type PhotoPickerProps = {
  /** Qué foto es: "Foto de perfil", "Foto del carro", "Foto del SOAT vigente". */
  label: string;
  /** Qué pasa al tocar, por ejemplo "Abre la galería o la cámara". */
  hint: string;
  /** URI local o firmada de la foto ya elegida. */
  imageUri?: string | null;
  onPress: () => void;
  /** avatar: círculo con "+" (registro, paso 5). upload: zona de carga (carro y SOAT). */
  variant?: 'avatar' | 'upload';
};

/**
 * Zona para elegir una foto. Es presentacional: quien la usa decide si abre la
 * galería o la cámara (expo-image-picker llega en la Etapa 4).
 * Accesibilidad (S-09): un solo botón con etiqueta, pista y estado "foto cargada";
 * el ícono de subir es #334259 sobre blanco (V-04).
 */
export function PhotoPicker({
  label,
  hint,
  imageUri,
  onPress,
  variant = 'upload',
}: PhotoPickerProps) {
  const { colors, borders } = useTheme();
  const hasImage = Boolean(imageUri);
  const isAvatar = variant === 'avatar';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={hasImage ? `${label}, foto cargada` : label}
      accessibilityHint={hint}
      onPress={onPress}
      style={({ pressed }) => [
        isAvatar ? styles.avatar : styles.upload,
        {
          backgroundColor: isAvatar ? colors.avatarBackground : colors.surface,
          borderColor: colors.border,
          borderWidth: borders.thin,
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      {hasImage && imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={isAvatar ? styles.avatarImage : styles.uploadImage}
          contentFit="cover"
          accessible={false}
          // Una foto no debe invertirse cuando el usuario activa "invertir colores" en iOS.
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View style={styles.placeholder}>
          <Icon
            name={isAvatar ? 'account' : 'upload'}
            size={isAvatar ? 72 : 48}
            color={isAvatar ? colors.avatarIcon : colors.primary}
          />
          {isAvatar ? null : (
            <AppText variant="secondary" importantForAccessibility="no">
              {label}
            </AppText>
          )}
        </View>
      )}
      {isAvatar ? (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Icon name={hasImage ? 'pencil' : 'plus'} size={20} color={colors.onPrimary} />
        </View>
      ) : null}
    </Pressable>
  );
}

const AVATAR_SIZE = 128;

const styles = StyleSheet.create({
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.pill,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.pill,
  },
  upload: {
    minHeight: 160,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    overflow: 'hidden',
  },
  uploadImage: {
    alignSelf: 'stretch',
    height: 200,
    borderRadius: radius.control,
  },
  placeholder: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: TOUCH_MIN * 0.75,
    height: TOUCH_MIN * 0.75,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
