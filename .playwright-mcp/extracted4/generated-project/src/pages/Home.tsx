import { useState, useEffect } from 'react';
import { Card } from '@/components';
import { Button } from '@/components';

export default function Home() {
  const [stats] = useState({
    users: 1248,
    projects: 356,
    visits: 8920
  });

  return (
    <div style={{ padding: 24 }}>
      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        borderRadius: 16, 
        padding: 48, 
        color: '#fff',
        marginBottom: 32,
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: 36, marginBottom: 16, fontWeight: 600 }}>E-Commerce Dashboard</h1>
        <p style={{ fontSize: 18, opacity: 0.9, maxWidth: 600, margin: '0 auto 24px' }}>An interactive and comprehensive web-based e-commerce dashboard that provides real-time analytics, inventory management, and order processing capabilities. This project showcases advanced front-end development skills with React and TypeScript, along with back-end development using Node.js.</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Button style={{ background: '#fff', color: '#667eea' }}>开始使用</Button>
          <Button style={{ background: 'transparent', border: '2px solid #fff', color: '#fff' }}>了解更多</Button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
        {Object.entries(stats).map(([key, value]) => (
          <Card key={key} style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#667eea' }}>{value.toLocaleString()}</div>
            <div style={{ color: '#666', marginTop: 8, textTransform: 'capitalize' }}>{key}</div>
          </Card>
        ))}
      </div>

      {/* Features */}
      <h2 style={{ marginBottom: 24, fontSize: 24 }}>核心功能</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {[
          { icon: '🚀', title: '快速部署', desc: '一键部署到生产环境' },
          { icon: '📊', title: '数据分析', desc: '实时监控和数据分析' },
          { icon: '🔒', title: '安全可靠', desc: '企业级安全保障' }
        ].map((item, i) => (
          <Card key={i}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>{item.title}</h3>
            <p style={{ color: '#666', fontSize: 14 }}>{item.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}