import { Card } from '@/components';

export default function About() {
  return (
    <Card title="关于我们">
      <p>一个基于React和TypeScript构建的智能数据可视化分析平台，旨在为用户提供高效、直观的数据分析和展示功能，支持多端访问，并具备良好的扩展性和性能优化。</p>
      <div style={{ marginTop: 24 }}>
        <h4>联系方式</h4>
        <p>邮箱: contact@example.com</p>
      </div>
    </Card>
  );
}