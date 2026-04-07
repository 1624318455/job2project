import { Card } from '@/components';
import { Input } from '@/components';
import { Button } from '@/components';
import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card title="联系我们">
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h3>提交成功</h3>
          <p style={{ color: '#666', marginTop: 8 }}>我们尽快与您联系</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="联系我们">
      <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, color: '#333' }}>姓名</label>
          <Input 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})}
            placeholder="请输入您的姓名"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, color: '#333' }}>邮箱</label>
          <Input 
            type="email"
            value={form.email} 
            onChange={e => setForm({...form, email: e.target.value})}
            placeholder="请输入您的邮箱"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, color: '#333' }}>留言</label>
          <textarea 
            value={form.message}
            onChange={e => setForm({...form, message: e.target.value})}
            placeholder="请输入您的留言"
            style={{ 
              width: '100%', minHeight: 120, padding: 12, border: '1px solid #d9d9d9', 
              borderRadius: 4, fontSize: 14, resize: 'vertical'
            }}
          />
        </div>
        <Button type="submit" variant="primary" style={{ width: '100%' }}>提交</Button>
      </form>
      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
        <h4 style={{ marginBottom: 12 }}>其他联系方式</h4>
        <p style={{ color: '#666' }}>📧 contact@example.com</p>
        <p style={{ color: '#666' }}>📞 400-123-4567</p>
        <p style={{ color: '#666' }}>🏠 北京市朝阳区xxx大厦</p>
      </div>
    </Card>
  );
}