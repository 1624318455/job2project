export interface LLMProvider {
  id: string;
  name: string;
  baseUrl: string;
  models: LLMModel[];
}

export interface LLMModel {
  id: string;
  name: string;
  description: string;
  free: boolean;
}

export const LLM_PROVIDERS: LLMProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', description: '最新旗舰，多模态', free: false },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: '轻量快速，性价比高', free: false },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: '上一代旗舰', free: false },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: '经济实惠', free: false },
    ],
  },
  {
    id: 'zhipu',
    name: '智谱 GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    models: [
      { id: 'glm-4.7-flash', name: 'GLM-4.7-Flash', description: '主力免费，强烈推荐', free: true },
      { id: 'glm-4-flash', name: 'GLM-4-Flash', description: '速度快，性价比高', free: true },
      { id: 'glm-4.5-flash', name: 'GLM-4.5-Flash', description: '已下线，自动路由至4.7', free: true },
      { id: 'glm-4-flashx', name: 'GLM-4-FlashX', description: '超快推理，付费', free: false },
      { id: 'glm-4-plus', name: 'GLM-4-Plus', description: '增强版，付费', free: false },
      { id: 'glm-4', name: 'GLM-4', description: '标准版，付费', free: false },
      { id: 'glm-4-air', name: 'GLM-4-Air', description: '低价高效', free: false },
      { id: 'glm-4-airx', name: 'GLM-4-AirX', description: 'Air增强版', free: false },
      { id: 'glm-4v', name: 'GLM-4V', description: '多模态视觉', free: false },
    ],
  },
  {
    id: 'aliyun',
    name: '阿里云 通义',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: [
      { id: 'qwen-plus', name: 'Qwen-Plus', description: '均衡型，性价比高', free: false },
      { id: 'qwen-turbo', name: 'Qwen-Turbo', description: '快速型，免费额度', free: true },
      { id: 'qwen-max', name: 'Qwen-Max', description: '最强能力', free: false },
      { id: 'qwen-long', name: 'Qwen-Long', description: '超长上下文', free: false },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek-V3', description: '主力模型，免费额度', free: true },
      { id: 'deepseek-reasoner', name: 'DeepSeek-R1', description: '推理模型', free: true },
    ],
  },
  {
    id: 'moonshot',
    name: '月之暗面 Kimi',
    baseUrl: 'https://api.moonshot.cn/v1',
    models: [
      { id: 'moonshot-v1-8k', name: 'Moonshot 8K', description: '标准版，8K上下文', free: false },
      { id: 'moonshot-v1-32k', name: 'Moonshot 32K', description: '32K上下文', free: false },
      { id: 'moonshot-v1-128k', name: 'Moonshot 128K', description: '128K长文本', free: false },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    baseUrl: 'https://api.anthropic.com/v1',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: '最新Sonnet', free: false },
      { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet', description: '性价比最优', free: false },
      { id: 'claude-3-5-haiku-latest', name: 'Claude 3.5 Haiku', description: '快速轻量', free: false },
      { id: 'claude-3-opus-latest', name: 'Claude 3 Opus', description: '最强能力', free: false },
    ],
  },
  {
    id: 'google',
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: '免费，快速高效', free: true },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: '专业版，免费额度', free: true },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: '上一代Flash', free: true },
    ],
  },
  {
    id: 'siliconflow',
    name: '硅基流动',
    baseUrl: 'https://api.siliconflow.cn/v1',
    models: [
      { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen2.5-72B', description: '免费额度', free: true },
      { id: 'THUDM/glm-4-9b-chat', name: 'GLM-4-9B', description: '免费额度', free: true },
      { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek-V3', description: '免费额度', free: true },
    ],
  },
];

export function getProviderById(id: string): LLMProvider | undefined {
  return LLM_PROVIDERS.find((p) => p.id === id);
}

export function getModelById(providerId: string, modelId: string): LLMModel | undefined {
  const provider = getProviderById(providerId);
  return provider?.models.find((m) => m.id === modelId);
}
