import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotes, createNote } from '../api/notes';
import './Dashboard.css';

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch notes whenever search changes
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const response = await getNotes(search);
        setNotes(response.data);
      } catch (err) {
        console.error('Failed to fetch notes:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce — wait 300ms after user stops typing
    const timer = setTimeout(fetchNotes, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleNewNote = async () => {
    try {
      const response = await createNote({
        title: 'Untitled note',
        content: '',
      });
      navigate(`/notes/${response.data.id}`);
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Strip HTML tags for preview text
  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return tmp.textContent || tmp.innerText || '';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const featuredNotes = notes.slice(0, 2);
  const sideNotes = notes.slice(2);

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">📝</div>
          <div>
            <div className="sidebar-brand-text">Notes</div>
            <div className="sidebar-brand-sub">EDITORIAL MINIMALIST</div>
          </div>
        </div>

        <button className="sidebar-new-note" onClick={handleNewNote}>
          + New Note
        </button>

        <nav className="sidebar-nav">
          <button className="sidebar-item active">📄 All Notes</button>
          <button className="sidebar-item">📁 Folders</button>
          <button className="sidebar-item">🏷️ Tags</button>
          <button className="sidebar-item">🗑️ Trash</button>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-item">⚙️ Settings</button>
          <button className="sidebar-item" onClick={handleLogout}>
            🚪 Log out
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="main">
        <div className="main-topbar">
          <div className="main-brandline">The Digital Curator</div>
          <div className="main-actions">
            <span style={{ fontSize: 13, color: '#666' }}>{user.email}</span>
          </div>
        </div>

        <div className="main-header">
          <div>
            <h1 className="main-greeting">Morning Reflections</h1>
            <div className="main-subtitle">
              Your workspace for thoughts, curated with clinical precision
              and editorial intent.
            </div>
          </div>

          <div className="search-box">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search curated notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* NOTES */}
        {loading ? (
          <div className="state-message">Loading your notes...</div>
        ) : notes.length === 0 ? (
          <div className="state-message">
            {search
              ? `No notes matching "${search}"`
              : 'No notes yet. Click "+ New Note" to create your first one.'}
          </div>
        ) : (
          <div className="notes-grid">
            {/* Featured (larger) column */}
            <div className="notes-column">
              {featuredNotes.map((note) => (
                <div
                  key={note.id}
                  className="note-card note-card-featured"
                  onClick={() => navigate(`/notes/${note.id}`)}
                >
                  <div className="note-card-header">
                    <span className="note-card-tag">NOTE</span>
                    <span>{formatDate(note.updated_at)}</span>
                  </div>
                  <div className="note-card-title">{note.title}</div>
                  <div className="note-card-preview">
                    {stripHtml(note.content) || 'No content yet...'}
                  </div>
                </div>
              ))}
            </div>

            {/* Side (smaller) column */}
            <div className="notes-column">
              {sideNotes.map((note) => (
                <div
                  key={note.id}
                  className="note-card note-card-small"
                  onClick={() => navigate(`/notes/${note.id}`)}
                >
                  <div className="note-card-header">
                    <span>{formatDate(note.updated_at)}</span>
                  </div>
                  <div className="note-card-title">{note.title}</div>
                  <div className="note-card-preview">
                    {stripHtml(note.content) || 'No content yet...'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="main-footer">
          Showing {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;