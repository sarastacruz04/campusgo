// Base SQLite falsa, en memoria, para probar db/cache.ts sin el módulo nativo.
// Solo entiende las tres consultas que usa la caché.

type Row = { datos: string; cached_at: number };

export function createFakeDatabase() {
  const rows = new Map<string, Row>();
  const keyOf = (userId: unknown, clave: unknown) => `${String(userId)}|${String(clave)}`;

  return {
    rows,
    async runAsync(sql: string, ...params: unknown[]) {
      if (sql.startsWith('INSERT OR REPLACE')) {
        const [userId, clave, datos, cachedAt] = params;
        rows.set(keyOf(userId, clave), { datos: String(datos), cached_at: Number(cachedAt) });
      } else if (sql.startsWith('DELETE')) {
        const [userId] = params;
        for (const key of [...rows.keys()]) {
          if (key.startsWith(`${String(userId)}|`)) rows.delete(key);
        }
      }
      return { changes: 1, lastInsertRowId: 0 };
    },
    async getFirstAsync<T>(_sql: string, ...params: unknown[]): Promise<T | null> {
      const [userId, clave] = params;
      return (rows.get(keyOf(userId, clave)) as T | undefined) ?? null;
    },
  };
}
