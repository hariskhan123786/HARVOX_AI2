import { motion } from 'framer-motion';

export default function VoiceOrb({ isListening, isSpeaking, isThinking, isError }) {
  // Determine state-based parameters
  const getOrbColor = () => {
    if (isError) return 'from-red-600 via-rose-500/40 to-transparent';
    if (isThinking) return 'from-purple-600 via-fuchsia-500/40 to-transparent';
    if (isSpeaking) return 'from-cyan-400 via-emerald-500/35 to-transparent';
    if (isListening) return 'from-[#00ffff] via-blue-500/40 to-transparent';
    return 'from-cyan-500/30 via-blue-600/15 to-transparent'; // Idle
  };

  const getBorderColor = () => {
    if (isError) return 'border-red-500/40 shadow-red-500/30';
    if (isThinking) return 'border-purple-500/40 shadow-purple-500/30';
    if (isSpeaking) return 'border-emerald-500/40 shadow-emerald-500/30';
    if (isListening) return 'border-[#00ffff]/40 shadow-[#00ffff]/30';
    return 'border-white/10 shadow-[#00f0ff]/10'; // Idle
  };

  // Define SVG Ring animations based on states
  const getOuterRotationSpeed = () => {
    if (isThinking) return 3; // Fast spin
    if (isListening) return 8; // Moderate spin
    if (isSpeaking) return 12; // Moderate slow
    return 30; // Idle slow
  };

  const getInnerRotationSpeed = () => {
    if (isThinking) return -2.5; // Fast reverse spin
    if (isListening) return -6;
    if (isSpeaking) return -10;
    return -25; // Idle slow
  };

  return (
    <div className="relative flex items-center justify-center w-72 h-72 select-none pointer-events-none">
      
      {/* ============================================================
          1. DYNAMIC GLOW LAYER (Background glow)
      ============================================================ */}
      <motion.div
        animate={{
          scale: isListening ? [1, 1.25, 1] : isSpeaking ? [1, 1.15, 0.95, 1.1, 1] : isThinking ? [1, 1.05, 1] : [1, 1.08, 1],
          opacity: isListening ? [0.4, 0.7, 0.4] : isSpeaking ? [0.5, 0.8, 0.5] : isThinking ? [0.6, 0.9, 0.6] : 0.25,
        }}
        transition={{
          duration: isListening ? 1.2 : isSpeaking ? 0.6 : isThinking ? 2 : 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`absolute w-64 h-64 rounded-full blur-3xl bg-gradient-to-tr ${getOrbColor()}`}
      />

      {/* ============================================================
          2. OUTER RING (Sci-fi Instrument Dashes)
      ============================================================ */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: getOuterRotationSpeed(),
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute w-64 h-64"
      >
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke={isError ? '#ef4444' : isThinking ? '#a855f7' : isSpeaking ? '#34d399' : '#00ffff'}
            strokeWidth="0.75"
            strokeOpacity="0.35"
            strokeDasharray="15 8 5 8 30 10"
          />
        </svg>
      </motion.div>

      {/* ============================================================
          3. INNER RING (Concentric Reverse spin)
      ============================================================ */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{
          duration: Math.abs(getInnerRotationSpeed()),
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute w-56 h-56"
      >
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={isError ? '#ef4444' : isThinking ? '#d946ef' : isSpeaking ? '#22d3ee' : '#00f0ff'}
            strokeWidth="1.25"
            strokeOpacity="0.45"
            strokeDasharray="2 12"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      {/* ============================================================
          4. SPECTRUM RING & PARTICLE CLOUD (Concentric equalizers)
      ============================================================ */}
      <motion.div
        animate={{
          scale: isSpeaking ? [1, 1.06, 0.96, 1.02, 1] : 1
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-44 h-44 flex items-center justify-center"
      >
        {/* Floating Particle Dots orbiting in background */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              rotate: 360,
              scale: isListening ? [0.8, 1.3, 0.8] : 1
            }}
            transition={{
              rotate: { duration: 15 + i * 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, delay: i * 0.2 }
            }}
            className={`absolute w-1.5 h-1.5 rounded-full ${
              isError ? 'bg-red-500' : isThinking ? 'bg-purple-400' : isSpeaking ? 'bg-emerald-400' : 'bg-cyan-400'
            } opacity-50`}
            style={{
              transform: `rotate(${i * 60}deg) translateY(-80px)`
            }}
          />
        ))}
      </motion.div>

      {/* ============================================================
          5. CORE ENERGY SPHERE (Central HUD element)
      ============================================================ */}
      <motion.div
        animate={
          isError ? {
            x: [0, -4, 4, -4, 4, 0],
            y: [0, 2, -2, 2, -2, 0],
            scale: 1,
          } : isListening ? {
            scale: [0.95, 1.08, 0.95],
          } : isSpeaking ? {
            scale: [0.98, 1.04, 0.97, 1.02, 0.98],
          } : {
            scale: [1, 1.03, 1], // Idle breathing
          }
        }
        transition={{
          duration: isError ? 0.35 : isListening ? 1.4 : isSpeaking ? 0.5 : 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`relative w-36 h-36 rounded-full flex items-center justify-center border backdrop-blur-md transition-colors duration-500 bg-black/60 shadow-[inset_0_4px_16px_rgba(255,255,255,0.08)] ${getBorderColor()}`}
      >
        {/* Pulsing Core Sphere Grid */}
        <div className="absolute inset-2 rounded-full border border-white/5 bg-gradient-to-tr from-white/5 to-transparent flex items-center justify-center overflow-hidden">
          
          {/* Circular Equalizer simulation in center */}
          <div className="flex items-end justify-center space-x-1.5 h-8">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  height: isListening
                    ? ['15%', '85%', '15%']
                    : isSpeaking
                    ? ['20%', '100%', '30%', '85%', '20%']
                    : isThinking
                    ? ['10%', '45%', '10%']
                    : '15%'
                }}
                transition={{
                  duration: isSpeaking ? 0.45 : isListening ? 0.8 : 1.2,
                  repeat: Infinity,
                  delay: i * 0.08,
                  ease: 'easeInOut'
                }}
                className={`w-1.5 rounded-t transition-colors duration-500 ${
                  isError ? 'bg-red-500 shadow-[0_0_6px_#ef4444]' : 
                  isThinking ? 'bg-purple-500 shadow-[0_0_6px_#a855f7]' : 
                  isSpeaking ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 
                  'bg-[#00ffff] shadow-[0_0_6px_#00ffff]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Specular glass reflection layer */}
        <div className="absolute top-1 left-4 w-24 h-12 bg-gradient-to-b from-white/10 to-transparent rounded-full transform -rotate-12 blur-[1.5px]" />
      </motion.div>

    </div>
  );
}
