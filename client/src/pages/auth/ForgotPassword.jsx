import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Loader2, AlertCircle, CheckCircle2, Zap, ArrowLeft, ArrowRight } from 'lucide-react';

const AuthBg = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-[#04030c]" />
    <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-[120px]" />
    <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-neon-blue/8 rounded-full blur-[120px]" />
    <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="forgotGrid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#8A2BE2" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#forgotGrid)" />
    </svg>
  </div>
);

const NeonInput = ({ icon: Icon, type, value, onChange, placeholder, required }) => {
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
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 py-3 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none font-mono"
        />
      </div>
    </div>
  );
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authAPI.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <AuthBg />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="relative rounded-3xl border border-white/8 bg-[#07060f]/90 backdrop-blur-2xl p-8 shadow-[0_0_60px_rgba(138,43,226,0.08)]">
          {/* Accent Borders */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-neon-purple/40 rounded-tl-3xl" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-neon-blue/40 rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-neon-pink/30 rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-neon-purple/30 rounded-br-3xl" />

          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-neon-purple/15 border border-neon-purple/30 flex items-center justify-center">
              <Zap size={18} className="text-neon-purple" />
            </div>
            <span className="font-orbitron font-black text-xl tracking-wider gradient-text">HARVOX AI</span>
          </div>

          <h1 className="font-orbitron text-xl font-black text-center mb-2">
            Recover <span className="gradient-text">Credentials</span>
          </h1>
          <p className="text-gray-500 text-xs text-center mb-8 font-mono">
            Enter your email to receive a password reset link
          </p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 bg-rose-500/8 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl mb-6 text-xs font-mono"
              >
                <AlertCircle size={13} className="shrink-0" />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 bg-emerald-500/8 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl mb-6 text-xs font-mono"
              >
                <CheckCircle2 size={13} className="shrink-0" />
                Password reset link sent! Check your inbox.
              </motion.div>
            )}
          </AnimatePresence>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-orbitron font-bold tracking-widest text-gray-500 uppercase mb-2">
                  Email Address
                </label>
                <NeonInput
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@harvox.ai"
                  required
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full mt-6 py-3.5 rounded-xl font-orbitron font-black text-sm tracking-widest uppercase overflow-hidden transition-all duration-300 disabled:opacity-60 group"
                style={{
                  background: 'linear-gradient(135deg, #8A2BE2, #00F0FF)',
                  boxShadow: '0 0 30px rgba(138,43,226,0.4)',
                }}
              >
                <span className="relative flex items-center justify-center gap-2 text-white">
                  {loading ? (
                    <><Loader2 size={15} className="animate-spin" /> Verifying...</>
                  ) : (
                    <><span>Send Reset Link</span> <ArrowRight size={14} /></>
                  )}
                </span>
              </motion.button>
            </form>
          ) : (
            <div className="text-center mt-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-mono text-neon-blue hover:text-neon-purple transition-colors"
              >
                <ArrowLeft size={12} /> Return to Login
              </Link>
            </div>
          )}

          {!success && (
            <div className="text-center mt-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-white transition-colors"
              >
                <ArrowLeft size={12} /> Back to Login
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
