'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Task } from '@/types';

export default function HistoryPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tasks');
      const data = await res.json();

      if (data.code === 0) {
        setTasks(data.data?.tasks || []);
      } else {
        setError(data.message || '获取历史任务失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success';
      case 'failed':
        return 'bg-error';
      case 'pending':
      case 'analyzing':
      case 'searching':
      case 'deciding':
      case 'generating':
      case 'deploying':
      case 'testing':
        return 'bg-warning';
      default:
        return 'bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: '等待中',
      analyzing: '分析中',
      searching: '搜索中',
      deciding: '决策中',
      generating: '生成中',
      deploying: '部署中',
      testing: '测试中',
      completed: '已完成',
      failed: '失败',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin text-cta">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 bg-primary border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回
          </Link>
          <h1 className="text-xl font-semibold text-foreground">历史任务</h1>
        </div>
      </header>

      <main className="px-4 py-6 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-muted">暂无历史任务</p>
              <Link href="/" className="mt-4 inline-block text-sm text-cta hover:text-cta/80 cursor-pointer">
                开始第一个任务 →
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 bg-secondary rounded-lg border border-border hover:border-cta transition-colors cursor-pointer"
                  onClick={() => {
                    window.location.href = `/?task_id=${task.id}`;
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium text-primary rounded ${getStatusColor(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                        {task.project_metadata && (
                          <span className="px-2 py-1 text-xs font-medium bg-primary text-foreground rounded">
                            {task.project_metadata.type === 'web'
                              ? 'Web应用'
                              : task.project_metadata.type === 'desktop'
                              ? '桌面应用'
                              : '小程序'}
                          </span>
                        )}
                        {task.project_metadata?.file_count && (
                          <span className="text-xs text-muted">
                            {task.project_metadata.file_count} 个文件
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">
                        {task.job_description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted">
                    <div className="flex items-center gap-4">
                      {task.project_metadata?.file_list && (
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                          {task.project_metadata.file_list.slice(0, 3).join(', ')}
                          {task.project_metadata.file_list.length > 3 && '...'}
                        </div>
                      )}
                    </div>
                    <div>
                      {new Date(task.created_at).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
