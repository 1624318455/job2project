import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
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

    if (task.status !== 'completed') {
      return NextResponse.json<ApiResponse>({
        code: 400,
        message: 'Task not completed',
        error: 'Project preview is only available for completed tasks'
      }, { status: 400 });
    }

    const projectMetadata = task.project_metadata as {
      type: string;
      preview_url?: string;
    } | null;

    if (!projectMetadata?.preview_url) {
      return NextResponse.json<ApiResponse>({
        code: 404,
        message: 'Preview URL not found',
        error: 'No preview URL available for this project'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<{ preview_url: string; project_type: string }>>({
      code: 0,
      message: 'success',
      data: {
        preview_url: projectMetadata.preview_url,
        project_type: projectMetadata.type
      }
    });
  } catch (error) {
    console.error('Get preview URL error:', error);
    return NextResponse.json<ApiResponse>({
      code: 500,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
