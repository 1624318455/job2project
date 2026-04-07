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

### 2026-04-07: Vercel Serverless超时导致任务卡住
- **问题**: Agent工作流在Vercel serverless函数中执行时，超过5分钟超时限制导致任务卡在"分析中"、"生成中"等状态
- **症状**: 任务状态一直停留在某个阶段不更新，前端显示"分析中"但永远不完成
- **原因**: Vercel的serverless function有5分钟超时限制，而代码生成是长时间运行任务
- **解决方案**: 移除工作流的超时等待包装，让工作流在后台异步执行，前端通过轮询查询状态
- **适用场景**: 所有需要长时间运行的后端任务都应在后台异步执行，避免serverless超时
- **预防方法**: 任务创建接口应立即返回task_id，由后台worker处理实际工作

### 2026-04-07: 代码未持久化导致预览失败
- **问题**: 生成的代码存储在内存中（globalThis），冷启动后丢失，导致文件预览返回404
- **症状**: 点击历史任务查看生成代码时显示"File not found"
- **原因**: 
  1. 使用全局变量存储生成的代码，Vercel冷启动后内存被清空
  2. `saveProjectCode` 函数成功保存了generated_code到数据库
  3. 但旧任务的数据库中generated_code字段为空（可能是之前实现不完整或任务失败）
- **解决方案**: 
  1. 确保每次生成完成后都调用 `saveProjectCode` 保存到数据库
  2. 文件预览API先尝试从内存读取，失败则从数据库读取
- **适用场景**: 任何需要在多次请求间保持的数据都必须持久化到数据库，不能依赖内存
- **经验**: 测试时应用新任务验证，因为旧任务可能使用旧代码生成，存在数据不一致

### 2026-04-07: updateTaskMetadata覆盖了generated_code
- **问题**: `updateTaskMetadata` 使用 `project_metadata = $1::jsonb` 覆盖整个字段，导致之前保存的generated_code丢失
- **症状**: 数据库中project_metadata有其他字段（如file_list、preview_url）但没有generated_code
- **解决方案**: 修改为合并现有数据，先查询再合并：`{...existing, ...newMetadata}`
- **适用场景**: 更新JSONB字段时要注意保留原有数据，使用合并而非覆盖

### 2026-04-07: useSearchParams未包裹Suspense导致SSR错误
- **问题**: 在page.tsx中使用`useSearchParams`获取URL参数，但未包裹Suspense导致构建失败
- **错误**: `useSearchParams() should be wrapped in a suspense boundary at page "/"`
- **解决方案**: 将组件拆分为两个：外层使用Suspense包装，内层使用useSearchParams
- **适用场景**: 任何使用useSearchParams的组件都需要包裹在Suspense中

### 2026-04-07: 旧任务无法显示生成结果
- **问题**: 从历史任务入口点击查看已完成任务时，只显示用户消息，没有显示Agent的生成结果
- **原因**: loadTaskFromId函数只加载了用户消息，没有处理已完成状态下的结果展示
- **解决方案**: 当任务状态为completed且有project_metadata时，添加Agent消息显示结果（下载链接、预览链接、文件列表等）
- **适用场景**: 从URL参数恢复任务状态时，需要根据任务完成状态加载相应的消息

## 问题排查方法论
### 1. 日志追踪法
- 通过在关键函数添加console.log，逐步定位问题
- 常用位置：API入口、数据库查询、状态更新处
- 适用于：数据流不清楚、不知道在哪一步失败

### 2. 新旧对比法
- 当修复后仍有问题时，创建一个全新的任务测试
- 原因：旧任务可能使用旧代码或存在数据不一致
- 适用于：数据库中有历史数据但无法确定其状态

### 3. 分层排查法
- 前端 → API → 数据库 → 服务层 → 外部依赖
- 逐层验证是否正常工作
- 适用于：不确定问题发生在哪一层

### 4. 网络请求检查法
- 使用浏览器开发者工具或Playwright查看网络请求
- 检查请求参数、响应状态码、响应内容
- 适用于：API调用失败或返回意外结果

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
