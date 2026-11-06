// Configuración de ESLint (formato "flat", el que usa Expo desde el SDK 53).
// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const reactNativeA11y = require('eslint-plugin-react-native-a11y');

module.exports = defineConfig([
  expoConfig,
  // Prettier va como regla de ESLint: el formato incorrecto aparece como error de lint.
  eslintPluginPrettierRecommended,
  {
    // Reglas de accesibilidad para React Native (conjunto "all": iOS + Android).
    plugins: { 'react-native-a11y': reactNativeA11y },
    rules: {
      ...reactNativeA11y.configs.all.rules,
      // Esta regla exige accessibilityHint en TODO elemento con accessibilityLabel.
      // La propuesta aprobada del Corte 2 (S-02) pide la pista solo cuando el resultado
      // no es obvio: una pista redundante alarga lo que lee TalkBack en cada foco.
      // Decisión registrada en docs/DECISIONES.md (2026-11-06).
      'react-native-a11y/has-accessibility-hint': 'off',
      // Sin console.log en producción (sección 9 de la especificación).
      'no-console': 'error',
    },
  },
  {
    // expo-env.d.ts lo genera Expo y está en .gitignore.
    ignores: ['dist/*', '.expo/*', 'node_modules/*', 'coverage/*', 'expo-env.d.ts'],
  },
]);
