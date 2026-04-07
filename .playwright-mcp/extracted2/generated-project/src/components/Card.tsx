import React from 'react';

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
}