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
  const resolvedModel = model || process.env.OPENAI_MODEL || 'gpt-4o';
  const resolvedBaseUrl = resolveBaseUrl(resolvedModel);
  
  console.log('[createLLM] Creating LLM with:', {
    model: resolvedModel,
    baseUrl: resolvedBaseUrl,
    hasApiKey: !!apiKey,
    keyPrefix: apiKey?.substring(0, 10) || 'none'
  });
  
  return new ChatOpenAI({
    apiKey: apiKey || process.env.OPENAI_API_KEY || '',
    model: resolvedModel,
    configuration: {
      baseURL: resolvedBaseUrl,
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
    new SystemMessage(`你是一个专业的招聘分析师和前端技术专家。请分析以下岗位描述，提取关键信息。

## 分析要求
1. tech_stack: 技术栈列表（如 React, Vue, Node.js, TypeScript, Next.js 等）
2. project_type_preference: 项目类型偏好（web/desktop/miniprogram）
3. industry: 行业领域（如 电商、金融、教育、社交、游戏等）
4. experience_level: 经验要求（junior/mid/senior）
5. key_requirements: 关键要求列表（至少5条，包含技术要求和非技术要求）

## 重要：关键要求必须包含以下维度
- 核心技能要求（前端框架、编程语言等）
- 进阶技能要求（性能优化、架构设计、团队协作等）
- 业务能力要求（需求分析、产品思维等）
- 加分项（AI、全栈、跨平台等）

请返回有效的JSON格式，不要包含其他文字。`),
    new HumanMessage(jobDescription),
  ];

  const response = await llm.invoke(messages);
  const content = response.content as string;

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        ...parsed,
        key_requirements: parsed.key_requirements?.length >= 5 ? parsed.key_requirements : [
          '熟练使用主流前端框架',
          '扎实的JavaScript/TypeScript基础',
          '了解前端工程化',
          '良好的代码规范和团队协作能力',
          '本科及以上学历',
        ],
      };
    }
    return JSON.parse(content);
  } catch {
    return {
      tech_stack: ['React', 'TypeScript'],
      project_type_preference: 'web',
      industry: '互联网',
      experience_level: 'mid',
      key_requirements: [
        '熟练使用React开发',
        '掌握TypeScript',
        '了解前端工程化',
        '良好的团队协作',
        '本科及以上学历',
      ],
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
    new SystemMessage(`你是一个资深前端架构师。基于岗位分析和市场趋势，生成一个面试级项目的规格说明书。

## 重要要求
1. 生成的项目必须是一个**可交互、可演示**的完整产品原型
2. 功能必须具体、可实现，包含完整的业务逻辑
3. 适合作为面试作品展示

## 返回格式（JSON）
{
  "name": "项目名称（要专业、有特色）",
  "description": "项目描述（体现技术深度和业务价值）",
  "features": [
    "功能1：具体描述（包含用户交互、数据流程）",
    "功能2：具体描述",
    ...
    "功能5-8：每个功能都要具体可行"
  ],
  "architecture": "架构说明（体现技术选型理由和模块划分）",
  "dependencies": ["具体依赖列表"]
}

## 示例features格式（不要这样写，要更具体）：
❌ 错误："用户登录功能"
✅ 正确："用户登录注册：支持邮箱注册、密码强度验证、登录状态保持、Token存储与刷新、退出登录"

请只返回JSON，不要包含其他文字。`),
    new HumanMessage(`## 岗位分析
${JSON.stringify(analysis, null, 2)}

## 市场趋势
${searchContext}

## 关键要求
${analysis.key_requirements.join('\n')}

请生成一个可作为面试作品的项目规格说明书。`),
  ];

  const response = await llm.invoke(messages);
  const content = response.content as string;

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        ...parsed,
        features: parsed.features?.length >= 5 ? parsed.features : [
          '用户管理：支持注册、登录、权限控制',
          '数据展示：列表、分页、详情展示',
          '表单交互：完整的增删改查流程',
          '状态管理：全局状态与本地状态结合',
          '响应式适配：适配多端设备',
        ],
      };
    }
    return JSON.parse(content);
  } catch {
    return {
      name: '前端项目',
      description: '基于前端技术栈的可交互项目',
      features: [
        '用户管理：注册、登录、权限控制',
        '数据展示：列表、分页、详情',
        '表单交互：增删改查',
        '响应式设计',
      ],
      architecture: 'SPA + 组件化开发',
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
  model?: string,
  researchContext?: string
): Promise<Record<string, string>> {
  const llm = createLLM(apiKey, model, { maxTokens: 20000 });

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

  // 4. Build the prompt with competitive analysis
  const researchSection = researchContext ? `
## 竞品分析参考
以下是搜索到的同类优秀产品分析，请参考这些产品的设计亮点来生成代码：

${researchContext}

请借鉴这些产品的核心功能和界面设计，做出有竞争力的实现。
` : '';

  const systemPrompt = `你是一个资深前端架构师。项目已有一个完整的基础框架。

你的任务是：为以下功能生成**完整的、可交互的、高质量业务代码**。${researchSection}

## 重要要求
1. 代码必须**完整可运行**，不是stub或占位符，每个功能都要有真实的业务逻辑
2. 使用**Mock数据**模拟后端API，确保功能可演示
3. 页面和组件要有完整的**状态管理**（loading、error、empty、success）
4. 注重**用户体验**：平滑的过渡动画、合理的loading提示、友好的error处理
5. **界面设计要专业**：现代化的UI设计，包含统计卡片、特性展示、联系方式表单等

## 编码规范
- TypeScript 严格模式，禁止 any
- 组件使用函数式 + Hooks
- 每个组件不超过 150 行，超过则拆分
- 使用语义化 HTML 标签
- 错误处理：所有异步操作必须有 try/catch
- 样式使用行内样式（已提供基础样式系统）
- 组件之间通过 props 传递数据，使用 React Context 进行全局状态管理

## 项目已包含的完整页面（不要重复生成，直接使用）
- **Home页面**：包含Hero区域、统计卡片、特性展示的完整首页
- **About页面**：关于我们
- **Contact页面**：联系表单（包含姓名、邮箱、留言字段和提交功能）
- **UI组件**：Loading, Button, Input, Card, Modal, Empty, Table, Tabs, Badge
- **工具函数**：date.ts, storage.ts, validate.ts, request.ts, helpers.ts
- **Hooks**：useDebounce, usePagination, useToggle
- **类型定义**：User, ApiResponse, PageResult, SelectOption
- **布局组件**：MainLayout（包含顶部导航）
- **Context**：AppProvider

## 输出格式
使用以下分隔符格式输出**每个新增或修改的文件**（只在原有基础上添加新功能，不要覆盖已有的页面）：

=== path/to/file.ext ===
文件内容
=== end ===

注意：
- 不要覆盖已存在的页面（Home, About, Contact, NotFound）
- **文件路径必须使用标准的相对路径格式**，例如：
  - ✅ src/pages/ProductList.tsx
  - ✅ src/api/products.ts
  - ✅ src/services/productService.ts
  - ❌ path/to/src/pages/xxx.tsx（错误格式）
  - ❌ src\\pages\\xxx.tsx（Windows路径）
- 确保所有 import 路径正确（使用 @/ 别名）
- 优先使用项目已有的组件和工具函数`;

  const userPrompt = `## 项目信息

- **名称**: ${spec.name}
- **描述**: ${spec.description}
- **架构**: ${spec.architecture}

## 需要实现的功能（每个功能都要完整实现，至少3-5个核心功能）

${featureList}

## 技术栈

${spec.dependencies?.join(', ') || 'React 18, TypeScript, Vite, React Router'}

## 关键要求
1. 请生成以下类型的页面：
   - **业务列表页**：表格展示、分页、搜索、筛选
   - **详情页**：查看详情、编辑功能
   - **表单页**：新增/编辑数据的表单
   - **Dashboard页**：统计图表、数据展示

2. 每个页面需要包含：
   - 完整的Mock数据和服务层
   - 状态管理（loading、error、empty）
   - 用户交互（点击、输入、提交）
   - 响应式设计

 3. 生成的文件放在 src/api/, src/services/, src/pages/ 等目录

 4. 确保 npm run dev 后可以直接访问并演示功能
`;

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
      let filePath = match[1].trim();
      let fileContent = match[2];
      fileContent = fileContent.replace(/^\n+/, '').replace(/\n+$/, '');
      
      // Fix malformed paths
      if (filePath.includes('path') || filePath.includes('\\')) {
        // Remove "path\to\src\" or similar prefixes
        filePath = filePath.replace(/^path[\\/]+to[\\/]+src[\\/]+/, 'src/');
        filePath = filePath.replace(/^path[\\/]+/, '');
        // Fix Windows-style paths
        filePath = filePath.replace(/\\/g, '/');
      }
      
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
