import { Pool } from 'pg';

let pool: Pool | null = null;
let initialized = false;

async function initializeDatabase(p: Pool) {
  if (initialized) return;
  
  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT,
        job_description TEXT NOT NULL,
        ocr_source_url TEXT,
        decision JSONB,
        status TEXT NOT NULL DEFAULT 'pending',
        project_metadata JSONB,
        test_report JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    await p.query(`CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)`);
    await p.query(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`);
    await p.query(`CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC)`);
    
    console.log('[db] Database tables initialized');
    initialized = true;
  } catch (error) {
    console.error('[db] Failed to initialize database:', error);
  }
}

function getPool(): Pool | null {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString || connectionString.includes('your_') || connectionString.includes('example')) {
    console.warn('[db] DATABASE_URL not configured, using in-memory mock');
    return null;
  }

  console.log('[db] Creating pool, connection string starts with:', connectionString.substring(0, 30));
  
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });

  pool.on('error', (err) => {
    console.error('[db] Pool error:', err.message);
  });

  initializeDatabase(pool).catch(console.error);
  
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
