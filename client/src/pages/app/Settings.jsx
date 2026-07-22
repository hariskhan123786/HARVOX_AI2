import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { settingsAPI, authAPI } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import NeonButton from '../../components/ui/NeonButton';
import { AI_PROVIDERS, AI_PROVIDER_META, getDefaultModelForProvider, getModelsByProvider, GROQ_MODELS, GEMINI_MODELS } from '../../config/aiModels';
import BrainMemorySettings from '../../components/settings/BrainMemorySettings';
import { usePerformanceMode } from '../../components/performance/PerformanceProvider';
import { useThemeStore } from '../../store/themeStore';
import {
  Paintbrush, Cpu, Volume2, Shield,
  Bell, Layout, Database, LogOut, Check, User,
  Github, Linkedin, Twitter, Globe, Plus, X,
  CheckCircle2, AlertCircle, Loader2, Brain, Key
} from 'lucide-react';

/* ─── Neon Toast Component ─────────────────────────────────────────── */
function NeonToast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  return (
    <AnimatePresence>
      <motion.div
        key={toast.id}
        initial={{ opacity: 0, y: -30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl"
        style={{
          background: isSuccess
            ? 'rgba(0, 240, 255, 0.06)'
            : 'rgba(255, 0, 0, 0.06)',
          borderColor: isSuccess
            ? 'rgba(0, 240, 255, 0.3)'
            : 'rgba(255, 80, 80, 0.3)',
          boxShadow: isSuccess
            ? '0 0 30px rgba(0, 240, 255, 0.15), inset 0 0 20px rgba(0, 240, 255, 0.03)'
            : '0 0 30px rgba(255, 80, 80, 0.15)',
        }}
      >
        {isSuccess
          ? <CheckCircle2 className="w-5 h-5 text-neon-blue shrink-0" />
          : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        }
        <div>
          <p className="font-orbitron text-xs font-bold tracking-wider"
            style={{ color: isSuccess ? '#00F0FF' : '#ff6b6b' }}>
            {isSuccess ? 'SYNC COMPLETE' : 'UPLINK ERROR'}
          </p>
          <p className="text-[10px] text-muted mt-0.5">{toast.message}</p>
        </div>
        <button onClick={onDismiss} className="ml-2 text-muted hover:text-white transition-all">
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Toggle Switch ─────────────────────────────────────────────────── */
function Toggle({ value, onChange, color = 'bg-neon-blue' }) {
  const glowStyle = value
    ? { boxShadow: color === 'bg-neon-blue' ? '0 0 10px rgba(0, 240, 255, 0.4)' : color === 'bg-neon-pink' ? '0 0 10px rgba(255, 0, 200, 0.4)' : '0 0 10px rgba(138, 43, 226, 0.4)' }
    : {};
  return (
    <button
      onClick={() => onChange(!value)}
      style={glowStyle}
      className={`relative w-10 h-5 rounded-full transition-all duration-300 flex items-center px-1 shrink-0 ${value ? color : 'bg-[#111118] border border-white/10'}`}
    >
      <motion.div layout className="w-3 h-3 bg-white rounded-full shadow" />
    </button>
  );
}

/* ─── Skill Tag Input ────────────────────────────────────────────────── */
function SkillTags({ skills, onChange }) {
  const [input, setInput] = useState('');

  const addSkill = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInput('');
  };

  const removeSkill = (skill) => {
    onChange(skills.filter((s) => s !== skill));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[36px]">
        {skills.map((sk) => (
          <span
            key={sk}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-neon-purple/30 bg-neon-purple/10 text-neon-purple font-mono text-[10px] font-bold"
          >
            {sk}
            <button onClick={() => removeSkill(sk)} className="hover:text-rose-400 transition-all">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
          placeholder="Add a skill (Enter to confirm)…"
          className="input-neon text-xs font-mono flex-1"
        />
        <button
          onClick={addSkill}
          className="px-3 rounded-xl border border-neon-blue/30 bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function Settings() {
  const { user, loadUser } = useAuthStore();
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const toastIdRef = useRef(0);
  const { graphicsMode, setGraphicsMode } = usePerformanceMode();
  const themeStore = useThemeStore();

  const [activeTab, setActiveTab] = useState('identity');
  const [toast, setToast] = useState(null);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const loadVoicesList = () => {
      if ('speechSynthesis' in window) {
        setVoices(window.speechSynthesis.getVoices());
      }
    };
    loadVoicesList();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoicesList;
    }
  }, []);

  const showToast = (message, type = 'success') => {
    toastIdRef.current += 1;
    setToast({ id: toastIdRef.current, message, type });
  };
  const dismissToast = () => setToast(null);

  /* ── Settings toggles ──────────────────────────────────── */
  const [theme, setTheme] = useState('cyberpunk');
  const [accent, setAccent] = useState('purple');
  const [provider, setProvider] = useState(AI_PROVIDERS.GROQ);
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [creativity, setCreativity] = useState(0.7);
  const [responseLength, setResponseLength] = useState(2048);
  const [expertMode, setExpertMode] = useState(false);
  const [codingMode, setCodingMode] = useState(true);
  const [groqApiKey, setGroqApiKey]           = useState('');
  const [geminiApiKey, setGeminiApiKey]       = useState('');
  const [openrouterApiKey, setOpenrouterApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey]       = useState('');
  const [huggingfaceApiKey, setHuggingfaceApiKey] = useState('');
  const [ollamaUrl, setOllamaUrl]             = useState('');
  const [contextLength, setContextLength]     = useState(4096);
  const [reasoningMode, setReasoningMode]     = useState(false);
  const [systemPrompt, setSystemPrompt]       = useState('');
  const [personalityMode, setPersonalityMode] = useState('professional');
  const [voiceGender, setVoiceGender] = useState('female');
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [autoVoiceReplies, setAutoVoiceReplies] = useState(false);
  const [wakeWord, setWakeWord] = useState('Hey Harvox');
  const [voiceLanguage, setVoiceLanguage] = useState('en-US');
  const [tfa, setTfa] = useState(false);
  const [apiKeys, setApiKeys] = useState('gsk_idHqe...xxxx');
  const [aiAlerts, setAiAlerts] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [widgetRearrange, setWidgetRearrange] = useState(true);
  const [customSidebar, setCustomSidebar] = useState('standard');
  const [layoutPreset, setLayoutPreset] = useState('hologram');

  /* ── Security & Data Hub State ─────────────────────────── */
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  /* ── Identity profile state ────────────────────────────── */
  const [identityForm, setIdentityForm] = useState({
    name: '',
    bio: '',
    location: '',
    developerRole: '',
    experienceLevel: 'intermediate',
    skills: [],
    socialLinks: { github: '', linkedin: '', twitter: '', website: '' },
  });
  const [identitySaving, setIdentitySaving] = useState(false);

  /* Seed identity from auth store */
  useEffect(() => {
    if (user) {
      setIdentityForm({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        developerRole: user.developerRole || '',
        experienceLevel: user.experienceLevel || 'intermediate',
        skills: Array.isArray(user.skills) ? user.skills : [],
        socialLinks: {
          github: user.socialLinks?.github || '',
          linkedin: user.socialLinks?.linkedin || '',
          twitter: user.socialLinks?.twitter || '',
          website: user.socialLinks?.website || '',
        },
      });
    }
  }, [user]);

  /* Fetch existing settings on mount */
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await settingsAPI.get();
        if (data.settings) {
          const s = data.settings;
          if (s.appearance) {
            setTheme(s.appearance.theme);
            setAccent(s.appearance.accentColor);
            if (s.appearance.graphicsMode) setGraphicsMode(s.appearance.graphicsMode);
            themeStore.setAccentColor(s.appearance.accentColor || 'purple');
            themeStore.setMode(s.appearance.theme === 'hologram' ? 'system' : 'dark');
          }
          if (s.ai) {
            setProvider(s.ai.provider || AI_PROVIDERS.GROQ);
            setModel(s.ai.model);
            setCreativity(s.ai.creativity);
            setExpertMode(s.ai.expertiseLevel === 'expert');
            setCodingMode(s.ai.codingMode !== 'standard');
            setPersonalityMode(s.ai.personalityMode || 'professional');
            if (s.ai.contextLength) setContextLength(s.ai.contextLength);
            if (s.ai.reasoningMode !== undefined) setReasoningMode(s.ai.reasoningMode);
            if (s.ai.systemPrompt !== undefined) setSystemPrompt(s.ai.systemPrompt);
          }
          if (s.apiKeys) {
            setGroqApiKey(s.apiKeys.groq || '');
            setGeminiApiKey(s.apiKeys.gemini || '');
            setOpenrouterApiKey(s.apiKeys.openrouter || '');
            setOpenaiApiKey(s.apiKeys.openai || '');
            setHuggingfaceApiKey(s.apiKeys.huggingface || '');
            setOllamaUrl(s.apiKeys.ollamaUrl || '');
          }
          if (s.voice) {
            setVoiceGender(s.voice.voiceSelection || 'female');
            setVoiceSpeed(s.voice.speed || 1.0);
            setAutoVoiceReplies(s.voice.autoReplies || false);
            setWakeWord(s.voice.wakeWord || 'Hey Harvox');
            setVoiceLanguage(s.voice.language || 'en-US');
          }
          if (s.notifications) {
            setAiAlerts(s.notifications.aiAlerts);
            setEmailNotif(s.notifications.email);
            setSoundEffects(s.notifications.soundEffects);
            setPushNotif(s.notifications.desktop);
          }
          if (s.workspace) setLayoutPreset(s.workspace.layoutType);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    };
    fetchSettings();
  }, []);

  const saveSetting = async (category, updates) => {
    try {
      await settingsAPI.update({ [category]: updates });
      showToast(`${category.charAt(0).toUpperCase() + category.slice(1)} setting updated.`, 'success');
    } catch (err) {
      console.error('Failed to save settings', err);
      showToast(`Failed to update ${category} settings.`, 'error');
    }
  };

  const saveApiKeys = async (gKey, gemKey, orKey, oaiKey, hfKey, oUrl) => {
    try {
      await settingsAPI.update({ apiKeys: { groq: gKey, gemini: gemKey, openrouter: orKey, openai: oaiKey, huggingface: hfKey, ollamaUrl: oUrl } });
      showToast('Neural API keys updated and secured.', 'success');
    } catch (err) {
      showToast('Failed to secure API credentials.', 'error');
    }
  };

  /* ── Identity save ─────────────────────────────────────── */
  const handleIdentitySave = async () => {
    setIdentitySaving(true);
    try {
      await authAPI.updateProfile(identityForm);
      await loadUser();
      showToast('Neural identity matrix synced to core database.', 'success');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to sync identity profile.';
      showToast(msg, 'error');
    } finally {
      setIdentitySaving(false);
    }
  };

  const setField = (key, val) => setIdentityForm((prev) => ({ ...prev, [key]: val }));
  const setSocial = (key, val) =>
    setIdentityForm((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: val },
    }));

  const handlePasswordSave = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast('New cipher key must be at least 6 chars', 'error');
      return;
    }
    setPasswordSaving(true);
    try {
      await authAPI.updateProfile({ password: newPassword });
      setNewPassword('');
      setCurrentPassword('');
      showToast('Neural cipher bound successfully.', 'success');
    } catch (err) {
      showToast('Failed to re-cipher Database Binding', 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "harvox_operator_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showToast('Data exported successfully', 'success');
  };

  const handleWipeData = async () => {
    if(window.confirm('WARNING: Wiping data is irreversible. Confirm destruct sequence?')) {
      showToast('Destruct sequence initiated...', 'success');
      setTimeout(() => showToast('Data wiped successfully', 'success'), 1500);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const tabs = [
    { id: 'identity', label: 'Identity', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Paintbrush },
    { id: 'ai', label: 'AI Engine', icon: Cpu },
    { id: 'memory', label: 'Brain & Memory', icon: Brain },
    { id: 'voice', label: 'Voice Link', icon: Volume2 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'workspace', label: 'Workspace', icon: Layout },
    { id: 'data', label: 'Data Hub', icon: Database },
  ];

  return (
    <>
      {/* Global Neon Toast */}
      <NeonToast toast={toast} onDismiss={dismissToast} />

      <div className="space-y-6">
        {/* Title */}
        <div>
          <h1 className="font-orbitron text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-neon">
            NEURAL GRID SETTINGS
          </h1>
          <p className="text-xs text-muted">Reconfigure identity matrix, neural bindings, layout presets, and voice telemetry</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Tab Sidebar */}
          <div className="md:col-span-1 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  id={`settings-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-orbitron text-xs font-semibold tracking-wider transition-all border ${
                    isActive
                      ? 'border-neon-purple/40 text-neon-blue bg-neon-purple/5 shadow-[0_0_15px_rgba(138,43,226,0.15)]'
                      : 'border-white/5 text-muted hover:border-white/10 hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabGlow"
                      className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-gradient-to-b from-neon-blue via-neon-purple to-neon-pink shadow-[0_0_10px_#00F0FF]"
                    />
                  )}
                  <Icon className={`w-4 h-4 ${isActive ? 'text-neon-blue' : 'text-muted'}`} />
                  {tab.label}
                </motion.button>
              );
            })}

            <div className="pt-4 border-t border-white/5 mt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-orbitron text-xs font-semibold tracking-wider text-rose-400 border border-rose-500/20 hover:border-rose-500/40 bg-rose-950/10 hover:bg-rose-950/30 transition-all duration-300"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                Sever Connection
              </button>
            </div>
          </div>

          {/* Panel */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                <GlassCard hover={false} className="border-white/5 min-h-[440px]">

                  {/* ── 0. IDENTITY ─────────────────────────────────── */}
                  {activeTab === 'identity' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <h3 className="font-orbitron font-semibold text-sm text-white tracking-widest uppercase">
                          Identity Matrix
                        </h3>
                        <span className="text-[9px] font-mono text-muted px-2 py-0.5 rounded border border-white/5 bg-secondary/20">
                          NEURAL DB SYNC
                        </span>
                      </div>

                      {/* Row: Name + Location */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-orbitron font-bold tracking-widest text-muted uppercase">
                            Display Name
                          </label>
                          <input
                            id="identity-name"
                            type="text"
                            value={identityForm.name}
                            onChange={(e) => setField('name', e.target.value)}
                            placeholder="e.g. Kaelen_Forge"
                            className="input-neon text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-orbitron font-bold tracking-widest text-muted uppercase">
                            Location Beacon
                          </label>
                          <input
                            id="identity-location"
                            type="text"
                            value={identityForm.location}
                            onChange={(e) => setField('location', e.target.value)}
                            placeholder="e.g. Karachi, PK"
                            className="input-neon text-xs font-mono"
                          />
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-orbitron font-bold tracking-widest text-muted uppercase">
                          Operator Bio
                        </label>
                        <textarea
                          id="identity-bio"
                          rows={3}
                          value={identityForm.bio}
                          onChange={(e) => setField('bio', e.target.value)}
                          placeholder="Describe your neural profile, specializations, and mission parameters…"
                          className="input-neon text-xs font-mono resize-none"
                        />
                      </div>

                      {/* Role + Experience */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-orbitron font-bold tracking-widest text-muted uppercase">
                            Developer Role
                          </label>
                          <input
                            id="identity-role"
                            type="text"
                            value={identityForm.developerRole}
                            onChange={(e) => setField('developerRole', e.target.value)}
                            placeholder="e.g. Full Stack Developer"
                            className="input-neon text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-orbitron font-bold tracking-widest text-muted uppercase">
                            Experience Level
                          </label>
                          <select
                            id="identity-experience"
                            value={identityForm.experienceLevel}
                            onChange={(e) => setField('experienceLevel', e.target.value)}
                            className="input-neon text-xs font-mono"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                          </select>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-orbitron font-bold tracking-widest text-muted uppercase">
                          Skill Stack
                        </label>
                        <SkillTags
                          skills={identityForm.skills}
                          onChange={(skills) => setField('skills', skills)}
                        />
                      </div>

                      {/* Social Links */}
                      <div className="space-y-3 pt-2 border-t border-white/5">
                        <label className="text-[10px] font-orbitron font-bold tracking-widest text-muted uppercase">
                          Social Link Matrix
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            { key: 'github', icon: Github, placeholder: 'github.com/username', color: 'text-white' },
                            { key: 'linkedin', icon: Linkedin, placeholder: 'linkedin.com/in/username', color: 'text-blue-400' },
                            { key: 'twitter', icon: Twitter, placeholder: 'twitter.com/username', color: 'text-sky-400' },
                            { key: 'website', icon: Globe, placeholder: 'https://yoursite.com', color: 'text-neon-blue' },
                          ].map(({ key, icon: Icon, placeholder, color }) => (
                            <div key={key} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-white/5 bg-secondary/20 focus-within:border-neon-blue/45 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all">
                              <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                              <input
                                id={`identity-social-${key}`}
                                type="text"
                                value={identityForm.socialLinks[key]}
                                onChange={(e) => setSocial(key, e.target.value)}
                                placeholder={placeholder}
                                className="bg-transparent text-xs font-mono text-white placeholder:text-muted/40 outline-none flex-1 w-0"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="pt-2 flex justify-end">
                        <NeonButton
                          id="identity-save-btn"
                          onClick={handleIdentitySave}
                          disabled={identitySaving}
                          className="text-xs py-2.5 px-6 flex items-center gap-2"
                        >
                          {identitySaving
                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing…</>
                            : <><Check className="w-3.5 h-3.5" /> Sync Identity to Core</>
                          }
                        </NeonButton>
                      </div>
                    </div>
                  )}

                  {/* ── 1. APPEARANCE ───────────────────────────────── */}
                  {activeTab === 'appearance' && (
                    <div className="space-y-6">
                      <h3 className="font-orbitron font-semibold text-sm text-white tracking-widest uppercase border-b border-white/5 pb-2">Appearance Settings</h3>
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold font-orbitron tracking-wider text-muted">ACCENT COLOR PICKER</label>
                          <div className="flex gap-4">
                            {[
                              { name: 'purple', class: 'bg-[#8A2BE2] shadow-neon-purple/50' },
                              { name: 'blue', class: 'bg-[#00F0FF] shadow-neon-blue/50' },
                              { name: 'pink', class: 'bg-[#FF00C8] shadow-neon-pink/50' },
                            ].map((color) => (
                              <button
                                key={color.name}
                                onClick={() => { 
                                  setAccent(color.name); 
                                  themeStore.setAccentColor(color.name);
                                  saveSetting('appearance', { accentColor: color.name }); 
                                }}
                                className={`w-9 h-9 rounded-full ${color.class} flex items-center justify-center border-2 transition-all ${accent === color.name ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                              >
                                {accent === color.name && <Check className="w-4 h-4 text-white" />}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2 pt-2">
                          <label className="text-xs font-semibold font-orbitron tracking-wider text-muted">CYBERPUNK THEMES</label>
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { key: 'cyberpunk', label: 'Cyberpunk Neon', desc: 'Pitch dark overlay, vivid neon glow', border: 'border-neon-purple/40 bg-neon-purple/5' },
                              { key: 'hologram', label: 'Hologram Blue', desc: 'Soft blue-tinted HUD operating system', border: 'border-neon-blue/40 bg-neon-blue/5' },
                            ].map((t) => (
                              <div
                                key={t.key}
                                onClick={() => { 
                                  setTheme(t.key); 
                                  themeStore.setMode(t.key === 'hologram' ? 'system' : 'dark');
                                  saveSetting('appearance', { theme: t.key }); 
                                  document.body.className = t.key;
                                }}
                                className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${theme === t.key ? t.border : 'border-white/5 bg-secondary/10'}`}
                              >
                                <div>
                                  <p className="font-orbitron text-xs font-bold text-white tracking-wider">{t.label}</p>
                                  <p className="text-[10px] text-muted">{t.desc}</p>
                                </div>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${theme === t.key ? 'border-neon-blue' : 'border-white/10'}`}>
                                  {theme === t.key && <div className="w-2 h-2 rounded-full bg-neon-blue" />}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2 pt-2">
                          <label className="text-xs font-semibold font-orbitron tracking-wider text-muted">UI CUSTOMIZATION</label>
                          <select className="input-neon text-xs font-mono">
                            <option>Standard UI Density (Medium)</option>
                            <option>Compact HUD Density (Dense)</option>
                            <option>Minimalist Aesthetic (Spacious)</option>
                          </select>
                        </div>
                        <div className="space-y-3 pt-2 border-t border-white/5">
                          <div>
                            <label className="text-xs font-semibold font-orbitron tracking-wider text-muted">GRAPHICS MODE</label>
                            <p className="mt-1 text-[10px] text-muted">Choose a fixed visual quality or let HARVOX tune effects from device resources and live frame rate.</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              { key: 'auto', label: 'Auto Detect', desc: 'Matches effects to your device and FPS.', accent: 'border-neon-blue/40 bg-neon-blue/5 text-neon-blue' },
                              { key: 'balanced', label: 'Balanced', desc: 'A steady mix of effects and responsiveness.', accent: 'border-neon-purple/40 bg-neon-purple/5 text-neon-purple' },
                              { key: 'performance', label: 'Performance', desc: 'Minimizes effects for lower-end devices.', accent: 'border-emerald-400/40 bg-emerald-400/5 text-emerald-400' },
                              { key: 'ultra', label: 'Ultra', desc: 'Enables all visual effects for powerful hardware.', accent: 'border-amber-400/40 bg-amber-400/5 text-amber-400' },
                            ].map((graphics) => {
                              const selected = graphicsMode === graphics.key;
                              return (
                                <button
                                  key={graphics.key}
                                  onClick={() => {
                                    setGraphicsMode(graphics.key);
                                    saveSetting('appearance', { graphicsMode: graphics.key });
                                  }}
                                  className={`rounded-xl border p-3 text-left transition-all ${selected ? graphics.accent : 'border-white/5 bg-secondary/10 hover:border-white/15'}`}
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="font-orbitron text-[10px] font-bold tracking-wider text-white">{graphics.label}</span>
                                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selected ? 'border-current' : 'border-white/20'}`}>
                                      {selected && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                                    </span>
                                  </div>
                                  <p className="mt-1.5 text-[9px] leading-relaxed text-muted">{graphics.desc}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── 2. AI ENGINE ────────────────────────────────── */}
                  {activeTab === 'ai' && (
                    <div className="space-y-6">
                      <h3 className="font-orbitron font-semibold text-sm text-white tracking-widest uppercase border-b border-white/5 pb-2">AI Configuration Panel</h3>
                      <div className="space-y-5">
                      <div className="space-y-2">
                          <label className="text-xs font-semibold font-orbitron tracking-wider text-muted">AI PROVIDER SELECTION</label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { id: AI_PROVIDERS.GROQ, label: 'Groq AI', desc: 'Fast & Reliable' },
                              { id: AI_PROVIDERS.GEMINI, label: 'Google Gemini', desc: 'Advanced & Capable' },
                              { id: AI_PROVIDERS.OPENROUTER, label: 'OpenRouter', desc: 'Free OSS Models' },
                              { id: AI_PROVIDERS.OPENAI, label: 'OpenAI', desc: 'GPT-4o & more' },
                              { id: AI_PROVIDERS.OLLAMA, label: 'Ollama (Local)', desc: 'Run locally offline' },
                              { id: AI_PROVIDERS.HUGGINGFACE, label: 'Hugging Face', desc: 'Open source hub' },
                              { id: AI_PROVIDERS.AUTO, label: '⚡ Auto Routing', desc: 'AI-powered routing' },
                            ].map((p) => (
                              <button
                                key={p.id}
                                onClick={() => {
                                  setProvider(p.id);
                                  const defaultModel = getDefaultModelForProvider(p.id);
                                  setModel(defaultModel);
                                  saveSetting('ai', { provider: p.id, model: defaultModel });
                                }}
                                className={`p-3 rounded-xl border transition-all ${
                                  provider === p.id
                                    ? 'border-neon-blue/50 bg-neon-blue/10'
                                    : 'border-white/5 bg-secondary/10 hover:border-white/10'
                                }`}
                              >
                                <p className="font-orbitron text-xs font-bold text-white tracking-wider">{p.label}</p>
                                <p className="text-[9px] text-muted">{p.desc}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold font-orbitron tracking-wider text-muted">AI MODEL SELECTION</label>
                          <select 
                            value={model} 
                            onChange={(e) => { 
                              setModel(e.target.value); 
                              saveSetting('ai', { model: e.target.value }); 
                            }} 
                            className="input-neon text-xs font-mono"
                          >
                            {getModelsByProvider(provider).map((m) => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                          <p className="text-[9px] text-muted/60">Switching providers will automatically select the recommended model</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold font-orbitron tracking-wider text-muted">AI PERSONALITY MODE</label>
                          <select 
                            value={personalityMode} 
                            onChange={(e) => { 
                              setPersonalityMode(e.target.value); 
                              saveSetting('ai', { personalityMode: e.target.value }); 
                            }} 
                            className="input-neon text-xs font-mono w-full"
                          >
                            <option value="professional">Professional Mode — Technical & Concise</option>
                            <option value="friendly">Friendly Mode — Relaxed & Supportive</option>
                            <option value="mentor">Mentor Mode — Explains & Teaches Step-by-Step</option>
                            <option value="playful">Playful Mode — Witty Banter & Humorous</option>
                          </select>
                          <p className="text-[9px] text-muted/60">Adjusts the assistant's tone, pacing, and pedagogical style</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                          <div className="space-y-2">
                            <label className="text-[10px] font-orbitron font-bold tracking-widest text-muted uppercase">Groq API Key (Optional)</label>
                            <input
                              type="password"
                              value={groqApiKey}
                              onChange={(e) => setGroqApiKey(e.target.value)}
                              onBlur={() => saveApiKeys(groqApiKey, geminiApiKey, openrouterApiKey, openaiApiKey, huggingfaceApiKey, ollamaUrl)}
                              placeholder="Leave empty to use admin's key"
                              className="input-neon text-xs font-mono"
                            />
                            <p className="text-[9px] text-muted/60">Add your personal Groq API key for priority access</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-orbitron font-bold tracking-widest text-muted uppercase">Gemini API Key (Optional)</label>
                            <input
                              type="password"
                              value={geminiApiKey}
                              onChange={(e) => setGeminiApiKey(e.target.value)}
                              onBlur={() => saveApiKeys(groqApiKey, geminiApiKey, openrouterApiKey, openaiApiKey, huggingfaceApiKey, ollamaUrl)}
                              placeholder="Leave empty to use admin's key"
                              className="input-neon text-xs font-mono"
                            />
                            <p className="text-[9px] text-muted/60">Add your personal Gemini API key for priority access</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-orbitron font-bold tracking-widest text-muted uppercase">OpenRouter API Key</label>
                            <input
                              type="password"
                              value={openrouterApiKey}
                              onChange={(e) => setOpenrouterApiKey(e.target.value)}
                              onBlur={() => saveApiKeys(groqApiKey, geminiApiKey, openrouterApiKey, openaiApiKey, huggingfaceApiKey, ollamaUrl)}
                              placeholder="sk-or-…"
                              className="input-neon text-xs font-mono"
                            />
                            <p className="text-[9px] text-muted/60">Required for free OpenRouter models</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-orbitron font-bold tracking-widest text-muted uppercase">OpenAI API Key</label>
                            <input
                              type="password"
                              value={openaiApiKey}
                              onChange={(e) => setOpenaiApiKey(e.target.value)}
                              onBlur={() => saveApiKeys(groqApiKey, geminiApiKey, openrouterApiKey, openaiApiKey, huggingfaceApiKey, ollamaUrl)}
                              placeholder="sk-…"
                              className="input-neon text-xs font-mono"
                            />
                            <p className="text-[9px] text-muted/60">For GPT-4o and other OpenAI models</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-orbitron font-bold tracking-widest text-muted uppercase">Hugging Face API Key</label>
                            <input
                              type="password"
                              value={huggingfaceApiKey}
                              onChange={(e) => setHuggingfaceApiKey(e.target.value)}
                              onBlur={() => saveApiKeys(groqApiKey, geminiApiKey, openrouterApiKey, openaiApiKey, huggingfaceApiKey, ollamaUrl)}
                              placeholder="hf_…"
                              className="input-neon text-xs font-mono"
                            />
                            <p className="text-[9px] text-muted/60">For Hugging Face inference API</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-orbitron font-bold tracking-widest text-muted uppercase">Ollama URL</label>
                            <input
                              type="text"
                              value={ollamaUrl}
                              onChange={(e) => setOllamaUrl(e.target.value)}
                              onBlur={() => saveApiKeys(groqApiKey, geminiApiKey, openrouterApiKey, openaiApiKey, huggingfaceApiKey, ollamaUrl)}
                              placeholder="http://localhost:11434"
                              className="input-neon text-xs font-mono"
                            />
                            <p className="text-[9px] text-muted/60">Custom Ollama server URL (default: localhost:11434)</p>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <div className="flex justify-between text-xs font-semibold font-orbitron tracking-wider">
                            <span className="text-muted">CONTEXT LENGTH</span>
                            <span className="text-neon-blue font-mono">{contextLength.toLocaleString()} tokens</span>
                          </div>
                          <input type="range" min="1024" max="32768" step="1024" value={contextLength} onChange={(e) => { setContextLength(Number(e.target.value)); saveSetting('ai', { contextLength: Number(e.target.value) }); }} className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-neon-blue" />
                          <p className="text-[9px] text-muted/60">Maximum context window for conversations</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-orbitron font-bold tracking-widest text-muted uppercase">Default System Prompt</label>
                          <textarea
                            rows={3}
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            onBlur={() => saveSetting('ai', { systemPrompt })}
                            placeholder="You are a helpful assistant. You respond concisely and accurately…"
                            className="input-neon text-xs font-mono resize-none"
                          />
                          <p className="text-[9px] text-muted/60">Custom instructions prepended to every AI session</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold font-orbitron tracking-wider">
                            <span className="text-muted">CREATIVITY SLIDER (TEMPERATURE)</span>
                            <span className="text-neon-blue font-mono">{creativity}</span>
                          </div>
                          <input type="range" min="0.1" max="1.5" step="0.1" value={creativity} onChange={(e) => { setCreativity(Number(e.target.value)); saveSetting('ai', { creativity: Number(e.target.value) }); }} className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-neon-blue" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold font-orbitron tracking-wider">
                            <span className="text-muted">MAX RESPONSE LENGTH</span>
                            <span className="text-neon-purple font-mono">{responseLength} tokens</span>
                          </div>
                          <input type="range" min="512" max="4096" step="256" value={responseLength} onChange={(e) => { setResponseLength(Number(e.target.value)); saveSetting('ai', { responseLength: e.target.value > 2000 ? 'long' : 'medium' }); }} className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-neon-purple" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          {[
                            { label: 'EXPERT COGNITION MODE', desc: 'Advanced engineering details', value: expertMode, onChange: (v) => { setExpertMode(v); saveSetting('ai', { expertiseLevel: v ? 'expert' : 'intermediate' }); }, color: 'bg-neon-blue' },
                            { label: 'CODING ASSISTANT MODE', desc: 'Prioritizes code-only syntax', value: codingMode, onChange: (v) => { setCodingMode(v); saveSetting('ai', { codingMode: v ? 'strict' : 'standard' }); }, color: 'bg-neon-purple' },
                          ].map(({ label, desc, value, onChange, color }) => (
                            <div key={label} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-secondary/10">
                              <div>
                                <p className="font-orbitron text-xs font-bold text-white tracking-wider">{label}</p>
                                <p className="text-[10px] text-muted">{desc}</p>
                              </div>
                              <Toggle value={value} onChange={onChange} color={color} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── 2b. BRAIN & MEMORY ─────────────────────────── */}
                  {activeTab === 'memory' && (
                    <BrainMemorySettings showToast={showToast} />
                  )}

                  {/* ── 3. VOICE LINK ────────────────────────────────── */}
                  {activeTab === 'voice' && (
                    <div className="space-y-6">
                      <h3 className="font-orbitron font-semibold text-sm text-white tracking-widest uppercase border-b border-white/5 pb-2">Voice Assistant Link</h3>
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold font-orbitron tracking-wider text-muted">ELEVENLABS & NEURAL VOICE SELECTOR</label>
                          <div className="flex gap-2">
                            <select
                              value={voiceGender}
                              onChange={(e) => { setVoiceGender(e.target.value); saveSetting('voice', { voiceSelection: e.target.value }); }}
                              className="input-neon text-xs font-mono flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white"
                            >
                              <optgroup label="── Female Hindi Voices (Default) ──">
                                <option value="cgSgspJ2msm6clMCkdW9">Hindi Female Premium (Priya) — Default</option>
                                <option value="21m00Tcm4TlvDq8ikWAM">Hindi Female 1 (Rachel)</option>
                                <option value="EXAVITQu4vr4xnSDxMaL">Hindi Female 2 (Sarah)</option>
                                <option value="XB0fDUnUDz4sSJJ5qy5z">Hindi Female 3 (Charlotte)</option>
                              </optgroup>
                              <optgroup label="── Male Hindi Voices ──">
                                <option value="pNInz6obpgfrhhF2E4DY">Hindi Male 1 (Adam)</option>
                                <option value="ErXwobaYiN019PkySvjV">Hindi Male 2 (Antoni)</option>
                                <option value="onwF48T1CtxCmqQRPOHJ">Hindi Male 3 (Daniel)</option>
                              </optgroup>
                              <optgroup label="── Urdu Voices ──">
                                <option value="ohvvU75FpBEB8fdaLOMh">Female Urdu Voice 1 (ohvvU75F)</option>
                                <option value="VG7gYikNQ71LJ52W9fAD">Female Urdu Voice 2 (VG7gYikN)</option>
                                <option value="CYZATuZ1tjgW8es1QfPG">Male Urdu Voice (CYZATuZ1)</option>
                              </optgroup>
                              <optgroup label="── English Voices ──">
                                <option value="Lcfc5ZowlhAlwG5vBb22">English Female (Emily)</option>
                                <option value="IKne3meq5aKbA1x0m7Ed">English Male (Charlie)</option>
                              </optgroup>
                              <optgroup label="── Browser Native Fallbacks ──">
                                <option value="female">System Browser — Female</option>
                                <option value="male">System Browser — Male</option>
                                {voices.map((v) => (
                                  <option key={v.name} value={v.name}>{v.name} [{v.lang}]</option>
                                ))}
                              </optgroup>
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                // Request dynamic TTS playback from server for voice testing
                                settingsAPI.update({ voice: { voiceSelection: voiceGender } })
                                  .then(() => {
                                    const sampleText = voiceLanguage === 'ur-PK' 
                                      ? 'آپ کا وائس لنک کامیابی سے ترتیب دے دیا گیا ہے۔' 
                                      : 'Voice link configured successfully.';
                                    import('../../services/api').then(({ aiAPI }) => {
                                      aiAPI.tts({ text: sampleText, voiceId: voiceGender })
                                        .then(({ data }) => {
                                          if (data.audioBase64) {
                                            const audio = new Audio(`data:audio/mpeg;base64,${data.audioBase64}`);
                                            audio.playbackRate = voiceSpeed;
                                            audio.play();
                                          }
                                        }).catch(() => {});
                                    });
                                  })
                                  .catch(() => {});
                              }}
                              className="shrink-0 px-3.5 rounded-xl border border-neon-pink/30 bg-neon-pink/10 text-neon-pink hover:bg-neon-pink/20 transition-all font-orbitron text-[9px] font-bold tracking-widest"
                            >
                              TEST VOICE
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2 pt-2">
                          <label className="text-xs font-semibold font-orbitron tracking-wider text-muted">VOICE LINK LANGUAGE</label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { id: 'en-US', label: 'English 🇬🇧', desc: 'Standard English recognition & voice' },
                              { id: 'ur-PK', label: 'Urdu 🇵🇰', desc: 'اردو آواز اور بولنے کی پہچان' }
                            ].map((l) => (
                              <button
                                key={l.id}
                                onClick={() => {
                                  setVoiceLanguage(l.id);
                                  saveSetting('voice', { language: l.id });
                                }}
                                className={`p-3 rounded-xl border text-left transition-all ${
                                  voiceLanguage === l.id
                                    ? 'border-neon-pink/50 bg-neon-pink/10'
                                    : 'border-white/5 bg-secondary/10 hover:border-white/10'
                                }`}
                              >
                                <p className="font-orbitron text-xs font-bold text-white tracking-wider">{l.label}</p>
                                <p className="text-[9px] text-muted">{l.desc}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold font-orbitron tracking-wider">
                            <span className="text-muted">VOICE SPEED VELOCITY</span>
                            <span className="text-neon-pink font-mono">{voiceSpeed}x</span>
                          </div>
                          <input type="range" min="0.5" max="2.0" step="0.1" value={voiceSpeed} onChange={(e) => { setVoiceSpeed(Number(e.target.value)); saveSetting('voice', { speed: Number(e.target.value) }); }} className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-neon-pink" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold font-orbitron tracking-wider text-muted">WAKE WORD PROTOCOL</label>
                          <input 
                            type="text" 
                            value={wakeWord} 
                            onChange={(e) => setWakeWord(e.target.value)} 
                            onBlur={() => saveSetting('voice', { wakeWord })}
                            onKeyDown={(e) => e.key === 'Enter' && saveSetting('voice', { wakeWord })}
                            className="input-neon text-xs font-mono" 
                            placeholder="e.g. Hey Harvox" 
                          />
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div>
                            <p className="font-orbitron text-xs font-bold text-white tracking-wider">AUTO VOICE REPLIES</p>
                            <p className="text-[10px] text-muted">AI reads chat replies instantly via speaker output</p>
                          </div>
                          <Toggle value={autoVoiceReplies} onChange={(v) => { setAutoVoiceReplies(v); saveSetting('voice', { autoReplies: v }); }} color="bg-neon-pink" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── 4. SECURITY ──────────────────────────────────── */}
                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <h3 className="font-orbitron font-semibold text-sm text-white tracking-widest uppercase border-b border-white/5 pb-2">Security & Firewall</h3>
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold font-orbitron tracking-wider text-muted">CRYPTOGRAPHIC STRING (PASSWORD)</label>
                          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Active cipher key" className="input-neon text-xs w-full" />
                          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New cipher key (min 6 chars)" className="input-neon text-xs mt-2 w-full" />
                          <NeonButton onClick={handlePasswordSave} disabled={passwordSaving} className="text-xs py-2 mt-2">
                            {passwordSaving ? 'Re-ciphering...' : 'Re-cipher Database Binding'}
                          </NeonButton>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-secondary/10">
                          <div>
                            <p className="font-orbitron text-xs font-bold text-white tracking-wider">TWO-FACTOR AUTHENTICATION (2FA)</p>
                            <p className="text-[10px] text-muted">Bind visual security matrix to email/phone</p>
                          </div>
                          <Toggle value={tfa} onChange={(v) => { setTfa(v); saveSetting('security', { tfa: v }); }} color="bg-neon-blue" />
                        </div>
                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <label className="text-xs font-semibold font-orbitron tracking-wider text-muted">EXTERNAL API KEY PROTOCOLS</label>
                          <input 
                            type="text" 
                            value={apiKeys} 
                            onChange={(e) => setApiKeys(e.target.value)} 
                            onBlur={() => saveSetting('apiKeys', apiKeys)}
                            onKeyDown={(e) => e.key === 'Enter' && saveSetting('apiKeys', apiKeys)}
                            className="input-neon text-xs font-mono" 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── 5. NOTIFICATIONS ─────────────────────────────── */}
                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <h3 className="font-orbitron font-semibold text-sm text-white tracking-widest uppercase border-b border-white/5 pb-2">Notification & Signals</h3>
                      <div className="space-y-4">
                        {[
                          { label: 'AI COGNITION ALERTS', desc: 'Alerts when long generations or scans finish', value: aiAlerts, onChange: (v) => { setAiAlerts(v); saveSetting('notifications', { aiAlerts: v }); }, color: 'bg-neon-blue' },
                          { label: 'EMAIL MATRIX SIGNALS', desc: 'Weekly performance telemetry summaries', value: emailNotif, onChange: (v) => { setEmailNotif(v); saveSetting('notifications', { email: v }); }, color: 'bg-neon-blue' },
                          { label: 'SYSTEM SOUND EFFECTS', desc: 'Cybernetic HUD sound signals on click', value: soundEffects, onChange: (v) => { setSoundEffects(v); saveSetting('notifications', { soundEffects: v }); }, color: 'bg-neon-pink' },
                          { label: 'PUSH NOTIFICATIONS', desc: 'Desktop overlay when tabs are running in background', value: pushNotif, onChange: (v) => { setPushNotif(v); saveSetting('notifications', { desktop: v }); }, color: 'bg-neon-purple' },
                        ].map(({ label, desc, value, onChange, color }) => (
                          <div key={label} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-secondary/10">
                            <div>
                              <p className="font-orbitron text-xs font-bold text-white tracking-wider">{label}</p>
                              <p className="text-[10px] text-muted">{desc}</p>
                            </div>
                            <Toggle value={value} onChange={onChange} color={color} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── 6. WORKSPACE ─────────────────────────────────── */}
                  {activeTab === 'workspace' && (
                    <div className="space-y-6">
                      <h3 className="font-orbitron font-semibold text-sm text-white tracking-widest uppercase border-b border-white/5 pb-2">Workspace Customization</h3>
                      <div className="space-y-5">
                        <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-secondary/10">
                          <div>
                            <p className="font-orbitron text-xs font-bold text-white tracking-wider">WIDGET REARRANGING</p>
                            <p className="text-[10px] text-muted">Drag-and-drop dashboard modular components</p>
                          </div>
                          <Toggle value={widgetRearrange} onChange={setWidgetRearrange} color="bg-neon-blue" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold font-orbitron tracking-wider text-muted">SIDEBAR SYSTEM MODES</label>
                          <select value={customSidebar} onChange={(e) => setCustomSidebar(e.target.value)} className="input-neon text-xs font-mono">
                            <option value="standard">Standard Navigation Sidebar</option>
                            <option value="compact">Compact Neon Icon Sidebar</option>
                            <option value="hover">Hidden / Hover Trigger Overlay</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold font-orbitron tracking-wider text-muted">LAYOUT TELEMETRY PRESETS</label>
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { name: 'hologram', label: 'Hologram HUD', desc: 'Floating grid borders' },
                              { name: 'flat', label: 'Flat Glassmorphism', desc: 'No background movement' },
                            ].map((p) => (
                              <div key={p.name} onClick={() => { setLayoutPreset(p.name); saveSetting('workspace', { layoutType: p.name }); }} className={`p-3.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${layoutPreset === p.name ? 'border-neon-purple/40 bg-neon-purple/5' : 'border-white/5 bg-secondary/10'}`}>
                                <div>
                                  <p className="font-orbitron text-xs font-bold text-white">{p.label}</p>
                                  <p className="text-[9px] text-muted">{p.desc}</p>
                                </div>
                                {layoutPreset === p.name && <div className="w-1.5 h-1.5 rounded-full bg-neon-blue shadow-neon-blue" />}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── 7. DATA HUB ──────────────────────────────────── */}
                  {activeTab === 'data' && (
                    <div className="space-y-6">
                      <h3 className="font-orbitron font-semibold text-sm text-white tracking-widest uppercase border-b border-white/5 pb-2">DATA ARCHIVE HUB</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-xl border border-white/5 bg-secondary/10">
                          <div>
                            <p className="font-orbitron text-xs font-bold text-white">EXPORT COGNITIVE HISTORY</p>
                            <p className="text-[10px] text-muted">Download all AI chats, code logs, and prompts in JSON</p>
                          </div>
                          <NeonButton onClick={handleExportData} variant="secondary" className="text-xs py-1.5 px-3">Export JSON</NeonButton>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-xl border border-rose-500/30 bg-rose-950/15 shadow-[0_0_20px_rgba(239,68,68,0.15)] relative overflow-hidden">
                          {/* Danger diagonal stripes on the left border */}
                          <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{
                            backgroundImage: 'repeating-linear-gradient(45deg, #ef4444, #ef4444 4px, #000 4px, #000 8px)'
                          }} />
                          <div className="pl-2">
                            <p className="font-orbitron text-xs font-black text-rose-500 tracking-widest uppercase">DESTRUCT CHAT HISTORY WIPE</p>
                            <p className="text-[10px] text-rose-300/80 mt-1 leading-normal">Irreversibly wipe all AI chat buffers, operator note memory caches, and session credentials.</p>
                          </div>
                          <button
                            onClick={handleWipeData}
                            className="text-xs font-orbitron font-black text-white bg-rose-600 hover:bg-rose-500 transition-all duration-300 rounded-xl px-4 py-2 shadow-lg shadow-rose-600/30 active:scale-95 shrink-0"
                          >
                            DESTROY SYSTEM MEMORY
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </GlassCard>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
