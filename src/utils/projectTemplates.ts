export interface ProjectTemplate {
  name: string;
  framework: string;
  files: Record<string, string>;
}

const COMMON_UTILS = {
  'src/utils/date.ts': `export function formatDate(date: string | Date, format = 'YYYY-MM-DD'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');
  return format.replace('YYYY', String(year)).replace('MM', month).replace('DD', day).replace('HH', hour).replace('mm', minute).replace('ss', second);
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return \`\${days}天前\`;
  if (hours > 0) return \`\${hours}小时前\`;
  if (minutes > 0) return \`\${minutes}分钟前\`;
  return '刚刚';
}

export function formatNumber(num: number, decimals = 0): string {
  return num.toLocaleString('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}`,
  'src/utils/storage.ts': `const PREFIX = 'app_';

export const storage = {
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = localStorage.getItem(PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage set error:', e);
    }
  },
  remove(key: string): void {
    localStorage.removeItem(PREFIX + key);
  },
  clear(): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(PREFIX)) localStorage.removeItem(key);
    });
  },
};`,
  'src/utils/validate.ts': `export function isEmail(email: string): boolean {
  return /^\\w+([.-]?\\w+)*@\\w+([.-]?\\w+)*(\\.\\w+)+$/.test(email);
}

export function isPhone(phone: string): boolean {
  return /^1[3-9]\\d{9}$/.test(phone);
}

export function isUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

export function validateForm(data: Record<string, unknown>, rules: Record<string, (value: unknown) => string | true>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [key, validator] of Object.entries(rules)) {
    const result = validator(data[key]);
    if (result !== true) errors[key] = result;
  }
  return errors;
}`,
  'src/utils/request.ts': `interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

class HttpClient {
  private baseURL = '';
  private timeout = 10000;

  setBaseURL(url: string) {
    this.baseURL = url;
  }

  private buildURL(url: string, params?: Record<string, string | number | boolean>): string {
    const u = new URL(url, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([k, v]) => u.searchParams.append(k, String(v)));
    }
    return u.toString();
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || \`HTTP \${response.status}\`);
    }
    return response.json();
  }

  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    const fullURL = this.buildURL(url, options?.params);
    const response = await fetch(fullURL, { ...options, method: 'GET' });
    return this.handleResponse<T>(response);
  }

  async post<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const response = await fetch(this.buildURL(url, options?.params), {
      ...options,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    const response = await fetch(this.buildURL(url, options?.params), {
      ...options,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    const response = await fetch(this.buildURL(url, options?.params), { ...options, method: 'DELETE' });
    return this.handleResponse<T>(response);
  }
}

export const http = new HttpClient();`,
  'src/utils/helpers.ts': `export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let last = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn(...args);
    }
  };
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function downloadFile(content: string, filename: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}`,
  'src/types/index.ts': `export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
}

export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message?: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}`,
  'src/hooks/useDebounce.ts': `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}`,
  'src/hooks/usePagination.ts': `import { useState, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  total?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { initialPage = 1, initialPageSize = 10 } = options;
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const goToPage = useCallback((p: number) => setPage(Math.max(1, p)), []);
  const nextPage = useCallback(() => setPage(p => p + 1), []);
  const prevPage = useCallback(() => setPage(p => Math.max(1, p - 1)), []);
  const setPageSizeFn = useCallback((size: number) => { setPageSize(size); setPage(1); }, []);

  return { page, pageSize, goToPage, nextPage, prevPage, setPageSize: setPageSizeFn };
}`,
  'src/hooks/useToggle.ts': `import { useState, useCallback } from 'react';

export function useToggle(initial = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue(v => !v), []);
  const set = useCallback((v: boolean) => setValue(v), []);
  return [value, toggle, set];
}`,
  'src/components/Loading.tsx': `interface LoadingProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  fullScreen?: boolean;
}

export function Loading({ size = 'default', tip, fullScreen }: LoadingProps) {
  const sizeMap = { small: 24, default: 32, large: 48 };
  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: sizeMap[size],
        height: sizeMap[size],
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #1890ff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      {tip && <span style={{ color: '#666', fontSize: 14 }}>{tip}</span>}
      <style>{'@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}'}</style>
    </div>
  );
  if (fullScreen) {
    return <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.9)', zIndex: 9999 }}>{spinner}</div>;
  }
  return <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>{spinner}</div>;
}`,
  'src/components/Button.tsx': `import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'default' | 'danger' | 'link';
  size?: 'small' | 'default' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ variant = 'default', size = 'default', loading, icon, children, disabled, style, ...props }: ButtonProps) {
  const sizeMap = { small: { padding: '4px 12px', fontSize: 12 }, default: { padding: '8px 16px', fontSize: 14 }, large: { padding: '12px 24px', fontSize: 16 } };
  const variantMap = { primary: { background: '#1890ff', color: '#fff' }, default: { background: '#fff', color: '#333', border: '1px solid #d9d9d9' }, danger: { background: '#ff4d4f', color: '#fff' }, link: { background: 'none', color: '#1890ff', border: 'none' } };
  return (
    <button disabled={disabled || loading} style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, borderRadius: 4, ...sizeMap[size], ...variantMap[variant], ...style }} {...props}>
      {loading ? <span>加载中...</span> : <>{icon}{children}</>}
    </button>
  );
}`,
  'src/components/Input.tsx': `import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  error?: string;
}

export function Input({ prefix, suffix, error, style, ...props }: InputProps) {
  return (
    <div style={{ position: 'relative' }}>
      {prefix && <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }}>{prefix}</span>}
      <input style={{ width: '100%', padding: '8px 12px', paddingLeft: prefix ? 36 : 12, paddingRight: suffix ? 36 : 12, border: error ? '1px solid #ff4d4f' : '1px solid #d9d9d9', borderRadius: 4, fontSize: 14, outline: 'none', ...style }} {...props} />
      {suffix && <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }}>{suffix}</span>}
      {error && <span style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4, display: 'block' }}>{error}</span>}
    </div>
  );
}`,
  'src/components/Card.tsx': `import React from 'react';

interface CardProps {
  title?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function Card({ title, extra, children, style }: CardProps) {
  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', ...style }}>
      {(title || extra) && (
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {title && <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>{title}</h3>}
          {extra && <div>{extra}</div>}
        </div>
      )}
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
}`,
  'src/components/Modal.tsx': `import React, { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number | string;
  footer?: React.ReactNode;
}

export function Modal({ open, title, onClose, children, width = 520, footer }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width, background: '#fff', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
        {title && <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', fontSize: 16, fontWeight: 500 }}>{title}</div>}
        <div style={{ padding: 24, maxHeight: '60vh', overflow: 'auto' }}>{children}</div>
        {footer && <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{footer}</div>}
      </div>
    </div>
  );
}`,
  'src/components/Empty.tsx': `interface EmptyProps {
  description?: string;
  image?: string;
}

export function Empty({ description = '暂无数据' }: EmptyProps) {
  return (
    <div style={{ padding: 60, textAlign: 'center', color: '#999' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
      <div>{description}</div>
    </div>
  );
}`,
};

