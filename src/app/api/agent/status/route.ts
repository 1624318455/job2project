import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, Task } from '@/types';
import { getTask } from '@/lib/tasks';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('task_id');

    if (!taskId) {
      return NextResponse.json<ApiResponse>({
        code: 400,
        message: 'Missing required parameter: task_id',
        error: 'Please provide task_id'
      }, { status: 400 });
    }

    const task = await getTask(taskId);

    if (!task) {
      return NextResponse.json<ApiResponse>({
        code: 404,
        message: 'Task not found',
        error: 'Task with the given ID does not exist'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<Task>>({
      code: 0,
      message: 'success',
      data: task as Task
    });
  } catch (error) {
    console.error('Get task status error:', error);
    return NextResponse.json<ApiResponse>({
      code: 500,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
