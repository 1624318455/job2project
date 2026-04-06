import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, Task } from '@/types';
import { listTasks, countTasks } from '@/lib/tasks';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');

    const tasks = await listTasks(page, pageSize);
    const total = await countTasks();

    return NextResponse.json<ApiResponse<{ tasks: Task[]; total: number }>>({
      code: 0,
      message: 'success',
      data: {
        tasks: tasks as Task[],
        total,
      },
    });
  } catch (error) {
    console.error('List tasks error:', error);
    return NextResponse.json<ApiResponse>({
      code: 500,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
