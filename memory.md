# 项目记忆：job2project

## 项目概述
- **项目名称**: job2project - AI Agent智能体应用
- **技术栈**: Next.js 16 + TailwindCSS + Supabase + LangChain.js
- **创建日期**: 2026-04-02
- **项目状态**: 核心功能已完成，构建成功

## 关键技术决策
- 决策1：使用Next.js API Routes作为后端，而非独立Express服务器，简化部署和开发流程
- 决策2：使用LangChain.js构建Agent工作流，支持工具调用和状态管理
- 决策3：使用Supabase作为数据库和存储服务，提供实时订阅和认证功能
- 决策4：前端使用TailwindCSS，遵循ui-ux-pro-max设计规范
- 决策5：Agent工作流使用简单的异步函数链，而非LangGraph StateGraph（API不稳定）

## 项目结构
```
job2project/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (main)/             # 主路由组
│   │   │   ├── page.tsx        # 主对话页面
│   │   │   └── history/        # 历史任务页面
│   │   └── api/                # API路由
│   │       ├── agent/          # Agent相关接口
│   │       │   ├── start/      # 启动任务
│   │       │   ├── status/     # 查询状态
│   │       │   └── cancel/     # 取消任务
│   │       └── project/        # 项目相关接口
│   │           ├── download/   # 下载项目
│   │           └── preview/    # 预览项目
│   ├── components/             # React组件
│   │   ├── Chat/               # 对话相关组件
│   │   │   ├── MessageList.tsx # 消息列表
│   │   │   ├── InputArea.tsx   # 输入区域
│   │   │   └── AgentThinking.tsx # 思考过程展示
│   │   ├── Result/             # 结果展示组件
│   │   └── Common/             # 通用组件
│   ├── lib/                    # 工具库
│   │   └── supabase.ts         # Supabase客户端
│   ├── services/               # 服务层
│   │   └── agentWorkflow.ts    # Agent工作流（异步函数链）
│   ├── utils/                  # 工具函数
│   │   ├── llmClient.ts        # LLM客户端（OpenAI）
│   │   ├── searchClient.ts     # 搜索客户端（Tavily）
│   │   └── ocr.ts              # OCR工具（百度OCR）
│   └── types/                  # TypeScript类型定义
├── supabase/                   # Supabase配置
│   └── migrations/             # 数据库迁移（001_initial_schema.sql）
└── memory.md                   # 项目记忆文件
```

## 核心功能实现状态
- [x] 前端对话界面
  - [x] 主对话页面（消息列表、输入区域、思考过程展示）
  - [x] 历史任务页面
  - [x] 响应式设计（移动端适配）
  - [x] 暗色主题（遵循ui-ux-pro-max设计规范）
- [x] 后端API路由
  - [x] POST /api/agent/start - 启动任务
  - [x] GET /api/agent/status - 查询任务状态
  - [x] POST /api/agent/cancel - 取消任务
  - [x] GET /api/project/download - 获取下载链接
  - [x] GET /api/project/preview - 获取预览链接
- [x] Agent工作流
  - [x] 岗位描述分析（LLM）
  - [x] 市场趋势搜索（Tavily）
  - [x] 项目类型决策
  - [x] 代码生成（LLM）
  - [x] 部署集成（模拟）
  - [x] 测试执行（模拟）
- [x] 数据库设计
  - [x] tasks表（任务管理）
  - [x] generated_projects表（项目存储）
  - [x] 索引和RLS策略
- [x] 工具函数
  - [x] LLM客户端（OpenAI GPT-4）
  - [x] 搜索客户端（Tavily API）
  - [x] OCR工具（百度OCR API）

## 踩坑记录
### 2026-04-02: LangChain.js StateGraph API不稳定
- **问题**: 使用`@langchain/langgraph`的StateGraph时，`setEntryPoint`和`addEdge`的类型定义要求参数为`"__start__" | "__end__"`，而不是自定义节点名称
- **解决方案**: 改用简单的异步函数链实现工作流，避免使用LangGraph
- **原因**: LangChain.js的API在快速迭代中，StateGraph的API可能有breaking changes
- **适用场景**: 简单的线性工作流可以使用异步函数链，复杂的条件分支工作流再考虑使用LangGraph

### 2026-04-02: Supabase客户端构建时验证URL
- **问题**: Next.js构建时会验证Supabase客户端的URL，如果使用占位符会导致构建失败
- **解决方案**: 在supabase.ts中使用try-catch捕获初始化错误，使用有效的URL格式（如`https://example.supabase.co`）
- **原因**: Supabase客户端在初始化时会验证URL格式
- **适用场景**: 开发环境可以使用占位符，生产环境需要配置真实的Supabase URL

## ui-ux-pro-max使用记录
- **调用场景**: 主对话页面布局设计
- **获取的设计规范**:
  - 模式: Data-Dense + Drill-Down
  - 风格: Data-Dense Dashboard
  - 颜色方案:
    - 主色: #0F172A (深蓝黑色)
    - 次要色: #1E293B
    - CTA色: #22C55E (绿色)
    - 背景色: #020617
    - 文字色: #F8FAFC
  - 字体: Fira Code / Fira Sans
  - 效果: 悬停工具提示、图表点击缩放、行悬停高亮、平滑过滤动画、数据加载旋转器
- **自定义补充**:
  - 添加了自定义滚动条样式
  - 添加了焦点状态样式（无障碍）
  - 添加了减少动画的媒体查询（无障碍）
  - 自定义了消息气泡样式

## 性能与成本
- 目标LLM成本：$0.5/任务
- 并发限制：10

## 待办改进
- [ ] 支持更多招聘平台直接爬取
- [ ] 允许用户干预决策
- [ ] 生成的项目支持在线编辑
- [ ] 编写单元测试和E2E测试
- [ ] 集成真实的Vercel部署API
- [ ] 优化OCR识别准确率

## 开发进度
### 2026-04-02
- 完成Next.js项目初始化
- 完成数据库表结构设计（Supabase迁移文件）
- 完成后端API路由（agent/start, agent/status, agent/cancel, project/download, project/preview）
- 完成Agent核心引擎（LangChain工作流）
- 完成前端对话界面（主页面、消息列表、输入区域、思考过程展示、历史任务页面）
- 完成工具函数（LLM客户端、搜索客户端、OCR工具）
- 项目构建成功（npm run build通过）
- 开发服务器启动成功（npm run dev）

## 环境配置
### 必需的环境变量（.env.local）
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4
TAVILY_API_KEY=your_tavily_api_key
```

### 可选的环境变量
```
BAIDU_OCR_API_KEY=your_baidu_ocr_api_key
BAIDU_OCR_SECRET_KEY=your_baidu_ocr_secret_key
VERCEL_API_TOKEN=your_vercel_api_token
GITHUB_TOKEN=your_github_token
```

### 启动命令
```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run start    # 启动生产服务器
npm run lint     # 运行ESLint检查
```
