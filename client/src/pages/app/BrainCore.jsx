import React, { useState, useEffect, useRef, useMemo } from 'react';
import { memoryAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, User, Cpu, FileCode, Clock, Sparkles, Network,
  Activity, ShieldAlert, Zap, BookOpen, Layers, Search,
  Trash2, Edit, Plus, ChevronLeft, ChevronRight, RefreshCw,
  Check, X, AlertCircle, Save, Undo, Lock
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import NeonButton from '../../components/ui/NeonButton';

// Custom Typewriter Hook for Cyberpunk AI Summary Output
function useTypewriter(text, speed = 15) {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    setDisplayedText('');
    if (!text) return;
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return displayedText;
}

// Neon label styled input
const NeonInput = ({ label, ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-[9px] font-orbitron uppercase tracking-widest text-gray-500">{label}</label>}
    <input
      {...props}
      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono placeholder-gray-700 focus:outline-none focus:border-neon-blue/50 focus:shadow-[0_0_10px_rgba(0,240,255,0.1)] transition-all"
    />
  </div>
);

const NeonTextarea = ({ label, rows = 3, ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-[9px] font-orbitron uppercase tracking-widest text-gray-500">{label}</label>}
    <textarea
      rows={rows}
      {...props}
      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono placeholder-gray-700 focus:outline-none focus:border-neon-blue/50 focus:shadow-[0_0_10px_rgba(0,240,255,0.1)] transition-all resize-none"
    />
  </div>
);

export default function BrainCore() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNode, setActiveNode] = useState(null);
  
  // Stats & Sync
  const [lastSync, setLastSync] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCategories, setVisibleCategories] = useState({
    identity: true,
    preferences: true,
    project: true,
    conversation: true,
    activity: true
  });

  // Graph dragging state
  const containerRef = useRef(null);
  const defaultPositions = {
    identity: { x: 250, y: 70 },
    preferences: { x: 100, y: 170 },
    project: { x: 400, y: 170 },
    conversation: { x: 250, y: 270 },
    activity: { x: 250, y: 170 }
  };
  const [nodePositions, setNodePositions] = useState(defaultPositions);
  const [draggingNode, setDraggingNode] = useState(null);

  // Inspector Panel modes: 'view' | 'edit' | 'create'
  const [inspectorMode, setInspectorMode] = useState('view');
  const [siblingIndex, setSiblingIndex] = useState(0);

  // Edit / Create Form States
  const [formKey, setFormKey] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formCategory, setFormCategory] = useState('preferences');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formDesc, setFormDesc] = useState('');
  const [formDetails, setFormDetails] = useState('');
  const [formArch, setFormArch] = useState('');
  const [formTags, setFormTags] = useState('');
  const [isAutoTagging, setIsAutoTagging] = useState(false);
  const [autoTagSuccess, setAutoTagSuccess] = useState(false);

  // Timeline Config
  const [activityLimit, setActivityLimit] = useState(10);
  const [timeRange, setTimeRange] = useState('all'); // 'all' | '24h' | '7d' | '30d'

  // AI Summary & Conflicts
  const [aiSummary, setAiSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);
  const [showConflictsPanel, setShowConflictsPanel] = useState(false);

  // Fetch all memories
  const fetchBrainData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await memoryAPI.list();
      const allMemories = data.memories || [];
      setMemories(allMemories);
      setLastSync(new Date());

      if (activeNode) {
        const updated = allMemories.find((m) => m._id === activeNode._id);
        if (updated) {
          setActiveNode(updated);
        } else {
          const categoryMemories = allMemories.filter((m) => m.category === activeNode.category);
          if (categoryMemories.length > 0) {
            setActiveNode(categoryMemories[0]);
          } else {
            setActiveNode(allMemories[0] || null);
          }
        }
      } else {
        const identityNode = allMemories.find((m) => m.category === 'identity');
        if (identityNode) setActiveNode(identityNode);
      }
    } catch (err) {
      console.error('Failed to load memory nodes:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const runConflictCheck = async () => {
    setIsCheckingConflicts(true);
    try {
      const { data } = await memoryAPI.detectConflicts();
      setConflicts(data.conflicts || []);
    } catch (err) {
      console.error('Conflict detection error:', err);
    } finally {
      setIsCheckingConflicts(false);
    }
  };

  useEffect(() => {
    fetchBrainData();
    runConflictCheck();
  }, []);

  const matchesSearch = (m) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const keyMatch = m.key?.toLowerCase().includes(query);
    const valMatch = String(m.value || '').toLowerCase().includes(query);
    let metaMatch = false;
    if (m.metadata && typeof m.metadata === 'object') {
      metaMatch = Object.values(m.metadata).some((val) => 
        String(val || '').toLowerCase().includes(query)
      );
    }
    return keyMatch || valMatch || metaMatch;
  };

  const identityMemories = useMemo(() => 
    memories.filter((m) => m.category === 'identity' && matchesSearch(m)), 
    [memories, searchQuery]
  );
  const preferenceMemories = useMemo(() => 
    memories.filter((m) => m.category === 'preferences' && matchesSearch(m)), 
    [memories, searchQuery]
  );
  const projectMemories = useMemo(() => 
    memories.filter((m) => m.category === 'project' && matchesSearch(m)), 
    [memories, searchQuery]
  );
  const conversationMemories = useMemo(() => 
    memories.filter((m) => m.category === 'conversation' && matchesSearch(m)), 
    [memories, searchQuery]
  );

  const activityMemories = useMemo(() => {
    let logs = memories.filter((m) => m.category === 'activity' && matchesSearch(m));
    if (timeRange !== 'all') {
      const limitDate = new Date();
      if (timeRange === '24h') limitDate.setHours(limitDate.getHours() - 24);
      else if (timeRange === '7d') limitDate.setDate(limitDate.getDate() - 7);
      else if (timeRange === '30d') limitDate.setDate(limitDate.getDate() - 30);
      logs = logs.filter((m) => new Date(m.createdAt) >= limitDate);
    }
    return logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [memories, searchQuery, timeRange]);

  const pagedActivityMemories = useMemo(() => 
    activityMemories.slice(0, activityLimit), 
    [activityMemories, activityLimit]
  );

  const totalCount = memories.length;

  const graphNodes = useMemo(() => [
    { id: 'identity', label: 'Identity Matrix', color: '#00F0FF', icon: User, count: identityMemories.length },
    { id: 'preferences', label: 'Preferences', color: '#FF00C8', icon: Zap, count: preferenceMemories.length },
    { id: 'project', label: 'Projects Core', color: '#8A2BE2', icon: FileCode, count: projectMemories.length },
    { id: 'conversation', label: 'Synapses', color: '#39FF14', icon: Sparkles, count: conversationMemories.length },
    { id: 'activity', label: 'Command Logs', color: '#FFCC00', icon: Activity, count: activityMemories.length, isCenter: true }
  ], [identityMemories, preferenceMemories, projectMemories, conversationMemories, activityMemories]);

  const graphConnections = [
    { from: 'activity', to: 'identity' },
    { from: 'activity', to: 'preferences' },
    { from: 'activity', to: 'project' },
    { from: 'activity', to: 'conversation' },
    { from: 'identity', to: 'project' },
    { from: 'preferences', to: 'project' }
  ];

  const getCategoryMemories = (catId) => {
    switch (catId) {
      case 'identity': return identityMemories;
      case 'preferences': return preferenceMemories;
      case 'project': return projectMemories;
      case 'conversation': return conversationMemories;
      case 'activity': return activityMemories;
      default: return [];
    }
  };

  const handleMouseDown = (nodeId, e) => {
    e.preventDefault();
    setDraggingNode(nodeId);
  };

  useEffect(() => {
    if (!draggingNode) return;
    const handleMouseMove = (e) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = Math.max(30, Math.min(rect.width - 30, e.clientX - rect.left));
      const y = Math.max(30, Math.min(rect.height - 30, e.clientY - rect.top));
      setNodePositions((prev) => ({ ...prev, [draggingNode]: { x, y } }));
    };
    const handleMouseUp = () => setDraggingNode(null);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingNode]);

  const siblings = useMemo(() => {
    if (!activeNode) return [];
    return getCategoryMemories(activeNode.category);
  }, [activeNode, memories, searchQuery]);

  useEffect(() => {
    if (activeNode && siblings.length > 0) {
      const idx = siblings.findIndex((s) => s._id === activeNode._id);
      if (idx !== -1) setSiblingIndex(idx);
    }
  }, [activeNode, siblings]);

  const handleNextSibling = () => {
    if (siblings.length <= 1) return;
    const nextIdx = (siblingIndex + 1) % siblings.length;
    setActiveNode(siblings[nextIdx]);
  };

  const handlePrevSibling = () => {
    if (siblings.length <= 1) return;
    const prevIdx = (siblingIndex - 1 + siblings.length) % siblings.length;
    setActiveNode(siblings[prevIdx]);
  };

  const startEdit = () => {
    if (!activeNode) return;
    setFormKey(activeNode.key);
    setFormValue(typeof activeNode.value === 'object' ? JSON.stringify(activeNode.value) : activeNode.value);
    setFormIsPinned(activeNode.isPinned || false);
    setFormDesc(activeNode.metadata?.description || '');
    setFormDetails(activeNode.metadata?.details || '');
    setFormArch(activeNode.metadata?.architecture || '');
    setFormTags(activeNode.metadata?.tags || '');
    setInspectorMode('edit');
  };

  const startCreate = () => {
    setFormKey('');
    setFormValue('');
    setFormCategory(activeNode?.category || 'preferences');
    setFormIsPinned(false);
    setFormDesc('');
    setFormDetails('');
    setFormArch('');
    setFormTags('');
    setAutoTagSuccess(false);
    setInspectorMode('create');
  };

  const handleSaveEdit = async () => {
    if (!formKey.trim() || !formValue.trim()) return;
    try {
      const metadata = { description: formDesc, details: formDetails, architecture: formArch, tags: formTags };
      await memoryAPI.update(activeNode._id, { key: formKey, value: formValue, isPinned: formIsPinned, metadata });
      setInspectorMode('view');
      await fetchBrainData(true);
      runConflictCheck();
    } catch (err) {
      console.error('Failed to update synapse:', err);
    }
  };

  const handleDeleteNode = async () => {
    if (!activeNode) return;
    if (!window.confirm('Are you sure you want to permanently delete this synapse memory?')) return;
    try {
      await memoryAPI.delete(activeNode._id);
      setInspectorMode('view');
      const categoryMemories = memories.filter((m) => m.category === activeNode.category && m._id !== activeNode._id);
      setActiveNode(categoryMemories.length > 0 ? categoryMemories[0] : null);
      await fetchBrainData(true);
      runConflictCheck();
    } catch (err) {
      console.error('Failed to delete synapse:', err);
    }
  };

  const handleCreateNode = async () => {
    if (!formKey.trim() || !formValue.trim()) return;
    try {
      const metadata = { description: formDesc, details: formDetails, architecture: formArch, tags: formTags };
      const { data } = await memoryAPI.create({ category: formCategory, key: formKey, value: formValue, isPinned: formIsPinned, metadata });
      setInspectorMode('view');
      setActiveNode(data.memory);
      await fetchBrainData(true);
      runConflictCheck();
    } catch (err) {
      console.error('Failed to create memory:', err);
    }
  };

  const handleAIAutoTag = async () => {
    if (!formKey.trim() || !formValue.trim()) { alert('Fill in Key and Value first.'); return; }
    setIsAutoTagging(true);
    setAutoTagSuccess(false);
    try {
      const { data } = await memoryAPI.autoTag({ key: formKey, value: formValue });
      if (data) {
        if (data.category) setFormCategory(data.category);
        if (data.description) setFormDesc(data.description);
        if (data.details) setFormDetails(data.details);
        if (data.tags) setFormTags(data.tags);
        setAutoTagSuccess(true);
        setTimeout(() => setAutoTagSuccess(false), 3000);
      }
    } catch (err) {
      console.error('AI Auto-Tagging failed:', err);
    } finally {
      setIsAutoTagging(false);
    }
  };

  const handleSummarizeIdentity = async () => {
    setIsSummarizing(true);
    try {
      const { data } = await memoryAPI.summarizeIdentity();
      setAiSummary(data.summary || 'Summary unavailable.');
    } catch (err) {
      console.error('AI Identity Summary failed:', err);
      setAiSummary('Failed to compile identity telemetry context.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleToggleCategory = (cat) => {
    setVisibleCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const typedBio = useTypewriter(aiSummary);

  const categoryColors = {
    identity: '#00F0FF',
    preferences: '#FF00C8',
    project: '#8A2BE2',
    conversation: '#39FF14',
    activity: '#FFCC00',
  };

  return (
    <div className="space-y-6 select-none pb-12">

      {/* ── Animated Neon Title Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue/20 via-neon-purple/10 to-transparent rounded-xl blur-xl pointer-events-none" />
          <h1 className="relative font-orbitron text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#BE5CF6] to-[#00F0FF] bg-[size:200%] animate-[shimmer_3s_linear_infinite] flex items-center gap-3">
            <div className="relative">
              <Brain className="w-7 h-7 text-neon-blue" />
              <div className="absolute inset-0 rounded-full bg-neon-blue/30 blur-md animate-pulse" />
            </div>
            HARVOX BRAIN CORE
          </h1>
          <p className="text-[11px] text-gray-500 mt-1 font-mono">
            <span className="text-neon-blue/60">///</span> Futuristic telemetry dashboard · Neural knowledge graph · Synaptic memory OS
          </p>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-3">
          <div className="text-[9px] font-mono text-gray-600 text-right hidden md:block leading-relaxed bg-black/30 border border-white/5 rounded-xl px-3 py-1.5">
            <p>UPLINK: <span className="text-neon-blue animate-pulse">STABLE</span></p>
            {lastSync && <p>LAST SYNC: <span className="text-gray-400">{lastSync.toLocaleTimeString()}</span></p>}
          </div>
          <button
            onClick={() => { setIsRefreshing(true); fetchBrainData(true); runConflictCheck(); }}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neon-blue/5 border border-neon-blue/20 hover:bg-neon-blue/15 hover:border-neon-blue/40 transition-all font-mono text-[10px] text-neon-blue cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync Core
          </button>
        </div>
      </div>

      {/* ── Synaptic Conflict Alert Banner ── */}
      {conflicts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-red-500/30 bg-red-950/20 rounded-2xl p-4 flex items-start justify-between gap-4 relative overflow-hidden backdrop-blur-md"
        >
          <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-red-400 via-red-500 to-red-400 animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(239,68,68,0.05),transparent_70%)] pointer-events-none" />
          <div className="flex gap-3 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="text-red-500 w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h4 className="font-orbitron font-bold text-xs text-red-400 tracking-wider">SYNAPTIC CONFLICT ALERT</h4>
              <p className="text-[11px] text-gray-300 font-sans mt-0.5">
                Brain Core detected {conflicts.length} logical contradiction{conflicts.length > 1 ? 's' : ''} in your identity/preferences nodes.
              </p>
              {showConflictsPanel && (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-2 border-t border-white/5 pt-2">
                  {conflicts.map((c, idx) => (
                    <div key={idx} className="bg-black/35 border border-white/5 rounded-xl p-2.5 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded ${
                          c.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>{c.severity || 'warning'}</span>
                        <span className="text-[9px] font-mono text-gray-500">Key: {c.keyName}</span>
                      </div>
                      <p className="text-[10px] text-gray-300 font-sans">{c.message}</p>
                      {c.conflictingIds?.length > 0 && (
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => { const f = memories.find(m => m._id === c.conflictingIds[0]); if (f) { setActiveNode(f); setInspectorMode('view'); } }} className="text-[9px] font-mono text-neon-blue hover:underline cursor-pointer">Inspect Node A</button>
                          {c.conflictingIds[1] && <button onClick={() => { const f = memories.find(m => m._id === c.conflictingIds[1]); if (f) { setActiveNode(f); setInspectorMode('view'); } }} className="text-[9px] font-mono text-neon-purple hover:underline cursor-pointer">Inspect Node B</button>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowConflictsPanel(!showConflictsPanel)}
            className="text-[10px] font-mono px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-300 transition cursor-pointer relative z-10 shrink-0"
          >
            {showConflictsPanel ? 'Collapse' : 'Resolve Diagnostics'}
          </button>
        </motion.div>
      )}

      {/* ── Memory Stats Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Nodes', count: totalCount, color: '#FFFFFF', icon: Brain },
          { label: 'Identity', count: identityMemories.length, color: '#00F0FF', icon: User },
          { label: 'Preferences', count: preferenceMemories.length, color: '#FF00C8', icon: Zap },
          { label: 'Projects', count: projectMemories.length, color: '#8A2BE2', icon: FileCode },
          { label: 'Synapses', count: conversationMemories.length, color: '#39FF14', icon: Sparkles }
        ].map((stat, idx) => {
          const StatIcon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="relative overflow-hidden bg-black/40 border border-white/5 rounded-2xl px-4 py-3 group hover:border-white/10 transition-all"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(ellipse at bottom left, ${stat.color}08, transparent 70%)` }} />
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <span className="text-[8px] font-orbitron text-gray-600 uppercase tracking-widest block">{stat.label}</span>
                  <span className="text-2xl font-bold text-white mt-0.5 block font-mono" style={{ textShadow: `0 0 10px ${stat.color}40` }}>{stat.count}</span>
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${stat.color}0d`, borderColor: `${stat.color}25` }}>
                  <StatIcon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${stat.color}30, transparent)` }} />
            </motion.div>
          );
        })}
      </div>

      {/* ── Search and Filters Bar ── */}
      <GlassCard className="border-white/5" hover={false}>
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-gray-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search knowledge core..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue/40 focus:shadow-[0_0_12px_rgba(0,240,255,0.08)] transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end">
            <span className="text-[9px] font-orbitron font-bold text-gray-600 uppercase flex items-center mr-2">Filters:</span>
            {[
              { id: 'identity', label: 'Identity', color: '#00F0FF' },
              { id: 'preferences', label: 'Prefs', color: '#FF00C8' },
              { id: 'project', label: 'Projects', color: '#8A2BE2' },
              { id: 'conversation', label: 'Synapses', color: '#39FF14' },
              { id: 'activity', label: 'Logs', color: '#FFCC00' }
            ].map((cat) => {
              const active = visibleCategories[cat.id];
              return (
                <button
                  key={cat.id}
                  onClick={() => handleToggleCategory(cat.id)}
                  className={`text-[9px] font-mono px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${active ? 'text-white' : 'border-white/5 bg-transparent text-gray-600'}`}
                  style={{ borderColor: active ? `${cat.color}55` : '', backgroundColor: active ? `${cat.color}15` : '', boxShadow: active ? `0 0 8px ${cat.color}20` : '' }}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: active ? cat.color : '#444' }} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column: Interactive Neural Node Graph ── */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="border-white/5 relative overflow-hidden" hover={false}>
            {/* Holographic grid backing */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(138,43,226,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(138,43,226,0.025)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.03),transparent_70%)] pointer-events-none" />

            <div className="flex justify-between items-center mb-4 relative z-10">
              <h3 className="font-orbitron font-bold text-xs tracking-widest text-white uppercase flex items-center gap-2">
                <Network className="text-neon-blue w-4 h-4" />
                Synaptic Connection Graph
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNodePositions(defaultPositions)}
                  className="text-[8px] font-mono text-gray-500 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-2 py-1 flex items-center gap-1 transition cursor-pointer"
                >
                  <Undo className="w-2.5 h-2.5" />
                  Reset Layout
                </button>
                <span className="text-[9px] font-mono text-neon-blue border border-neon-blue/25 bg-neon-blue/5 px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  Holographic View
                </span>
              </div>
            </div>

            {/* Neural Graph Canvas */}
            <div 
              ref={containerRef}
              className="h-[360px] relative border border-white/5 bg-black/50 rounded-2xl flex items-center justify-center overflow-hidden"
            >
              {/* Scanline overlay */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,240,255,0.01)_2px,rgba(0,240,255,0.01)_4px)] pointer-events-none z-0" />

              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-neon-blue border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    <div className="absolute inset-1 rounded-full border border-neon-purple/30 animate-ping" />
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 animate-pulse">Syncing node arrays...</span>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  {/* SVG with full neon glow defs */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <defs>
                      <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="4" result="blur1" />
                        <feGaussianBlur stdDeviation="8" result="blur2" />
                        <feMerge>
                          <feMergeNode in="blur2" />
                          <feMergeNode in="blur1" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      <filter id="nodeHalo" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      <linearGradient id="connGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.1" />
                        <stop offset="50%" stopColor="#BE5CF6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>

                    {graphConnections.map((conn, idx) => {
                      const fromNode = graphNodes.find(n => n.id === conn.from);
                      const toNode = graphNodes.find(n => n.id === conn.to);
                      const fromVisible = visibleCategories[conn.from];
                      const toVisible = visibleCategories[conn.to];
                      if (!fromNode || !toNode) return null;
                      const p1 = nodePositions[conn.from] || defaultPositions[conn.from];
                      const p2 = nodePositions[conn.to] || defaultPositions[conn.to];
                      const isFaded = !fromVisible || !toVisible;
                      const midX = (p1.x + p2.x) / 2;
                      const midY = (p1.y + p2.y) / 2;

                      return (
                        <g key={idx}>
                          {/* Outer glow line */}
                          {!isFaded && (
                            <line
                              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                              stroke="rgba(0,240,255,0.12)"
                              strokeWidth={6}
                              filter="url(#neonGlow)"
                            />
                          )}
                          {/* Core line */}
                          <line
                            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                            stroke={isFaded ? 'rgba(255,255,255,0.02)' : 'rgba(0,240,255,0.25)'}
                            strokeWidth={isFaded ? 0.5 : 1.5}
                          />
                          {/* Midpoint pulse dot */}
                          {!isFaded && (
                            <circle cx={midX} cy={midY} r={2} fill="rgba(0,240,255,0.5)" filter="url(#neonGlow)" />
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* Render Graph Interactive Nodes */}
                  {graphNodes.map((node) => {
                    const NodeIcon = node.icon;
                    const isActive = activeNode?.category === node.id || (node.isCenter && activeNode?.category === 'activity');
                    const isVisible = visibleCategories[node.id];
                    const pos = nodePositions[node.id] || defaultPositions[node.id];
                    const isDraggingThis = draggingNode === node.id;

                    return (
                      <motion.div
                        key={node.id}
                        style={{ 
                          left: pos.x - 32, 
                          top: pos.y - 32,
                          opacity: isVisible ? 1 : 0.18,
                          cursor: isDraggingThis ? 'grabbing' : 'grab'
                        }}
                        onMouseDown={(e) => isVisible && handleMouseDown(node.id, e)}
                        onClick={() => {
                          if (!isVisible) return;
                          const items = getCategoryMemories(node.id);
                          if (items.length > 0) { setActiveNode(items[0]); setInspectorMode('view'); }
                          else { setFormCategory(node.id); startCreate(); }
                        }}
                        whileHover={isVisible ? { scale: 1.15 } : {}}
                        className="absolute z-10 flex flex-col items-center gap-1.5 select-none"
                      >
                        {/* Halo aura ring behind node */}
                        {isActive && isVisible && (
                          <div
                            className="absolute inset-[-8px] rounded-2xl animate-ping"
                            style={{ background: `radial-gradient(circle, ${node.color}25 0%, transparent 70%)`, animationDuration: '2s' }}
                          />
                        )}
                        <div 
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 border backdrop-blur-md relative overflow-hidden ${
                            isActive 
                              ? 'border-white/30 scale-105'
                              : 'border-white/10 hover:border-white/20'
                          }`}
                          style={{ 
                            background: isActive 
                              ? `radial-gradient(circle, ${node.color}30 0%, rgba(0,0,0,0.85) 100%)`
                              : 'rgba(8, 6, 14, 0.88)',
                            boxShadow: isActive ? `0 0 24px ${node.color}50, 0 0 48px ${node.color}20` : `0 0 0px transparent`
                          }}
                        >
                          {/* Inner shimmer */}
                          {isActive && <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />}
                          <NodeIcon className="w-6 h-6 relative z-10" style={{ color: node.color, filter: isActive ? `drop-shadow(0 0 6px ${node.color})` : 'none' }} />
                        </div>
                        <div className="text-center">
                          <span className="text-[8px] font-orbitron font-bold tracking-wider uppercase" style={{ color: isActive ? node.color : '#6b7280' }}>
                            {node.label}
                          </span>
                          <span className="text-[7px] font-mono text-gray-600 block">
                            {node.count} Link{node.count !== 1 && 's'}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </GlassCard>

          {/* ── Active Synapse Data Inspector ── */}
          <GlassCard className="border-white/5 relative" hover={false}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-orbitron font-bold text-xs tracking-widest text-white uppercase flex items-center gap-2">
                <Layers className="text-[#be5cf6] w-4 h-4" />
                Active Synapse Data Inspector
                {activeNode && (
                  <span className="text-[8px] font-mono px-2 py-0.5 rounded-full border ml-1" style={{ color: categoryColors[activeNode.category] || '#fff', borderColor: `${categoryColors[activeNode.category]}40`, backgroundColor: `${categoryColors[activeNode.category]}10` }}>
                    {activeNode.category}
                  </span>
                )}
              </h3>
              
              <div className="flex items-center gap-2">
                {inspectorMode === 'view' ? (
                  <>
                    <button
                      onClick={startCreate}
                      className="text-[9px] font-mono px-2.5 py-1.5 bg-[#8a2be2]/15 border border-[#8a2be2]/30 hover:border-[#8a2be2]/50 hover:bg-[#8a2be2]/25 rounded-lg text-white flex items-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-[#be5cf6]" />
                      New Synapse
                    </button>
                    {activeNode && (
                      <button
                        onClick={startEdit}
                        className="text-[9px] font-mono px-2.5 py-1.5 bg-white/5 border border-white/10 hover:border-neon-blue/30 hover:bg-neon-blue/5 rounded-lg text-white flex items-center gap-1 transition cursor-pointer"
                      >
                        <Edit className="w-3 h-3 text-gray-400" />
                        Edit
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => setInspectorMode('view')}
                    className="text-[9px] font-mono px-2.5 py-1.5 bg-black/45 border border-white/10 rounded-lg text-gray-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* View Mode */}
            {inspectorMode === 'view' && (
              <div>
                {activeNode ? (
                  <motion.div
                    key={activeNode._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[#080611] border border-white/5 rounded-2xl p-5 space-y-4 relative overflow-hidden"
                  >
                    {/* Category color accent left bar */}
                    <div className="absolute top-0 bottom-0 left-0 w-0.5 rounded-l-2xl" style={{ background: `linear-gradient(to bottom, ${categoryColors[activeNode.category] || '#fff'}, transparent)` }} />

                    <div className="flex justify-between items-start border-b border-white/5 pb-3">
                      <div>
                        <span className="text-[8px] font-orbitron font-black tracking-widest uppercase block" style={{ color: categoryColors[activeNode.category] || '#be5cf6' }}>
                          Category Node: {activeNode.category}
                        </span>
                        <h4 className="font-mono text-sm font-bold text-white tracking-wide mt-1">
                          {activeNode.key}
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {activeNode.isPinned && (
                          <span className="text-[8px] font-orbitron font-bold text-neon-blue bg-neon-blue/10 border border-neon-blue/20 px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                            Pinned Core
                          </span>
                        )}
                        {siblings.length > 1 && (
                          <div className="flex items-center border border-white/10 bg-black/45 rounded-lg overflow-hidden">
                            <button onClick={handlePrevSibling} className="p-1 hover:bg-white/5 border-r border-white/10 text-gray-400 hover:text-white cursor-pointer"><ChevronLeft className="w-3 h-3" /></button>
                            <span className="text-[9px] font-mono px-2 text-gray-500">{siblingIndex + 1}/{siblings.length}</span>
                            <button onClick={handleNextSibling} className="p-1 hover:bg-white/5 text-gray-400 hover:text-white cursor-pointer"><ChevronRight className="w-3 h-3" /></button>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-300 leading-relaxed font-sans whitespace-pre-wrap">
                      {String(activeNode.value)}
                    </p>

                    {activeNode.metadata && typeof activeNode.metadata === 'object' && Object.values(activeNode.metadata).some(Boolean) && (
                      <div className="bg-black/50 border border-white/5 rounded-xl p-3.5 space-y-1.5 text-[10px] font-mono text-gray-500">
                        <p className="text-[8px] font-orbitron text-gray-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-neon-purple inline-block" />
                          Synapse Metadata
                        </p>
                        {activeNode.metadata.description && <p><span className="text-gray-700">&gt; DESC:</span> {activeNode.metadata.description}</p>}
                        {activeNode.metadata.architecture && <p><span className="text-gray-700">&gt; ARCH:</span> {activeNode.metadata.architecture}</p>}
                        {activeNode.metadata.details && <p><span className="text-gray-700">&gt; DETAIL:</span> {activeNode.metadata.details}</p>}
                        {activeNode.metadata.tags && <p><span className="text-gray-700">&gt; TAGS:</span> {activeNode.metadata.tags}</p>}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[9px] font-mono text-gray-600 pt-2 border-t border-white/5">
                      <span>LAST SYNC: {new Date(activeNode.updatedAt).toLocaleString()}</span>
                      <button
                        onClick={handleDeleteNode}
                        className="text-red-500/70 hover:text-red-400 flex items-center gap-1 font-mono hover:underline cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Purge Node
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-28 gap-2 text-center">
                    <Network className="w-8 h-8 text-gray-700 animate-pulse" />
                    <p className="font-orbitron text-[10px] text-gray-600 uppercase tracking-wider">Select a neural node to inspect its synapse matrix</p>
                  </div>
                )}
              </div>
            )}

            {/* Edit Mode */}
            {inspectorMode === 'edit' && activeNode && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#080611] border border-neon-purple/15 rounded-2xl p-5 space-y-4"
              >
                <h4 className="font-orbitron font-bold text-xs text-neon-purple tracking-widest uppercase mb-2">Edit Memory Synapse</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NeonInput label="Key Identifier" type="text" value={formKey} onChange={(e) => setFormKey(e.target.value)} />
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer py-2 text-gray-400 select-none text-xs font-mono">
                      <input type="checkbox" checked={formIsPinned} onChange={(e) => setFormIsPinned(e.target.checked)} className="rounded border-white/10 bg-black/45 text-neon-blue focus:ring-0 w-4 h-4" />
                      Pin to Core Prompts
                    </label>
                  </div>
                </div>
                <NeonTextarea label="Value Data" rows={3} value={formValue} onChange={(e) => setFormValue(e.target.value)} />
                <div className="border-t border-white/5 pt-3.5 space-y-3">
                  <p className="text-[8px] text-gray-500 tracking-widest uppercase font-orbitron">Metadata Context</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <NeonInput label="Description" type="text" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
                    <NeonInput label="Details" type="text" value={formDetails} onChange={(e) => setFormDetails(e.target.value)} />
                    <NeonInput
                      label={activeNode.category === 'project' ? 'Architecture' : 'Tags (comma sep)'}
                      type="text"
                      value={activeNode.category === 'project' ? formArch : formTags}
                      onChange={(e) => activeNode.category === 'project' ? setFormArch(e.target.value) : setFormTags(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2.5 pt-2">
                  <button onClick={() => setInspectorMode('view')} className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white transition cursor-pointer font-orbitron text-[10px]">Cancel</button>
                  <button onClick={handleSaveEdit} className="px-4 py-1.5 rounded-xl bg-[#8a2be2] border border-[#be5cf6]/40 hover:bg-[#be5cf6] text-white flex items-center gap-1.5 transition cursor-pointer font-orbitron text-[10px] font-bold">
                    <Save className="w-3.5 h-3.5" />
                    Save Synapse
                  </button>
                </div>
              </motion.div>
            )}

            {/* Create Mode */}
            {inspectorMode === 'create' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#080611] border border-neon-blue/15 rounded-2xl p-5 space-y-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-orbitron font-bold text-xs text-neon-blue tracking-widest uppercase">Initialize New Synapse</h4>
                  <button
                    onClick={handleAIAutoTag}
                    disabled={isAutoTagging || !formKey.trim() || !formValue.trim()}
                    className="text-[9px] font-mono px-3 py-1.5 bg-neon-blue/10 border border-neon-blue/30 rounded-lg text-neon-blue hover:bg-neon-blue/20 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Sparkles className={`w-3 h-3 ${isAutoTagging ? 'animate-spin' : ''}`} />
                    {isAutoTagging ? 'Analyzing...' : 'AI Auto-Tag'}
                  </button>
                </div>

                {autoTagSuccess && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-neon-blue/5 border border-neon-blue/20 text-neon-blue text-[10px] p-2 rounded-xl text-center font-mono flex items-center justify-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    Neural analysis complete! Parameters auto-injected.
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <NeonInput label="Key Identifier" type="text" placeholder="e.g. preferredModel" value={formKey} onChange={(e) => setFormKey(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-orbitron uppercase tracking-widest text-gray-500">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-neon-blue/50 cursor-pointer"
                    >
                      <option value="identity">Identity</option>
                      <option value="preferences">Preferences</option>
                      <option value="project">Project</option>
                      <option value="conversation">Synapses</option>
                    </select>
                  </div>
                </div>

                <NeonTextarea label="Value Data" rows={3} placeholder="Provide details, facts, or instruction arrays..." value={formValue} onChange={(e) => setFormValue(e.target.value)} />

                <label className="flex items-center gap-2 cursor-pointer text-gray-400 select-none text-xs font-mono">
                  <input type="checkbox" checked={formIsPinned} onChange={(e) => setFormIsPinned(e.target.checked)} className="rounded border-white/10 bg-black/45 text-neon-blue focus:ring-0 w-4 h-4" />
                  Pin Core (Forces prompt injection across session)
                </label>

                <div className="border-t border-white/5 pt-3.5 space-y-3">
                  <p className="text-[8px] text-gray-500 tracking-widest uppercase font-orbitron">Suggested Metadata (Optional)</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <NeonInput label="Description" type="text" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
                    <NeonInput label="Details" type="text" value={formDetails} onChange={(e) => setFormDetails(e.target.value)} />
                    <NeonInput
                      label={formCategory === 'project' ? 'Architecture' : 'Tags (comma sep)'}
                      type="text"
                      value={formCategory === 'project' ? formArch : formTags}
                      onChange={(e) => formCategory === 'project' ? setFormArch(e.target.value) : setFormTags(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button onClick={() => setInspectorMode('view')} className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white transition cursor-pointer font-orbitron text-[10px]">Cancel</button>
                  <button onClick={handleCreateNode} className="px-4 py-1.5 rounded-xl bg-neon-blue/80 border border-neon-blue/40 hover:bg-neon-blue text-white flex items-center gap-1.5 transition font-orbitron font-bold tracking-wider cursor-pointer text-[10px]">
                    <Plus className="w-3.5 h-3.5" />
                    Build Synapse
                  </button>
                </div>
              </motion.div>
            )}
          </GlassCard>
        </div>

        {/* ── Right Column: Operator Card & Learning Timeline ── */}
        <div className="space-y-6">
          
          {/* Operator Identity Card */}
          <GlassCard className="border-white/5 relative overflow-hidden" hover={false}>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-blue/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-neon-purple/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-start mb-5 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/25 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.15)]">
                  <User className="text-neon-blue w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-xs tracking-widest text-white uppercase">Operator Profile</h3>
                  <span className="text-[9px] font-mono text-neon-blue/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse inline-block" />
                    Cognitive Uplink Stable
                  </span>
                </div>
              </div>
              <button
                onClick={handleSummarizeIdentity}
                disabled={isSummarizing}
                className="text-[9px] font-mono text-neon-blue border border-neon-blue/25 bg-neon-blue/5 px-2.5 py-1.5 rounded-lg hover:bg-neon-blue/15 hover:border-neon-blue/50 transition flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className={`w-3 h-3 ${isSummarizing ? 'animate-spin' : ''}`} />
                {isSummarizing ? 'Synthesizing...' : 'Synthesize'}
              </button>
            </div>

            {/* Profile fields */}
            <div className="space-y-0 font-mono text-xs relative z-10">
              {[
                { label: 'OPERATOR', value: 'Haris Khan', color: '#00F0FF' },
                { label: 'ROLE', value: 'Full Stack Developer', color: '#BE5CF6' },
                { label: 'EDUCATION', value: 'BSCS Student', color: '#39FF14' },
                { label: 'ACADEMICS', value: 'UoBalochistan', color: '#FFCC00' },
                { label: 'CORE PROJECT', value: 'HARVOX AI OS', color: '#FF00C8' },
              ].map((row, i) => (
                <div key={i} className={`flex items-center justify-between py-2.5 ${i < 4 ? 'border-b border-white/5' : ''}`}>
                  <span className="text-gray-600 text-[9px] tracking-widest font-orbitron">{row.label}</span>
                  <span className="font-bold text-[11px]" style={{ color: row.color, textShadow: `0 0 8px ${row.color}40` }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Holographic biography block */}
            {(aiSummary || isSummarizing) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 relative z-10"
              >
                <div className="bg-[#020812] border border-neon-blue/20 rounded-xl p-4 relative overflow-hidden">
                  {/* Scanline effect */}
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,240,255,0.012)_3px,rgba(0,240,255,0.012)_6px)] pointer-events-none" />
                  <p className="text-[8px] font-orbitron text-neon-blue uppercase tracking-widest mb-2 flex items-center gap-1.5 relative z-10">
                    <Cpu className="w-3 h-3 animate-pulse" />
                    Cognitive Synthesis Stream
                    <span className="ml-auto text-[7px] text-gray-600 font-mono">v2.1.0</span>
                  </p>
                  {isSummarizing ? (
                    <div className="flex items-center gap-2 py-2 relative z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-ping" />
                      <span className="text-[9px] font-mono text-gray-500 animate-pulse">Decrypting matrix configurations...</span>
                    </div>
                  ) : (
                    <div className="relative z-10">
                      <p className="text-[10px] font-mono text-gray-300 leading-relaxed min-h-[40px] text-justify whitespace-pre-wrap">
                        {typedBio}
                        {typedBio.length < aiSummary.length && (
                          <span className="inline-block w-1.5 h-3 bg-neon-blue animate-pulse ml-0.5" />
                        )}
                      </p>
                      {typedBio.length >= aiSummary.length && (
                        <div className="flex justify-end mt-2 border-t border-white/5 pt-1.5">
                          <button onClick={() => setAiSummary('')} className="text-[8px] font-mono text-gray-600 hover:text-white cursor-pointer transition-colors">
                            Clear Stream
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </GlassCard>

          {/* AI Learning / Activity Timeline */}
          <GlassCard className="border-white/5 flex flex-col min-h-[440px] max-h-[500px]" hover={false}>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <Clock className="text-neon-purple w-4 h-4" />
                <h3 className="font-orbitron font-bold text-xs tracking-widest text-white uppercase">Synaptic Learning Feed</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="bg-black/40 border border-white/10 rounded-lg px-1.5 py-1 text-[8px] font-mono text-gray-400 hover:border-white/20 cursor-pointer focus:outline-none">
                  <option value="all">All Logs</option>
                  <option value="24h">Past 24h</option>
                  <option value="7d">Past 7d</option>
                  <option value="30d">Past 30d</option>
                </select>
                <select value={activityLimit} onChange={(e) => setActivityLimit(Number(e.target.value))} className="bg-black/40 border border-white/10 rounded-lg px-1.5 py-1 text-[8px] font-mono text-gray-400 hover:border-white/20 cursor-pointer focus:outline-none">
                  <option value={10}>10 Logs</option>
                  <option value={25}>25 Logs</option>
                  <option value={50}>50 Logs</option>
                  <option value={100}>100 Logs</option>
                </select>
              </div>
            </div>

            {/* Timeline Stream */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1.5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(138,43,226,0.3) transparent' }}>
              {pagedActivityMemories.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
                  <Activity className="w-8 h-8 text-gray-700 animate-pulse" />
                  <p className="font-orbitron text-[10px] text-gray-600 uppercase tracking-wider">No learning activities tracked yet.</p>
                </div>
              ) : (
                <>
                  {pagedActivityMemories.map((act, i) => {
                    const dateText = new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const isLast = i === pagedActivityMemories.length - 1;
                    const isEven = i % 2 === 0;
                    return (
                      <div key={act._id || i} className={`flex gap-3 relative group rounded-xl px-2 py-1.5 transition-colors ${isEven ? 'bg-white/[0.015]' : ''}`}>
                        {!isLast && <div className="absolute left-4 top-6 bottom-[-20px] w-[1px] bg-neon-purple/15" />}
                        {/* Timeline dot */}
                        <div className="w-5 h-5 rounded-full border border-neon-purple/20 bg-[#0e0c15] flex items-center justify-center z-10 shrink-0 mt-0.5 group-hover:border-neon-purple/50 transition-colors">
                          <div className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-pulse" />
                        </div>
                        <div className="space-y-1 w-full min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[9px] font-mono text-[#be5cf6] uppercase bg-[#8a2be2]/10 border border-[#8a2be2]/20 px-1.5 py-0.5 rounded leading-none truncate max-w-[100px]">{act.key}</span>
                              <span className="text-[8px] font-mono text-gray-600 shrink-0">{dateText}</span>
                            </div>
                            <button
                              onClick={async () => { if (window.confirm('Purge log element?')) { await memoryAPI.delete(act._id); await fetchBrainData(true); } }}
                              className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition text-[8px] font-mono cursor-pointer shrink-0"
                            >
                              Purge
                            </button>
                          </div>
                          <p className="text-[11px] text-gray-300 font-medium leading-relaxed font-sans line-clamp-2">
                            {act.value}
                          </p>
                          {act.metadata?.command && (
                            <div className="bg-black/40 rounded-lg border border-white/5 px-2 py-1 mt-1 font-mono text-[9px] text-gray-600 break-all">
                              CMD: {act.metadata.command}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {activityMemories.length > pagedActivityMemories.length && (
                    <div className="pt-2 text-center">
                      <button
                        onClick={() => setActivityLimit((prev) => prev + 15)}
                        className="text-[9px] font-mono px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-neon-purple/10 hover:border-neon-purple/30 rounded-xl text-gray-400 hover:text-white transition cursor-pointer"
                      >
                        Show More ({activityMemories.length - pagedActivityMemories.length} remaining)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
