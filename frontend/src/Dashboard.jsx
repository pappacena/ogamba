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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null); // null for "New Project", object for "Edit"
  const [projectName, setProjectName] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/projects/`, {
        headers: {
          Authorization: `Bearer ${token}`,
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated, getAccessToken]);

  const handleOpenModal = (project = null) => {
    setCurrentProject(project);
    setProjectName(project ? project.name : '');
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProject(null);
    setProjectName('');
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const url = currentProject
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/projects/${currentProject.id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/projects/`;

      const method = currentProject ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Logto-User': 'test_user_id'
        },
        body: JSON.stringify({ name: projectName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${currentProject ? 'update' : 'create'} project`);
      }

      await fetchProjects();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (project) => {
    if (!window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      return;
    }

    try {
      const token = await getAccessToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Logto-User': 'test_user_id'
        },
        body: JSON.stringify({ deleted: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      await fetchProjects();
    } catch (err) {
      alert(`Error deleting project: ${err.message}`);
    }
  };

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
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ New Project</button>
          </div>
        </div>
      </nav>

      <main className="container dashboard-content animate-fade-in">
        <header className="dashboard-header">
          <h1 className="text-gradient">Your Projects</h1>
          <p className="subtitle">Manage and monitor your projects</p>
        </header>

        {loading ? (
          <div className="loading-state glass glass-card">
            <div className="spinner"></div>
            <p>Loading your projects...</p>
          </div>
        ) : error && !isModalOpen ? (
          <div className="error-state glass glass-card">
            <p>Error: {error}</p>
            <button className="btn btn-secondary" onClick={() => fetchProjects()}>Retry</button>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state glass glass-card">
            <h3>No projects found</h3>
            <p>Get started by creating your first project.</p>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>Create Project</button>
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
                  <button className="btn-icon" onClick={() => handleOpenModal(project)} title="Edit Project">⚙️</button>
                  <button className="btn-icon btn-icon-danger" onClick={() => handleDeleteProject(project)} title="Delete Project">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Project Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content glass glass-card animate-zoom-in" onClick={e => e.stopPropagation()}>
            <header className="modal-header">
              <h2 className="text-gradient">{currentProject ? 'Edit Project' : 'New Project'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </header>
            <form onSubmit={handleSaveProject}>
              <div className="form-group">
                <label htmlFor="projectName">Project Name</label>
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  autoFocus
                  required
                />
              </div>
              {error && <p className="modal-error">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving || !projectName.trim()}>
                  {saving ? 'Saving...' : currentProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
