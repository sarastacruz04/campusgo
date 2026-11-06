import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';
import { fontFamilies } from '@/theme/typography';

type LogoProps = {
  size?: 'large' | 'small';
  /**
   * true en las pantallas internas: el logo del encabezado no aporta información y
   * el lector lo salta (S-09). En bienvenida y autenticación es una imagen con nombre.
   */
  decorative?: boolean;
};

const SIZES = {
  large: { word: 44, credit: 14 },
  small: { word: 24, credit: 12 },
} as const;

export const LOGO_LABEL = 'CampusGo, by Sara y Samuel';

/**
 * Logo recreado en código (sin imágenes del Figma): "Campus G" + un pin de ubicación
 * en lugar de la "O", y debajo a la derecha "By Sara y Samuel" (sección 6.5).
 * El logo es un logotipo: queda exento del criterio 1.4.4 y no escala con la fuente
 * del sistema, para que no rompa el encabezado al 200 %.
 */
export function Logo({ size = 'large', decorative = false }: LogoProps) {
  const { colors } = useTheme();
  const { word, credit } = SIZES[size];
  // El pin mide lo mismo que la altura de una mayúscula de la palabra.
  const pinHeight = word * 0.9;
  const pinWidth = pinHeight * 0.75;

  return (
    <View
      accessible={!decorative}
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityLabel={decorative ? undefined : LOGO_LABEL}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
      accessibilityElementsHidden={decorative}
      testID="logo"
      style={styles.container}
    >
      <View style={styles.row}>
        <Text
          allowFontScaling={false}
          style={[
            styles.word,
            { fontSize: word, lineHeight: Math.ceil(word * 1.4), color: colors.text },
          ]}
        >
          Campus G
        </Text>
        <Svg width={pinWidth} height={pinHeight} viewBox="0 0 24 32">
          <Path
            d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z"
            fill={colors.text}
          />
          <Circle cx={12} cy={12} r={5.5} fill={colors.surface} />
        </Svg>
      </View>
      <Text
        allowFontScaling={false}
        style={[
          styles.credit,
          { fontSize: credit, lineHeight: Math.ceil(credit * 1.4), color: colors.text },
        ]}
      >
        By Sara y Samuel
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    alignItems: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  word: {
    fontFamily: fontFamilies.bold,
    letterSpacing: 0,
  },
  credit: {
    fontFamily: fontFamilies.regular,
    letterSpacing: 0,
    marginTop: -4,
  },
});
