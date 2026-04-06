'use client';

import { AgentStep } from '@/types';

interface AgentThinkingProps {
  steps: AgentStep[];
  onCancel: () => void;
}

const stageLabels: Record<AgentStep['stage'], string> = {
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

const stageIcons: Record<AgentStep['stage'], React.ReactNode> = {
  pending: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  analyzing: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  searching: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  deciding: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  generating: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  deploying: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  testing: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  completed: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  failed: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

export default function AgentThinking({ steps, onCancel }: AgentThinkingProps) {
  const currentStep = steps[steps.length - 1];

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] message-agent p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-cta flex items-center justify-center animate-pulse">
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-foreground">Agent 正在思考...</span>
          </div>
          <button
            onClick={onCancel}
            className="text-xs text-muted hover:text-error transition-colors cursor-pointer"
          >
            取消
          </button>
        </div>

        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 p-2 rounded-lg ${
                index === steps.length - 1
                  ? 'bg-secondary'
                  : 'bg-secondary/50'
              }`}
            >
              <div
                className={`${
                  index === steps.length - 1 ? 'text-cta' : 'text-muted'
                }`}
              >
                {stageIcons[step.stage]}
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium text-foreground">
                  {stageLabels[step.stage]}
                </div>
                <div className="text-xs text-muted">{step.detail}</div>
              </div>
              {index === steps.length - 1 && (
                <div className="animate-spin text-cta">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 进度指示器 */}
        <div className="mt-3 flex items-center gap-1">
          {['analyzing', 'searching', 'deciding', 'generating', 'deploying', 'testing'].map(
            (stage) => {
              const isCompleted = steps.some((s) => s.stage === stage);
              const isCurrent = currentStep?.stage === stage;

              return (
                <div
                  key={stage}
                  className={`h-1 flex-1 rounded-full ${
                    isCompleted
                      ? 'bg-cta'
                      : isCurrent
                      ? 'bg-cta/50 animate-pulse'
                      : 'bg-border'
                  }`}
                />
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
