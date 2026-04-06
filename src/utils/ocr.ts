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

export async function extractTextFromImage(
  imageBase64: string,
  apiKey?: string,
  model?: string
): Promise<string> {
  const visionModel = resolveVisionModel(model);
  console.log('[OCR] Using vision model:', visionModel, '(original:', model, ')');

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
    new SystemMessage('你是一个OCR助手。请提取图片中的所有文字内容，保持原始格式。不要添加任何额外说明。'),
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
          text: '请提取这张图片中的所有文字内容。',
        },
      ],
    }),
  ];

  const response = await llm.invoke(messages);
  return response.content as string;
}
