interface EmptyProps {
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
}