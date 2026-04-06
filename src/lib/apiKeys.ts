'use client';

// 从localStorage获取API密钥
export function getApiKeys(): {
  llmProvider: string;
  openaiApiKey: string;
  openaiModel: string;
  tavilyApiKey: string;
  vercelToken: string;
} {
  if (typeof window === 'undefined') {
    return { llmProvider: 'zhipu', openaiApiKey: '', openaiModel: 'glm-4-flash', tavilyApiKey: '', vercelToken: '' };
  }

  try {
    const stored = localStorage.getItem('job2project_api_keys');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        llmProvider: parsed.llmProvider || 'zhipu',
        openaiApiKey: parsed.openaiApiKey || '',
        openaiModel: parsed.openaiModel || 'glm-4-flash',
        tavilyApiKey: parsed.tavilyApiKey || '',
        vercelToken: parsed.vercelToken || '',
      };
    }
  } catch (e) {
    console.error('Failed to get API keys:', e);
  }

  return { llmProvider: 'zhipu', openaiApiKey: '', openaiModel: 'glm-4-flash', tavilyApiKey: '', vercelToken: '' };
}

// 检查API密钥是否已配置
export function isApiConfigured(): boolean {
  const keys = getApiKeys();
  return !!keys.openaiApiKey;
}

// 创建带有API密钥的请求头
export function createApiHeaders(): HeadersInit {
  const keys = getApiKeys();
  return {
    'Content-Type': 'application/json',
    'x-openai-api-key': keys.openaiApiKey,
    'x-openai-model': keys.openaiModel,
    'x-tavily-api-key': keys.tavilyApiKey,
    'x-vercel-token': keys.vercelToken,
  };
}
