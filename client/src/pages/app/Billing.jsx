import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/ui/GlassCard';
import NeonButton from '../../components/ui/NeonButton';
import { Crown, CheckCircle, Zap, Shield, Clock, Upload, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';
import { profileAPI, paymentsAPI } from '../../services/api';

export default function Billing() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  
  // Payment dynamic configuration from admin
  const [paymentSettings, setPaymentSettings] = useState({
    jazzCashNumber: '03188353770',
    jazzCashName: 'muhammad haris khan',
    easyPaisaNumber: '03188353770',
    easyPaisaName: 'muhammad haris khan',
  });

  // User's active payment request status
  const [activeRequest, setActiveRequest] = useState(null);

  // Form State
  const [selectedPlan, setSelectedPlan] = useState('monthly'); // 'monthly' | 'yearly'
  const [paymentMethod, setPaymentMethod] = useState('JazzCash'); // 'JazzCash' | 'EasyPaisa'
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  
  const [feedback, setFeedback] = useState({ show: false, message: '', type: 'info' });
  const [modalOpen, setModalOpen] = useState(false);

  const getPlanPrice = (plan) => (plan === 'monthly' ? 999 : 8999);

  const fetchStatusAndSettings = async () => {
    try {
      const settingsRes = await paymentsAPI.getSettings();
      if (settingsRes.data) {
        setPaymentSettings(settingsRes.data);
      }
      
      const statusRes = await paymentsAPI.getStatus();
      if (statusRes.data && statusRes.data.payment) {
        setActiveRequest(statusRes.data.payment);
      }
    } catch (error) {
      console.error('Failed to fetch payment parameters', error);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data } = await profileAPI.getData();
        setProfileData(data);
      } catch (error) {
        console.error('Failed to fetch profile data', error);
      }
    };
    
    fetchProfileData();
    fetchStatusAndSettings();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const showFeedback = (message, type = 'info') => {
    setFeedback({ show: true, message, type });
    setTimeout(() => setFeedback({ show: false, message: '', type: 'info' }), 4000);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!screenshotFile) {
      showFeedback('Please upload a screenshot proof of payment.', 'error');
      return;
    }

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
      
      // Reset form
      setTransactionId('');
      setScreenshotFile(null);
      setScreenshotPreview(null);
      setModalOpen(false);
      
      // Refresh status
      await fetchStatusAndSettings();
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Submission failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isPro = user?.subscription === 'pro' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-orbitron text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-neon">
            SUBSCRIPTION & BILLING
          </h1>
          <p className="text-xs text-muted">Manage your premium SaaS cognitive resources</p>
        </div>
        
        <button 
          onClick={fetchStatusAndSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 bg-secondary/40 text-xs font-mono text-muted hover:text-white hover:border-white/10 transition-all"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Sync Billing State
        </button>
      </div>

      {/* Toast Alert */}
      {feedback.show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border font-mono text-xs flex items-center gap-3 ${
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

      {/* Pro Plan Active Status */}
      {isPro ? (
        <GlassCard hover={false} className="border-amber-400/30 bg-amber-400/5 relative overflow-hidden">
          {/* Holographic background rings */}
          <div className="absolute top-1/2 right-10 -translate-y-1/2 w-48 h-48 rounded-full border border-amber-400/5 border-dashed pointer-events-none" />
          <div className="absolute top-1/2 right-16 -translate-y-1/2 w-36 h-36 rounded-full border border-amber-400/10 border-dashed pointer-events-none animate-[spin_40s_linear_infinite]" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-amber-400/20 flex items-center justify-center border border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.3)] shrink-0 animate-pulse">
                <Crown className="w-7 h-7 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-orbitron font-bold text-amber-400 tracking-widest text-lg">PRO COGNITION ACTIVE</h3>
                <p className="text-xs text-muted max-w-xl font-poppins leading-relaxed">
                  Your node is fully synchronized with the high-performance Llama 3 70B model. Unlimited cognitive bandwidth, voice Assistant links, and full agent workspace systems are unlocked.
                </p>
              </div>
            </div>
            
            <div className="shrink-0">
              <div className="px-4 py-2.5 rounded-xl border border-amber-400/30 bg-amber-400/10 font-orbitron text-center">
                <span className="text-[10px] text-amber-400 font-bold block tracking-wider">TIER SUBSCRIPTION</span>
                <span className="text-white text-xs font-bold font-mono">RS. 999 / MONTH</span>
              </div>
            </div>
          </div>
        </GlassCard>
      ) : activeRequest && activeRequest.status === 'pending' ? (
        /* Pending Request overlay */
        <GlassCard hover={false} className="border-neon-blue/30 bg-neon-blue/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-neon-blue/10 flex items-center justify-center border border-neon-blue/50 shrink-0">
              <Clock className="w-6 h-6 text-neon-blue animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="font-orbitron font-bold text-neon-blue tracking-wider text-sm">UPGRADE REQUEST PENDING</h3>
              <p className="text-xs text-muted leading-relaxed">
                We have received your manual transaction proof (ID: <span className="font-mono text-white">{activeRequest.transactionId || 'N/A'}</span>) via {activeRequest.method} for the <span className="uppercase font-bold text-white">{activeRequest.plan}</span> plan. Our system admin is verifying the payment slot.
              </p>
            </div>
          </div>
        </GlassCard>
      ) : (
        /* Standard pricing cards */
        <div className="space-y-6">
          {/* Rejection Notification if any */}
          {activeRequest && activeRequest.status === 'rejected' && (
            <GlassCard hover={false} className="border-rose-500/40 bg-rose-500/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-orbitron text-xs font-bold text-rose-400 tracking-wider">UPGRADE REQUEST REJECTED</h4>
                  <p className="text-xs text-muted leading-relaxed">
                    Reason: <span className="text-white italic">&quot;{activeRequest.rejectionReason || 'Invalid proof upload screenshot.'}&quot;</span>. Please double-check your payment transaction details and upload a valid transaction receipt slip.
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Tier Card */}
            <GlassCard hover={false} className="border-white/10 opacity-75 flex flex-col justify-between h-full">
              <div className="space-y-6">
                <div className="text-center space-y-3 pb-6 border-b border-white/5">
                  <h3 className="font-orbitron font-bold tracking-widest text-sm text-muted">FREE COGNITION NODE</h3>
                  <p className="text-4xl font-bold font-mono text-white">Rs. 0<span className="text-xs text-muted tracking-wider block font-sans mt-1">Free Tier bandwidth</span></p>
                </div>
                
                <div className="space-y-3 px-2">
                  {[
                    'Limited AI Chats (20/day)',
                    'Limited Code Generation (10/day)',
                    'Limited File Upload Scans (5/day)',
                    'Standard UI & Basic Memory Presets',
                    'Voice Assistant Locked',
                    'Autonomous Project Generator Locked',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs font-mono text-muted">
                      <CheckCircle className="w-4 h-4 text-white/20 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5">
                <NeonButton disabled className="w-full opacity-50 cursor-not-allowed text-[10px] tracking-widest py-2">
                  ACTIVE DEFAULT TIER
                </NeonButton>
              </div>
            </GlassCard>

            {/* Pro Tier Card */}
            <GlassCard hover={true} className="border-neon-purple/40 bg-neon-purple/5 relative overflow-hidden flex flex-col justify-between h-full">
              <div className="absolute top-0 right-0 bg-neon-purple text-white text-[9px] font-bold font-orbitron px-4 py-1.5 rounded-bl-xl tracking-widest">
                RECOMMENDED
              </div>
              
              <div className="space-y-6">
                <div className="text-center space-y-3 pb-6 border-b border-white/5">
                  <h3 className="font-orbitron font-bold tracking-widest text-neon-purple text-sm">PRO QUANTUM NODE</h3>
                  <p className="text-4xl font-bold font-mono text-white">Rs. 999<span className="text-xs text-muted tracking-wider block font-sans mt-1">per solar month (Rs. 8,999 / Year)</span></p>
                </div>

                <div className="space-y-3 px-2">
                  {[
                    'Unlimited AI Chats (Groq, Llama 3 70B)',
                    'Unlimited Code Generators & Debug sessions',
                    'Unlimited Smart File Analysis (PDFs, docs, code)',
                    'Quantum Voice Assistant Link Telemetry',
                    'Autonomous MERN Project Scaffolder & Zip downloader',
                    'Real-Time Cognitive Memory Profiles',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs font-mono text-white">
                      <CheckCircle className="w-4 h-4 text-neon-blue shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5">
                <NeonButton 
                  onClick={() => setModalOpen(true)} 
                  className="w-full text-[10px] tracking-widest py-2.5 shadow-neon-purple"
                >
                  UPGRADE SYSTEM NODE
                </NeonButton>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Manual Payment Step-by-Step Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-[#0C101A] border border-neon-purple/40 rounded-2xl p-6 shadow-neon-purple overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-5">
              <h3 className="font-orbitron font-bold text-white text-sm tracking-wider">PRO SYSTEM SYNC PROTOCOL</h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-muted hover:text-white font-mono text-sm"
              >
                [X]
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-5">
              {/* Step 1: Plan Selector */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-orbitron tracking-widest text-muted">1. Choose Subscription Cycle</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('monthly')}
                    className={`py-2 rounded-xl border text-xs font-mono tracking-wider transition-all ${
                      selectedPlan === 'monthly' ? 'border-neon-blue bg-neon-blue/10 text-white' : 'border-white/5 bg-secondary text-muted'
                    }`}
                  >
                    Monthly (Rs. 999)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('yearly')}
                    className={`py-2 rounded-xl border text-xs font-mono tracking-wider transition-all ${
                      selectedPlan === 'yearly' ? 'border-neon-purple bg-neon-purple/10 text-white' : 'border-white/5 bg-secondary text-muted'
                    }`}
                  >
                    Yearly (Rs. 8,999)
                  </button>
                </div>
              </div>

              {/* Step 2: Payment Provider */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-orbitron tracking-widest text-muted">2. Select Payment Node</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('JazzCash')}
                    className={`py-2 rounded-xl border text-xs font-mono tracking-wider transition-all flex items-center justify-center gap-2 ${
                      paymentMethod === 'JazzCash' ? 'border-neon-purple bg-neon-purple/10 text-white' : 'border-white/5 bg-secondary text-muted'
                    }`}
                  >
                    <Smartphone size={14} className="text-neon-pink" />
                    JazzCash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('EasyPaisa')}
                    className={`py-2 rounded-xl border text-xs font-mono tracking-wider transition-all flex items-center justify-center gap-2 ${
                      paymentMethod === 'EasyPaisa' ? 'border-neon-blue bg-neon-blue/10 text-white' : 'border-white/5 bg-secondary text-muted'
                    }`}
                  >
                    <Smartphone size={14} className="text-neon-blue" />
                    EasyPaisa
                  </button>
                </div>
              </div>

              {/* Step 3: Display Account details */}
              <div className="p-4 rounded-xl border border-white/5 bg-secondary/60 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted font-mono">Mobile Account Number:</span>
                  <span className="font-orbitron font-bold text-neon-blue tracking-widest text-sm">
                    {paymentMethod === 'JazzCash' ? paymentSettings.jazzCashNumber : paymentSettings.easyPaisaNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted font-mono">Account Holder Title:</span>
                  <span className="font-orbitron font-bold text-white tracking-widest text-xs">
                    {paymentMethod === 'JazzCash' ? paymentSettings.jazzCashName : paymentSettings.easyPaisaName}
                  </span>
                </div>
                <div className="text-[10px] text-muted italic font-sans border-t border-white/5 pt-1.5 mt-1.5 leading-relaxed">
                  Please transfer exactly <span className="font-bold text-white">Rs. {getPlanPrice(selectedPlan)}</span> to this account. Once done, upload your receipt screenshot and insert the Transaction ID below.
                </div>
              </div>

              {/* Step 4: Transaction ID */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-orbitron tracking-widest text-muted">3. Transaction ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 810729384728"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="input-neon text-xs font-mono py-2.5"
                />
              </div>

              {/* Step 5: Upload Screenshot */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-orbitron tracking-widest text-muted block">4. Upload Proof Screenshot</label>
                <div className="relative border-2 border-dashed border-white/10 hover:border-neon-purple/40 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-secondary/20">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required
                  />
                  {screenshotPreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={screenshotPreview} alt="Screenshot proof preview" className="max-h-24 rounded object-contain border border-white/10" />
                      <span className="text-[10px] text-muted truncate max-w-[200px]">{screenshotFile?.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 py-2">
                      <Upload className="w-5 h-5 text-neon-purple animate-bounce" />
                      <span className="text-[10px] text-muted font-mono">Select image file proof</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <NeonButton
                  type="submit"
                  disabled={loading}
                  className="w-full text-xs font-orbitron tracking-widest py-2.5"
                >
                  {loading ? 'SYNCHRONIZING TELEMETRY...' : 'SUBMIT UPGRADE TRANSACTION'}
                </NeonButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Payment History */}
      <GlassCard hover={false} className="border-white/5 mt-6">
        <h3 className="font-orbitron font-semibold text-sm tracking-wider mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-neon-blue" /> TRANSACTION LOG HISTORY
        </h3>
        {profileData?.subscription?.paymentHistory?.length > 0 ? (
          <div className="space-y-3">
            {profileData.subscription.paymentHistory.map((payment, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-white/5 font-mono text-xs">
                <span className="text-muted">{new Date(payment.date).toLocaleDateString()}</span>
                <span className="text-white text-xs uppercase">{payment.plan} plan</span>
                <span className="text-white">Rs. {payment.amount}</span>
                <span className="text-[9px] uppercase text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{payment.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted font-mono italic">No past billing history detected in the system records.</p>
        )}
      </GlassCard>
    </div>
  );
}
