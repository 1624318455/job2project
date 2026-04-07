import { NextRequest, NextResponse } from 'next/server';
import { getGeneratedCode } from '@/services/agentWorkflow';
import { getProjectCode } from '@/lib/tasks';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('task_id');
    const file = searchParams.get('file');

    if (!taskId || !file) {
      return new NextResponse('Missing task_id or file parameter', { status: 400 });
    }

    let projectCode = getGeneratedCode(taskId);
    
    if (!projectCode || !projectCode[file]) {
      projectCode = await getProjectCode(taskId);
    }

    if (!projectCode) {
      return new NextResponse('File not found', { status: 404 });
    }

    const exactMatch = projectCode[file];
    if (exactMatch) {
      return new NextResponse(projectCode[file], {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-File-Path': file,
        },
      });
    }

    for (const key of Object.keys(projectCode)) {
      if (key === file || key.endsWith('/' + file) || key.endsWith('\\' + file)) {
        return new NextResponse(projectCode[key], {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-File-Path': key,
          },
        });
      }
    }

    return new NextResponse('File not found', { status: 404 });
  } catch (error) {
    console.error('File preview error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
