import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Zap, Bot, Terminal, Cpu, ArrowRight } from 'lucide-react';

// ─── Animated grid / particle background ────────────────────────────────────
const AuthBg = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Deep space gradient */}
    <div className="absolute inset-0 bg-[#04030c]" />
    {/* Glowing orbs */}
    <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-[120px]" />
    <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-neon-blue/8 rounded-full blur-[120px]" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-neon-pink/5 rounded-full blur-[80px]" />
    {/* Grid lines */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="authGrid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#8A2BE2" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#authGrid)" />
    </svg>
    {/* Scan-line sweep */}
    <motion.div
      animate={{ y: ['0%', '100%'] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-purple/30 to-transparent"
    />
    {/* Floating particles */}
    {Array.from({ length: 18 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: `${Math.random() * 2 + 1}px`,
          height: `${Math.random() * 2 + 1}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          background: ['#8A2BE2', '#00F0FF', '#FF00C8'][i % 3],
          opacity: 0.4,
        }}
        animate={{ opacity: [0.2, 0.7, 0.2], scale: [1, 1.4, 1] }}
        transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
      />
    ))}
  </div>
);

// ─── Neon input field ─────────────────────────────────────────────────────────
const NeonInput = ({ icon: Icon, type, value, onChange, placeholder, required, minLength, rightEl }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className="relative rounded-xl overflow-hidden transition-all duration-300"
      style={{
        border: focused ? '1px solid rgba(138,43,226,0.6)' : '1px solid rgba(255,255,255,0.06)',
        boxShadow: focused ? '0 0 20px rgba(138,43,226,0.2), inset 0 0 10px rgba(138,43,226,0.05)' : 'none',
      }}
    >
      <div className="flex items-center bg-white/3 px-3.5">
        <Icon size={14} className={`shrink-0 mr-2.5 transition-colors duration-300 ${focused ? 'text-neon-purple' : 'text-gray-600'}`} />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 py-3 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none font-mono"
        />
        {rightEl}
      </div>
      {/* Bottom glow line */}
      <div
        className="absolute bottom-0 left-0 h-px transition-all duration-300"
        style={{
          right: '0',
          background: focused
            ? 'linear-gradient(to right, transparent, #8A2BE2, #00F0FF, transparent)'
            : 'transparent',
        }}
      />
    </div>
  );
};

// ─── Feature bullet ──────────────────────────────────────────────────────────
const Feature = ({ icon: Icon, text, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-center gap-3"
  >
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: `${color}15`, border: `1px solid ${color}30` }}
    >
      <Icon size={13} style={{ color }} />
    </div>
    <p className="text-[11px] text-gray-400 font-mono">{text}</p>
  </motion.div>
);

// ────────────────────────────────────────────────────────────────────────────
export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/app/dashboard');
    } catch {}
  };

  return (
    <div className="min-h-screen flex relative">
      <AuthBg />

      {/* ── LEFT PANEL — Branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] p-12 relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-neon-purple/15 border border-neon-purple/30 flex items-center justify-center shadow-[0_0_20px_rgba(138,43,226,0.3)]">
            <Zap size={18} className="text-neon-purple" />
          </div>
          <span className="font-orbitron font-black text-xl tracking-wider gradient-text">HARVOX AI</span>
        </motion.div>

        {/* Main copy */}
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <p className="text-[10px] font-orbitron font-black tracking-[0.3em] text-neon-blue/60 uppercase mb-4">
              Advanced AI Platform
            </p>
            <h2 className="font-orbitron text-4xl font-black leading-tight mb-5">
              Your AI-Powered<br />
              <span className="gradient-text">Dev Command</span><br />
              Center
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-10">
              Automate projects, debug code, generate notes, and control your entire dev workflow through natural language.
            </p>
          </motion.div>

          <div className="space-y-3.5">
            <Feature icon={Bot}      text="AI Chat with streaming responses"      color="#8A2BE2" delay={0.35} />
            <Feature icon={Terminal}  text="Live automation & bash execution"      color="#00F0FF" delay={0.45} />
            <Feature icon={Cpu}       text="AI-powered code generation & debugging" color="#FF00C8" delay={0.55} />
          </div>
        </div>

        {/* Bottom status bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center gap-2.5 bg-white/3 border border-white/6 rounded-2xl px-4 py-3 w-fit"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          <span className="text-[10px] font-mono text-gray-500 tracking-widest">SYSTEM OPERATIONAL · PHASE 8</span>
        </motion.div>
      </div>

      {/* ── Vertical divider ── */}
      <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-neon-purple/20 to-transparent relative z-10 self-stretch my-8" />

      {/* ── RIGHT PANEL — Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="relative rounded-3xl border border-white/8 bg-[#07060f]/90 backdrop-blur-2xl p-8 shadow-[0_0_60px_rgba(138,43,226,0.08)]">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-neon-purple/40 rounded-tl-3xl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-neon-blue/40 rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-neon-pink/30 rounded-bl-3xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-neon-purple/30 rounded-br-3xl" />
            {/* Top shimmer */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-purple/50 to-transparent" />

            {/* Header */}
            <div className="text-center mb-8">
              {/* Mobile logo */}
              <div className="flex lg:hidden items-center justify-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-xl bg-neon-purple/15 border border-neon-purple/30 flex items-center justify-center">
                  <Zap size={14} className="text-neon-purple" />
                </div>
                <span className="font-orbitron font-black text-base tracking-wider gradient-text">HARVOX AI</span>
              </div>
              <p className="text-[9px] font-orbitron font-black tracking-[0.25em] text-neon-blue/50 uppercase mb-2">Secure Access Portal</p>
              <h1 className="font-orbitron text-2xl font-black tracking-wide">
                Welcome <span className="gradient-text">Back</span>
              </h1>
              <p className="text-gray-600 text-xs mt-1.5 font-mono">Sign in to your HARVOX command center</p>
            </div>

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="flex items-center gap-2.5 bg-rose-500/8 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl mb-6 text-xs font-mono"
                >
                  <AlertCircle size={13} className="shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-orbitron font-bold tracking-widest text-gray-500 uppercase mb-2">Email Address</label>
                <NeonInput
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-orbitron font-bold tracking-widest text-gray-500 uppercase">Password</label>
                  <button type="button" className="text-[9px] text-neon-blue/60 hover:text-neon-blue transition-colors font-mono tracking-wide">
                    Forgot password?
                  </button>
                </div>
                <NeonInput
                  icon={Lock}
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  placeholder="••••••••"
                  required
                  rightEl={
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="text-gray-600 hover:text-gray-400 transition-colors p-1"
                    >
                      {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  }
                />
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="relative w-full mt-6 py-3.5 rounded-xl font-orbitron font-black text-sm tracking-widest uppercase overflow-hidden transition-all duration-300 disabled:opacity-60 group"
                style={{
                  background: 'linear-gradient(135deg, #8A2BE2, #00F0FF)',
                  boxShadow: '0 0 30px rgba(138,43,226,0.4)',
                }}
              >
                {/* Shimmer sweep */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 overflow-hidden transition-opacity duration-300">
                  <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700" />
                </div>
                <span className="relative flex items-center justify-center gap-2">
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" /> Authenticating...</>
                    : <><span>Sign In</span> <ArrowRight size={14} /></>
                  }
                </span>
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[9px] text-gray-700 font-mono tracking-widest">OR</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Sign up link */}
            <p className="text-center text-[11px] text-gray-600 font-mono">
              No account yet?{' '}
              <Link
                to="/register"
                className="text-neon-blue hover:text-neon-purple transition-colors font-bold"
              >
                Create one — it's free
              </Link>
            </p>
          </div>

          {/* Bottom label */}
          <p className="text-center text-[9px] text-gray-700 mt-5 font-mono tracking-widest">
            HARVOX AI · PHASE 8 · SECURED CONNECTION
          </p>
        </motion.div>
      </div>
    </div>
  );
}
