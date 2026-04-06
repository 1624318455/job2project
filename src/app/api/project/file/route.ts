import { NextRequest, NextResponse } from 'next/server';
import { getGeneratedCode } from '@/services/agentWorkflow';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('task_id');
    const file = searchParams.get('file');

    if (!taskId || !file) {
      return new NextResponse('Missing task_id or file parameter', { status: 400 });
    }

    const projectCode = getGeneratedCode(taskId);

    if (!projectCode || !projectCode[file]) {
      return new NextResponse('File not found', { status: 404 });
    }

    return new NextResponse(projectCode[file], {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-File-Path': file,
      },
    });
  } catch (error) {
    console.error('File preview error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
