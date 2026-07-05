import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Star, Zap, Brain, Code2, MessageSquare, Cpu,
  X, ChevronRight, Sparkles, Wifi, WifiOff, Clock
} from 'lucide-react';
import {
  ALL_MODELS,
  AI_PROVIDER_META,
  getModelsByProvider,
} from '../../config/aiModels';

const CATEGORIES = [
  { id: 'all', label: 'All Models', icon: Sparkles },
  { id: 'coding', label: 'Coding', icon: Code2 },
  { id: 'reasoning', label: 'Reasoning', icon: Brain },
  { id: 'general', label: 'General', icon: MessageSquare },
  { id: 'local', label: 'Local', icon: Cpu },
];

const SPEED_COLORS = {
  'Very Fast': '#00F0FF',
  'Fast': '#00ff9d',
  'Moderate': '#FFD21E',
  'Slow': '#FF6B6B',
};

const PROVIDER_BADGES = {
  groq: { label: 'Groq', color: '#FF6B35' },
  gemini: { label: 'Gemini', color: '#4285F4' },
  openrouter: { label: 'OpenRouter', color: '#8A2BE2' },
  openai: { label: 'OpenAI', color: '#10A37F' },
  ollama: { label: 'Local', color: '#FF6B35' },
  huggingface: { label: 'HF', color: '#FFD21E' },
  cerebras: { label: '⚡ Cerebras', color: '#FF6B35' },
};

