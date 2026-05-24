import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Crown, Shield, Zap, Lock, ArrowRight } from 'lucide-react';
import GlassCard from './GlassCard';
import NeonButton from './NeonButton';

export default function PremiumLockOverlay({ featureName, description }) {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-[500px] w-full items-center justify-center p-6 overflow-hidden rounded-2xl">
      {/* Background Cyber Grid effect */}
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-md z-0" />
      <div className="absolute inset-0 bg-gradient-to-tr from-neon-purple/10 via-transparent to-neon-blue/10 z-0 animate-pulse" />
      
      {/* Dotted Radial Circle Overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-neon-purple/20 border-dashed animate-[spin_120s_linear_infinite] z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-neon-blue/10 border-dashed animate-[spin_60s_linear_infinite_reverse] z-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 max-w-md w-full"
      >
        <GlassCard hover={true} className="border-neon-purple/40 bg-[#0c0f17]/90 p-8 shadow-neon-purple/30 text-center relative overflow-hidden">
          {/* Top subtle bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-neon-purple via-neon-pink to-neon-blue" />
          
          <div className="flex flex-col items-center space-y-5">
            {/* Glowing Icon Lock Ring */}
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-neon-purple/10 border border-neon-purple/50 shadow-neon-purple animate-pulse">
              <Lock className="w-6 h-6 text-neon-pink" />
              <Crown className="w-4 h-4 text-neon-blue absolute -top-1 -right-1 rotate-12" />
            </div>

            <div className="space-y-2">
              <h2 className="font-orbitron text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-pro">
                PRO MODULE RESTRICTED
              </h2>
              <p className="text-sm font-orbitron font-semibold text-neon-blue uppercase tracking-wider">
                {featureName || 'Cognitive Feature'}
              </p>
              <p className="text-xs text-muted leading-relaxed font-poppins px-2">
                {description || 'This AI operational node requires a validated PRO subscription tier to hydralize parameters.'}
              </p>
            </div>

            {/* Premium features unlocked with PRO list */}
            <div className="w-full bg-secondary/40 rounded-xl p-4 border border-white/5 text-left space-y-2.5 font-mono text-[11px]">
              <div className="flex items-center gap-2 text-white">
                <Zap className="w-3.5 h-3.5 text-neon-blue shrink-0" />
                <span>Unlimited neural requests & file analyzer scans</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Shield className="w-3.5 h-3.5 text-neon-purple shrink-0" />
                <span>Access all advanced cognitive models</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Crown className="w-3.5 h-3.5 text-neon-pink shrink-0" />
                <span>Voice telemetry link and Project Generator Scaffolding</span>
              </div>
            </div>

            <div className="w-full pt-2">
              <NeonButton
                variant="pro"
                onClick={() => navigate('/app/billing')}
                className="w-full py-2.5 text-xs font-orbitron font-bold tracking-widest shadow-neon-pink flex items-center justify-center gap-2"
              >
                UPGRADE COGNITIVE SYSTEM
                <ArrowRight className="w-3.5 h-3.5" />
              </NeonButton>
            </div>
            
            <button
              onClick={() => navigate('/app/dashboard')}
              className="text-[10px] font-orbitron tracking-widest text-muted/60 hover:text-white transition-all uppercase"
            >
              Abort Link and Return
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
