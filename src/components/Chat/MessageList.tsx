'use client';

import { Message, Decision } from '@/types';
import ReactMarkdown from 'react-markdown';
import CodePreview from './CodePreview';

interface MessageListProps {
  messages: Message[];
  onConfirm?: (taskId: string, decision: Decision, confirmed: boolean) => void;
}

export default function MessageList({ messages, onConfirm }: MessageListProps) {
  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] ${
              message.role === 'user'
                ? 'message-user'
                : 'message-agent'
            } p-4`}
          >
            {message.image_url && (
              <div className="mb-3">
                <img
                  src={message.image_url}
                  alt="Uploaded image"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}

            <div className="text-sm leading-relaxed">
              {message.role === 'agent' ? (
                <ReactMarkdown>{message.content}</ReactMarkdown>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>

            {message.result && (
              <div className="mt-4 p-4 bg-background rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 text-xs font-medium bg-cta text-primary rounded">
                    {message.result.type === 'web'
                      ? 'Web应用'
                      : message.result.type === 'desktop'
                      ? '桌面应用'
                      : '小程序'}
                  </span>
                  <span className="text-xs text-muted">已生成</span>
                  {message.result.file_count && (
                    <span className="text-xs text-muted">
                      {message.result.file_count} 个文件
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {message.result.preview_url && (
                    <a
                      href={message.result.preview_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-cta hover:text-cta/80 transition-colors cursor-pointer"
                    >
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
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      预览项目（在线）
                    </a>
                  )}

                  {message.result.code_archive_url && (
                    <a
                      href={message.result.code_archive_url}
                      className="flex items-center gap-2 text-sm text-cta hover:text-cta/80 transition-colors cursor-pointer"
                    >
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      下载项目代码（ZIP）
                    </a>
                  )}
                </div>
              </div>
            )}

            {message.decision && message.task_id && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => onConfirm?.(message.task_id!, message.decision!, true)}
                  className="px-4 py-2 bg-cta text-primary font-medium rounded-lg hover:bg-cta/80 transition-colors cursor-pointer"
                >
                  确认继续
                </button>
                <button
                  onClick={() => onConfirm?.(message.task_id!, message.decision!, false)}
                  className="px-4 py-2 bg-secondary text-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
                >
                  取消
                </button>
              </div>
            )}

            {message.result?.file_list && message.result.file_list.length > 0 && message.task_id && (
              <CodePreview
                taskId={message.task_id}
                fileList={message.result.file_list}
              />
            )}

            <div className="mt-2 text-xs text-muted">
              {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