function ModelCard({ model, isSelected, isFavorite, onSelect, onToggleFavorite }) {
  const providerBadge = PROVIDER_BADGES[model.provider] || { label: model.provider, color: '#888' };
  const speedColor = SPEED_COLORS[model.speed] || '#888';

  return (
    <motion.button
      whileHover={{ scale: 1.01, x: 2 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(model)}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all text-left cursor-pointer ${
        isSelected
          ? 'border-neon-blue/50 bg-neon-blue/8 shadow-[0_0_12px_rgba(0,240,255,0.12)]'
          : 'border-white/5 hover:border-white/15 bg-secondary/10 hover:bg-secondary/20'
      }`}
    >
      {/* Provider Color Dot */}
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: providerBadge.color, boxShadow: `0 0 6px ${providerBadge.color}80` }}
      />

      {/* Model Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-xs font-semibold font-mono truncate ${isSelected ? 'text-neon-blue' : 'text-white/90'}`}>
            {model.name}
          </p>
          {model.free && (
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0">
              FREE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {/* Provider badge */}
          <span
            className="text-[8px] font-bold font-mono px-1.5 py-0.5 rounded border"
            style={{
              color: providerBadge.color,
              borderColor: `${providerBadge.color}40`,
              backgroundColor: `${providerBadge.color}10`,
            }}
          >
            {providerBadge.label}
          </span>
          {/* Speed */}
          <span className="text-[9px] font-mono flex items-center gap-0.5" style={{ color: speedColor }}>
            <Zap className="w-2.5 h-2.5" />
            {model.speed}
          </span>
          {/* Cost */}
          <span className="text-[9px] font-mono text-muted/60">
            {model.costPer1M === 0 ? '$0.00/1M' : `$${model.costPer1M}/1M`}
          </span>
        </div>
      </div>

      {/* Star Favorite */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(model.id); }}
        className={`shrink-0 p-1 rounded-lg transition-all hover:scale-110 ${
          isFavorite ? 'text-yellow-400' : 'text-muted/30 hover:text-muted/60'
        }`}
      >
        <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-yellow-400' : ''}`} />
      </button>

      {/* Selected Check */}
      {isSelected && (
        <div className="w-1.5 h-1.5 rounded-full bg-neon-blue shrink-0 shadow-[0_0_5px_#00F0FF]" />
      )}
    </motion.button>
  );
}

export default function ModelSelector({
  isOpen,
  onClose,
  selectedProvider,
  selectedModel,
  onSelect,
  anchorRef,
}) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('harvox_model_favorites') || '[]');
    } catch {
      return [];
    }
  });
  const [recents, setRecents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('harvox_model_recents') || '[]');
    } catch {
      return [];
    }
  });
  const searchRef = useRef(null);
  const panelRef = useRef(null);

  // Auto-focus search when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchRef.current?.focus(), 60);
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        anchorRef?.current && !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose, anchorRef]);

  const toggleFavorite = (modelId) => {
    const next = favorites.includes(modelId)
      ? favorites.filter((f) => f !== modelId)
      : [...favorites, modelId];
    setFavorites(next);
    localStorage.setItem('harvox_model_favorites', JSON.stringify(next));
  };

  const handleSelect = (model) => {
    // Update recents
    const next = [model.id, ...recents.filter((r) => r !== model.id)].slice(0, 3);
    setRecents(next);
    localStorage.setItem('harvox_model_recents', JSON.stringify(next));

    onSelect(model.provider, model.id);
    onClose();
  };

  // Filter models
  const filteredModels = ALL_MODELS.filter((m) => {
    const matchSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase()) ||
      m.provider.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || m.category === activeCategory;
    return matchSearch && matchCat;
  });

  // Partition: favorites first, then recents (that aren't favorites), then rest
  const favoriteModels = filteredModels.filter((m) => favorites.includes(m.id));
  const recentModels = filteredModels.filter(
    (m) => !favorites.includes(m.id) && recents.includes(m.id)
  );
  const otherModels = filteredModels.filter(
    (m) => !favorites.includes(m.id) && !recents.includes(m.id)
  );

  // Auto-routing special card
  const isAutoSelected = selectedProvider === 'auto';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="absolute z-[9999] w-[380px] max-h-[560px] flex flex-col rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          style={{
            background: 'rgba(6, 6, 16, 0.97)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 0 60px rgba(0,240,255,0.08), 0 20px 60px rgba(0,0,0,0.8)',
            bottom: '100%',
            left: 0,
            marginBottom: 8,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-white/5 shrink-0">
            <div>
              <h3 className="font-orbitron text-xs font-bold tracking-widest text-neon-blue uppercase">
                Neural Model Selector
              </h3>
              <p className="text-[9px] text-muted/50 font-mono mt-0.5">
                {filteredModels.length} models • {favorites.length} favorites
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted/40 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-2 border-b border-white/5 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted/40" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search models, providers…"
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/4 border border-white/8 text-xs font-mono text-white placeholder:text-muted/30 outline-none focus:border-neon-blue/40 focus:bg-neon-blue/5 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted/30 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 px-3 py-2 border-b border-white/5 overflow-x-auto scrollbar-none shrink-0">
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold font-orbitron tracking-wider whitespace-nowrap transition-all shrink-0 ${
                  activeCategory === id
                    ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/30'
                    : 'text-muted/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-2.5 h-2.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Model List */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10">

            {/* Auto Routing Card */}
            {(activeCategory === 'all' && !search) && (
              <div>
                <p className="text-[8px] font-bold font-orbitron tracking-widest text-neon-pink/60 uppercase mb-1.5 px-0.5">
                  Smart Routing
                </p>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => { onSelect('auto', 'auto'); onClose(); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                    isAutoSelected
                      ? 'border-neon-pink/50 bg-neon-pink/8 shadow-[0_0_12px_rgba(255,0,200,0.12)]'
                      : 'border-neon-pink/15 hover:border-neon-pink/30 bg-neon-pink/5'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full shrink-0 bg-neon-pink shadow-[0_0_6px_#FF00C8]" />
                  <div className="flex-1 text-left">
                    <p className={`text-xs font-semibold font-mono ${isAutoSelected ? 'text-neon-pink' : 'text-white/90'}`}>
                      Auto Routing
                    </p>
                    <p className="text-[9px] text-muted/50 mt-0.5">AI-selected model based on your prompt</p>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-neon-pink/60 shrink-0" />
                </motion.button>
              </div>
            )}

            {/* Favorites */}
            {favoriteModels.length > 0 && (
              <div>
                <p className="text-[8px] font-bold font-orbitron tracking-widest text-yellow-400/60 uppercase mb-1.5 px-0.5 flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" /> Favorites
                </p>
                <div className="space-y-1">
                  {favoriteModels.map((m) => (
                    <ModelCard
                      key={m.id}
                      model={m}
                      isSelected={selectedModel === m.id}
                      isFavorite={true}
                      onSelect={handleSelect}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recents */}
            {recentModels.length > 0 && (
              <div>
                <p className="text-[8px] font-bold font-orbitron tracking-widest text-muted/50 uppercase mb-1.5 px-0.5 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> Recent
                </p>
                <div className="space-y-1">
                  {recentModels.map((m) => (
                    <ModelCard
                      key={m.id}
                      model={m}
                      isSelected={selectedModel === m.id}
                      isFavorite={false}
                      onSelect={handleSelect}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All / Filtered */}
            {otherModels.length > 0 && (
              <div>
                {(favoriteModels.length > 0 || recentModels.length > 0) && (
                  <p className="text-[8px] font-bold font-orbitron tracking-widest text-muted/40 uppercase mb-1.5 px-0.5">
                    All Models
                  </p>
                )}
                <div className="space-y-1">
                  {otherModels.map((m) => (
                    <ModelCard
                      key={m.id}
                      model={m}
                      isSelected={selectedModel === m.id}
                      isFavorite={favorites.includes(m.id)}
                      onSelect={handleSelect}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredModels.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Search className="w-6 h-6 text-muted/20 mb-2" />
                <p className="text-xs text-muted/40 font-mono">No models found</p>
                <p className="text-[9px] text-muted/25 mt-1">Try a different search term</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-white/5 shrink-0">
            <p className="text-[8px] font-mono text-muted/30 text-center">
              ★ to pin favorites • Models without keys will use system defaults
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
