import { useState, useEffect } from 'react';
import { noteAPI } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import NeonButton from '../../components/ui/NeonButton';
import { FileText, Search, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [activeNote, setActiveNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchNotes();
  }, [search]);

  const fetchNotes = async () => {
    try {
      const { data } = await noteAPI.list(search);
      setNotes(data.notes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    try {
      const { data } = await noteAPI.create({ title: 'New Note', content: '' });
      setNotes([data.note, ...notes]);
      setActiveNote(data.note);
      setEditForm({ title: data.note.title, content: data.note.content });
      setIsEditing(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    if (!activeNote) return;
    try {
      const { data } = await noteAPI.update(activeNote._id, editForm);
      setNotes(notes.map(n => n._id === data.note._id ? data.note : n));
      setActiveNote(data.note);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await noteAPI.delete(id);
      setNotes(notes.filter(n => n._id !== id));
      if (activeNote?._id === id) {
        setActiveNote(null);
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6">
      {/* Sidebar */}
      <GlassCard className="w-80 flex flex-col p-4 h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <FileText className="w-5 h-5 mr-2 text-neon-blue" />
            Notes
          </h2>
          <NeonButton variant="outline" size="sm" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
          </NeonButton>
        </div>

        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-primary/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:border-neon-blue/50 outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
          {notes.map((note) => (
            <div
              key={note._id}
              onClick={() => {
                setActiveNote(note);
                setEditForm({ title: note.title, content: note.content });
                setIsEditing(false);
              }}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                activeNote?._id === note._id 
                  ? 'bg-neon-blue/10 border-neon-blue/30' 
                  : 'bg-primary/30 border-white/5 hover:border-white/20'
              }`}
            >
              <h3 className="font-medium truncate">{note.title || 'Untitled Note'}</h3>
              <div className="flex items-center justify-between mt-2 text-xs text-muted">
                <span>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
                <span className="bg-white/10 px-2 py-0.5 rounded capitalize">{note.source}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Main Content */}
      <GlassCard className="flex-1 p-6 flex flex-col h-full">
        {activeNote ? (
          isEditing ? (
            <div className="flex flex-col h-full space-y-4">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="text-2xl font-bold bg-transparent border-b border-white/10 focus:border-neon-blue/50 outline-none pb-1 w-full mr-4"
                  placeholder="Note Title"
                />
                <div className="flex space-x-2">
                  <NeonButton variant="primary" size="sm" onClick={handleUpdate}>
                    <Check className="w-4 h-4 mr-2" /> Save
                  </NeonButton>
                  <NeonButton variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4" />
                  </NeonButton>
                </div>
              </div>
              <textarea
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                className="flex-1 w-full bg-primary/30 border border-white/10 rounded-lg p-4 font-mono text-sm resize-none outline-none focus:border-neon-blue/50 custom-scrollbar"
                placeholder="Start typing your note here (Markdown supported)..."
              />
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{activeNote.title}</h1>
                  <div className="text-sm text-muted">
                    Last updated: {new Date(activeNote.updatedAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <NeonButton variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </NeonButton>
                  <button 
                    onClick={() => handleDelete(activeNote._id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar prose prose-invert max-w-none">
                <ReactMarkdown>{activeNote.content || '*Empty note*'}</ReactMarkdown>
              </div>
            </div>
          )
        ) : (
          <div className="h-full flex items-center justify-center flex-col text-muted opacity-50">
            <FileText className="w-16 h-16 mb-4" />
            <p>Select a note from the sidebar or create a new one.</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
