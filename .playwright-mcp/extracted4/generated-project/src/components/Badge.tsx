interface BadgeProps {
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
}