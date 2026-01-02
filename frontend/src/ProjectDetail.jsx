import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLogto } from '@logto/react';
import './App.css';
import './ProjectDetail.css';

function ProjectDetail() {
  const { projectId } = useParams();
  const { isAuthenticated, getAccessToken } = useLogto();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [dataItems, setDataItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDataItem, setCurrentDataItem] = useState(null);
  const [inputPayload, setInputPayload] = useState('');
  const [outputPayload, setOutputPayload] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProjectData = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      const headers = {
        Authorization: `Bearer ${token}`,
        'X-Logto-User': 'test_user_id'
      };

      // Fetch project details
      const projectResp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/projects/`, { headers });
      if (!projectResp.ok) throw new Error('Failed to fetch project');
      const allProjects = await projectResp.json();
      const foundProject = allProjects.find(p => p.id === projectId);
      if (!foundProject) throw new Error('Project not found');
      setProject(foundProject);

      // Fetch data items
      const itemsResp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/projects/${projectId}/data-items/`, { headers });
      if (!itemsResp.ok) throw new Error('Failed to fetch data items');
      const itemsData = await itemsResp.json();
      setDataItems(itemsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, getAccessToken]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjectData();
    }
  }, [isAuthenticated, fetchProjectData]);

  const handleOpenModal = (item = null) => {
    setCurrentDataItem(item);
    if (item) {
      setInputPayload(JSON.stringify(item.input_message || [], null, 2));
      setOutputPayload(JSON.stringify(item.output_message || [], null, 2));
    } else {
      setInputPayload(JSON.stringify([
        {
          role: "user",
          content: [{ type: "input_text", text: "" }]
        }
      ], null, 2));
      setOutputPayload(JSON.stringify([
        {
          role: "assistant",
          content: [{ type: "input_text", text: "" }]
        }
      ], null, 2));
    }
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentDataItem(null);
    setInputPayload('');
    setOutputPayload('');
  };

  const handleSaveDataItem = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const input = JSON.parse(inputPayload);
      const output = JSON.parse(outputPayload);
      const token = await getAccessToken();
      const url = currentDataItem
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/projects/${projectId}/data-items/${currentDataItem.id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/projects/${projectId}/data-items/`;

      const method = currentDataItem ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Logto-User': 'test_user_id'
        },
        body: JSON.stringify({
          input_message: input,
          output_message: output
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail?.[0]?.msg || errData.detail || 'Failed to save data item');
      }

      await fetchProjectData();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDataItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const token = await getAccessToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/projects/${projectId}/data-items/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Logto-User': 'test_user_id'
        }
      });
      if (!response.ok) throw new Error('Failed to delete item');
      await fetchProjectData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="project-detail-wrapper">
      <div className="gradient-bg"></div>

      <nav className="navbar glass">
        <div className="container nav-content">
          <div className="logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <span className="text-gradient">OGamba</span>
          </div>
          <div className="nav-links">
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Add Data Item</button>
          </div>
        </div>
      </nav>

      <main className="container detail-content animate-fade-in">
        <header className="detail-header">
          {project && (
            <>
              <h1 className="text-gradient">{project.name}</h1>
              <p className="subtitle">ID: {project.id}</p>
            </>
          )}
        </header>

        {loading ? (
          <div className="loading-state glass glass-card">
            <div className="spinner"></div>
            <p>Loading project data...</p>
          </div>
        ) : error && !isModalOpen ? (
          <div className="error-state glass glass-card">
            <p>Error: {error}</p>
            <button className="btn btn-secondary" onClick={() => fetchProjectData()}>Retry</button>
          </div>
        ) : (
          <div className="items-section">
            <div className="section-header">
              <h2>Data Items ({dataItems.length})</h2>
            </div>

            <div className="items-list">
              {dataItems.length === 0 ? (
                <div className="empty-state glass glass-card">
                  <p>No data items yet. Start by adding one!</p>
                  <button className="btn btn-primary" onClick={() => handleOpenModal()}>Add First Item</button>
                </div>
              ) : (
                dataItems.map(item => (
                  <div key={item.id} className="item-card glass glass-card">
                    <div className="item-content-preview">
                      <div className="preview-block">
                        <span className="label">Input:</span>
                        <p>{item.input_message?.[0]?.content?.[0]?.text || 'Multimodal content'}</p>
                      </div>
                      <div className="preview-block">
                        <span className="label">Output:</span>
                        <p>{item.output_message?.[0]?.content?.[0]?.text || 'No output'}</p>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button className="btn-icon" onClick={() => handleOpenModal(item)} title="Edit Item">📝</button>
                      <button className="btn-icon btn-icon-danger" onClick={() => handleDeleteDataItem(item.id)} title="Delete Item">🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* DataItem Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content glass glass-card animate-zoom-in large-modal" onClick={e => e.stopPropagation()}>
            <header className="modal-header">
              <h2 className="text-gradient">{currentDataItem ? 'Edit Data Item' : 'New Data Item'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </header>
            <form onSubmit={handleSaveDataItem}>
              <div className="modal-body-scroll">
                <div className="form-group">
                  <label htmlFor="inputPayload">Input Message (JSON OpenAI Format)</label>
                  <textarea
                    id="inputPayload"
                    value={inputPayload}
                    onChange={(e) => setInputPayload(e.target.value)}
                    placeholder='[ { "role": "user", "content": [...] } ]'
                    rows={8}
                    required
                    className="code-editor"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="outputPayload">Output Message (JSON OpenAI Format)</label>
                  <textarea
                    id="outputPayload"
                    value={outputPayload}
                    onChange={(e) => setOutputPayload(e.target.value)}
                    placeholder='[ { "role": "assistant", "content": [...] } ]'
                    rows={8}
                    required
                    className="code-editor"
                  />
                  <p className="helper-text">Strict multimodal format required for both.</p>
                </div>
              </div>
              {error && <p className="modal-error">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving || !inputPayload.trim() || !outputPayload.trim()}>
                  {saving ? 'Saving...' : currentDataItem ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;
