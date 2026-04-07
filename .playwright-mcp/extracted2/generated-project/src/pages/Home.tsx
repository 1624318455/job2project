import { Card } from '@/components';
import { Button } from '@/components';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <h1 style={{ fontSize: 32, marginBottom: 16, color: '#1890ff' }}>智能数据可视化分析平台</h1>
          <p style={{ fontSize: 16, color: '#666', marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
            基于React和TypeScript构建的现代化数据可视化平台，提供图表展示、数据分析等功能
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Button variant="primary" onClick={() => navigate('/data')}>
              查看数据可视化
            </Button>
            <Button onClick={() => navigate('/about')}>
              了解更多
            </Button>
          </div>
        </div>
      </Card>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 24 }}>
        <Card>
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
            <h3>数据可视化</h3>
            <p style={{ color: '#666', fontSize: 14 }}>多种图表类型，支持交互</p>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
            <h3>响应式设计</h3>
            <p style={{ color: '#666', fontSize: 14 }}>完美适配各种设备</p>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔧</div>
            <h3>TypeScript</h3>
            <p style={{ color: '#666', fontSize: 14 }}>类型安全，易于维护</p>
          </div>
        </Card>
      </div>
    </div>
  );
}