const REACT_COMPONENTS = {
  'src/context/AppContext.tsx': `import { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  user: { id: string; name: string } | null;
  setUser: (user: { id: string; name: string } | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  return <AppContext.Provider value={{ user, setUser }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}`,
  'src/components/index.ts': `export { Loading } from './Loading';
export { Button } from './Button';
export { Input } from './Input';
export { Card } from './Card';
export { Modal } from './Modal';
export { Empty } from './Empty';
export { Table } from './Table';
export { Tabs } from './Tabs';
export { Badge } from './Badge';`,
  'src/components/Badge.tsx': `interface BadgeProps {
  count?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'default';
  children?: React.ReactNode;
}

export function Badge({ count, variant = 'primary', children }: BadgeProps) {
  const colors = {
    primary: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    danger: '#ff4d4f',
    default: '#d9d9d9'
  };
  const bg = colors[variant];
  if (children) {
    return (
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        {children}
        {count && count > 0 && (
          <span style={{
            position: 'absolute', top: -8, right: -8,
            background: bg, color: '#fff', borderRadius: 10,
            padding: '2px 6px', fontSize: 12, minWidth: 18, textAlign: 'center'
          }}>{count > 99 ? '99+' : count}</span>
        )}
      </span>
    );
  }
  if (count !== undefined) {
    return (
      <span style={{
        background: bg, color: '#fff', borderRadius: 10,
        padding: '2px 8px', fontSize: 12
      }}>{count > 99 ? '99+' : count}</span>
    );
  }
  return null;
}`,
  'src/components/Table.tsx': `import React from 'react';

interface Column<T> {
  key: string;
  title: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  onRowClick?: (record: T, index: number) => void;
}

export function Table<T extends Record<string, any>>({ 
  columns, data, loading, emptyText = '暂无数据', onRowClick 
}: TableProps<T>) {
  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>加载中...</div>;
  }
  if (data.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>{emptyText}</div>;
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#fafafa' }}>
            {columns.map(col => (
              <th key={col.key} style={{ 
                padding: '12px 16px', textAlign: 'left', fontWeight: 500, 
                borderBottom: '1px solid #f0f0f0', color: '#333', width: col.width 
              }}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((record, i) => (
            <tr key={i} onClick={() => onRowClick?.(record, i)} style={{ 
              borderBottom: '1px solid #f0f0f0', cursor: onRowClick ? 'pointer' : 'default' 
            }}>
              {columns.map(col => (
                <td key={col.key} style={{ padding: '12px 16px', color: '#666' }}>
                  {col.render ? col.render(record[col.key], record, i) : record[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`,
  'src/components/Tabs.tsx': `import React, { useState } from 'react';

interface TabItem {
  key: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
}

export function Tabs({ items, defaultActiveKey, onChange }: TabsProps) {
  const [activeKey, setActiveKey] = useState(defaultActiveKey || items[0]?.key);
  const active = items.find(item => item.key === activeKey) || items[0];
  
  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
        {items.map(item => (
          <div key={item.key} onClick={() => { setActiveKey(item.key); onChange?.(item.key); }}
            style={{
              padding: '12px 24px', cursor: 'pointer', color: activeKey === item.key ? '#1890ff' : '#666',
              borderBottom: activeKey === item.key ? '2px solid #1890ff' : '2px solid transparent',
              fontWeight: activeKey === item.key ? 500 : 400
            }}>
            {item.label}
          </div>
        ))}
      </div>
      <div style={{ padding: 24 }}>{active?.content}</div>
    </div>
  );
}`,
  'src/components/Loading.tsx': `import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: '首页' },
  { path: '/about', label: '关于' },
  { path: '/contact', label: '联系' },
];

export function MainLayout({ children }: LayoutProps) {
  const location = useLocation();
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <header style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 100 }}>
        <nav style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ fontSize: 20, fontWeight: 600, color: '#1890ff' }}>{{projectName}}</Link>
          <div style={{ display: 'flex', gap: 32 }}>
            {navItems.map(item => (
              <Link key={item.path} to={item.path} style={{ color: location.pathname === item.path ? '#1890ff' : '#333', fontSize: 14 }}>{item.label}</Link>
            ))}
          </div>
        </nav>
      </header>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>{children}</main>
    </div>
  );
}`,
};

