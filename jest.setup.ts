// Configuración común de las pruebas. Los simulacros (mocks) existen SOLO aquí y en
// __tests__: la app nunca usa datos simulados (sección 14).

// Simulacro oficial de AsyncStorage: guarda en memoria en lugar del almacenamiento nativo.
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
