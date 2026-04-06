import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool | null {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString || connectionString.includes('your_') || connectionString.includes('example')) {
    console.warn('[db] DATABASE_URL not configured, using in-memory mock');
    return null;
  }

  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });

  console.log('[db] PostgreSQL pool initialized');
  return pool;
}

export async function query<T = Record<string, any>>(text: string, params?: any[]): Promise<T[]> {
  const p = getPool();
  if (!p) return [];

  const client = await p.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function execute(text: string, params?: any[]): Promise<void> {
  const p = getPool();
  if (!p) return;

  const client = await p.connect();
  try {
    await client.query(text, params);
  } finally {
    client.release();
  }
}

export { getPool };
