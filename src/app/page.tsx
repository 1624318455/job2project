'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import MessageList from '@/components/Chat/MessageList';
import InputArea from '@/components/Chat/InputArea';
import AgentThinking from '@/components/Chat/AgentThinking';
import { Message, Task, AgentStep } from '@/types';
import { isApiConfigured, createApiHeaders } from '@/lib/apiKeys';

function MainPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [apiConfigured, setApiConfigured] = useState(false);
  const [loadedTask, setLoadedTask] = useState<Task | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const taskIdFromUrl = searchParams.get('task_id');

  useEffect(() => {
    setApiConfigured(isApiConfigured());
  }, []);

  const loadTaskFromId = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/agent/status?task_id=${taskId}`);
      const data = await response.json();
      
      if (data.code === 0 && data.data) {
        const task: Task = data.data;
        setLoadedTask(task);
        
        const userMsg: Message = {
          id: uuidv4(),
          role: 'user',
          content: task.job_description || '',
          timestamp: task.created_at,
        };
        
        const messages: Message[] = [userMsg];
        
        if (task.status === 'completed' && task.project_metadata) {
          const agentMsg: Message = {
            id: uuidv4(),
            role: 'agent',
            content: '项目生成完成！',
            result: task.project_metadata,
            task_id: taskId,
            timestamp: task.updated_at,
          };
          messages.push(agentMsg);
        }
        
        setMessages(messages);
        
        setAgentSteps(updateStepsFromStatus(task.status));
        setIsProcessing(task.status === 'generating' || task.status === 'analyzing' || task.status === 'deciding');
        
        if (task.status !== 'completed' && task.status !== 'failed') {
          setCurrentTaskId(taskId);
          startPolling(taskId);
        }
      }
    } catch (error) {
      console.error('Failed to load task:', error);
    }
  }, []);

  useEffect(() => {
    if (taskIdFromUrl && !currentTaskId && !loadedTask) {
      loadTaskFromId(taskIdFromUrl);
    }
  }, [taskIdFromUrl, currentTaskId, loadedTask]);

  useEffect(() => {
    if (taskIdFromUrl && !currentTaskId && !loadedTask) {
      loadTaskFromId(taskIdFromUrl);
    }
  }, [taskIdFromUrl, currentTaskId, loadedTask, loadTaskFromId]);

  const updateStepsFromStatus = (status: string): AgentStep[] => {
    const now = new Date().toISOString();
    const steps: AgentStep[] = [
      { stage: 'analyzing', detail: '正在分析岗位描述，提取关键技术栈...', timestamp: now },
      { stage: 'deciding', detail: '正在综合分析结果，决策最佳项目类型...', timestamp: now },
    ];
    
    if (status === 'generating' || status === 'deploying') {
      steps.push({ stage: 'generating', detail: '正在生成项目代码...', timestamp: now });
    }
    
    if (status === 'completed') {
      steps[0] = { ...steps[0], timestamp: now };
      steps[1] = { ...steps[1], timestamp: now };
    }
    
    return steps;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, agentSteps]);

  const handleSubmit = async (text: string, imageBase64?: string) => {
    if (!text.trim() && !imageBase64) return;

    if (!isApiConfigured()) {
      router.push('/settings');
      return;
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: text,
      image_url: imageBase64,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);
    setAgentSteps([]);

    try {
      const response = await fetch('/api/agent/start', {
        method: 'POST',
        headers: createApiHeaders(),
        body: JSON.stringify({ text, imageBase64 }),
      });

      const data = await response.json();

      if (data.code === 0 && data.data?.task_id) {
        setCurrentTaskId(data.data.task_id);
        startPolling(data.data.task_id);
      } else {
        throw new Error(data.message || 'Failed to start task');
      }
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'agent',
        content: `提交失败：${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsProcessing(false);
    }
  };

  const startPolling = (taskId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/agent/status?task_id=${taskId}`);
        const data = await response.json();

        if (data.code === 0 && data.data) {
          const task: Task = data.data;

          updateAgentSteps(task.status);

          if (task.status === 'waiting_confirm' && task.decision) {
            const confirmMessage: Message = {
              id: uuidv4(),
              role: 'agent',
              content: `我建议生成一个【${task.decision.type === 'web' ? 'Web应用' : task.decision.type === 'desktop' ? '桌面应用' : '小程序'}】，理由：${task.decision.reason}\n\n技术栈：${task.decision.tech_stack.join('、')}\n\n项目名称：${task.decision.project_spec?.name || '待生成'}\n\n请确认是否继续？`,
              decision: task.decision,
              task_id: taskId,
              timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, confirmMessage]);
            setIsProcessing(false);
            setCurrentTaskId(null);
            clearInterval(interval);
            return;
          }

          if (task.status === 'completed') {
            clearInterval(interval);
            setIsProcessing(false);

            const agentMessage: Message = {
              id: uuidv4(),
              role: 'agent',
              content: '项目生成完成！',
              result: task.project_metadata,
              task_id: taskId,
              timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, agentMessage]);
            setAgentSteps([]);
          } else if (task.status === 'failed') {
            clearInterval(interval);
            setIsProcessing(false);

            // Extract actual error message from project_metadata if available
            const meta = task.project_metadata as { error_message?: string } | undefined;
            const errorMsg = meta?.error_message
              ? `任务执行失败：${meta.error_message}`
              : '任务执行失败，请检查API密钥配置或重试。';

            const errorMessage: Message = {
              id: uuidv4(),
              role: 'agent',
              content: errorMsg,
              timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, errorMessage]);
            setAgentSteps([]);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  const handleConfirm = async (taskId: string, decision: any, confirmed: boolean) => {
    try {
      await fetch('/api/agent/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, decision, confirmed }),
      });

      if (confirmed) {
        setIsProcessing(true);
        setCurrentTaskId(taskId);
        startPolling(taskId);
      } else {
        const cancelMessage: Message = {
          id: uuidv4(),
          role: 'agent',
          content: '已取消任务。',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, cancelMessage]);
      }
    } catch (error) {
      console.error('Confirm error:', error);
    }
  };

  const updateAgentSteps = (status: string) => {
    const statusMap: Record<string, { stage: AgentStep['stage']; detail: string }> = {
      analyzing: { stage: 'analyzing', detail: '正在分析岗位描述，提取关键技术栈...' },
      deciding: { stage: 'deciding', detail: '正在综合分析结果，决策最佳项目类型...' },
      generating: { stage: 'generating', detail: '正在生成项目代码...' },
      deploying: { stage: 'deploying', detail: '正在部署项目...' },
      testing: { stage: 'testing', detail: '正在运行测试...' },
    };

    const stepInfo = statusMap[status];
    if (stepInfo) {
      const newStep: AgentStep = {
        ...stepInfo,
        timestamp: new Date().toISOString(),
      };

      setAgentSteps((prev) => {
        if (prev.some((s) => s.stage === newStep.stage)) {
          return prev;
        }
        return [...prev, newStep];
      });
    }
  };

  const handleCancel = async () => {
    if (!currentTaskId) return;

    try {
      await fetch('/api/agent/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: currentTaskId }),
      });

      setIsProcessing(false);
      setCurrentTaskId(null);
      setAgentSteps([]);

      const cancelMessage: Message = {
        id: uuidv4(),
        role: 'agent',
        content: '任务已取消。',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, cancelMessage]);
    } catch (error) {
      console.error('Cancel error:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 顶部标题栏 */}
      <header className="flex items-center justify-between px-6 py-4 bg-primary border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cta flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Job2Project</h1>
          <span className="text-sm text-muted hidden md:inline">AI Agent智能体应用</span>
        </div>
        <nav className="flex items-center gap-4">
          {!apiConfigured && (
            <button
              onClick={() => router.push('/settings')}
              className="flex items-center gap-2 px-3 py-2 bg-warning/20 text-warning rounded-lg hover:bg-warning/30 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm">配置API</span>
            </button>
          )}
          <button
            onClick={() => router.push('/settings')}
            className="p-2 text-muted hover:text-foreground transition-colors cursor-pointer"
            title="设置"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <a
            href="/history"
            className="text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            历史任务
          </a>
        </nav>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && !taskIdFromUrl ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-cta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                欢迎使用 Job2Project
              </h2>
              <p className="text-muted max-w-md mb-6">
                发送前端开发工程师的岗位描述，AI Agent将自动分析需求并生成完整的项目代码。
              </p>

              {!apiConfigured && (
                <button
                  onClick={() => router.push('/settings')}
                  className="mb-8 px-6 py-3 bg-cta text-primary font-medium rounded-lg hover:bg-cta/80 transition-colors cursor-pointer"
                >
                  先配置 API 密钥 →
                </button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                <div className="p-4 bg-secondary rounded-lg border border-border">
                  <div className="text-cta text-sm font-medium mb-2">支持多模态输入</div>
                  <p className="text-xs text-muted">粘贴文本或上传招聘截图</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg border border-border">
                  <div className="text-cta text-sm font-medium mb-2">智能决策引擎</div>
                  <p className="text-xs text-muted">自动选择最佳项目类型</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg border border-border">
                  <div className="text-cta text-sm font-medium mb-2">一键部署预览</div>
                  <p className="text-xs text-muted">Web项目自动部署到Vercel</p>
                </div>
              </div>
            </div>
          ) : (
            <MessageList messages={messages} onConfirm={handleConfirm} />
          )}

          {isProcessing && agentSteps.length > 0 && (
            <AgentThinking steps={agentSteps} onCancel={handleCancel} />
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 底部输入区 */}
      <footer className="border-t border-border bg-primary px-4 py-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {!apiConfigured ? (
            <div className="text-center py-4">
              <p className="text-muted mb-2">请先配置 API 密钥才能使用</p>
              <button
                onClick={() => router.push('/settings')}
                className="text-cta hover:text-cta/80 cursor-pointer"
              >
                前往设置 →
              </button>
            </div>
          ) : (
            <InputArea onSubmit={handleSubmit} disabled={isProcessing} />
          )}
        </div>
      </footer>
    </div>
  );
}

export default function MainPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-screen bg-background">
        <header className="flex items-center justify-between px-6 py-4 bg-primary border-b border-border">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-foreground">Job2Project</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-muted">加载中...</div>
        </main>
      </div>
    }>
      <MainPageContent />
    </Suspense>
  );
}
