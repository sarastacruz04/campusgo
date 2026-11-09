import { createAction } from '@reduxjs/toolkit';

/**
 * Se despacha cuando ya no hay sesión (cierre de sesión o token vencido).
 * Todos los slices la escuchan y vuelven a su estado inicial, para que no queden
 * datos de la persona anterior en memoria.
 * Vive en su propio archivo para evitar importaciones circulares entre
 * auth/slice.ts y auth/thunks.ts.
 */
export const sessionCleared = createAction('auth/sessionCleared');
