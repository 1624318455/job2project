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

export async function researchProducts(
  query: string,
  tavilyApiKey: string,
  maxResults: number = 10
): Promise<SearchResult[]> {
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tavilyApiKey}`,
      },
      body: JSON.stringify({
        query: query,
        max_results: maxResults,
        include_answer: true,
        include_raw_content: true,
      }),
    });

    if (!response.ok) {
      console.error('Tavily API error:', response.statusText);
      return [];
    }

    const data = await response.json();
    console.log('[researchProducts] Got', data.results?.length || 0, 'results');
    return data.results || [];
  } catch (error) {
    console.error('Research search error:', error);
    return [];
  }
}

export async function summarizeResearch(
  results: SearchResult[],
  projectInfo: string,
  openaiApiKey?: string,
  openaiModel?: string
): Promise<string> {
  if (results.length === 0) {
    return '未找到相关竞品。';
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

  const resultsText = results
    .slice(0, 5)
    .map((r, i) => `${i + 1}. ${r.title}\nURL: ${r.url}\n${r.content?.substring(0, 500) || ''}`)
    .join('\n\n');

  const messages = [
    new SystemMessage(`你是一个产品分析师。请分析搜索到的类似产品，总结：
1. 这些产品的核心功能和特点
2. 界面设计和交互模式
3. 值得借鉴的设计要点
4. 可以做出差异化的方向

请详细分析，帮助生成高质量的项目。`),
    new HumanMessage(`项目信息：${projectInfo}

竞品分析：
${resultsText}

请总结竞品的关键特点和设计建议。`),
  ];

  const response = await llm.invoke(messages);
  console.log('[summarizeResearch] Analysis complete');
  return response.content as string;
}
