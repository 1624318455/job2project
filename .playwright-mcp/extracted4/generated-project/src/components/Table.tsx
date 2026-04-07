import React from 'react';

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
}