import postgres from 'postgres';

let _sql: ReturnType<typeof postgres> | null = null;

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function sql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está definida.');
  }
  if (!_sql) {
    _sql = postgres(process.env.DATABASE_URL, { max: 8 });
  }
  return _sql;
}

export function jsonb(valor: unknown) {
  return sql().json(valor as never);
}

export function begin<T>(fn: (tx: ReturnType<typeof postgres>) => Promise<T>): Promise<T> {
  return sql().begin(fn) as Promise<T>;
}