const REACT_PAGES = {
  'src/pages/About.tsx': `import { Card } from '@/components';

export default function About() {
  return (
    <Card title="关于我们">
      <p>{{projectDescription}}</p>
      <div style={{ marginTop: 24 }}>
        <h4>联系方式</h4>
        <p>邮箱: contact@example.com</p>
      </div>
    </Card>
  );
}`,
  'src/pages/NotFound.tsx': `import { Button } from '@/components';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: 'center', padding: 100 }}>
      <h1 style={{ fontSize: 72, color: '#ccc' }}>404</h1>
      <p style={{ fontSize: 18, color: '#666', marginBottom: 24 }}>页面不存在</p>
      <Button variant="primary" onClick={() => navigate('/')}>返回首页</Button>
    </div>
  );
}`,
  'src/pages/Home.tsx': `import { useState, useEffect } from 'react';
import { Card } from '@/components';
import { Button } from '@/components';

export default function Home() {
  const [stats] = useState({
    users: 1248,
    projects: 356,
    visits: 8920
  });

  return (
    <div style={{ padding: 24 }}>
      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        borderRadius: 16, 
        padding: 48, 
        color: '#fff',
        marginBottom: 32,
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: 36, marginBottom: 16, fontWeight: 600 }}>{{projectName}}</h1>
        <p style={{ fontSize: 18, opacity: 0.9, maxWidth: 600, margin: '0 auto 24px' }}>{{projectDescription}}</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Button style={{ background: '#fff', color: '#667eea' }}>开始使用</Button>
          <Button style={{ background: 'transparent', border: '2px solid #fff', color: '#fff' }}>了解更多</Button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
        {Object.entries(stats).map(([key, value]) => (
          <Card key={key} style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#667eea' }}>{value.toLocaleString()}</div>
            <div style={{ color: '#666', marginTop: 8, textTransform: 'capitalize' }}>{key}</div>
          </Card>
        ))}
      </div>

      {/* Features */}
      <h2 style={{ marginBottom: 24, fontSize: 24 }}>核心功能</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {[
          { icon: '🚀', title: '快速部署', desc: '一键部署到生产环境' },
          { icon: '📊', title: '数据分析', desc: '实时监控和数据分析' },
          { icon: '🔒', title: '安全可靠', desc: '企业级安全保障' }
        ].map((item, i) => (
          <Card key={i}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>{item.title}</h3>
            <p style={{ color: '#666', fontSize: 14 }}>{item.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}`,
  'src/pages/Contact.tsx': `import { Card } from '@/components';
import { Input } from '@/components';
import { Button } from '@/components';
import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card title="联系我们">
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h3>提交成功</h3>
          <p style={{ color: '#666', marginTop: 8 }}>我们尽快与您联系</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="联系我们">
      <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, color: '#333' }}>姓名</label>
          <Input 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})}
            placeholder="请输入您的姓名"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, color: '#333' }}>邮箱</label>
          <Input 
            type="email"
            value={form.email} 
            onChange={e => setForm({...form, email: e.target.value})}
            placeholder="请输入您的邮箱"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, color: '#333' }}>留言</label>
          <textarea 
            value={form.message}
            onChange={e => setForm({...form, message: e.target.value})}
            placeholder="请输入您的留言"
            style={{ 
              width: '100%', minHeight: 120, padding: 12, border: '1px solid #d9d9d9', 
              borderRadius: 4, fontSize: 14, resize: 'vertical'
            }}
          />
        </div>
        <Button type="submit" variant="primary" style={{ width: '100%' }}>提交</Button>
      </form>
      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
        <h4 style={{ marginBottom: 12 }}>其他联系方式</h4>
        <p style={{ color: '#666' }}>📧 contact@example.com</p>
        <p style={{ color: '#666' }}>📞 400-123-4567</p>
        <p style={{ color: '#666' }}>🏠 北京市朝阳区xxx大厦</p>
      </div>
    </Card>
  );
}`,
};

