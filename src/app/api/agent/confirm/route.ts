import { NextRequest, NextResponse } from 'next/server';
import { getTask, updateTaskStatus, updateTaskDecision } from '@/lib/tasks';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task_id, decision, confirmed } = body;

    if (!task_id) {
      return NextResponse.json({
        code: 1,
        message: 'Missing required field: task_id',
      });
    }

    const task = await getTask(task_id);
    if (!task) {
      return NextResponse.json({
        code: 2,
        message: 'Task not found',
      });
    }

    if (!confirmed) {
      await updateTaskStatus(task_id, 'failed');
      return NextResponse.json({
        code: 0,
        message: 'Task cancelled by user',
      });
    }

    if (decision) {
      await updateTaskDecision(task_id, decision);
    }

    await updateTaskStatus(task_id, 'generating');

    return NextResponse.json({
      code: 0,
      message: 'Decision confirmed, continuing...',
    });
  } catch (error) {
    console.error('Confirm API error:', error);
    return NextResponse.json({
      code: 500,
      message: 'Internal server error',
    });
  }
}
