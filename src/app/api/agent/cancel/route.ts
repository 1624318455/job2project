import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
import { getTask, updateTaskStatus } from '@/lib/tasks';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task_id } = body;

    if (!task_id) {
      return NextResponse.json<ApiResponse>({
        code: 400,
        message: 'Missing required field: task_id',
        error: 'Please provide task_id'
      }, { status: 400 });
    }

    const task = await getTask(task_id);

    if (!task) {
      return NextResponse.json<ApiResponse>({
        code: 404,
        message: 'Task not found',
        error: 'Task with the given ID does not exist'
      }, { status: 404 });
    }

    const cancellableStatuses = ['pending', 'analyzing', 'searching', 'deciding', 'generating', 'deploying', 'testing'];
    if (!cancellableStatuses.includes(task.status)) {
      return NextResponse.json<ApiResponse>({
        code: 400,
        message: 'Task cannot be cancelled',
        error: `Task status is ${task.status}, only pending tasks can be cancelled`
      }, { status: 400 });
    }

    await updateTaskStatus(task_id, 'failed');

    return NextResponse.json<ApiResponse>({
      code: 0,
      message: 'Task cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel task error:', error);
    return NextResponse.json<ApiResponse>({
      code: 500,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
