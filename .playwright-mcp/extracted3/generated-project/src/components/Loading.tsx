interface LoadingProps {
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
}