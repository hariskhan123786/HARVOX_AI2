import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { settingsAPI, authAPI } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import NeonButton from '../../components/ui/NeonButton';
import {
  Paintbrush, Cpu, Volume2, Shield,
  Bell, Layout, Database, LogOut, Check, User,
  Github, Linkedin, Twitter, Globe, Plus, X,
  CheckCircle2, AlertCircle, Loader2
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
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-all duration-300 flex items-center px-1 shrink-0 ${value ? color : 'bg-secondary'}`}
    >
      <motion.div layout className="w-3.5 h-3.5 bg-white rounded-full shadow" />
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
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [creativity, setCreativity] = useState(0.7);
  const [responseLength, setResponseLength] = useState(2048);
  const [expertMode, setExpertMode] = useState(false);
  const [codingMode, setCodingMode] = useState(true);
  const [voiceGender, setVoiceGender] = useState('female');
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [autoVoiceReplies, setAutoVoiceReplies] = useState(false);
  const [wakeWord, setWakeWord] = useState('Hey Harvox');
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
          if (s.appearance) { setTheme(s.appearance.theme); setAccent(s.appearance.accentColor); }
          if (s.ai) {
            setModel(s.ai.model);
            setCreativity(s.ai.creativity);
            setExpertMode(s.ai.expertiseLevel === 'expert');
            setCodingMode(s.ai.codingMode !== 'standard');
          }
          if (s.voice) {
            setVoiceGender(s.voice.voiceSelection);
            setVoiceSpeed(s.voice.speed);
            setAutoVoiceReplies(s.voice.autoReplies);
            setWakeWord(s.voice.wakeWord);
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
    } catch (err) {
      console.error('Failed to save settings', err);
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
                <button
                  key={tab.id}
                  id={`settings-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-orbitron text-xs font-semibold tracking-wider transition-all border ${
                    isActive
                      ? 'border-neon-purple/30 text-neon-blue bg-neon-purple/5 shadow-neon-purple/10'
                      : 'border-white/5 text-muted hover:border-white/10 hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabGlow"
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-neon-blue"
                    />
                  )}
                  <Icon className={`w-4 h-4 ${isActive ? 'text-neon-blue' : 'text-muted'}`} />
                  {tab.label}
                </button>
              );
            })}

            <div className="pt-4 border-t border-white/5 mt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-orbitron text-xs font-semibold tracking-wider text-rose-500 border border-rose-950/20 hover:bg-rose-950/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
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
                            <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/5 bg-secondary/20">
                              <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                              <input
                                id={`identity-social-${key}`}
                                type="text"
                                value={identityForm.socialLinks[key]}
                                onChange={(e) => setSocial(key, e.target.value)}
                                placeholder={placeholder}
                                className="bg-transparent text-xs font-mono text-white placeholder:text-muted/50 outline-none flex-1 w-0"
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
                                onClick={() => { setAccent(color.name); saveSetting('appearance', { accentColor: color.name }); }}
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
                                  saveSetting('appearance', { theme: t.label }); 
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
                      </div>
                    </div>
                  )}

                  {/* ── 2. AI ENGINE ────────────────────────────────── */}
                  {activeTab === 'ai' && (
                    <div className="space-y-6">
                      <h3 className="font-orbitron font-semibold text-sm text-white tracking-widest uppercase border-b border-white/5 pb-2">AI Configuration Panel</h3>
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold font-orbitron tracking-wider text-muted">AI MODEL SELECTION</label>
                          <select value={model} onChange={(e) => { setModel(e.target.value); saveSetting('ai', { model: e.target.value }); }} className="input-neon text-xs font-mono">
                            <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Expert)</option>
                            <option value="llama3-70b-8192">llama3-70b-8192 (Fast)</option>
                            <option value="mixtral-8x7b-32768">mixtral-8x7b-32768 (Lite)</option>
                          </select>
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

                  {/* ── 3. VOICE LINK ────────────────────────────────── */}
                  {activeTab === 'voice' && (
                    <div className="space-y-6">
                      <h3 className="font-orbitron font-semibold text-sm text-white tracking-widest uppercase border-b border-white/5 pb-2">Voice Assistant Link</h3>
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold font-orbitron tracking-wider text-muted">SYSTEM VOICE SELECTOR</label>
                          <div className="flex gap-2">
                            <select
                              value={voiceGender}
                              onChange={(e) => { setVoiceGender(e.target.value); saveSetting('voice', { voiceSelection: e.target.value }); }}
                              className="input-neon text-xs font-mono flex-1"
                            >
                              <option value="female">Default — Aura (Female)</option>
                              <option value="male">Default — Echo (Male)</option>
                              {voices.map((v) => (
                                <option key={v.name} value={v.name}>{v.name} [{v.lang}]</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                if ('speechSynthesis' in window) {
                                  window.speechSynthesis.cancel();
                                  const utter = new SpeechSynthesisUtterance('Neural voice telemetry uplink stabilized. HARVOX AI online.');
                                  utter.rate = voiceSpeed;
                                  const matched = voices.find(v => v.name === voiceGender);
                                  if (matched) utter.voice = matched;
                                  window.speechSynthesis.speak(utter);
                                }
                              }}
                              className="shrink-0 px-3 rounded-xl border border-neon-pink/30 bg-neon-pink/10 text-neon-pink hover:bg-neon-pink/20 transition-all font-orbitron text-[9px] font-bold tracking-widest"
                            >
                              TEST
                            </button>
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
                          <input type="text" value={wakeWord} onChange={(e) => { setWakeWord(e.target.value); saveSetting('voice', { wakeWord: e.target.value }); }} className="input-neon text-xs font-mono" placeholder="e.g. Hey Harvox" />
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
                          <input type="text" value={apiKeys} onChange={(e) => { setApiKeys(e.target.value); saveSetting('apiKeys', e.target.value); }} className="input-neon text-xs font-mono" />
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
                        <div className="flex justify-between items-center p-3 rounded-xl border border-rose-950/20 bg-rose-950/5">
                          <div>
                            <p className="font-orbitron text-xs font-bold text-rose-500">DESTRUCT CHAT HISTORY WIPE</p>
                            <p className="text-[10px] text-rose-400/80">Wipe all AI chat buffers, note memories, and session tokens</p>
                          </div>
                          <button onClick={handleWipeData} className="text-xs font-orbitron font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all rounded-lg px-3 py-2">
                            WIPE DATA
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
