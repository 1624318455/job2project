import { query, execute, getPool } from '@/lib/database';

export async function createTask(id: string, userId: string, jobDescription: string) {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database not available');
  }
  
  return execute(
    `INSERT INTO tasks (id, user_id, job_description, status) VALUES ($1, $2, $3, 'pending')`,
    [id, userId, jobDescription]
  );
}

export async function getTask(id: string) {
  const rows = await query(`SELECT * FROM tasks WHERE id = $1`, [id]);
  return rows[0] || null;
}

export async function updateTaskStatus(id: string, status: string) {
  return execute(`UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2`, [status, id]);
}

export async function updateTaskDecision(id: string, decision: any) {
  return execute(
    `UPDATE tasks SET decision = $1::jsonb, updated_at = NOW() WHERE id = $2`,
    [JSON.stringify(decision), id]
  );
}

export async function updateTaskMetadata(id: string, metadata: any) {
  const existing = await query(`SELECT project_metadata FROM tasks WHERE id = $1`, [id]);
  const merged = {
    ...(existing[0]?.project_metadata || {}),
    ...metadata,
  };
  return execute(
    `UPDATE tasks SET project_metadata = $1::jsonb, updated_at = NOW() WHERE id = $2`,
    [JSON.stringify(merged), id]
  );
}

export async function saveProjectCode(id: string, code: Record<string, string>) {
  return execute(
    `UPDATE tasks SET project_metadata = COALESCE(project_metadata, '{}'::jsonb) || jsonb_build_object('generated_code', $1::jsonb), updated_at = NOW() WHERE id = $2`,
    [JSON.stringify(code), id]
  );
}

export async function getProjectCode(id: string) {
  const rows = await query(`SELECT project_metadata FROM tasks WHERE id = $1`, [id]);
  if (rows[0]?.project_metadata?.generated_code) {
    return rows[0].project_metadata.generated_code;
  }
  return null;
}

export async function listTasks(page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  return query(`SELECT * FROM tasks ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [pageSize, offset]);
}

export async function countTasks() {
  const rows = await query(`SELECT COUNT(*) as count FROM tasks`);
  return parseInt(rows[0]?.count || '0');
}
