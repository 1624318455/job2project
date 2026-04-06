-- 创建 tasks 表
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  job_description TEXT NOT NULL,
  ocr_source_url TEXT,
  decision JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'searching', 'deciding', 'generating', 'deploying', 'testing', 'completed', 'failed')),
  project_metadata JSONB,
  test_report JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- 创建 generated_projects 表
CREATE TABLE IF NOT EXISTS generated_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  project_type VARCHAR(20) NOT NULL CHECK (project_type IN ('web', 'desktop', 'miniprogram')),
  code_archive_url TEXT,
  preview_url TEXT,
  download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_generated_projects_task_id ON generated_projects(task_id);

-- 创建自动更新 updated_at 的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 tasks 表创建触发器
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 generated_projects 表创建触发器
CREATE TRIGGER update_generated_projects_updated_at
  BEFORE UPDATE ON generated_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 启用 RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_projects ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略（允许匿名用户访问自己的任务）
CREATE POLICY "Allow anonymous access to tasks" ON tasks
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous access to generated_projects" ON generated_projects
  FOR ALL USING (true);

-- 创建存储桶（用于存储代码压缩包和图片）
INSERT INTO storage.buckets (id, name, public) VALUES ('task-files', 'task-files', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('generated-code', 'generated-code', true);
