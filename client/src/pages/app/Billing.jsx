import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/ui/GlassCard';
import NeonButton from '../../components/ui/NeonButton';
import {
  Crown, CheckCircle, Zap, Shield, Clock, Upload, AlertCircle,
  RefreshCw, Smartphone, X, Scan, Star, ChevronRight
} from 'lucide-react';
import { profileAPI, paymentsAPI } from '../../services/api';

export default function Billing() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const [paymentSettings, setPaymentSettings] = useState({
    jazzCashNumber: '03188353770',
    jazzCashName: 'muhammad haris khan',
    easyPaisaNumber: '03188353770',
    easyPaisaName: 'muhammad haris khan',
  });

  const [activeRequest, setActiveRequest] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState('JazzCash');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [feedback, setFeedback] = useState({ show: false, message: '', type: 'info' });
  const [modalOpen, setModalOpen] = useState(false);

  const getPlanPrice = (plan) => {
    if (plan === 'monthly') {
      return paymentSettings.proPriceMonthly || 999;
    }
    return paymentSettings.proPriceYearly || 8999;
  };

  const fetchStatusAndSettings = async () => {
    try {
      const settingsRes = await paymentsAPI.getSettings();
      if (settingsRes.data) setPaymentSettings(settingsRes.data);
      const statusRes = await paymentsAPI.getStatus();
      if (statusRes.data?.payment) setActiveRequest(statusRes.data.payment);
    } catch (error) {
      console.error('Failed to fetch payment parameters', error);
    }
  };

  const fetchProfileData = async () => {
    try {
      const { data } = await profileAPI.getData();
      setProfileData(data);
    } catch (error) {
      console.error('Failed to fetch profile data', error);
    }
  };

  useEffect(() => {
    fetchProfileData();
    fetchStatusAndSettings();
  }, []);

  const handleFileChange = (file) => {
    if (!file) return;
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setScreenshotPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const showFeedback = (message, type = 'info') => {
    setFeedback({ show: true, message, type });
    setTimeout(() => setFeedback({ show: false, message: '', type: 'info' }), 4500);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!screenshotFile) { showFeedback('Please upload a screenshot proof of payment.', 'error'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('method', paymentMethod);
      formData.append('amount', getPlanPrice(selectedPlan));
      formData.append('plan', selectedPlan);
      formData.append('transactionId', transactionId);
      formData.append('screenshot', screenshotFile);
      const { data } = await paymentsAPI.submitRequest(formData);
      showFeedback(data.message || 'Payment request submitted successfully!', 'success');
      
      if (data.user) {
        updateUser(data.user);
      }

      setTransactionId('');
      setScreenshotFile(null);
      setScreenshotPreview(null);
      setModalOpen(false);
      await fetchStatusAndSettings();
      await fetchProfileData();
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Submission failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isPro = user?.subscription === 'pro' || user?.role === 'admin';

  const currentAccountNumber = paymentMethod === 'JazzCash' ? paymentSettings.jazzCashNumber : paymentSettings.easyPaisaNumber;
  const currentAccountName = paymentMethod === 'JazzCash' ? paymentSettings.jazzCashName : paymentSettings.easyPaisaName;

  return (
    <div className="space-y-6">

      {/* ── Animated Title Header ── */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-purple/15 via-neon-blue/8 to-transparent rounded-xl blur-xl pointer-events-none" />
          <h1 className="relative font-orbitron text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#BE5CF6] via-[#00F0FF] to-[#BE5CF6]">
            SUBSCRIPTION &amp; BILLING
          </h1>
          <p className="text-[11px] text-gray-500 font-mono mt-0.5">
            <span className="text-neon-purple/60">///</span> Manage your premium SaaS cognitive resources
          </p>
        </div>
        <button
          onClick={fetchStatusAndSettings}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/8 bg-white/3 text-[11px] font-mono text-gray-500 hover:text-white hover:border-white/15 hover:bg-white/6 transition-all"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Sync State
        </button>
      </div>

      {/* ── Toast Alert ── */}
      <AnimatePresence>
        {feedback.show && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className={`p-4 rounded-2xl border font-mono text-xs flex items-center gap-3 ${
              feedback.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'
                : feedback.type === 'error'
                ? 'border-rose-500/30 bg-rose-500/5 text-rose-400'
                : 'border-neon-blue/30 bg-neon-blue/5 text-neon-blue'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pro Plan Active Status ── */}
      {isPro ? (
        <GlassCard hover={false} className="border-amber-400/30 bg-amber-400/5 relative overflow-hidden">
          <div className="absolute top-1/2 right-8 -translate-y-1/2 w-56 h-56 rounded-full border border-amber-400/5 border-dashed pointer-events-none" />
          <div className="absolute top-1/2 right-16 -translate-y-1/2 w-40 h-40 rounded-full border border-amber-400/10 border-dashed pointer-events-none animate-[spin_50s_linear_infinite]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(251,191,36,0.06),transparent_60%)] pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/15 flex items-center justify-center border border-amber-400/40 shadow-[0_0_24px_rgba(251,191,36,0.25)] shrink-0 relative">
                <Crown className="w-8 h-8 text-amber-400" />
                <div className="absolute inset-0 rounded-2xl animate-ping opacity-30" style={{ background: 'rgba(251,191,36,0.15)', animationDuration: '2.5s' }} />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-orbitron font-black text-amber-400 tracking-widest text-lg">PRO COGNITION ACTIVE</h3>
                <p className="text-xs text-gray-400 max-w-xl font-sans leading-relaxed">
                  Your node is fully synchronized with the high-performance Llama 3 70B model. Unlimited cognitive bandwidth, voice assistant links, and full agent workspace are unlocked.
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <div className="px-5 py-3 rounded-xl border border-amber-400/30 bg-amber-400/8 font-orbitron text-center">
                <span className="text-[9px] text-amber-400/80 font-bold block tracking-widest mb-0.5">ACTIVE TIER</span>
                <span className="text-white text-base font-bold font-mono">Rs. 999<span className="text-xs text-gray-400 font-sans"> / mo</span></span>
              </div>
            </div>
          </div>
        </GlassCard>

      ) : activeRequest?.status === 'pending' ? (
        <GlassCard hover={false} className="border-neon-blue/25 bg-neon-blue/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(0,240,255,0.04),transparent_60%)] pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-neon-blue/10 flex items-center justify-center border border-neon-blue/40 shrink-0">
              <Clock className="w-6 h-6 text-neon-blue animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="font-orbitron font-bold text-neon-blue tracking-wider text-sm">UPGRADE REQUEST PENDING</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Received transaction proof (ID: <span className="font-mono text-white">{activeRequest.transactionId || 'N/A'}</span>) via {activeRequest.method} for the <span className="uppercase font-bold text-white">{activeRequest.plan}</span> plan. Admin verification in progress.
              </p>
            </div>
          </div>
        </GlassCard>

      ) : (
        <div className="space-y-6">
          {/* Rejection notice */}
          {activeRequest?.status === 'rejected' && (
            <GlassCard hover={false} className="border-rose-500/35 bg-rose-500/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-orbitron text-xs font-bold text-rose-400 tracking-wider">UPGRADE REQUEST REJECTED</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Reason: <span className="text-white italic">&quot;{activeRequest.rejectionReason || 'Invalid proof upload screenshot.'}&quot;</span>. Please recheck your payment details and upload a valid receipt.
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* ── Pricing Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Tier */}
            <GlassCard hover={false} className="border-white/8 opacity-70 flex flex-col justify-between h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.02),transparent_60%)] pointer-events-none" />
              <div className="space-y-6 relative z-10">
                <div className="text-center space-y-3 pb-6 border-b border-white/5">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-5 h-5 text-gray-500" />
                  </div>
                  <h3 className="font-orbitron font-bold tracking-widest text-sm text-gray-500">FREE COGNITION NODE</h3>
                  <div>
                    <p className="text-4xl font-bold font-mono text-white">Rs. 0</p>
                    <span className="text-[10px] text-gray-600 tracking-wider font-mono">Free Tier bandwidth</span>
                  </div>
                </div>
                <div className="space-y-2.5 px-2">
                  {[
                    'Limited AI Chats (20/day)',
                    'Limited Code Generation (10/day)',
                    'Limited File Upload Scans (5/day)',
                    'Standard UI & Basic Memory Presets',
                    'Voice Assistant Locked',
                    'Autonomous Project Generator Locked',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs font-mono text-gray-600">
                      <CheckCircle className="w-3.5 h-3.5 text-white/15 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-white/5 relative z-10">
                <NeonButton disabled className="w-full opacity-40 cursor-not-allowed text-[10px] tracking-widest py-2">
                  ACTIVE DEFAULT TIER
                </NeonButton>
              </div>
            </GlassCard>

            {/* Pro Tier Card — Pulsing Neon Aura */}
            <div className="relative">
              {/* Outer pulsing aura rings */}
              <div className="absolute -inset-[3px] rounded-2xl bg-gradient-to-br from-neon-purple via-neon-blue to-neon-purple opacity-30 animate-[spin_6s_linear_infinite]" />
              <div className="absolute -inset-[1px] rounded-2xl bg-[#0c0a16]" />

              <GlassCard hover={false} className="border-neon-purple/50 bg-gradient-to-b from-neon-purple/8 to-transparent relative overflow-hidden flex flex-col justify-between h-full z-10">
                {/* Recommended badge */}
                <div className="absolute top-0 right-0 bg-gradient-to-l from-neon-purple to-[#be5cf6] text-white text-[8px] font-black font-orbitron px-5 py-1.5 rounded-bl-2xl tracking-[0.2em] flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-white" />
                  RECOMMENDED
                </div>
                {/* Background glow */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(138,43,226,0.12),transparent_60%)] pointer-events-none" />

                <div className="space-y-6 relative z-10">
                  <div className="text-center space-y-3 pb-6 border-b border-neon-purple/15">
                    <div className="w-12 h-12 rounded-full bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center mx-auto mb-2 shadow-[0_0_20px_rgba(138,43,226,0.3)]">
                      <Crown className="w-6 h-6 text-neon-purple" />
                    </div>
                    <h3 className="font-orbitron font-bold tracking-widest text-neon-purple text-sm">PRO QUANTUM NODE</h3>
                    <div>
                      <p className="text-4xl font-bold font-mono text-white" style={{ textShadow: '0 0 20px rgba(138,43,226,0.5)' }}>Rs. 999</p>
                      <span className="text-[10px] text-gray-500 tracking-wider font-mono">per solar month &bull; Rs. 8,999 / Year</span>
                    </div>
                  </div>
                  <div className="space-y-2.5 px-2">
                    {[
                      'Unlimited AI Chats (Groq, Llama 3 70B)',
                      'Unlimited Code Generators & Debug sessions',
                      'Unlimited Smart File Analysis (PDFs, docs, code)',
                      'Quantum Voice Assistant Link Telemetry',
                      'Autonomous MERN Project Scaffolder & Zip',
                      'Real-Time Cognitive Memory Profiles',
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs font-mono text-white">
                        <div className="w-3.5 h-3.5 rounded-full bg-neon-blue/20 border border-neon-blue/40 flex items-center justify-center shrink-0">
                          <Check className="w-2 h-2 text-neon-blue" />
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-8 pt-4 border-t border-neon-purple/15 relative z-10">
                  <NeonButton onClick={() => setModalOpen(true)} className="w-full text-[10px] tracking-widest py-2.5 flex items-center justify-center gap-2">
                    UPGRADE SYSTEM NODE
                    <ChevronRight className="w-3.5 h-3.5" />
                  </NeonButton>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      )}

      {/* ── Manual Payment Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg relative"
            >
              {/* Outer glow ring */}
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-neon-purple/60 via-neon-blue/30 to-neon-purple/60 opacity-50" />
              <div className="relative bg-[#080611] border border-neon-purple/30 rounded-2xl p-6 overflow-y-auto max-h-[92vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-white/8 mb-5">
                  <div>
                    <h3 className="font-orbitron font-black text-white text-sm tracking-wider">PRO SYSTEM SYNC PROTOCOL</h3>
                    <p className="text-[9px] font-mono text-gray-600 mt-0.5">Secure manual payment uplink channel</p>
                  </div>
                  <button onClick={() => setModalOpen(false)} className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-5">

                  {/* Step 1: Plan Selector */}
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-orbitron tracking-widest text-gray-500 flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center text-[8px] text-neon-purple font-bold">1</span>
                      Choose Subscription Cycle
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ id: 'monthly', label: 'Monthly', price: 'Rs. 999', color: 'neon-blue' }, { id: 'yearly', label: 'Yearly', price: 'Rs. 8,999', color: 'neon-purple' }].map((plan) => (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlan(plan.id)}
                          className={`py-3 px-4 rounded-xl border text-xs font-mono tracking-wider transition-all text-left ${
                            selectedPlan === plan.id
                              ? plan.id === 'monthly'
                                ? 'border-neon-blue/50 bg-neon-blue/10 text-white shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                                : 'border-neon-purple/50 bg-neon-purple/10 text-white shadow-[0_0_15px_rgba(138,43,226,0.1)]'
                              : 'border-white/8 bg-white/3 text-gray-500'
                          }`}
                        >
                          <div className="font-bold">{plan.label}</div>
                          <div className="text-[10px] mt-0.5 opacity-70">{plan.price}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Payment Provider */}
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-orbitron tracking-widest text-gray-500 flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center text-[8px] text-neon-purple font-bold">2</span>
                      Select Payment Node
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ id: 'JazzCash', color: 'rgba(190,92,246,0.5)', bg: 'rgba(138,43,226,0.1)', border: 'rgba(190,92,246,0.4)' }, { id: 'EasyPaisa', color: 'rgba(0,240,255,0.5)', bg: 'rgba(0,240,255,0.08)', border: 'rgba(0,240,255,0.35)' }].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id)}
                          className={`py-2.5 rounded-xl border text-xs font-mono tracking-wider transition-all flex items-center justify-center gap-2 ${
                            paymentMethod === m.id ? 'text-white' : 'border-white/8 bg-white/3 text-gray-500'
                          }`}
                          style={paymentMethod === m.id ? { borderColor: m.border, backgroundColor: m.bg, boxShadow: `0 0 12px ${m.color}30` } : {}}
                        >
                          <Smartphone size={14} style={{ color: paymentMethod === m.id ? m.color : '#6b7280' }} />
                          {m.id}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Holographic Credit Card Details */}
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-orbitron tracking-widest text-gray-500 flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center text-[8px] text-neon-purple font-bold">3</span>
                      Transfer to This Account
                    </label>
                    {/* Credit card visual */}
                    <div className="relative rounded-2xl p-5 overflow-hidden" style={{
                      background: paymentMethod === 'JazzCash'
                        ? 'linear-gradient(135deg, #1a0a2e 0%, #2d1454 40%, #0e0527 100%)'
                        : 'linear-gradient(135deg, #021624 0%, #073047 40%, #011018 100%)',
                    }}>
                      {/* Card shimmer lines */}
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(255,255,255,0.015)_20px,rgba(255,255,255,0.015)_40px)] pointer-events-none" />
                      {/* Card glow corner */}
                      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: paymentMethod === 'JazzCash' ? 'rgba(190,92,246,0.2)' : 'rgba(0,240,255,0.15)' }} />
                      
                      <div className="relative z-10">
                        {/* Card top */}
                        <div className="flex justify-between items-start mb-5">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-5 h-5" style={{ color: paymentMethod === 'JazzCash' ? '#be5cf6' : '#00F0FF' }} />
                            <span className="font-orbitron font-bold text-sm tracking-wider" style={{ color: paymentMethod === 'JazzCash' ? '#be5cf6' : '#00F0FF' }}>
                              {paymentMethod}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">AMOUNT DUE</div>
                            <div className="font-orbitron font-black text-white text-sm">Rs. {getPlanPrice(selectedPlan).toLocaleString()}</div>
                          </div>
                        </div>

                        {/* Card number section */}
                        <div className="mb-4">
                          <div className="text-[8px] font-mono text-gray-500 uppercase tracking-widest mb-1">Mobile Account</div>
                          <div className="font-mono text-2xl font-black tracking-[0.2em]" style={{ color: paymentMethod === 'JazzCash' ? '#be5cf6' : '#00F0FF', textShadow: `0 0 15px ${paymentMethod === 'JazzCash' ? 'rgba(190,92,246,0.5)' : 'rgba(0,240,255,0.4)'}` }}>
                            {currentAccountNumber.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3')}
                          </div>
                        </div>

                        {/* Card holder */}
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-[8px] font-mono text-gray-500 uppercase tracking-widest mb-0.5">Account Holder</div>
                            <div className="font-orbitron font-bold text-white uppercase text-xs tracking-widest">{currentAccountName}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[8px] font-mono text-gray-500 uppercase tracking-widest mb-0.5">Plan</div>
                            <div className="font-mono text-white text-xs uppercase font-bold">{selectedPlan}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-[9px] text-gray-600 font-mono italic px-1">
                      Transfer exactly <span className="text-white font-bold">Rs. {getPlanPrice(selectedPlan).toLocaleString()}</span> to this account, then complete steps below.
                    </p>
                  </div>

                  {/* Step 4: Transaction ID */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-orbitron tracking-widest text-gray-500 flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center text-[8px] text-neon-purple font-bold">4</span>
                      Transaction ID <span className="text-gray-600 normal-case font-sans">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 810729384728"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-mono placeholder-gray-700 focus:outline-none focus:border-neon-purple/50 focus:shadow-[0_0_12px_rgba(138,43,226,0.1)] transition-all"
                    />
                  </div>

                  {/* Step 5: Digital Scanner Upload */}
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-orbitron tracking-widest text-gray-500 flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center text-[8px] text-neon-purple font-bold">5</span>
                      Upload Proof Screenshot
                    </label>

                    <div
                      className={`relative rounded-xl overflow-hidden transition-all ${dragOver ? 'scale-[1.01]' : ''}`}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileChange(f); }}
                    >
                      {/* Scanner border frame */}
                      <div className={`absolute inset-0 rounded-xl transition-all ${dragOver ? 'opacity-100' : 'opacity-60'}`}
                        style={{ background: 'transparent', boxShadow: dragOver ? '0 0 0 2px rgba(138,43,226,0.6), 0 0 20px rgba(138,43,226,0.2) inset' : '0 0 0 2px rgba(138,43,226,0.25)' }} />
                      {/* Corner brackets */}
                      {[['top-2 left-2 border-t border-l', 'rounded-tl'], ['top-2 right-2 border-t border-r', 'rounded-tr'], ['bottom-2 left-2 border-b border-l', 'rounded-bl'], ['bottom-2 right-2 border-b border-r', 'rounded-br']].map(([pos, rnd], i) => (
                        <div key={i} className={`absolute w-4 h-4 ${pos} border-neon-purple/60 pointer-events-none z-10`} />
                      ))}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                        required
                      />
                      <div className={`p-6 flex flex-col items-center justify-center gap-3 bg-black/40 min-h-[110px] ${dragOver ? 'bg-neon-purple/5' : ''}`}>
                        {screenshotPreview ? (
                          <div className="flex flex-col items-center gap-2">
                            <img src={screenshotPreview} alt="Payment proof preview" className="max-h-20 rounded-lg object-contain border border-neon-purple/30 shadow-[0_0_15px_rgba(138,43,226,0.2)]" />
                            <span className="text-[9px] text-gray-500 font-mono truncate max-w-[200px]">{screenshotFile?.name}</span>
                          </div>
                        ) : (
                          <>
                            {/* Scanner laser animation */}
                            <div className="relative w-10 h-10">
                              <Scan className="w-10 h-10 text-neon-purple/40" />
                              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-neon-purple animate-[scan_2s_ease-in-out_infinite]" style={{ animationName: 'scan' }} />
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] font-orbitron text-gray-500 tracking-widest uppercase">Drop or click to scan</p>
                              <p className="text-[9px] font-mono text-gray-700 mt-0.5">Payment receipt image file</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-1">
                    <NeonButton type="submit" disabled={loading} className="w-full text-xs font-orbitron tracking-widest py-3 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          SYNCHRONIZING TELEMETRY...
                        </>
                      ) : (
                        <>
                          <Shield className="w-3.5 h-3.5" />
                          SUBMIT UPGRADE TRANSACTION
                        </>
                      )}
                    </NeonButton>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Transaction Log History (Terminal Grid) ── */}
      <GlassCard hover={false} className="border-white/5 mt-6 relative overflow-hidden">
        {/* Header line accent */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-blue/40 to-transparent" />

        <h3 className="font-orbitron font-semibold text-xs tracking-widest mb-4 flex items-center gap-2 uppercase text-white">
          <Clock className="w-4 h-4 text-neon-blue" />
          Transaction Log History
          <span className="ml-auto text-[9px] font-mono text-gray-600">TERMINAL v2</span>
        </h3>

        {/* Table header */}
        {profileData?.subscription?.paymentHistory?.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-white/5">
            {/* Column headers */}
            <div className="grid grid-cols-4 bg-black/40 border-b border-white/5 px-4 py-2">
              {['DATE', 'PLAN', 'AMOUNT', 'STATUS'].map((col) => (
                <span key={col} className="text-[8px] font-orbitron text-gray-600 uppercase tracking-widest">{col}</span>
              ))}
            </div>
            {/* Rows */}
            {profileData.subscription.paymentHistory.map((payment, i) => (
              <div
                key={i}
                className={`grid grid-cols-4 px-4 py-3 font-mono text-xs transition-colors ${i % 2 === 0 ? 'bg-black/20' : 'bg-white/[0.012]'} hover:bg-neon-blue/5 border-b border-white/3`}
              >
                <span className="text-gray-500 text-[10px]">{new Date(payment.date).toLocaleDateString()}</span>
                <span className="text-white uppercase text-[10px] font-bold">{payment.plan}</span>
                <span className="text-white text-[10px] font-mono">Rs. {payment.amount}</span>
                <span>
                  <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold ${
                    payment.status === 'completed' || payment.status === 'success'
                      ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20'
                      : payment.status === 'pending'
                      ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20'
                      : 'text-rose-400 bg-rose-400/10 border border-rose-400/20'
                  }`}>
                    {payment.status}
                  </span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 py-6 px-4 bg-black/20 rounded-xl border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-blue/40 animate-pulse" />
            <p className="text-xs text-gray-600 font-mono italic">No past billing history detected in system records.</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// Icon micro alias
function Check({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
