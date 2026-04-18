import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { getNote, updateNote, deleteNote } from '../api/notes';
import './NoteEditor.css';
import './Dashboard.css'; // reuse sidebar styles

function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [note, setNote] = useState(null);

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'editor-content',
        'data-placeholder': 'Start writing your thoughts...',
      },
    },
  });

  // Fetch the note when page loads
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await getNote(id);
        setNote(response.data);
        setTitle(response.data.title);
        if (editor) {
          editor.commands.setContent(response.data.content || '');
        }
      } catch (err) {
        console.error('Failed to load note:', err);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (editor) fetchNote();
  }, [id, editor, navigate]);

  // Auto-save on title or content change (debounced)
  useEffect(() => {
    if (loading || !editor || !note) return;

    const timer = setTimeout(async () => {
      setSaveStatus('Saving...');
      try {
        await updateNote(id, {
          title: title || 'Untitled note',
          content: editor.getHTML(),
        });
        setSaveStatus('Saved ✓');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (err) {
        console.error('Auto-save failed:', err);
        setSaveStatus('Save failed');
      }
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, editor?.getHTML()]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this note? This cannot be undone.')) return;
    try {
      await deleteNote(id);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading || !editor) {
    return <div className="state-message">Loading note...</div>;
  }

  return (
    <div className="editor-page">
      {/* SIDEBAR — same as Dashboard */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">📝</div>
          <div>
            <div className="sidebar-brand-text">Notes</div>
            <div className="sidebar-brand-sub">EDITORIAL MINIMALIST</div>
          </div>
        </div>

        <button
          className="sidebar-new-note"
          onClick={() => navigate('/dashboard')}
        >
          ← Back to Notes
        </button>

        <nav className="sidebar-nav">
          <button className="sidebar-item active">📄 All Notes</button>
          <button className="sidebar-item">📁 Folders</button>
          <button className="sidebar-item">🏷️ Tags</button>
          <button className="sidebar-item">🗑️ Trash</button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="editor-main">
        <div className="editor-topbar">
          <div className="editor-meta">
            <span>LAST UPDATED: {formatDate(note?.updated_at)}</span>
            <span className="editor-meta-pill">NOTE</span>
          </div>

          <div className="editor-actions">
            {saveStatus && <span className="save-status">{saveStatus}</span>}
            <button
              className="editor-action-btn danger"
              onClick={handleDelete}
            >
              🗑 Delete
            </button>
          </div>
        </div>

        <div className="editor-canvas">
          <input
            type="text"
            className="editor-title-input"
            placeholder="Untitled note"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* TOOLBAR */}
          <div className="editor-toolbar">
            <button
              className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold"
            >
              <b>B</b>
            </button>
            <button
              className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic"
            >
              <i>I</i>
            </button>
            <button
              className={`toolbar-btn ${editor.isActive('strike') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="Strikethrough"
            >
              <s>S</s>
            </button>

            <div className="toolbar-divider"></div>

            <button
              className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              title="Heading 1"
            >
              H1
            </button>
            <button
              className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              title="Heading 2"
            >
              H2
            </button>

            <div className="toolbar-divider"></div>

            <button
              className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bullet list"
            >
              •
            </button>
            <button
              className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered list"
            >
              1.
            </button>
            <button
              className={`toolbar-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="Quote"
            >
              "
            </button>
          </div>

          <EditorContent editor={editor} />

          <div className="editor-footer">
            <span>
              {editor.storage.characterCount?.words?.() || editor.getText().split(/\s+/).filter(Boolean).length} words
            </span>
            <span>Auto-saved</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default NoteEditor;