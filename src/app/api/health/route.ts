import { NextResponse } from 'next/server';
import { getPool } from '@/lib/database';

export async function GET() {
  try {
    const pool = getPool();
    
    if (!pool) {
      return NextResponse.json({
        status: 'error',
        message: 'Database pool not initialized',
        reason: 'DATABASE_URL may not be configured or is invalid'
      });
    }

    const result = await pool.query('SELECT NOW() as current_time');
    
    return NextResponse.json({
      status: 'ok',
      current_time: result.rows[0]?.current_time,
      message: 'Database connected successfully'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
