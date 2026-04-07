import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: '首页' },
  { path: '/about', label: '关于' },
  { path: '/contact', label: '联系' },
];

export function MainLayout({ children }: LayoutProps) {
  const location = useLocation();
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <header style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 100 }}>
        <nav style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ fontSize: 20, fontWeight: 600, color: '#1890ff' }}>E-Commerce Product Catalog</Link>
          <div style={{ display: 'flex', gap: 32 }}>
            {navItems.map(item => (
              <Link key={item.path} to={item.path} style={{ color: location.pathname === item.path ? '#1890ff' : '#333', fontSize: 14 }}>{item.label}</Link>
            ))}
          </div>
        </nav>
      </header>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>{children}</main>
    </div>
  );
}