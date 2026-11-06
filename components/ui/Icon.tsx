import {
  MaterialDesignIcons,
  type MaterialDesignIconsIconName,
} from '@react-native-vector-icons/material-design-icons';

export type IconName = MaterialDesignIconsIconName;

type IconProps = {
  name: IconName;
  size?: number;
  color: string;
};

/**
 * Ícono siempre decorativo (S-02): el significado lo da la etiqueta del control que
 * lo contiene o el texto visible al lado. Se oculta del lector en Android
 * (importantForAccessibility) y en iOS (accessibilityElementsHidden) para que no
 * aparezca como un foco suelto sin nombre.
 */
export function Icon({ name, size = 24, color }: IconProps) {
  return (
    <MaterialDesignIcons
      name={name}
      size={size}
      color={color}
      allowFontScaling={false}
      accessible={false}
      importantForAccessibility="no"
      accessibilityElementsHidden
    />
  );
}
