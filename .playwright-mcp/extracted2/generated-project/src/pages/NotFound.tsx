import { Button } from '@/components';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: 'center', padding: 100 }}>
      <h1 style={{ fontSize: 72, color: '#ccc' }}>404</h1>
      <p style={{ fontSize: 18, color: '#666', marginBottom: 24 }}>页面不存在</p>
      <Button variant="primary" onClick={() => navigate('/')}>返回首页</Button>
    </div>
  );
}