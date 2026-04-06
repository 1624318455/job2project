import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@/types';
import { createTask } from '@/lib/tasks';
import { runAgentWorkflow } from '@/services/agentWorkflow';
import { extractTextFromImage } from '@/utils/ocr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, imageBase64 } = body;

    let openaiApiKey = request.headers.get('x-openai-api-key') || '';
    const openaiModel = request.headers.get('x-openai-model') || 'glm-4-flash';

    openaiApiKey = openaiApiKey.trim().replace(/^["']|["']$/g, '');

    if (!text && !imageBase64) {
      return NextResponse.json<ApiResponse>({
        code: 400,
        message: 'Missing required field: text or imageBase64',
        error: 'Please provide job description text or image'
      }, { status: 400 });
    }

    if (!openaiApiKey) {
      return NextResponse.json<ApiResponse>({
        code: 400,
        message: 'Missing API Key',
        error: 'Please configure your API key in settings'
      }, { status: 400 });
    }

    let jobDescription = text;

    if (imageBase64) {
      console.log('[agent/start] Running OCR on uploaded image...');
      try {
        const ocrText = await extractTextFromImage(imageBase64, openaiApiKey, openaiModel);
        jobDescription = text ? `${text}\n\n${ocrText}` : ocrText;
        console.log('[agent/start] OCR extracted', ocrText.length, 'characters');
      } catch (ocrError) {
        console.error('[agent/start] OCR failed:', ocrError);
        if (!text) {
          return NextResponse.json<ApiResponse>({
            code: 500,
            message: 'OCR failed',
            error: ocrError instanceof Error ? ocrError.message : 'Failed to extract text from image'
          }, { status: 500 });
        }
      }
    }

    const taskId = uuidv4();
    const anonymousUserId = uuidv4();

    console.log('[agent/start] Creating task:', taskId);
    try {
      await createTask(taskId, anonymousUserId, jobDescription);
      console.log('[agent/start] Task created successfully');
    } catch (taskError) {
      console.error('[agent/start] Failed to create task:', taskError);
      return NextResponse.json<ApiResponse>({
        code: 500,
        message: 'Failed to create task',
        error: taskError instanceof Error ? taskError.message : 'Database error'
      }, { status: 500 });
    }

    startAgentWorkflow(taskId, jobDescription, {
      openaiApiKey,
      openaiModel,
      tavilyApiKey: request.headers.get('x-tavily-api-key') || '',
      vercelToken: request.headers.get('x-vercel-token') || '',
    });

    return NextResponse.json<ApiResponse<{ task_id: string }>>({
      code: 0,
      message: 'success',
      data: { task_id: taskId }
    });
  } catch (error) {
    console.error('Start agent error:', error);
    return NextResponse.json<ApiResponse>({
      code: 500,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function startAgentWorkflow(
  taskId: string,
  jobDescription: string,
  apiKeys: {
    openaiApiKey: string;
    openaiModel: string;
    tavilyApiKey: string;
    vercelToken: string;
  }
) {
  try {
    console.log('[startAgentWorkflow] Starting workflow for task:', taskId);
    await runAgentWorkflow(taskId, jobDescription, apiKeys);
    console.log('[startAgentWorkflow] Workflow completed for task:', taskId);
  } catch (error) {
    console.error('Agent workflow error:', error);
  }
}
