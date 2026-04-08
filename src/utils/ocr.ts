import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { resolveBaseUrl } from './llmClient';

const VISION_MODELS: Record<string, string> = {
  'glm-4-flash': 'glm-4v',
  'glm-4.7-flash': 'glm-4v',
  'glm-4': 'glm-4v',
  'gpt-4o-mini': 'gpt-4o',
  'gpt-3.5-turbo': 'gpt-4o',
  'qwen-turbo': 'qwen-vl-plus',
  'qwen-plus': 'qwen-vl-plus',
  'gemini-2.5-flash': 'gemini-2.5-flash',
  'gemini-2.0-flash': 'gemini-2.0-flash',
};

function resolveVisionModel(model?: string): string {
  if (!model) return 'gpt-4o';
  return VISION_MODELS[model] || model;
}

const IMPROVED_SYSTEM_PROMPT = `你是一个专业的OCR文字识别助手。你的任务是：

1. 仔细识别图片中的所有文字，包括中文、英文、数字、标点符号
2. 保持原始的段落结构和换行
3. 对于模糊或不清楚的文字，根据上下文合理推断
4. 如果是招聘截图，特别注意识别：
   - 岗位名称（如：前端开发工程师）
   - 公司名称（如：XXX公司）
   - 薪资范围（如：11-17K）
   - 工作地点（如：武汉·洪山区）
   - 经验要求（如：3-5年）
   - 学历要求（如：本科）
   - 岗位职责和岗位要求的具体内容
5. 如果图片中没有文字或文字无法识别，明确说明
6. 不要添加任何图片中不存在的解释或内容`;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryOCR<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`[OCR] Attempt ${attempt}/${maxRetries} failed:`, lastError.message);
      
      if (attempt < maxRetries) {
        await sleep(delay * attempt);
      }
    }
  }
  
  throw lastError;
}

export async function extractTextFromImage(
  imageBase64: string,
  apiKey?: string,
  model?: string
): Promise<string> {
  const visionModel = resolveVisionModel(model);
  console.log('[OCR] Using vision model:', visionModel, '(original:', model, ')');

  return retryOCR(async () => {
    const llm = new ChatOpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY || '',
      model: visionModel,
      configuration: {
        baseURL: resolveBaseUrl(visionModel),
        timeout: 60_000,
      },
      temperature: 0.1,
      maxTokens: 4000,
    });

    const messages = [
      new SystemMessage(IMPROVED_SYSTEM_PROMPT),
      new HumanMessage({
        content: [
          {
            type: 'image_url',
            image_url: {
              url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`,
            },
          },
          {
            type: 'text',
            text: '请仔细识别这张图片中的所有文字内容。',
          },
        ],
      }),
    ];

    const response = await llm.invoke(messages);
    const text = response.content as string;
    
    console.log('[OCR] Extracted text length:', text.length);
    return text;
  });
}
