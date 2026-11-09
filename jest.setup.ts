// Configuración común de las pruebas. Los simulacros (mocks) existen SOLO aquí y en
// __tests__: la app nunca usa datos simulados (sección 14).

// Simulacro oficial de AsyncStorage: guarda en memoria en lugar del almacenamiento nativo.
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Simulacro oficial de NetInfo (no hay red real en Node).
jest.mock('@react-native-community/netinfo', () =>
  jest.requireActual('@react-native-community/netinfo/jest/netinfo-mock'),
);

// Ninguna prueba habla con Supabase: el cliente se reemplaza por un objeto vacío y
// cada prueba simula los servicios que necesita (sección 8, Etapa 3).
jest.mock('@/services/supabase', () => ({
  supabase: {},
  bindAutoRefreshToAppState: () => () => undefined,
}));
