-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  job_description TEXT NOT NULL,
  ocr_source_url TEXT,
  decision JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  project_metadata JSONB,
  test_report JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read/write for now (can be tightened later with auth)
CREATE POLICY "Allow all access" ON tasks
  FOR ALL
  USING (true)
  WITH CHECK (true);
