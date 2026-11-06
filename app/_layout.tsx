import { Stack } from 'expo-router';

// Layout raíz. En la Etapa 4 aquí vivirá el guardia de sesión (auth vs. tabs).
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
