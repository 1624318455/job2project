'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LLM_PROVIDERS } from '@/utils/llmProviders';

interface ApiKeys {
  llmProvider: string;
  openaiApiKey: string;
  openaiModel: string;
  tavilyApiKey: string;
  vercelToken: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKeys>({
    llmProvider: 'zhipu',
    openaiApiKey: '',
    openaiModel: 'glm-4-flash',
    tavilyApiKey: '',
    vercelToken: '',
  });
  const [saved, setSaved] = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('job2project_api_keys');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setKeys({
          llmProvider: parsed.llmProvider || 'zhipu',
          openaiApiKey: parsed.openaiApiKey || '',
          openaiModel: parsed.openaiModel || 'glm-4-flash',
          tavilyApiKey: parsed.tavilyApiKey || '',
          vercelToken: parsed.vercelToken || '',
        });
      } catch (e) {
        console.error('Failed to parse stored keys');
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('job2project_api_keys', JSON.stringify(keys));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    localStorage.removeItem('job2project_api_keys');
    setKeys({
      llmProvider: 'zhipu',
      openaiApiKey: '',
      openaiModel: 'glm-4-flash',
      tavilyApiKey: '',
      vercelToken: '',
    });
  };

  const isConfigured = keys.openaiApiKey;

  const currentProvider = LLM_PROVIDERS.find((p) => p.id === keys.llmProvider) || LLM_PROVIDERS[0];
  const currentModel = currentProvider.models.find((m) => m.id === keys.openaiModel) || currentProvider.models[0];

  const handleProviderChange = (providerId: string) => {
    const provider = LLM_PROVIDERS.find((p) => p.id === providerId);
    if (provider) {
      setKeys({
        ...keys,
        llmProvider: providerId,
        openaiModel: provider.models[0].id,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 bg-primary border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回
          </button>
          <h1 className="text-xl font-semibold text-foreground">设置</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className={`mb-6 p-4 rounded-lg border ${isConfigured ? 'bg-success/10 border-success' : 'bg-warning/10 border-warning'}`}>
          <div className="flex items-center gap-2">
            {isConfigured ? (
              <>
                <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-success">API 已配置完成，可以开始使用</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-warning">请配置必要的 API 密钥</span>
              </>
            )}
          </div>
        </div>

        {/* LLM 配置 */}
        <div className="bg-secondary rounded-lg border border-border p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-cta flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">大模型配置</h2>
              <p className="text-sm text-muted">选择 LLM 提供商和模型</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">提供商</label>
              <select
                value={keys.llmProvider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-cta transition-colors cursor-pointer"
              >
                {LLM_PROVIDERS.map((provider) => (
                  <option key={provider.id} value={provider.id}>{provider.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">模型</label>
              <select
                value={keys.openaiModel}
                onChange={(e) => setKeys({ ...keys, openaiModel: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-cta transition-colors cursor-pointer"
              >
                {currentProvider.models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} {model.free ? '（免费）' : ''} - {model.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                API Key <span className="text-error">*</span>
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={keys.openaiApiKey}
                onChange={(e) => setKeys({ ...keys, openaiApiKey: e.target.value })}
                placeholder="请输入 API Key"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-cta transition-colors"
              />
              {currentModel.free && (
                <p className="mt-2 text-xs text-success">此模型提供免费额度</p>
              )}
              <a
                href={getProviderKeyUrl(keys.llmProvider)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs text-cta hover:text-cta/80 cursor-pointer"
              >
                获取密钥 →
              </a>
            </div>
          </div>
        </div>

        {/* Tavily 配置 */}
        <div className="bg-secondary rounded-lg border border-border p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#4444ff] flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Tavily Search</h2>
              <p className="text-sm text-muted">用于搜索技术趋势和市场需求（可选）</p>
            </div>
            <a
              href="https://tavily.com"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-xs text-cta hover:text-cta/80 cursor-pointer"
            >
              获取密钥 →
            </a>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">API Key</label>
            <input
              type={showKeys ? 'text' : 'password'}
              value={keys.tavilyApiKey}
              onChange={(e) => setKeys({ ...keys, tavilyApiKey: e.target.value })}
              placeholder="tvly-xxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-cta transition-colors"
            />
            <p className="mt-2 text-xs text-muted">免费额度：每月 1000 次搜索</p>
          </div>
        </div>

        {/* Vercel 部署配置 */}
        <div className="bg-secondary rounded-lg border border-border p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#000] flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L24 22H0L12 1Z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Vercel 部署</h2>
              <p className="text-sm text-muted">生成完成后自动部署到 Vercel（可选）</p>
            </div>
            <a
              href="https://vercel.com/account/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-xs text-cta hover:text-cta/80 cursor-pointer"
            >
              获取 Token →
            </a>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">API Token</label>
            <input
              type={showKeys ? 'text' : 'password'}
              value={keys.vercelToken}
              onChange={(e) => setKeys({ ...keys, vercelToken: e.target.value })}
              placeholder="填写 Vercel API Token 开启自动部署"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-cta transition-colors"
            />
            <p className="mt-2 text-xs text-muted">填写后生成的项目将自动部署，获得真实预览链接</p>
          </div>
        </div>

        {/* 图片识别说明 */}
        <div className="bg-secondary rounded-lg border border-border p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#ff6b35] flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">图片识别（OCR）</h2>
              <p className="text-sm text-muted">上传招聘截图自动提取文字</p>
            </div>
          </div>

          <div className="text-sm text-muted space-y-2">
            <p>• 使用大模型自带的视觉能力识别图片文字</p>
            <p>• 智谱 GLM 用户会自动切换到 <code className="px-1 py-0.5 bg-background rounded text-foreground text-xs">glm-4v</code> 模型</p>
            <p>• OpenAI 用户会自动切换到 <code className="px-1 py-0.5 bg-background rounded text-foreground text-xs">gpt-4o</code> 模型</p>
            <p>• 无需额外配置，上传即可使用</p>
          </div>
        </div>

        {/* 显示/隐藏密钥 */}
        <div className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            id="showKeys"
            checked={showKeys}
            onChange={(e) => setShowKeys(e.target.checked)}
            className="w-4 h-4 rounded border-border bg-background text-cta focus:ring-cta cursor-pointer"
          />
          <label htmlFor="showKeys" className="text-sm text-muted cursor-pointer">
            显示密钥
          </label>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-cta text-primary font-medium rounded-lg hover:bg-cta/80 transition-colors cursor-pointer"
          >
            {saved ? '已保存 ✓' : '保存配置'}
          </button>
          <button
            onClick={handleClear}
            className="px-6 py-3 bg-secondary text-foreground font-medium rounded-lg border border-border hover:bg-secondary/80 transition-colors cursor-pointer"
          >
            清除配置
          </button>
          <button
            onClick={() => router.push('/')}
            className="ml-auto text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            返回主页 →
          </button>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 p-4 bg-primary/50 rounded-lg border border-border">
          <h3 className="text-sm font-medium text-foreground mb-2">安全说明</h3>
          <ul className="text-xs text-muted space-y-1">
            <li>• API 密钥仅存储在您的浏览器本地（localStorage）</li>
            <li>• 密钥不会上传到任何服务器</li>
            <li>• 清除浏览器数据会丢失配置</li>
            <li>• 请勿在公共电脑上保存密钥</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

function getProviderKeyUrl(providerId: string): string {
  const urls: Record<string, string> = {
    openai: 'https://platform.openai.com/api-keys',
    zhipu: 'https://open.bigmodel.cn/usercenter/apikeys',
    aliyun: 'https://bailian.console.aliyun.com/?apiKey=1#/api-key',
    deepseek: 'https://platform.deepseek.com/api_keys',
    moonshot: 'https://platform.moonshot.cn/console/api-keys',
    anthropic: 'https://console.anthropic.com/settings/keys',
    google: 'https://aistudio.google.com/apikey',
    siliconflow: 'https://cloud.siliconflow.cn/account/ak',
  };
  return urls[providerId] || 'https://open.bigmodel.cn/usercenter/apikeys';
}
