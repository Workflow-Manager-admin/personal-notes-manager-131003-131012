import React, { useState, useEffect } from 'react';
import './App.css';

// Color palette constants
const COLORS = {
  primary: '#1976d2',      // Blue
  secondary: '#424242',    // Charcoal
  accent: '#ffeb3b',       // Yellow
};

const SIDEBAR_WIDTH = 280;

// PUBLIC_INTERFACE
function App() {
  // Note schema: { id: string, title: string, content: string, createdAt: string, updatedAt: string }
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedId, setSelectedId] = useState(notes.length ? notes[0].id : null);
  const [tempNote, setTempNote] = useState({ title: '', content: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Save to localStorage when notes change
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  // Update tempNote when selectedId changes (view/edit different note)
  useEffect(() => {
    if (isEditing && selectedId) {
      const note = notes.find(n => n.id === selectedId);
      if (note) setTempNote({ title: note.title, content: note.content });
    }
  }, [selectedId, isEditing]);

  // PUBLIC_INTERFACE
  function handleSelectNote(id) {
    setSelectedId(id);
    setIsEditing(false);
    setTempNote({ title: '', content: '' });
    setShowDeleteConfirm(false);
  }

  // PUBLIC_INTERFACE
  function handleNewNote() {
    setSelectedId(null);
    setTempNote({ title: '', content: '' });
    setIsEditing(true);
    setShowDeleteConfirm(false);
  }

  // PUBLIC_INTERFACE
  function handleEditNote() {
    if (selectedId) {
      setIsEditing(true);
      const note = notes.find(n => n.id === selectedId);
      setTempNote(note ? { title: note.title, content: note.content } : { title: '', content: '' });
    }
    setShowDeleteConfirm(false);
  }

  // PUBLIC_INTERFACE
  function handleSaveNote() {
    // Save (add new or update existing)
    const now = new Date().toISOString();
    if (!tempNote.title.trim()) {
      alert('Title cannot be empty');
      return;
    }
    if (selectedId && isEditing) {
      // Edit existing note
      setNotes(notes =>
        notes.map(n =>
          n.id === selectedId ? { ...n, title: tempNote.title, content: tempNote.content, updatedAt: now } : n
        )
      );
    } else {
      // Create new note
      const newId = String(Date.now());
      setNotes([
        { id: newId, title: tempNote.title, content: tempNote.content, createdAt: now, updatedAt: now },
        ...notes,
      ]);
      setSelectedId(newId);
    }
    setIsEditing(false);
    setShowDeleteConfirm(false);
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote() {
    if (!selectedId) return;
    setNotes(notes => notes.filter(n => n.id !== selectedId));
    setSelectedId(notes.length > 1 ? notes.filter(n => n.id !== selectedId)[0].id : null);
    setIsEditing(false);
    setTempNote({ title: '', content: '' });
    setShowDeleteConfirm(false);
  }

  // PUBLIC_INTERFACE
  function handleCancelEdit() {
    setIsEditing(false);
    setShowDeleteConfirm(false);
    if (selectedId) {
      const note = notes.find(n => n.id === selectedId);
      setTempNote(note ? { title: note.title, content: note.content } : { title: '', content: '' });
    } else {
      setTempNote({ title: '', content: '' });
    }
  }

  // PUBLIC_INTERFACE
  function handleTitleChange(e) {
    setTempNote(tn => ({ ...tn, title: e.target.value }));
  }

  // PUBLIC_INTERFACE
  function handleContentChange(e) {
    setTempNote(tn => ({ ...tn, content: e.target.value }));
  }

  // PUBLIC_INTERFACE
  function confirmDeleteNote() {
    setShowDeleteConfirm(true);
  }

  // Get selected note
  const selectedNote = notes.find(n => n.id === selectedId);

  // Sorted notes (most recent first)
  const sortedNotes = [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  // Helper for date display
  function formatDate(iso) {
    if (!iso) return '';
    const date = new Date(iso);
    return date.toLocaleString();
  }

  // Minimalistic, Clean Styles (override App.css for custom theme vars)
  // The full structure: Sidebar | Main panel for detail/editor.
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
        background: '#fafbfc',
        color: COLORS.secondary,
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: SIDEBAR_WIDTH,
          background: '#fff',
          borderRight: `1px solid #e3e6ea`,
          padding: '20px 0 10px 0',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <h1 style={{
          fontSize: 23,
          fontWeight: 700,
          margin: '0 0 16px 32px',
          color: COLORS.primary,
          letterSpacing: '0.5px',
        }}>
          Notes
        </h1>
        <button
          style={{
            width: '80%',
            margin: '0 auto 20px auto',
            padding: '10px 0',
            fontWeight: 600,
            background: COLORS.primary,
            border: 'none',
            borderRadius: 7,
            color: '#fff',
            cursor: 'pointer',
            fontSize: 15,
            transition: 'background 0.2s',
            outline: 'none',
          }}
          onClick={handleNewNote}
          aria-label="Create new note"
        >
          + New Note
        </button>
        <nav style={{ overflowY: 'auto', flex: 1 }}>
          {sortedNotes.length === 0 && (
            <div style={{ color: '#aaa', margin: '50px 0 0 0', textAlign: 'center', fontSize: 16 }}>
              No notes yet.
            </div>
          )}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {sortedNotes.map(note => (
              <li
                key={note.id}
                style={{
                  background: note.id === selectedId ? COLORS.accent : 'none',
                  borderRadius: 7,
                  margin: '4px 12px',
                  padding: '7px 12px',
                  cursor: 'pointer',
                  fontWeight: note.id === selectedId ? 700 : 500,
                  color: note.id === selectedId ? COLORS.secondary : COLORS.primary,
                  transition: 'background 0.2s, color 0.2s',
                  border: `1.5px solid ${note.id === selectedId ? COLORS.secondary : 'transparent'}`,
                }}
                tabIndex={0}
                aria-selected={note.id === selectedId}
                onClick={() => handleSelectNote(note.id)}
                onKeyDown={e => e.key === 'Enter' && handleSelectNote(note.id)}
                title={note.title}
              >
                <div style={{
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  fontSize: 15,
                }}>
                  {note.title}
                </div>
                <div style={{
                  fontSize: 12,
                  color: '#888',
                  marginTop: '2px',
                  fontWeight: 400,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}>
                  {note.content?.substring(0, 35)}{note.content?.length > 35 ? '…' : ''}
                </div>
              </li>
            ))}
          </ul>
        </nav>
        <footer style={{
          marginTop: 18,
          fontSize: 11.2,
          textAlign: 'center',
          color: '#bbb',
          letterSpacing: '0.04em',
        }}>
          <span>Minimal Notes • 2024</span>
        </footer>
      </aside>
      {/* Main Panel */}
      <main
        style={{
          flex: 1,
          background: '#f7faff',
          display: 'flex',
          flexDirection: 'column',
          padding: '0 0 0 0',
          minWidth: 0,
        }}
      >
        <div style={{
          maxWidth: 720,
          margin: '40px auto',
          background: '#fff',
          borderRadius: 13,
          padding: 38,
          boxShadow: '0 2px 24px rgba(133, 154, 181, 0.14)',
          minHeight: 380,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Editor or detail */}
          {!isEditing && !selectedNote && (
            <div style={{ color: '#bbb', fontSize: 22, textAlign: 'center', margin: '120px 0 0 0' }}>
              👈 Select or create a note!
            </div>
          )}
          {(isEditing || selectedNote) && (
            <form
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
              onSubmit={e => { e.preventDefault(); handleSaveNote(); }}
              autoComplete="off"
            >
              {/* Title */}
              <input
                type="text"
                value={isEditing ? tempNote.title : (selectedNote ? selectedNote.title : '')}
                onChange={isEditing ? handleTitleChange : undefined}
                disabled={!isEditing}
                placeholder="Title"
                style={{
                  fontWeight: 700,
                  fontSize: 25,
                  color: COLORS.primary,
                  border: 'none',
                  borderBottom: `2px solid ${COLORS.primary}`,
                  marginBottom: 16,
                  outline: 'none',
                  background: 'transparent',
                  padding: '0 2px 3px 2px',
                  width: '100%',
                  borderRadius: 0,
                }}
                maxLength={72}
                autoFocus={isEditing}
                aria-label="Note title"
              />
              {/* Date info */}
              {(selectedNote || isEditing) && (
                <div style={{
                  fontSize: 11.6,
                  color: '#bbb',
                  fontWeight: 450,
                  marginBottom: 10,
                  marginTop: -6,
                  userSelect: 'none',
                }}>
                  {selectedNote && (
                    <>
                      Created: {formatDate(selectedNote.createdAt)} | Updated: {formatDate(selectedNote.updatedAt)}
                    </>
                  )}
                </div>
              )}
              {/* Content */}
              <textarea
                style={{
                  resize: 'vertical',
                  fontSize: 17,
                  color: COLORS.secondary,
                  border: isEditing ? `1.5px solid ${COLORS.primary}` : '1.5px solid #f0f2f5',
                  padding: 10,
                  borderRadius: 6,
                  minHeight: 130,
                  lineHeight: '1.5',
                  outline: 'none',
                  background: isEditing ? '#f9fbfd' : '#fafbfc',
                  marginBottom: 18,
                }}
                value={isEditing ? tempNote.content : (selectedNote ? selectedNote.content : '')}
                onChange={isEditing ? handleContentChange : undefined}
                readOnly={!isEditing}
                placeholder="Write your note here..."
                aria-label="Note content"
                maxLength={1500}
              />
              {/* Action buttons */}
              <div style={{
                marginTop: 'auto',
                display: 'flex',
                gap: 12,
                justifyContent: isEditing ? 'flex-end' : 'flex-start',
              }}>
                {isEditing ? (
                  <>
                    <button
                      type="submit"
                      style={{
                        background: COLORS.primary,
                        color: '#fff',
                        border: 'none',
                        borderRadius: 7,
                        padding: '9px 23px',
                        fontWeight: 600,
                        fontSize: 15.5,
                        cursor: 'pointer',
                        marginRight: 3,
                        transition: 'background 0.18s',
                        outline: 'none',
                      }}
                      aria-label="Save note"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      style={{
                        background: '#eee',
                        color: COLORS.secondary,
                        border: 'none',
                        borderRadius: 7,
                        padding: '9px 23px',
                        fontWeight: 500,
                        fontSize: 15.4,
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'background 0.14s',
                      }}
                      aria-label="Cancel"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  selectedNote && (
                    <>
                      <button
                        type="button"
                        style={{
                          background: COLORS.primary,
                          color: '#fff',
                          border: 'none',
                          borderRadius: 7,
                          padding: '8px 21px',
                          fontWeight: 600,
                          fontSize: 15.3,
                          cursor: 'pointer',
                          marginRight: 3,
                          transition: 'background 0.17s',
                          outline: 'none',
                        }}
                        onClick={handleEditNote}
                        aria-label="Edit note"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        style={{
                          background: COLORS.accent,
                          color: COLORS.secondary,
                          border: 'none',
                          borderRadius: 7,
                          padding: '8px 21px',
                          fontWeight: 600,
                          fontSize: 15.1,
                          cursor: 'pointer',
                          outline: 'none',
                          transition: 'background 0.17s',
                        }}
                        onClick={confirmDeleteNote}
                        aria-label="Delete note"
                      >
                        Delete
                      </button>
                    </>
                  )
                )}
              </div>
            </form>
          )}
          {/* Confirm delete dialog */}
          {showDeleteConfirm && (
            <div
              style={{
                position: 'absolute',
                left: 0, right: 0, top: 0, bottom: 0,
                background: 'rgba(48,48,48,0.15)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 199,
              }}
              aria-modal="true"
              role="dialog"
            >
              <div style={{
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 3px 25px rgba(70,80,120,0.14)',
                padding: '34px 32px 28px 32px',
                minWidth: 318,
                textAlign: 'center',
                border: `3px solid ${COLORS.accent}`,
              }}>
                <div style={{ fontWeight: 700, fontSize: 20.5, color: COLORS.secondary, marginBottom: 6 }}>
                  Delete this note?
                </div>
                <div style={{ fontSize: 14, color: '#888', marginBottom: 18 }}>
                  This cannot be undone!
                </div>
                <button
                  style={{
                    background: COLORS.primary,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 7,
                    padding: '9px 23px',
                    fontWeight: 600,
                    margin: '0 7px',
                    fontSize: 15,
                    cursor: 'pointer',
                  }}
                  onClick={handleDeleteNote}
                  aria-label="Confirm delete"
                >
                  Yes, Delete
                </button>
                <button
                  style={{
                    background: '#eee',
                    color: COLORS.secondary,
                    border: 'none',
                    borderRadius: 7,
                    padding: '9px 22px',
                    fontWeight: 500,
                    margin: '0 7px',
                    fontSize: 15,
                    cursor: 'pointer',
                  }}
                  onClick={() => setShowDeleteConfirm(false)}
                  aria-label="Cancel delete"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
