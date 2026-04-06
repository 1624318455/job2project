import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
import { getTask } from '@/lib/tasks';
import { getGeneratedCode } from '@/services/agentWorkflow';
import AdmZip from 'adm-zip';

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
        error: 'Project download is only available for completed tasks'
      }, { status: 400 });
    }

    const projectCode = getGeneratedCode(taskId);

    if (!projectCode || Object.keys(projectCode).length === 0) {
      return NextResponse.json<ApiResponse>({
        code: 404,
        message: 'No generated code available',
        error: 'The generated code is no longer available in memory'
      }, { status: 404 });
    }

    const zip = new AdmZip();
    const projectName = (task.project_metadata as { name?: string })?.name || 'generated-project';

    for (const [filePath, content] of Object.entries(projectCode)) {
      zip.addFile(`${projectName}/${filePath}`, Buffer.from(content, 'utf8'));
    }

    const zipBuffer = zip.toBuffer();

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${projectName}.zip"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json<ApiResponse>({
      code: 500,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
