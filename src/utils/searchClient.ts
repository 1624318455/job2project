import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { resolveBaseUrl } from './llmClient';

interface SearchResult {
  title: string;
  url: string;
  content: string;
}

export async function searchTechTrends(
  query: string,
  apiKey: string,
  maxResults: number = 5
): Promise<SearchResult[]> {
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query: query,
        max_results: maxResults,
        include_answer: true,
      }),
    });

    if (!response.ok) {
      console.error('Tavily API error:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function searchJobMarketTrends(
  techStack: string[],
  projectType: string,
  tavilyApiKey: string
): Promise<string> {
  const query = `2025 2026 前端开发 招聘趋势 技术栈 ${techStack.join(' ')} ${projectType} 项目类型 市场需求`;

  const results = await searchTechTrends(query, tavilyApiKey, 3);

  if (results.length === 0) {
    return '无法获取市场趋势数据，请基于岗位描述直接决策。';
  }

  const context = results
    .map((r, i) => `${i + 1}. ${r.title}\n${r.content}`)
    .join('\n\n');

  return context;
}

export async function summarizeSearchResults(
  results: string[],
  jobDescription: string,
  openaiApiKey?: string,
  openaiModel?: string
): Promise<string> {
  if (results.length === 0) {
    return '无相关搜索结果。';
  }

  const llm = new ChatOpenAI({
    apiKey: openaiApiKey || process.env.OPENAI_API_KEY || '',
    model: openaiModel || process.env.OPENAI_MODEL || 'gpt-4',
    configuration: {
      baseURL: resolveBaseUrl(openaiModel || process.env.OPENAI_MODEL),
      timeout: 120_000,
      maxRetries: 2,
    },
    temperature: 0.3,
  });

  const messages = [
    new SystemMessage(`你是一个技术分析师。请根据搜索结果和岗位描述，总结技术趋势和建议。

请提供：
1. 当前市场主流技术栈
2. 推荐的项目类型
3. 竞争优势分析`),
    new HumanMessage(`岗位描述：
${jobDescription}

搜索结果：
${results.join('\n\n')}

请总结技术趋势和建议。`),
  ];

  const response = await llm.invoke(messages);
  return response.content as string;
}
