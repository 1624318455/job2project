# job2project - AI Agent智能体应用

通过AI Agent分析岗位描述，自动生成完整的项目代码。

## 项目概述

job2project是一个AI Agent智能体应用，用户通过对话框发送前端开发工程师岗位描述（文本或图片OCR识别），Agent自主分析岗位要求，决策最合适的项目形态（Desktop / Web / 小程序），并通过联网搜索、技术调研等能力，自动完成一个完整可运行的项目。

## 核心功能

- **多模态输入**: 支持文本输入和图片上传（OCR识别）
- **岗位分析**: 提取关键技术栈、项目经验要求、UI偏好、性能指标等
- **自主决策**: 结合联网搜索，决策项目类型（Web/Desktop/小程序）
- **项目自动生成**: 根据决策结果，生成完整项目代码
- **一键部署**: Web项目自动部署到Vercel，返回可访问URL
- **测试与验收**: 自动运行单元测试和E2E测试
- **对话式交互**: Agent展示思考过程（链式推理）

## 技术栈

| 层级 | 技术栈 | 说明 |
|------|--------|------|
| 前端 | Next.js 16 + TailwindCSS | 主应用界面（Agent对话界面、预览区） |
| 后端 | Next.js API Routes | 处理Agent任务调度、LLM调用、文件存储 |
| Agent框架 | LangChain.js + OpenAI API | 任务规划、工具调用（搜索、代码生成） |
| 联网搜索 | Tavily API | 实时搜索招聘趋势和技术栈热度 |
| OCR | 百度OCR API | 图片文字提取 |
| 数据库 | Supabase (PostgreSQL) | 存储用户任务、生成的项目元数据、历史记录 |
| 部署 | Vercel | 主应用和生成的Web项目部署 |
| 测试 | Jest (单元) + Playwright (E2E) | 测试覆盖率 ≥80% |

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd job2project
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local`，并填入以下配置：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4

# Tavily Search
TAVILY_API_KEY=your_tavily_api_key

# Baidu OCR (可选)
BAIDU_OCR_API_KEY=your_baidu_ocr_api_key
BAIDU_OCR_SECRET_KEY=your_baidu_ocr_secret_key

# Vercel (可选，用于部署生成的Web项目)
VERCEL_API_TOKEN=your_vercel_api_token

# GitHub (可选，用于创建仓库)
GITHUB_TOKEN=your_github_token
```

### 4. 初始化数据库

在Supabase中执行 `supabase/migrations/001_initial_schema.sql` 文件。

### 5. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

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
│   │       └── project/        # 项目相关接口
│   ├── components/             # React组件
│   │   ├── Chat/               # 对话相关组件
│   │   ├── Result/             # 结果展示组件
│   │   └── Common/             # 通用组件
│   ├── lib/                    # 工具库
│   │   └── supabase.ts         # Supabase客户端
│   ├── services/               # 服务层
│   │   └── agentWorkflow.ts    # Agent工作流
│   ├── utils/                  # 工具函数
│   │   ├── llmClient.ts        # LLM客户端
│   │   ├── searchClient.ts     # 搜索客户端
│   │   └── ocr.ts              # OCR工具
│   └── types/                  # TypeScript类型定义
├── supabase/                   # Supabase配置
│   └── migrations/             # 数据库迁移
└── memory.md                   # 项目记忆文件
```

## API接口

### Agent相关

- `POST /api/agent/start` - 启动任务
  - 请求: `{ text, imageBase64? }`
  - 响应: `{ code, message, data: { task_id } }`

- `GET /api/agent/status?task_id=xxx` - 查询任务状态
  - 响应: `{ code, message, data: Task }`

- `POST /api/agent/cancel` - 取消任务
  - 请求: `{ task_id }`
  - 响应: `{ code, message }`

### Project相关

- `GET /api/project/download?task_id=xxx` - 获取下载链接
  - 响应: `{ code, message, data: { download_url } }`

- `GET /api/project/preview?task_id=xxx` - 获取预览链接
  - 响应: `{ code, message, data: { preview_url, project_type } }`

## 数据库表结构

### tasks表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID (PK) | 任务唯一标识 |
| user_id | UUID (FK) | 关联用户 |
| job_description | TEXT | 原始岗位描述文本 |
| ocr_source_url | TEXT | 上传图片的存储路径 |
| decision | JSONB | 决策结果 |
| status | VARCHAR(20) | 任务状态 |
| project_metadata | JSONB | 生成项目的元数据 |
| test_report | JSONB | 测试结果 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### generated_projects表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID (PK) | 主键 |
| task_id | UUID (FK) | 关联任务 |
| project_type | VARCHAR(20) | 项目类型 |
| code_archive_url | TEXT | 代码压缩包存储地址 |
| preview_url | TEXT | 预览链接 |
| download_url | TEXT | 下载链接 |

## 开发命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run start    # 启动生产服务器
npm run lint     # 运行ESLint检查
npm run test     # 运行测试
```

## 设计规范

本项目遵循 [ui-ux-pro-max](https://github.com/anthropics/claude-code) 设计规范：

- **风格**: Data-Dense Dashboard
- **主色**: #0F172A (深蓝黑色)
- **CTA色**: #22C55E (绿色)
- **字体**: Fira Code / Fira Sans
- **响应式**: 支持375px ~ 1440px

## 部署

### Vercel部署

1. 将项目推送到GitHub
2. 在Vercel中导入项目
3. 配置环境变量
4. 部署

### 其他平台

参考 [Next.js部署文档](https://nextjs.org/docs/app/building-your-application/deploying)。

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License
