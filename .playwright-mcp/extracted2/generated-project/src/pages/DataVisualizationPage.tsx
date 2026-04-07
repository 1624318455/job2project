import React, { useEffect, useState } from 'react';
import { fetchDataVisualization } from '@/api/dataVisualization';
import type { ApiResponse, PageResult } from '@/types';

interface ChartData {
  id: string;
  name: string;
  value: number;
  category: string;
}

const DataVisualizationPage: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDataVisualization()
      .then((response: ApiResponse<PageResult<ChartData>>) => {
        if (response.code === 0) {
          setChartData(response.data.list);
        } else {
          setError('Failed to fetch data');
        }
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ padding: 40, color: '#ff4d4f' }}>Error: {error}</div>;
  if (chartData.length === 0) return <div style={{ padding: 40, textAlign: 'center' }}>Empty data</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>数据可视化</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {chartData.map(item => (
          <div key={item.id} style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>{item.value}</div>
            <div style={{ color: '#666', marginTop: 8 }}>{item.name}</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{item.category}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataVisualizationPage;