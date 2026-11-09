import * as SQLite from 'expo-sqlite';

// Base de datos local (SQLite) para la caché sin conexión.
// Se abre una sola vez y, al abrirse, aplica las migraciones pendientes según
// PRAGMA user_version (el patrón de la documentación de expo-sqlite, SDK 58).

const DATABASE_NAME = 'campusgo.db';
export const DATABASE_VERSION = 1;

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Devuelve la base abierta y migrada; las llamadas siguientes reusan la misma. */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await migrate(db);
      return db;
    });
  }
  return databasePromise;
}

/**
 * Migraciones locales. user_version empieza en 0; cada bloque sube un número.
 * Para cambiar el esquema en el futuro: agregar un bloque "if (version < 2)" y
 * subir DATABASE_VERSION, sin tocar los bloques anteriores.
 */
export async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = row?.user_version ?? 0;
  if (version >= DATABASE_VERSION) return;

  if (version < 1) {
    // Una tabla clave-valor: cada fila guarda un conjunto de datos (perfil, viajes,
    // reservas) de un usuario como JSON, con la hora en que se guardó (cached_at).
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS cache (
        user_id   TEXT    NOT NULL,
        clave     TEXT    NOT NULL,
        datos     TEXT    NOT NULL,
        cached_at INTEGER NOT NULL,
        PRIMARY KEY (user_id, clave)
      );
    `);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