export const TEMPLATES: Record<string, ProjectTemplate> = {
  'vue3-vite': {
    name: 'Vue 3 + Vite + TypeScript',
    framework: 'vue',
    files: {
      'package.json': JSON.stringify({
        name: '{{projectName}}',
        private: true,
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vue-tsc && vite build',
          preview: 'vite preview',
        },
        dependencies: {
          vue: '^3.4.0',
          'vue-router': '^4.3.0',
          pinia: '^2.1.0',
        },
        devDependencies: {
          '@vitejs/plugin-vue': '^5.0.0',
          vite: '^5.4.0',
          'vue-tsc': '^2.0.0',
          typescript: '~5.5.0',
        },
      }, null, 2),
      'vite.config.ts': `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})`,
      'tsconfig.json': JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          module: 'ESNext',
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          isolatedModules: true,
          moduleDetection: 'force',
          noEmit: true,
          jsx: 'preserve',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
          paths: { '@/*': ['./src/*'] },
        },
        include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
        references: [{ path: './tsconfig.node.json' }],
      }, null, 2),
      'tsconfig.node.json': JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          lib: ['ES2023'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          isolatedModules: true,
          moduleDetection: 'force',
          noEmit: true,
          strict: true,
        },
        include: ['vite.config.ts'],
      }, null, 2),
      'index.html': `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{projectName}}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`,
      'src/main.ts': `import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/global.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')`,
      'src/App.vue': `<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
</script>

<style>
#app {
  min-height: 100vh;
}
</style>`,
      'src/env.d.ts': `/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}`,
      'src/router/index.ts': `import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
  ],
})

export default router`,
      'src/styles/global.css': `*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  cursor: pointer;
  border: none;
  outline: none;
  background: none;
  font: inherit;
}

img {
  max-width: 100%;
  height: auto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}`,
      'src/views/HomeView.vue': `<template>
  <div class="home">
    <h1>{{projectName}}</h1>
    <p>{{projectDescription}}</p>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
}

h1 {
  font-size: 2rem;
  margin-bottom: 16px;
  color: #1a1a1a;
}

p {
  color: #666;
  font-size: 1.1rem;
}
</style>`,
      '.gitignore': `node_modules
dist
*.local
.env
.env.*
!.env.example`,
      'README.md': `# {{projectName}}

{{projectDescription}}

## 技术栈

- Vue 3 + TypeScript
- Vite
- Vue Router
- Pinia

## 开发

\`\`\`bash
npm install
npm run dev
\`\`\`

## 构建

\`\`\`bash
npm run build
\`\`\`
`,
    },
  },
  'react-vite': {
    name: 'React + Vite + TypeScript',
    framework: 'react',
    files: {
      'package.json': JSON.stringify({
        name: '{{projectName}}',
        private: true,
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'tsc -b && vite build',
          preview: 'vite preview',
        },
        dependencies: {
          react: '^18.3.0',
          'react-dom': '^18.3.0',
          'react-router-dom': '^6.26.0',
        },
        devDependencies: {
          '@types/react': '^18.3.0',
          '@types/react-dom': '^18.3.0',
          '@vitejs/plugin-react': '^4.3.0',
          vite: '^5.4.0',
          typescript: '~5.5.0',
        },
      }, null, 2),
      'vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})`,
      'tsconfig.json': JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          isolatedModules: true,
          moduleDetection: 'force',
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
          paths: { '@/*': ['./src/*'] },
        },
        include: ['src'],
        references: [{ path: './tsconfig.node.json' }],
      }, null, 2),
      'tsconfig.node.json': JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          lib: ['ES2023'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          isolatedModules: true,
          moduleDetection: 'force',
          noEmit: true,
          strict: true,
        },
        include: ['vite.config.ts'],
      }, null, 2),
      'index.html': `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{projectName}}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
      'src/main.tsx': `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AppProvider } from './context/AppContext'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
)`,
      'src/App.tsx': `import { Routes, Route } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  )
}

