export interface Task {
  id: string;
  user_id?: string;
  job_description: string;
  ocr_source_url?: string;
  decision?: Decision;
  status: TaskStatus;
  project_metadata?: ProjectMetadata;
  test_report?: TestReport;
  created_at: string;
  updated_at: string;
}

export type TaskStatus =
  | 'pending'
  | 'analyzing'
  | 'searching'
  | 'deciding'
  | 'generating'
  | 'deploying'
  | 'testing'
  | 'completed'
  | 'failed';

export interface Decision {
  type: 'web' | 'desktop' | 'miniprogram';
  reason: string;
  tech_stack: string[];
  project_spec: ProjectSpec;
}

export interface ProjectSpec {
  name: string;
  description: string;
  features: string[];
  architecture: string;
  dependencies: string[];
}

export interface ProjectMetadata {
  type: 'web' | 'desktop' | 'miniprogram';
  repo_url?: string;
  preview_url?: string;
  download_url?: string;
  code_archive_url?: string;
  file_count?: number;
  file_list?: string[];
  error_message?: string;
}

export interface TestReport {
  total_tests: number;
  passed: number;
  failed: number;
  coverage: number;
  details: TestDetail[];
}

export interface TestDetail {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

export interface AgentStep {
  stage: TaskStatus;
  detail: string;
  timestamp: string;
}

export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  image_url?: string;
  steps?: AgentStep[];
  result?: ProjectMetadata;
  task_id?: string;
  timestamp: string;
}

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
  error?: string;
}
