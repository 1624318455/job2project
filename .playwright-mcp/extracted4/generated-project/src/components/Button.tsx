import React from 'react';

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
}