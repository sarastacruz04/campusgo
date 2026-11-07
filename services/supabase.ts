import { createClient } from '@supabase/supabase-js';
import { AppState, type AppStateStatus } from 'react-native';

import type { Database } from '@/types/database';

import { secureSessionStorage } from './secureSessionStorage';

// Cliente único de Supabase. Solo los archivos de services/ lo importan: las
// pantallas nunca hablan con Supabase directamente (sección 4).
//
// Las variables EXPO_PUBLIC_* las inyecta Expo desde .env al empaquetar. Hay que
// leerlas así, una por una (process.env.NOMBRE), para que Expo las reemplace.
// La anon key es pública por diseño: la seguridad la da RLS en la base de datos.
// La service_role key NUNCA se usa en la app.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copia .env.example como .env, llena los valores y reinicia "npx expo start".',
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureSessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    // En una app móvil la sesión no llega por URL de navegador.
    detectSessionInUrl: false,
  },
});

/**
 * Renueva el token solo mientras la app está en primer plano. En segundo plano
 * React Native pausa los temporizadores y el refresco fallaría; al volver, se
 * reanuda. Devuelve la función que quita el listener (se llama en el cleanup).
 */
export function bindAutoRefreshToAppState(): () => void {
  const handleChange = (state: AppStateStatus) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  };
  if (AppState.currentState === 'active') supabase.auth.startAutoRefresh();
  const subscription = AppState.addEventListener('change', handleChange);
  return () => {
    subscription.remove();
    supabase.auth.stopAutoRefresh();
  };
}
