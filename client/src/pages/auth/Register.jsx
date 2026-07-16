import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, Zap, Bot, Shield, CheckCircle2, ArrowRight } from 'lucide-react';

// ─── Animated grid / particle background ────────────────────────────────────
const AuthBg = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-[#04030c]" />
    <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-neon-blue/10 rounded-full blur-[120px]" />
    <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-neon-purple/8 rounded-full blur-[120px]" />
    <div className="absolute top-1/3 right-1/3 w-[250px] h-[250px] bg-neon-pink/5 rounded-full blur-[80px]" />
    <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="regGrid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#00F0FF" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#regGrid)" />
    </svg>
    <motion.div
      animate={{ y: ['0%', '100%'] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent"
    />
    {Array.from({ length: 18 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: `${Math.random() * 2 + 1}px`,
          height: `${Math.random() * 2 + 1}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          background: ['#00F0FF', '#8A2BE2', '#FF00C8'][i % 3],
          opacity: 0.4,
        }}
        animate={{ opacity: [0.2, 0.7, 0.2], scale: [1, 1.5, 1] }}
        transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
      />
    ))}
  </div>
);

// ─── Neon input field ─────────────────────────────────────────────────────────
const NeonInput = ({ icon: Icon, type, value, onChange, placeholder, required, minLength, rightEl, accentColor = '#8A2BE2' }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className="relative rounded-xl overflow-hidden transition-all duration-300"
      style={{
        border: focused ? `1px solid ${accentColor}60` : '1px solid rgba(255,255,255,0.06)',
        boxShadow: focused ? `0 0 20px ${accentColor}25, inset 0 0 10px ${accentColor}08` : 'none',
      }}
    >
      <div className="flex items-center bg-white/3 px-3.5">
        <Icon size={14} className="shrink-0 mr-2.5 transition-colors duration-300" style={{ color: focused ? accentColor : '#4b5563' }} />
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
      <div
        className="absolute bottom-0 left-0 h-px transition-all duration-300"
        style={{
          right: '0',
          background: focused
            ? `linear-gradient(to right, transparent, ${accentColor}, #00F0FF, transparent)`
            : 'transparent',
        }}
      />
    </div>
  );
};

// ─── Password strength indicator ─────────────────────────────────────────────
const StrengthBar = ({ password }) => {
  const getStrength = (p) => {
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };
  const strength = getStrength(password);
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#f87171', '#FFBD2E', '#34d399', '#00F0FF'];
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map(i => (
          <div
            key={i}
            className="flex-1 h-0.5 rounded-full transition-all duration-300"
            style={{ background: i <= strength ? colors[strength] : 'rgba(255,255,255,0.05)' }}
          />
        ))}
      </div>
      <p className="text-[9px] font-mono" style={{ color: colors[strength] || '#6b7280' }}>
        {labels[strength] || ''}
      </p>
    </div>
  );
};

// ─── Perk row ────────────────────────────────────────────────────────────────
const Perk = ({ text, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-center gap-2.5"
  >
    <CheckCircle2 size={13} className="text-neon-blue shrink-0" />
    <p className="text-[11px] text-gray-400 font-mono">{text}</p>
  </motion.div>
);

// ────────────────────────────────────────────────────────────────────────────
export default function Register() {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await register({ name, email, password });
      if (data && data.token) {
        navigate('/app/dashboard');
      } else {
        setRegSuccess(true);
      }
    } catch {}
  };

  return (
    <div className="min-h-screen flex relative">
      <AuthBg />

      {/* ── LEFT PANEL — Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="relative rounded-3xl border border-white/8 bg-[#07060f]/90 backdrop-blur-2xl p-8 shadow-[0_0_60px_rgba(0,240,255,0.06)]">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-neon-blue/40 rounded-tl-3xl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-neon-purple/40 rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-neon-purple/30 rounded-bl-3xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-neon-pink/30 rounded-br-3xl" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent" />

            {regSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-neon-blue/15 border border-neon-blue/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,240,255,0.2)] animate-pulse">
                  <Mail size={24} className="text-neon-blue" />
                </div>
                <h2 className="font-orbitron text-xl font-black mb-3">Verify Your <span className="gradient-text">Email</span></h2>
                <p className="text-gray-400 text-xs leading-relaxed font-mono mb-8 max-w-sm mx-auto">
                  A verification link has been sent to <span className="text-white font-bold">{email}</span>. Please check your inbox and verify your email to log in.
                </p>
                <div className="mt-6">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-xs font-mono text-neon-blue hover:text-neon-purple transition-colors font-bold"
                  >
                    Proceed to Login
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="text-center mb-7">
                  {/* Mobile logo */}
                  <div className="flex lg:hidden items-center justify-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-neon-blue/15 border border-neon-blue/30 flex items-center justify-center">
                      <Zap size={14} className="text-neon-blue" />
                    </div>
                    <span className="font-orbitron font-black text-base tracking-wider gradient-text">HARVOX AI</span>
                  </div>
                  <p className="text-[9px] font-orbitron font-black tracking-[0.25em] text-neon-blue/50 uppercase mb-2">Create Access Token</p>
                  <h1 className="font-orbitron text-2xl font-black tracking-wide">
                    Join <span className="gradient-text">HARVOX</span>
                  </h1>
                  <p className="text-gray-600 text-xs mt-1.5 font-mono">Initialize your AI command center</p>
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
                    <label className="block text-[10px] font-orbitron font-bold tracking-widest text-gray-500 uppercase mb-2">Full Name</label>
                    <NeonInput
                      icon={User}
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); clearError(); }}
                      placeholder="John Doe"
                      required
                      accentColor="#00F0FF"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-orbitron font-bold tracking-widest text-gray-500 uppercase mb-2">Email Address</label>
                    <NeonInput
                      icon={Mail}
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); clearError(); }}
                      placeholder="you@example.com"
                      required
                      accentColor="#00F0FF"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-orbitron font-bold tracking-widest text-gray-500 uppercase mb-2">Password</label>
                    <NeonInput
                      icon={Lock}
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); clearError(); }}
                      placeholder="Min. 6 characters"
                      required
                      minLength={6}
                      accentColor="#00F0FF"
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
                    <StrengthBar password={password} />
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="relative w-full mt-4 py-3.5 rounded-xl font-orbitron font-black text-sm tracking-widest uppercase overflow-hidden transition-all duration-300 disabled:opacity-60 group"
                    style={{
                      background: 'linear-gradient(135deg, #00c4cc, #8A2BE2)',
                      boxShadow: '0 0 30px rgba(0,240,255,0.3)',
                    }}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 overflow-hidden transition-opacity duration-300">
                      <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700" />
                    </div>
                    <span className="relative flex items-center justify-center gap-2">
                      {loading
                        ? <><Loader2 size={15} className="animate-spin" /> Creating account...</>
                        : <><span>Create Account</span> <ArrowRight size={14} /></>
                      }
                    </span>
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-[9px] text-gray-700 font-mono tracking-widest">OR</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                {/* Login link */}
                <p className="text-center text-[11px] text-gray-600 font-mono">
                  Already initialized?{' '}
                  <Link to="/login" className="text-neon-blue hover:text-neon-purple transition-colors font-bold">
                    Sign in here
                  </Link>
                </p>
              </>
            )}
          </div>

          <p className="text-center text-[9px] text-gray-700 mt-5 font-mono tracking-widest">
            HARVOX AI · SECURE REGISTRATION · ENCRYPTED
          </p>
        </motion.div>
      </div>

      {/* ── Vertical divider ── */}
      <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-neon-blue/20 to-transparent relative z-10 self-stretch my-8" />

      {/* ── RIGHT PANEL — Branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] p-12 relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-neon-blue/15 border border-neon-blue/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            <Zap size={18} className="text-neon-blue" />
          </div>
          <span className="font-orbitron font-black text-xl tracking-wider gradient-text">HARVOX AI</span>
        </motion.div>

        {/* Main copy */}
        <div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}>
            <p className="text-[10px] font-orbitron font-black tracking-[0.3em] text-neon-purple/60 uppercase mb-4">
              Free Forever Plan
            </p>
            <h2 className="font-orbitron text-4xl font-black leading-tight mb-5">
              Everything You<br />
              Need to Build<br />
              <span className="gradient-text">Faster</span>
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-10">
              Join thousands of developers who use HARVOX to ship faster and automate their workflow with AI.
            </p>
          </motion.div>

          <div className="space-y-3.5">
            <Perk text="Unlimited AI chat sessions"           delay={0.3} />
            <Perk text="Code generation & debugging assistant" delay={0.4} />
            <Perk text="Personal workspace OS with Monaco IDE"  delay={0.5} />
            <Perk text="Smart study tracker for BSCS"          delay={0.6} />
            <Perk text="Voice-controlled autopilot mode"        delay={0.7} />
          </div>
        </div>

        {/* Shield badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-3 bg-white/3 border border-white/6 rounded-2xl px-4 py-3 w-fit"
        >
          <Shield size={14} className="text-neon-blue shrink-0" />
          <span className="text-[10px] font-mono text-gray-500 tracking-wide">End-to-end encrypted · No credit card required</span>
        </motion.div>
      </div>
    </div>
  );
}
