'use client';

import { useState } from 'react';

interface CodePreviewProps {
  taskId: string;
  fileList?: string[];
}

export default function CodePreview({ taskId, fileList = [] }: CodePreviewProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleViewFile = async (filePath: string) => {
    if (selectedFile === filePath && code !== null) {
      setSelectedFile(null);
      setCode(null);
      return;
    }

    setLoading(true);
    setSelectedFile(filePath);
    try {
      const res = await fetch(`/api/project/file?task_id=${taskId}&file=${encodeURIComponent(filePath)}`);
      if (res.ok) {
        const data = await res.text();
        setCode(data);
      } else {
        setCode('无法加载文件内容');
      }
    } catch {
      setCode('加载失败');
    }
    setLoading(false);
  };

  if (!fileList.length) return null;

  const groupedFiles: Record<string, string[]> = {};
  for (const file of fileList) {
    const parts = file.split('/');
    const dir = parts.length > 1 ? parts[0] : '.';
    if (!groupedFiles[dir]) groupedFiles[dir] = [];
    groupedFiles[dir].push(file);
  }

  return (
    <div className="mt-3 border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2 bg-secondary text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
      >
        <span>📁 查看生成的代码 ({fileList.length} 个文件)</span>
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="flex" style={{ maxHeight: 500 }}>
          {/* File tree */}
          <div className="w-56 bg-secondary border-r border-border overflow-y-auto flex-shrink-0">
            <div className="p-2">
              {Object.entries(groupedFiles).map(([dir, files]) => (
                <div key={dir} className="mb-2">
                  <div className="text-xs font-medium text-muted px-2 py-1">
                    {dir === '.' ? '根目录' : `📂 ${dir}`}
                  </div>
                  {files.map((file) => {
                    const fileName = file.split('/').pop() || file;
                    const isActive = selectedFile === file;
                    return (
                      <button
                        key={file}
                        onClick={() => handleViewFile(file)}
                        className={`w-full text-left text-xs px-2 py-1 rounded cursor-pointer transition-colors truncate block ${
                          isActive
                            ? 'bg-cta/20 text-cta font-medium'
                            : 'text-muted hover:bg-background hover:text-foreground'
                        }`}
                      >
                        {getFileIcon(fileName)} {fileName}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Code view */}
          <div className="flex-1 overflow-auto bg-[#1e1e1e]">
            {loading ? (
              <div className="flex items-center justify-center h-full text-muted text-sm">加载中...</div>
            ) : selectedFile && code !== null ? (
              <div>
                <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-border">
                  <span className="text-xs text-foreground font-mono">{selectedFile}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(code)}
                    className="text-xs text-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    📋 复制
                  </button>
                </div>
                <pre className="p-4 text-sm text-[#d4d4d4] font-mono overflow-x-auto leading-relaxed">
                  <code>{code}</code>
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted text-sm">
                点击左侧文件查看内容
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  const icons: Record<string, string> = {
    ts: '🔷', tsx: '⚛️', js: '📜', jsx: '⚛️',
    vue: '💚', css: '🎨', html: '🌐', json: '📋',
    md: '📝', gitignore: '🚫', svg: '🖼️',
  };
  return icons[name] || icons[ext || ''] || '📄';
}
