import React, { useState } from 'react';

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
}