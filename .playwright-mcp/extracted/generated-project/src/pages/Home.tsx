function Home() {
  return (
    <div className="container" style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 16, color: '#1a1a1a' }}>
        ModernWebApp
      </h1>
      <p style={{ color: '#666', fontSize: '1.1rem' }}>
        A modern, full-stack web application built with React and TypeScript, leveraging Next.js for static site generation and server-side rendering, and designed for scalability and maintainability.
      </p>
    </div>
  )
}

export default Home