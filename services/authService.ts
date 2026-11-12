import { ERRORS, isAppError, toAppError, unwrap } from './errors';
import { supabase } from './supabase';

// Autenticación con Supabase Auth. El registro manda los datos del perfil en
// options.data; el trigger handle_new_user de la base los copia a profiles (R2).

export type SessionUser = { userId: string; email: string };

export type SignUpInput = {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  idUniversidad: string;
  telefono: string;
};

const INSTITUTIONAL_DOMAIN = '@unisabana.edu.co';

/** R1 en la app: se rechaza antes de llamar a Supabase (la base también lo bloquea). */
function assertInstitutionalEmail(email: string) {
  if (!email.trim().toLowerCase().endsWith(INSTITUTIONAL_DOMAIN)) {
    throw ERRORS.correoNoInstitucional;
  }
}

function toSessionUser(user: { id: string; email?: string | null } | null): SessionUser | null {
  return user ? { userId: user.id, email: user.email ?? '' } : null;
}

export async function signIn(email: string, password: string): Promise<SessionUser> {
  const data = unwrap(
    await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password }),
  );
  const sessionUser = toSessionUser(data.user);
  if (!sessionUser) throw ERRORS.sinSesion;
  return sessionUser;
}

/**
 * En el registro y el reenvío, lo lento es enviar el correo con el código: un error
 * del servidor ahí casi siempre es el SMTP. Se dice eso en vez de "servidor no
 * disponible" (TC-01, 504 "Context deadline exceeded" en los logs de Auth).
 */
function asCodeNotSent(error: unknown): unknown {
  return isAppError(error) && error.code === ERRORS.servidorNoDisponible.code
    ? ERRORS.correoNoEnviado
    : error;
}

export async function signUp(input: SignUpInput): Promise<void> {
  assertInstitutionalEmail(input.email);
  try {
    unwrap(
      await supabase.auth.signUp({
        email: input.email.trim().toLowerCase(),
        password: input.password,
        options: {
          // Estas claves son las que lee handle_new_user en raw_user_meta_data.
          data: {
            nombre: input.nombre.trim(),
            apellido: input.apellido.trim(),
            id_universidad: input.idUniversidad,
            telefono: input.telefono,
          },
        },
      }),
    );
  } catch (error) {
    throw asCodeNotSent(error);
  }
}

/** Confirma el correo con el código de 6 dígitos de la plantilla "Confirm signup" (R16). */
export async function verifySignUpCode(email: string, token: string): Promise<SessionUser> {
  const data = unwrap(
    await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token, type: 'email' }),
  );
  const sessionUser = toSessionUser(data.user);
  if (!sessionUser) throw ERRORS.sinSesion;
  return sessionUser;
}

export async function resendSignUpCode(email: string): Promise<void> {
  try {
    unwrap(await supabase.auth.resend({ type: 'signup', email: email.trim().toLowerCase() }));
  } catch (error) {
    throw asCodeNotSent(error);
  }
}

/** Cierra la sesión: Supabase borra los tokens del almacenamiento seguro (TC-21). */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  // Sin red, Supabase igual borra la sesión local; no se bloquea el cierre.
  if (error && toAppError(error).code !== 'sin_conexion') throw toAppError(error);
}

/** Lee la sesión guardada en el teléfono (no necesita red). */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const data = unwrap(await supabase.auth.getSession());
  return toSessionUser(data.session?.user ?? null);
}

/**
 * Avisa cuando la sesión cambia (inicio, cierre, token renovado o vencido).
 * Devuelve la función para dejar de escuchar.
 */
export function onSessionChange(callback: (user: SessionUser | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(toSessionUser(session?.user ?? null));
  });
  return () => data.subscription.unsubscribe();
}