export default App`,
      'src/vite-env.d.ts': `/// <reference types="vite/client" />`,
      'src/styles/global.css': `*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  cursor: pointer;
  border: none;
  outline: none;
  background: none;
  font: inherit;
}

img {
  max-width: 100%;
  height: auto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}`,
      ...COMMON_UTILS,
      ...REACT_COMPONENTS,
      ...REACT_PAGES,
      '.gitignore': `node_modules
dist
*.local
.env
.env.*
!.env.example`,
      'README.md': `# {{projectName}}

{{projectDescription}}

## 技术栈

- React 18 + TypeScript
- Vite
- React Router
- 自定义Hooks
- 常用工具函数
- UI组件库

## 项目结构

\`\`\`
src/
├── components/    # UI组件
├── context/       # 状态管理
├── hooks/         # 自定义Hooks
├── layouts/       # 布局组件
├── pages/         # 页面组件
├── types/         # 类型定义
├── utils/         # 工具函数
└── styles/        # 全局样式
\`\`\`

## 开发

\`\`\`bash
npm install
npm run dev
\`\`\`

## 构建

\`\`\`bash
npm run build
\`\`\`
`,
    },
  },
};

export function selectTemplate(techStack: string[], projectType: string): string {
  const hasVue = techStack.some((t) => t.toLowerCase().includes('vue'));
  const hasReact = techStack.some((t) => t.toLowerCase().includes('react'));

  if (hasVue && projectType === 'web') return 'vue3-vite';
  if (hasReact && projectType === 'web') return 'react-vite';
  if (projectType === 'web') return 'react-vite';

  return 'react-vite';
}

export function fillTemplate(template: Record<string, string>, vars: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [path, content] of Object.entries(template)) {
    let filled = content;
    for (const [key, value] of Object.entries(vars)) {
      filled = filled.replaceAll(`{{${key}}}`, value);
    }
    result[path] = filled;
  }
  return result;
}
