import React from 'react';

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
}