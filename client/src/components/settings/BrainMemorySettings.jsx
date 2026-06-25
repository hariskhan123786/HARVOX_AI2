import React, { useState, useEffect } from 'react';
import { memoryAPI } from '../../services/api';
import NeonButton from '../ui/NeonButton';
import { 
  Pin, Trash2, Search, Plus, Download, Edit3, Save, X, 
  Brain, FileText, Settings, Sparkles, Activity, Check, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BrainMemorySettings({ showToast }) {
  const [memories, setMemories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  // Edit / Add Form State
  const [isEditing, setIsEditing] = useState(null); // id of memory being edited
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    category: 'identity',
    key: '',
    value: '',
    isPinned: false,
    metadataDesc: '',
    metadataArch: '',
    metadataDetails: ''
  });

  const categories = [
    { id: 'all', label: 'All Neural Links', icon: Brain },
    { id: 'identity', label: 'Operator Identity', icon: HelpCircle },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'project', label: 'Projects', icon: FileText },
    { id: 'conversation', label: 'Conversations', icon: Sparkles },
    { id: 'activity', label: 'Activity Logs', icon: Activity }
  ];

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      if (search.trim()) params.q = search;
      
      const { data } = await memoryAPI.list(params);
      setMemories(data.memories || []);
    } catch (err) {
      console.error('Failed to fetch memories:', err);
      if (showToast) showToast('Failed to pull memory matrix.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [category, search]);

  const handlePin = async (id) => {
    try {
      const { data } = await memoryAPI.togglePin(id);
      setMemories(prev => 
        prev.map(m => m._id === id ? { ...m, isPinned: data.memory.isPinned } : m)
      );
      if (showToast) showToast(data.memory.isPinned ? 'Memory pinned to core priority' : 'Memory unpinned from core', 'success');
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to update memory pin telemetry.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirm deletion of this memory link?')) return;
    try {
      await memoryAPI.delete(id);
      setMemories(prev => prev.filter(m => m._id !== id));
      if (showToast) showToast('Memory record purged from Brain Core.', 'success');
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Purge sequence aborted. DB link failure.', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.key.trim() || !formData.value.trim()) {
      if (showToast) showToast('Memory key and value are required.', 'error');
      return;
    }

    const payload = {
      category: formData.category,
      key: formData.key.trim(),
      value: formData.value.trim(),
      isPinned: formData.isPinned,
      metadata: {
        description: formData.metadataDesc,
        architecture: formData.metadataArch,
        details: formData.metadataDetails
      }
    };

    try {
      if (isEditing) {
        await memoryAPI.update(isEditing, payload);
        if (showToast) showToast('Memory link updated successfully.', 'success');
      } else {
        await memoryAPI.create(payload);
        if (showToast) showToast('New memory matrix added to core.', 'success');
      }
      setIsAdding(false);
      setIsEditing(null);
      resetForm();
      fetchMemories();
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Uplink failed. Memory could not sync.', 'error');
    }
  };

  const handleEdit = (memory) => {
    setIsEditing(memory._id);
    setIsAdding(false);
    setFormData({
      category: memory.category,
      key: memory.key,
      value: typeof memory.value === 'object' ? JSON.stringify(memory.value) : String(memory.value),
      isPinned: memory.isPinned,
      metadataDesc: memory.metadata?.description || '',
      metadataArch: memory.metadata?.architecture || '',
      metadataDetails: memory.metadata?.details || ''
    });
  };

  const resetForm = () => {
    setFormData({
      category: 'identity',
      key: '',
      value: '',
      isPinned: false,
      metadataDesc: '',
      metadataArch: '',
      metadataDetails: ''
    });
  };

  const handleExport = () => {
    try {
      const url = memoryAPI.exportUrl();
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", url);
      downloadAnchor.setAttribute("download", "harvox_brain_memories.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      if (showToast) showToast('Memory Core profile exported successfully.', 'success');
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Failed to export Memory Core.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Subheader */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <h3 className="font-orbitron font-semibold text-sm text-white tracking-widest uppercase flex items-center gap-2">
          <Brain className="text-neon-blue w-4 h-4" />
          HARVOX Brain & Memory Core
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsAdding(true);
              setIsEditing(null);
              resetForm();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold font-orbitron tracking-wider text-neon-blue bg-neon-blue/10 border border-neon-blue/20 hover:bg-neon-blue/20 rounded-xl transition-all"
          >
            <Plus size={11} />
            ADD RECORD
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold font-orbitron tracking-wider text-neon-purple bg-neon-purple/10 border border-neon-purple/20 hover:bg-neon-purple/20 rounded-xl transition-all"
          >
            <Download size={11} />
            EXPORT ALL
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="md:col-span-1 relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search memory synapses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-[#0e0c15]/60 border border-white/5 rounded-xl text-xs text-white outline-none focus:border-neon-blue/30 transition-all font-mono"
          />
        </div>

        {/* Category switcher */}
        <div className="md:col-span-2 flex items-center gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {categories.map((c) => {
            const Icon = c.icon;
            const isSelected = category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-orbitron font-bold uppercase tracking-wider border shrink-0 transition-all ${
                  isSelected 
                    ? 'bg-neon-purple/10 border-neon-purple/30 text-neon-purple shadow-[0_0_15px_rgba(138,43,226,0.1)]'
                    : 'bg-secondary/15 border-white/5 text-muted hover:border-white/10 hover:text-white'
                }`}
              >
                <Icon size={11} />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic forms (Add/Edit) */}
      <AnimatePresence mode="wait">
        {(isAdding || isEditing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#13111c]/50 border border-neon-blue/20 rounded-2xl p-5 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-orbitron font-bold text-xs text-neon-blue tracking-wider uppercase">
                {isEditing ? 'MODIFY MEMORY SYNAPSE' : 'UPLINK NEW MEMORY'}
              </h4>
              <button 
                onClick={() => { setIsAdding(false); setIsEditing(null); }}
                className="p-1 text-muted hover:text-white rounded-lg hover:bg-white/5"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-orbitron font-bold tracking-widest text-muted uppercase">Memory Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="input-neon text-xs font-mono w-full"
                    disabled={!!isEditing && formData.category === 'activity'}
                  >
                    <option value="identity">Identity Profile</option>
                    <option value="preferences">Preferences & Models</option>
                    <option value="project">Project Context</option>
                    <option value="conversation">Important Discussions</option>
                    <option value="activity">Activity Log</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-orbitron font-bold tracking-widest text-muted uppercase">Memory Key (Synapse Identifier)</label>
                  <input
                    type="text"
                    placeholder="e.g. creator, preferredLanguage, fypGoal"
                    value={formData.key}
                    onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                    className="input-neon text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-orbitron font-bold tracking-widest text-muted uppercase">Memory Value (Details/Content)</label>
                <textarea
                  rows={2}
                  placeholder="Insert the fact, value, or summary statement to remember..."
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  className="input-neon text-xs font-mono"
                  required
                />
              </div>

              {/* Collapsible Metadata (Optional fields) */}
              <div className="pt-2 border-t border-white/5 space-y-3">
                <p className="text-[9px] font-orbitron font-bold text-gray-500 uppercase tracking-widest">Extended Metadata (Optional)</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Metadata Description"
                    value={formData.metadataDesc}
                    onChange={(e) => setFormData(prev => ({ ...prev, metadataDesc: e.target.value }))}
                    className="input-neon text-xs font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Architecture/Framework"
                    value={formData.metadataArch}
                    onChange={(e) => setFormData(prev => ({ ...prev, metadataArch: e.target.value }))}
                    className="input-neon text-xs font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Additional details"
                    value={formData.metadataDetails}
                    onChange={(e) => setFormData(prev => ({ ...prev, metadataDetails: e.target.value }))}
                    className="input-neon text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                    className="rounded border-white/10 bg-secondary text-neon-blue focus:ring-neon-blue focus:ring-offset-[#070B14] w-3.5 h-3.5"
                  />
                  <span className="text-[10px] font-orbitron font-bold tracking-widest text-muted uppercase">Pin to High Priority Core</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsAdding(false); setIsEditing(null); }}
                    className="px-4 py-2 border border-white/5 hover:border-white/10 text-muted hover:text-white rounded-xl text-[10px] font-orbitron font-bold tracking-widest"
                  >
                    CANCEL
                  </button>
                  <NeonButton type="submit" className="text-[10px] font-orbitron tracking-widest flex items-center gap-1.5 py-2 px-5">
                    <Save size={11} />
                    SAVE SYNASPE
                  </NeonButton>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Memory List Display */}
      {loading && memories.length === 0 ? (
        <div className="flex items-center justify-center h-48">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-white/5" />
            <div className="absolute inset-0 rounded-full border-2 border-t-neon-blue animate-spin" />
          </div>
        </div>
      ) : memories.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-white/5 bg-[#0e0c15]/30 rounded-2xl text-center gap-3">
          <Brain className="w-10 h-10 text-gray-700 animate-pulse" />
          <div>
            <p className="font-orbitron text-xs font-bold text-gray-500 tracking-wider">NO NEURAL MEMORY RECORDS FOUND</p>
            <p className="text-[10px] text-gray-700 mt-1">No memory matches for category &apos;{category}&apos; in the current synaptic grid.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memories.map((m) => {
            const date = new Date(m.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
            return (
              <motion.div
                key={m._id}
                layout
                className={`relative flex flex-col justify-between bg-[#0b0a0f]/90 border rounded-2xl p-4 transition-all duration-300 hover:border-neon-purple/20 group hover:shadow-[0_0_15px_rgba(138,43,226,0.05)] ${
                  m.isPinned ? 'border-neon-blue/30 shadow-[inset_0_0_15px_rgba(0,240,255,0.03)]' : 'border-white/5'
                }`}
              >
                <div>
                  {/* Card Header: Category & Key */}
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-orbitron font-black tracking-widest text-[#be5cf6] bg-[#8a2be2]/10 border border-[#8a2be2]/20 px-2 py-0.5 rounded-full uppercase">
                      {m.category}
                    </span>
                    
                    <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handlePin(m._id)}
                        className={`p-1 rounded hover:bg-white/5 transition-colors ${m.isPinned ? 'text-neon-blue' : 'text-gray-500 hover:text-white'}`}
                        title={m.isPinned ? 'Unpin memory' : 'Pin memory'}
                      >
                        <Pin size={11} fill={m.isPinned ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={() => handleEdit(m)}
                        className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                        title="Edit memory"
                      >
                        <Edit3 size={11} />
                      </button>
                      <button
                        onClick={() => handleDelete(m._id)}
                        className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-rose-400 transition-colors"
                        title="Delete memory"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Key and Value */}
                  <h5 className="font-mono text-xs font-bold text-white mb-1.5 flex items-center gap-1">
                    <span className="text-muted/60">&gt;</span> {m.key}
                  </h5>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed font-sans whitespace-pre-wrap">
                    {String(m.value)}
                  </p>

                  {/* Optional Metadata */}
                  {m.metadata && typeof m.metadata === 'object' && Object.values(m.metadata).some(Boolean) && (
                    <div className="mt-3 pt-2.5 border-t border-white/5 grid grid-cols-1 gap-1 text-[10px] font-mono text-gray-600">
                      {m.metadata.description && <p><span className="text-gray-700">DESC:</span> {m.metadata.description}</p>}
                      {m.metadata.architecture && <p><span className="text-gray-700">ARCH:</span> {m.metadata.architecture}</p>}
                      {m.metadata.details && <p><span className="text-gray-700">DETAILS:</span> {m.metadata.details}</p>}
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="mt-3 flex justify-between items-center text-[9px] font-mono text-gray-600">
                  <span>SYNAPSED: {date}</span>
                  {m.isPinned && <span className="text-neon-blue font-bold tracking-wider">PRIORITY LEVEL A</span>}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
