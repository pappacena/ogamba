import { useState, useEffect } from 'react';
import { useLogto } from '@logto/react';
import { useNavigate } from 'react-router-dom';
import './App.css'; // Reusing global styles for consistency
import './Dashboard.css';

function Dashboard() {
  const { isAuthenticated, getAccessToken } = useLogto();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
        // Logto handle authentication, but we can redirect if needed.
        // For now, let's just wait or show a message.
        return;
    }

    const fetchProjects = async () => {
      try {
        const token = await getAccessToken();
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/projects/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            // We use the header defined in main.py for now as a fallback/mock
            'X-Logto-User': 'test_user_id'
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isAuthenticated, getAccessToken]);

  if (!isAuthenticated) {
    return (
      <div className="dashboard-wrapper">
         <div className="gradient-bg"></div>
         <div className="container center-content">
            <h2 className="text-gradient">Please log in to view your dashboard</h2>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Home</button>
         </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="gradient-bg"></div>

      <nav className="navbar glass">
        <div className="container nav-content">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span className="text-gradient">OGamba</span>
          </div>
          <div className="nav-links">
            <button className="btn btn-secondary" onClick={() => navigate('/')}>Home</button>
            <button className="btn btn-primary">+ New Project</button>
          </div>
        </div>
      </nav>

      <main className="container dashboard-content animate-fade-in">
        <header className="dashboard-header">
          <h1 className="text-gradient">Your Projects</h1>
          <p className="subtitle">Manage and monitor your machine learning projects</p>
        </header>

        {loading ? (
          <div className="loading-state glass glass-card">
            <div className="spinner"></div>
            <p>Loading your projects...</p>
          </div>
        ) : error ? (
          <div className="error-state glass glass-card">
            <p>Error: {error}</p>
            <button className="btn btn-secondary" onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state glass glass-card">
            <h3>No projects found</h3>
            <p>Get started by creating your first project.</p>
            <button className="btn btn-primary">Create Project</button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card glass glass-card">
                <div className="project-icon">📁</div>
                <div className="project-info">
                  <h3>{project.name}</h3>
                  <p className="project-id">ID: {project.id}</p>
                </div>
                <div className="project-actions">
                  <button className="btn-icon">⚙️</button>
                  <button className="btn-icon">↗️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
