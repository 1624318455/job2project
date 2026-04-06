import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { getProviderById, LLM_PROVIDERS } from './llmProviders';
import { selectTemplate, fillTemplate } from './projectTemplates';

export function resolveBaseUrl(model?: string): string | undefined {
  if (!model) return undefined;
  for (const provider of LLM_PROVIDERS) {
    if (provider.models.some((m) => m.id === model)) {
      return provider.baseUrl;
    }
  }
  return undefined;
}

function createLLM(apiKey?: string, model?: string, opts?: { maxTokens?: number }) {
  return new ChatOpenAI({
    apiKey: apiKey || process.env.OPENAI_API_KEY || '',
    model: model || process.env.OPENAI_MODEL || 'gpt-4o',
    configuration: {
      baseURL: resolveBaseUrl(model || process.env.OPENAI_MODEL),
      timeout: 120_000,
      maxRetries: 2,
    },
    temperature: 0.7,
    maxTokens: opts?.maxTokens || 4000,
  });
}

export async function analyzeJobDescription(
  jobDescription: string,
  apiKey?: string,
  model?: string
): Promise<{
  tech_stack: string[];
  project_type_preference: string;
  industry: string;
  experience_level: string;
  key_requirements: string[];
}> {
  const llm = createLLM(apiKey, model);

  const messages = [
    new SystemMessage(`你是一个专业的招聘分析师。请分析以下岗位描述，提取关键信息并以JSON格式返回。

分析维度：
1. tech_stack: 技术栈列表（如 React, Vue, Node.js 等）
2. project_type_preference: 项目类型偏好（web/desktop/miniprogram）
3. industry: 行业领域
4. experience_level: 经验要求（junior/mid/senior）
5. key_requirements: 关键要求列表

请返回有效的JSON格式，不要包含其他文字。`),
    new HumanMessage(jobDescription),
  ];

  const response = await llm.invoke(messages);
  const content = response.content as string;

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(content);
  } catch {
    return {
      tech_stack: [],
      project_type_preference: 'web',
      industry: 'unknown',
      experience_level: 'mid',
      key_requirements: [],
    };
  }
}

export async function generateProjectSpec(
  analysis: {
    tech_stack: string[];
    project_type_preference: string;
    industry: string;
    experience_level: string;
    key_requirements: string[];
  },
  searchContext: string,
  apiKey?: string,
  model?: string
): Promise<{
  name: string;
  description: string;
  features: string[];
  architecture: string;
  dependencies: string[];
}> {
  const llm = createLLM(apiKey, model);

  const messages = [
    new SystemMessage(`你是一个项目架构师。基于岗位分析和市场趋势，生成一个项目规格说明书。

请返回JSON格式：
{
  "name": "项目名称",
  "description": "项目描述",
  "features": ["功能1", "功能2", ...],
  "architecture": "架构说明",
  "dependencies": ["依赖1", "依赖2", ...]
}

请只返回JSON，不要包含其他文字。`),
    new HumanMessage(`岗位分析：
${JSON.stringify(analysis, null, 2)}

市场趋势：
${searchContext}

请生成一个完整的项目规格说明书。`),
  ];

  const response = await llm.invoke(messages);
  const content = response.content as string;

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(content);
  } catch {
    return {
      name: 'Generated Project',
      description: 'A web application based on job requirements',
      features: ['Feature 1', 'Feature 2'],
      architecture: 'Single Page Application',
      dependencies: analysis.tech_stack,
    };
  }
}

export async function generateCode(
  spec: {
    name: string;
    description: string;
    features: string[];
    architecture: string;
    dependencies: string[];
  },
  projectType: 'web' | 'desktop' | 'miniprogram',
  apiKey?: string,
  model?: string
): Promise<Record<string, string>> {
  const llm = createLLM(apiKey, model, { maxTokens: 16000 });

  // 1. Select and fill template
  const templateKey = selectTemplate(spec.dependencies || [], projectType);
  const baseFiles = fillTemplate(
    require('./projectTemplates').TEMPLATES[templateKey]?.files || {},
    {
      projectName: spec.name,
      projectDescription: spec.description,
    }
  );

  console.log('[generateCode] Using template:', templateKey);

  // 2. Build feature list for prompt
  const featureList = spec.features.map((f, i) => `${i + 1}. ${f}`).join('\n');

  // 3. Determine framework for code examples
  const framework = require('./projectTemplates').TEMPLATES[templateKey]?.framework || 'react';
  const isVue = framework === 'vue';

  // 4. Build the prompt
  const systemPrompt = `你是一个资深前端架构师。项目已有一个完整的基础框架（包括构建工具、路由、样式重置、入口文件等）。

你的任务是：为以下功能生成**完整的业务代码**。

## 编码规范
- TypeScript 严格模式，禁止 any
- 组件使用函数式 + Hooks（React）或 <script setup>（Vue）
- 每个组件不超过 150 行，超过则拆分
- 使用语义化 HTML 标签
- 错误处理：所有异步操作必须有 try/catch
- 样式使用 scoped CSS 或 CSS Modules
- 组件之间通过 props 传递数据，状态管理使用 Pinia（Vue）或 React Context

## 输出格式
使用以下分隔符格式输出**每个新增或修改的文件**：

=== path/to/file.ext ===
文件内容（保持原始格式，不需要转义）
=== end ===

注意：
- 不要输出已有的框架文件（package.json、vite.config.ts、tsconfig.json、index.html、main.ts/tsx、App.vue/tsx、global.css、.gitignore）
- 只输出业务组件、页面、工具函数、类型定义、状态管理等
- 文件路径使用 src/ 开头的相对路径
- 确保所有 import 路径正确`;

  const userPrompt = `## 项目信息

- **名称**: ${spec.name}
- **描述**: ${spec.description}
- **架构**: ${spec.architecture}

## 需要实现的功能

${featureList}

## 技术栈

${spec.dependencies?.join(', ') || 'Vue 3 / React 18, TypeScript, Vite'}

请为上述功能生成完整的业务代码。确保代码可以直接 npm run dev 运行。`;

  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ];

  const response = await llm.invoke(messages);
  const content = response.content as string;

  try {
    const result: Record<string, string> = {};
    const regex = /===\s*(.+?)\s*===\n([\s\S]*?)===\s*end\s*===/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const filePath = match[1].trim();
      let fileContent = match[2];
      fileContent = fileContent.replace(/^\n+/, '').replace(/\n+$/, '');
      if (filePath && fileContent) {
        result[filePath] = fileContent;
      }
    }

    if (Object.keys(result).length > 0) {
      console.log('[generateCode] Generated', Object.keys(result).length, 'business files');
    } else {
      console.error('[generateCode] No business files found in response');
      console.error('[generateCode] Response preview:', content.substring(0, 500));
    }

    // 3. Merge with base template
    const finalFiles = { ...baseFiles, ...result };
    console.log('[generateCode] Total files:', Object.keys(finalFiles).length, '(template:', Object.keys(baseFiles).length, '+ business:', Object.keys(result).length, ')');
    return finalFiles;
  } catch (e) {
    console.error('[generateCode] Parse error:', e);
    console.error('[generateCode] Response preview:', content.substring(0, 500));
    return baseFiles;
  }
}
