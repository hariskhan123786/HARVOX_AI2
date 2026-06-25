import { useState, useEffect } from 'react';
import { noteAPI, aiAPI } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import NeonButton from '../../components/ui/NeonButton';
import { FileText, Search, Plus, Trash2, Edit2, Check, X, Copy, Sparkles, BookOpen, Eye, Columns } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [activeNote, setActiveNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '' });
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'ai', 'user'
  const [editorMode, setEditorMode] = useState('split'); // 'write', 'preview', 'split'
  const [noteCopied, setNoteCopied] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

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

  const handleCopyNote = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(activeNote.content || '');
    setNoteCopied(true);
    setTimeout(() => setNoteCopied(false), 2000);
  };

  const handleAIRefactor = async () => {
    if (!editForm.content) return;
    setAiLoading(true);
    try {
      const prompt = `Please review, organize, expand slightly and format the following note as highly readable and clean markdown (using bold titles, clear bullet points or headers where appropriate). Do not change the core meaning, just improve the layout and clarity:\n\n${editForm.content}`;
      const { data } = await aiAPI.chat({ message: prompt });
      setEditForm({ ...editForm, content: data.reply });
    } catch (err) {
      console.error(err);
      alert('AI Refactor failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setAiLoading(false);
    }
  };

  const insertMarkdown = (syntaxBefore, syntaxAfter = '') => {
    const textarea = document.getElementById('note-editor-textarea');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editForm.content;
    const selected = text.substring(start, end);
    const replacement = syntaxBefore + selected + syntaxAfter;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setEditForm({ ...editForm, content: newContent });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + syntaxBefore.length, start + syntaxBefore.length + selected.length);
    }, 0);
  };

  const getLineNumbers = (val, minLines = 10) => {
    const linesCount = Math.max(val.split('\n').length, minLines);
    return Array.from({ length: linesCount }, (_, i) => i + 1);
  };

  const filteredNotes = notes.filter(note => {
    if (activeTab === 'all') return true;
    if (activeTab === 'ai') return note.source === 'ai';
    return note.source !== 'ai';
  });

  const wordCount = activeNote?.content ? activeNote.content.split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6">
      {/* Sidebar Archive */}
      <GlassCard hover={false} className="w-80 flex flex-col p-4 h-full border-white/10 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-orbitron font-bold tracking-widest flex items-center">
            <FileText className="w-4 h-4 mr-2 text-neon-blue animate-pulse" />
            NOTE ARCHIVE
          </h2>
          <NeonButton variant="outline" className="p-2 border-white/10 hover:border-neon-blue/40" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
          </NeonButton>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted/50" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#050911]/50 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:border-neon-blue/50 outline-none text-white transition-all focus:ring-1 focus:ring-neon-blue/20"
          />
        </div>

        {/* Filter Source Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-white/5 border border-white/5 mb-4 select-none">
          {['all', 'ai', 'user'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-1 text-[9px] font-orbitron font-bold tracking-wider uppercase rounded-lg transition-all ${
                activeTab === tab 
                  ? 'bg-neon-blue/10 border border-neon-blue/30 text-neon-blue font-bold shadow-[0_0_8px_rgba(0,240,255,0.1)]' 
                  : 'border border-transparent text-muted/40 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Notes Archive List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
          {filteredNotes.map((note) => (
            <div
              key={note._id}
              onClick={() => {
                setActiveNote(note);
                setEditForm({ title: note.title, content: note.content });
                setIsEditing(false);
              }}
              className={`p-3.5 rounded-xl border relative cursor-pointer overflow-hidden transition-all duration-300 ${
                activeNote?._id === note._id 
                  ? 'bg-[#0a1324]/80 border-neon-blue/45 shadow-[0_0_12px_rgba(0,240,255,0.08)]' 
                  : 'bg-primary/20 border-white/5 hover:border-white/15 hover:bg-white/[0.01]'
              }`}
            >
              {/* Selected Glow Left bar */}
              {activeNote?._id === note._id && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-neon-blue shadow-[0_0_8px_#00F0FF] rounded-r" />
              )}
              <h3 className="font-semibold text-xs text-white/90 truncate pr-4">{note.title || 'Untitled Note'}</h3>
              <div className="flex items-center justify-between mt-2.5 text-[10px] text-muted/50 font-mono">
                <span>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-orbitron font-bold uppercase tracking-wider ${
                  note.source === 'ai' 
                    ? 'bg-neon-purple/10 border border-neon-purple/20 text-neon-purple' 
                    : 'bg-white/5 border border-white/10 text-muted/70'
                }`}>
                  {note.source}
                </span>
              </div>
            </div>
          ))}
          {filteredNotes.length === 0 && (
            <div className="text-center py-8 text-muted/40 font-poppins text-[10px]">
              No documents found.
            </div>
          )}
        </div>
      </GlassCard>

      {/* Main Workspace */}
      <GlassCard hover={false} className="flex-1 p-6 flex flex-col h-full border-white/10 relative overflow-hidden">
        {activeNote ? (
          isEditing ? (
            /* Note Editor Mode */
            <div className="flex flex-col h-full space-y-4">
              <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/5">
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="text-lg font-bold bg-transparent border-b border-white/10 focus:border-neon-blue/50 outline-none pb-1 w-full mr-4 text-white font-orbitron uppercase tracking-wider"
                  placeholder="Note Title"
                />
                
                {/* Editor Mode Selector */}
                <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-white/5 border border-white/5 select-none shrink-0">
                  {[
                    { mode: 'write', icon: Eye, label: 'Write' },
                    { mode: 'preview', icon: BookOpen, label: 'Preview' },
                    { mode: 'split', icon: Columns, label: 'Split' },
                  ].map((item) => (
                    <button
                      key={item.mode}
                      onClick={() => setEditorMode(item.mode)}
                      className={`p-1.5 px-3 rounded-lg text-[9px] font-orbitron font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                        editorMode === item.mode
                          ? 'bg-neon-blue/10 border border-neon-blue/20 text-neon-blue'
                          : 'border border-transparent text-muted/40 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-3 h-3" />
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="flex space-x-2 shrink-0">
                  <NeonButton variant="acid" className="py-2.5 px-4 text-xs font-bold font-orbitron" onClick={handleUpdate}>
                    <Check className="w-3.5 h-3.5 mr-1.5" /> Save
                  </NeonButton>
                  <NeonButton variant="outline" className="py-2.5 px-4 text-xs font-bold font-orbitron border-white/10 hover:border-white/20" onClick={() => setIsEditing(false)}>
                    <X className="w-3.5 h-3.5" />
                  </NeonButton>
                </div>
              </div>

              {/* Text Formatting Toolbar */}
              {editorMode !== 'preview' && (
                <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5 text-muted select-none">
                  <button onClick={() => insertMarkdown('**', '**')} className="p-1 px-2.5 text-[10px] font-bold rounded hover:bg-white/10 hover:text-white transition-all">B</button>
                  <button onClick={() => insertMarkdown('*', '*')} className="p-1 px-2.5 text-[10px] italic rounded hover:bg-white/10 hover:text-white transition-all">I</button>
                  <button onClick={() => insertMarkdown('`', '`')} className="p-1 px-2.5 text-[10px] font-mono rounded hover:bg-white/10 hover:text-white transition-all">Code</button>
                  <button onClick={() => insertMarkdown('### ')} className="p-1 px-2.5 text-[10px] rounded hover:bg-white/10 hover:text-white transition-all">H3</button>
                  <button onClick={() => insertMarkdown('> ')} className="p-1 px-2.5 text-[10px] rounded hover:bg-white/10 hover:text-white transition-all">Quote</button>
                  <button onClick={() => insertMarkdown('[', '](url)')} className="p-1 px-2.5 text-[10px] rounded hover:bg-white/10 hover:text-white transition-all">Link</button>
                  <button onClick={() => insertMarkdown('- ')} className="p-1 px-2.5 text-[10px] rounded hover:bg-white/10 hover:text-white transition-all">List</button>
                  
                  <div className="h-4 w-[1px] bg-white/10 mx-1" />

                  {/* AI Refactor Button */}
                  <button
                    onClick={handleAIRefactor}
                    disabled={aiLoading || !editForm.content}
                    className="ml-auto p-1 px-3 rounded border border-neon-purple/20 bg-neon-purple/5 hover:bg-neon-purple/15 text-neon-purple hover:text-neon-pink text-[9px] font-orbitron font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-3 h-3 ${aiLoading ? 'animate-spin' : ''}`} />
                    {aiLoading ? 'Refactoring...' : 'AI Refactor'}
                  </button>
                </div>
              )}

              {/* Editor Workspace */}
              <div className="flex-1 overflow-hidden min-h-0 flex gap-4">
                {/* Write Panel */}
                {(editorMode === 'write' || editorMode === 'split') && (
                  <div className="flex-1 flex rounded-xl border border-white/10 bg-[#03060d]/50 overflow-hidden relative">
                    <div className="w-9 text-right pr-2 py-3.5 bg-black/20 text-muted/20 select-none border-r border-white/5 text-[11px] leading-6 font-mono">
                      {getLineNumbers(editForm.content, 12).map((ln) => (
                        <div key={ln}>{ln}</div>
                      ))}
                    </div>
                    <textarea
                      id="note-editor-textarea"
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      className="flex-1 bg-transparent border-0 p-3.5 text-white font-mono text-xs leading-6 resize-none outline-none focus:ring-0 custom-scrollbar"
                      placeholder="Start typing your note here (Markdown supported)..."
                    />
                  </div>
                )}

                {/* Preview Panel */}
                {(editorMode === 'preview' || editorMode === 'split') && (
                  <div className="flex-1 rounded-xl border border-white/10 bg-[#03060d]/30 p-5 overflow-y-auto custom-scrollbar prose prose-invert max-w-none text-xs leading-relaxed text-muted font-poppins">
                    {editForm.content ? (
                      <ReactMarkdown
                        components={{
                          h1: ({children}) => <h2 className="font-orbitron font-bold text-white text-base mt-4 mb-2 uppercase">{children}</h2>,
                          h2: ({children}) => <h3 className="font-orbitron font-semibold text-white text-sm mt-3.5 mb-2 uppercase">{children}</h3>,
                          h3: ({children}) => <h4 className="font-orbitron font-medium text-white text-xs mt-3 mb-1.5 uppercase">{children}</h4>,
                          p: ({children}) => <p className="mb-3.5 text-muted/80">{children}</p>,
                          ul: ({children}) => <ul className="list-disc pl-5 mb-3.5 space-y-1">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal pl-5 mb-3.5 space-y-1">{children}</ol>,
                          blockquote: ({children}) => <blockquote className="border-l-2 border-neon-blue bg-white/[0.01] pl-4 py-1.5 my-3 rounded text-muted font-mono">{children}</blockquote>,
                          code: ({node, inline, children, ...props}) => (
                            inline ? (
                              <code className="bg-white/5 border border-white/10 rounded px-1 py-0.25 font-mono text-white text-[11px]" {...props}>{children}</code>
                            ) : (
                              <pre className="bg-black/40 border border-white/5 p-3.5 rounded-lg font-mono text-[10px] overflow-x-auto my-3"><code {...props}>{children}</code></pre>
                            )
                          )
                        }}
                      >
                        {editForm.content}
                      </ReactMarkdown>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted/30 italic">
                        Empty note preview
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Note View Mode */
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <h1 className="text-xl font-bold font-orbitron tracking-wider text-white mb-2">{activeNote.title}</h1>
                  <div className="flex items-center gap-3 text-[10px] text-muted/40 font-mono">
                    <span>Last updated: {new Date(activeNote.updatedAt).toLocaleString()}</span>
                    <span>•</span>
                    <span>{wordCount} words</span>
                    <span>•</span>
                    <span>{readingTime} min read</span>
                  </div>
                </div>
                
                <div className="flex space-x-2 shrink-0">
                  {/* Copy note */}
                  <button
                    onClick={handleCopyNote}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/15 text-muted hover:text-white transition-all cursor-pointer"
                    title="Copy Markdown"
                  >
                    {noteCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <NeonButton variant="outline" size="sm" className="border-white/10 hover:border-neon-blue/40 text-xs font-bold font-orbitron" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
                  </NeonButton>
                  <button 
                    onClick={() => handleDelete(activeNote._id)}
                    className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/10 hover:bg-red-500/20 hover:border-red-500/20 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 prose prose-invert max-w-none text-xs leading-relaxed text-muted font-poppins">
                <ReactMarkdown
                  components={{
                    h1: ({children}) => <h2 className="font-orbitron font-bold text-white text-base mt-4 mb-2 uppercase">{children}</h2>,
                    h2: ({children}) => <h3 className="font-orbitron font-semibold text-white text-sm mt-3.5 mb-2 uppercase">{children}</h3>,
                    h3: ({children}) => <h4 className="font-orbitron font-medium text-white text-xs mt-3 mb-1.5 uppercase">{children}</h4>,
                    p: ({children}) => <p className="mb-3.5 text-muted/80">{children}</p>,
                    ul: ({children}) => <ul className="list-disc pl-5 mb-3.5 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal pl-5 mb-3.5 space-y-1">{children}</ol>,
                    blockquote: ({children}) => <blockquote className="border-l-2 border-neon-blue bg-white/[0.01] pl-4 py-1.5 my-3 rounded text-muted font-mono">{children}</blockquote>,
                    code: ({node, inline, children, ...props}) => (
                      inline ? (
                        <code className="bg-white/5 border border-white/10 rounded px-1 py-0.25 font-mono text-white text-[11px]" {...props}>{children}</code>
                      ) : (
                        <pre className="bg-black/40 border border-white/5 p-3.5 rounded-lg font-mono text-[10px] overflow-x-auto my-3"><code {...props}>{children}</code></pre>
                      )
                    )
                  }}
                >
                  {activeNote.content || '*Empty note*'}
                </ReactMarkdown>
              </div>
            </div>
          )
        ) : (
          /* Empty Workspace State */
          <div className="h-full flex items-center justify-center flex-col text-muted opacity-80 py-10 relative">
            <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
            
            {/* Cyber Orb */}
            <div className="relative w-24 h-24 flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full border border-neon-blue/30 border-dashed animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-2 rounded-full border border-neon-purple/20 border-dotted animate-[spin_10s_linear_infinite_reverse]" />
              
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-neon-purple to-neon-blue p-[2px] shadow-[0_0_20px_rgba(0,240,255,0.3)] animate-pulse flex items-center justify-center">
                <div className="w-full h-full bg-[#070b14] rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-neon-blue" />
                </div>
              </div>
            </div>
            
            <h3 className="font-orbitron font-bold text-white tracking-widest text-xs uppercase">Awaiting Neural Feed</h3>
            <p className="text-[10px] text-center max-w-[260px] mt-2 leading-relaxed font-poppins">
              Select a document from the sidebar archive or initialize a new record to begin visual synthesis.
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
