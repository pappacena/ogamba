import { useState, useEffect } from 'react';
import { useLogto } from '@logto/react';
import { useNavigate } from 'react-router-dom';
import './App.css'

const ROTATING_TEXTS = [
  "Lower inference costs",
  "Increase  ML team productivity",
  "Manage your dataset",
  "Train models",
];

function App() {
  const { isAuthenticated, signIn, signOut } = useLogto();
  const [textIndex, setTextIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % ROTATING_TEXTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSignIn = () => {
    signIn(`${window.location.origin}/callback`);
  };

  const handleSignOut = () => {
    signOut(window.location.origin);
  };

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
            {isAuthenticated ? (
              <>
                <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Dashboard</button>
                <button className="btn btn-secondary" onClick={handleSignOut}>Logout</button>
              </>
            ) : (
              <button className="btn btn-secondary" onClick={handleSignIn}>Login</button>
            )}
            <button className="btn btn-primary" onClick={handleSignIn}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero container animate-fade-in">
        <h1 className="hero-title">
          <div className="rotator-container">
            <span key={textIndex} className="text-gradient rotating-text">
              {ROTATING_TEXTS[textIndex]}
            </span>
          </div>
          with few clicks
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
