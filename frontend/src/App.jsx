import './App.css'

function App() {
  return (
    <div className="app-wrapper">
      <div className="gradient-bg"></div>

      {/* Navigation */}
      <nav className="navbar glass">
        <div className="container nav-content">
          <div className="logo">
            <span className="text-gradient">OGamba</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <button className="btn btn-secondary">Login</button>
            <button className="btn btn-primary">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero container animate-fade-in">
        <h1 className="hero-title">
          Train Models <br />
          <span className="text-gradient">At the Speed of Thought</span>
        </h1>
        <p className="hero-subtitle">
          Manage your datasets, collaborate with your team, and deploy state-of-the-art
          machine learning models in minutes. No infrastructure management required.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-large">Start Training Free</button>
          <button className="btn btn-secondary btn-large">View Documentation</button>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="features-section container">
        <h2 className="section-title">Why choose OGamba?</h2>
        <div className="features-grid">
          <div className="feature-card glass glass-card">
            <div className="feature-icon">📊</div>
            <h3>Dataset Management</h3>
            <p>Upload, version, and clean your datasets with our intuitive management suite.</p>
          </div>
          <div className="feature-card glass glass-card">
            <div className="feature-icon">🚀</div>
            <h3>Fast Training</h3>
            <p>Leverage our distributed GPU clusters to train models up to 10x faster.</p>
          </div>
          <div className="feature-card glass glass-card">
            <div className="feature-icon">🛠️</div>
            <h3>One-Click Deploy</h3>
            <p>Deploy your trained models as scalable APIs with a single click.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section container">
        <div className="cta-card glass animate-fade-in">
          <h2>Ready to build the future?</h2>
          <p>Join 10,000+ developers building with OGamba.</p>
          <button className="btn btn-primary btn-large">Create Your Account</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer animate-fade-in">
        <div className="container footer-content">
          <div className="footer-brand">
            <span className="text-gradient">OGamba</span>
            <p>© 2026 OGamba AI Inc.</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Product</h4>
              <a href="#">Features</a>
              <a href="#">Pricing</a>
            </div>
            <div className="link-group">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Blog</a>
            </div>
            <div className="link-group">
              <h4>Legal</h4>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
