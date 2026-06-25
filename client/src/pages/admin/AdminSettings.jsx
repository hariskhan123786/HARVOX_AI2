import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  Settings, Save, Loader2, CheckCircle2, AlertCircle,
  Key, CreditCard, Megaphone, Eye, EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminCard = ({ children, className = '', glow = '#8A2BE2' }) => (
  <div
    className={`relative rounded-2xl border border-white/8 bg-[#07060f]/95 backdrop-blur-xl overflow-hidden ${className}`}
    style={{ boxShadow: `0 0 30px ${glow}15` }}
  >
    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${glow}50, transparent)` }} />
    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/10 rounded-tl-2xl" />
    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/10 rounded-tr-2xl" />
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, label, title, color }) => (
  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/5">
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: `${color}12`, border: `1px solid ${color}30` }}
    >
      <Icon size={14} style={{ color }} />
    </div>
    <div>
      <p className="text-[8px] font-orbitron font-black tracking-[0.2em] text-gray-600 uppercase">{label}</p>
      <p className="text-sm font-bold text-white">{title}</p>
    </div>
  </div>
);

const NeonField = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[9px] font-orbitron font-black tracking-widest text-gray-500 uppercase">{label}</label>
    {children}
    {hint && <p className="text-[9px] text-gray-700 font-mono leading-relaxed">{hint}</p>}
  </div>
);

const InputNeon = ({ type = 'text', name, value, onChange, placeholder, accentColor = '#8A2BE2', showToggle = false }) => {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div
      className="relative flex items-center rounded-xl overflow-hidden transition-all duration-300"
      style={{
        border: focused ? `1px solid ${accentColor}50` : '1px solid rgba(255,255,255,0.06)',
        boxShadow: focused ? `0 0 15px ${accentColor}20` : 'none',
      }}
    >
      <input
        type={showToggle ? (show ? 'text' : type) : type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="flex-1 bg-white/4 px-4 py-2.5 text-xs font-mono text-gray-300 placeholder:text-gray-700 outline-none"
      />
      {showToggle && (
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="px-3 text-gray-600 hover:text-gray-400 transition-colors bg-white/4 self-stretch flex items-center border-l border-white/5"
        >
          {show ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      )}
      <div
        className="absolute bottom-0 left-0 h-px transition-all duration-300"
        style={{ right: 0, background: focused ? `linear-gradient(to right, transparent, ${accentColor}, transparent)` : 'transparent' }}
      />
    </div>
  );
};

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    jazzCashNumber: '',
    jazzCashName: '',
    easyPaisaNumber: '',
    easyPaisaName: '',
    announcement: '',
    groqKey: '',
    geminiKey: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await adminAPI.getSettings();
        if (data.settings) setSettings(data.settings);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => setSettings({ ...settings, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await adminAPI.updateSettings(settings);
      setMessage('Settings saved successfully!');
      setIsError(false);
      setTimeout(() => setMessage(''), 3500);
    } catch {
      setMessage('Error saving settings.');
      setIsError(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3">
        <Loader2 size={16} className="text-neon-pink animate-spin" />
        <span className="text-xs font-mono text-gray-600 tracking-widest">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-neon-pink animate-pulse shadow-[0_0_8px_rgba(255,0,200,0.8)]" />
          <p className="text-[9px] font-orbitron font-black tracking-[0.3em] text-neon-pink/50 uppercase">System Configuration</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neon-pink/10 border border-neon-pink/25 flex items-center justify-center shadow-[0_0_15px_rgba(255,0,200,0.2)]">
            <Settings size={16} className="text-neon-pink" />
          </div>
          <div>
            <h1 className="font-orbitron text-xl font-black tracking-wider text-white">System Settings</h1>
            <p className="text-[10px] text-gray-600 font-mono">Platform-wide configuration controls</p>
          </div>
        </div>
      </div>

      {/* Save banner */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-mono overflow-hidden"
            style={isError ? {
              borderColor: 'rgba(248,113,113,0.3)',
              background: 'rgba(248,113,113,0.06)',
              color: '#f87171',
            } : {
              borderColor: 'rgba(52,211,153,0.3)',
              background: 'rgba(52,211,153,0.06)',
              color: '#34d399',
            }}
          >
            {isError ? <AlertCircle size={13} /> : <CheckCircle2 size={13} />}
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Payment Methods */}
        <AdminCard glow="#00F0FF" className="p-5">
          <SectionHeader icon={CreditCard} label="Finance Module" title="Payment Methods" color="#00F0FF" />
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-[9px] font-orbitron font-black text-gray-500 tracking-widest">JAZZCASH</p>
              <NeonField label="Account Number">
                <InputNeon name="jazzCashNumber" value={settings.jazzCashNumber} onChange={handleChange} placeholder="03XX-XXXXXXX" accentColor="#00F0FF" />
              </NeonField>
              <NeonField label="Account Name">
                <InputNeon name="jazzCashName" value={settings.jazzCashName} onChange={handleChange} placeholder="Account holder name" accentColor="#00F0FF" />
              </NeonField>
            </div>
            <div className="pt-4 border-t border-white/5 space-y-3">
              <p className="text-[9px] font-orbitron font-black text-gray-500 tracking-widest">EASYPAISA</p>
              <NeonField label="Account Number">
                <InputNeon name="easyPaisaNumber" value={settings.easyPaisaNumber} onChange={handleChange} placeholder="03XX-XXXXXXX" accentColor="#00F0FF" />
              </NeonField>
              <NeonField label="Account Name">
                <InputNeon name="easyPaisaName" value={settings.easyPaisaName} onChange={handleChange} placeholder="Account holder name" accentColor="#00F0FF" />
              </NeonField>
            </div>
          </div>
        </AdminCard>

        {/* Right col */}
        <div className="space-y-5">
          {/* API Keys */}
          <AdminCard glow="#8A2BE2" className="p-5">
            <SectionHeader icon={Key} label="AI Engine" title="Global API Keys" color="#8A2BE2" />
            <div className="space-y-4">
              <NeonField
                label="Groq API Key (Fallback)"
                hint="Used when the user doesn't have their own key configured."
              >
                <InputNeon
                  type="password"
                  name="groqKey"
                  value={settings.groqKey || ''}
                  onChange={handleChange}
                  placeholder="gsk_..."
                  accentColor="#8A2BE2"
                  showToggle
                />
              </NeonField>
              <NeonField
                label="Gemini API Key (Fallback)"
                hint="Used when the user doesn't have their own key configured."
              >
                <InputNeon
                  type="password"
                  name="geminiKey"
                  value={settings.geminiKey || ''}
                  onChange={handleChange}
                  placeholder="AIzaSy..."
                  accentColor="#8A2BE2"
                  showToggle
                />
              </NeonField>
            </div>
          </AdminCard>

          {/* Announcement */}
          <AdminCard glow="#FF00C8" className="p-5">
            <SectionHeader icon={Megaphone} label="Broadcast" title="Dashboard Announcement" color="#FF00C8" />
            <NeonField label="Message" hint="This message will be broadcast to all users on their dashboard.">
              <div
                className="relative rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <textarea
                  name="announcement"
                  value={settings.announcement}
                  onChange={handleChange}
                  className="w-full h-24 bg-white/4 px-4 py-3 text-xs font-mono text-gray-300 placeholder:text-gray-700 outline-none resize-none"
                  placeholder="Broadcast message to all users..."
                />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-pink/30 to-transparent" />
              </div>
            </NeonField>
          </AdminCard>

          {/* Save button */}
          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: saving ? 1 : 1.02 }}
            whileTap={{ scale: saving ? 1 : 0.98 }}
            className="relative w-full py-3.5 rounded-xl font-orbitron font-black text-sm tracking-widest uppercase overflow-hidden transition-all duration-300 disabled:opacity-60 group"
            style={{
              background: 'linear-gradient(135deg, #FF00C8, #8A2BE2)',
              boxShadow: '0 0 25px rgba(255,0,200,0.3)',
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 overflow-hidden transition-opacity duration-300">
              <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700" />
            </div>
            <span className="relative flex items-center justify-center gap-2.5">
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                : <><Save size={14} /> Save All Settings</>
              }
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
