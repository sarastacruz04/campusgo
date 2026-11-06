import { StyleSheet, Text, View } from 'react-native';

// Pantalla provisional de la Etapa 0: solo comprueba que la app abre en Expo Go.
// En la Etapa 1 se reemplaza por la bienvenida con el sistema de diseño.
export default function Index() {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        CampusGo
      </Text>
      <Text style={styles.subtitle}>Conectando estudiantes, compartiendo trayectos</Text>
    </View>
  );
}

// lineHeight de al menos 1,4 veces el tamaño para no recortar tildes ni la Ñ (V-07).
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    lineHeight: 40,
    fontWeight: '700',
    color: '#334259',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334259',
    textAlign: 'center',
  },
});
