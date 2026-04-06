import { query, execute } from '@/lib/database';

export async function createTask(id: string, userId: string, jobDescription: string) {
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

export async function updateTaskMetadata(id: string, metadata: any) {
  return execute(
    `UPDATE tasks SET project_metadata = $1::jsonb, updated_at = NOW() WHERE id = $2`,
    [JSON.stringify(metadata), id]
  );
}

export async function listTasks(page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  return query(`SELECT * FROM tasks ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [pageSize, offset]);
}

export async function countTasks() {
  const rows = await query(`SELECT COUNT(*) as count FROM tasks`);
  return parseInt(rows[0]?.count || '0');
}
