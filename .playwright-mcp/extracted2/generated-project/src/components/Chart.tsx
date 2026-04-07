import React from 'react';

interface ChartData {
  id: string;
  name: string;
  value: number;
  category: string;
}

interface ChartProps {
  data: ChartData[];
}

const Chart: React.FC<ChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ marginBottom: 20 }}>数据分布</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {data.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 80, textAlign: 'right', fontSize: 14 }}>{item.name}</div>
            <div style={{ flex: 1, height: 24, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${(item.value / maxValue) * 100}%`,
                  background: '#1890ff',
                  borderRadius: 4,
                  transition: 'width 0.3s ease'
                }} 
              />
            </div>
            <div style={{ width: 50, fontSize: 14, color: '#666' }}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chart;