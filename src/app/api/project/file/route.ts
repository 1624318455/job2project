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

    console.log('[file API] Request for task:', taskId, 'file:', file);
    
    let projectCode = getGeneratedCode(taskId);
    console.log('[file API] Memory cache:', projectCode ? Object.keys(projectCode).slice(0, 5) : 'null');
    
    if (!projectCode || !projectCode[file]) {
      projectCode = await getProjectCode(taskId);
      console.log('[file API] DB cache keys:', projectCode ? Object.keys(projectCode).slice(0, 5) : 'null');
    }

    if (!projectCode) {
      console.log('[file API] No project code found at all');
      return new NextResponse('File not found', { status: 404 });
    }

    const exactMatch = projectCode[file];
    if (exactMatch) {
      console.log('[file API] Found exact match for:', file);
      return new NextResponse(projectCode[file], {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-File-Path': file,
        },
      });
    }

    for (const key of Object.keys(projectCode)) {
      if (key === file || key.endsWith('/' + file) || key.endsWith('\\' + file)) {
        console.log('[file API] Found fuzzy match:', key);
        return new NextResponse(projectCode[key], {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-File-Path': key,
          },
        });
      }
    }

    console.log('[file API] File not found, available keys:', Object.keys(projectCode).slice(0, 10));
    return new NextResponse('File not found', { status: 404 });
  } catch (error) {
    console.error('File preview error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
