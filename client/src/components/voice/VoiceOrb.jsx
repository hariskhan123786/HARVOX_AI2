import { motion } from 'framer-motion';

export default function VoiceOrb({ isListening, isSpeaking }) {
  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      <motion.div
        animate={{ 
          scale: isListening ? [1, 1.2, 1] : isSpeaking ? [1, 1.1, 1] : 1,
          opacity: isListening ? [0.5, 0.8, 0.5] : isSpeaking ? [0.6, 1, 0.6] : 0.3
        }}
        transition={{ duration: isListening ? 1.5 : isSpeaking ? 0.8 : 2, repeat: Infinity }}
        className={`absolute inset-0 rounded-full blur-2xl ${
          isListening ? 'bg-neon-pink/30' : isSpeaking ? 'bg-neon-blue/30' : 'bg-neon-purple/20'
        }`}
      />
      <div className={`relative w-32 h-32 rounded-full flex items-center justify-center shadow-lg border border-white/10 ${
        isListening ? 'bg-neon-pink/20 shadow-neon-pink' : isSpeaking ? 'bg-neon-blue/20 shadow-neon-blue' : 'bg-white/5'
      }`}>
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
          {/* Audio bars simulation */}
          <div className="flex items-end justify-center space-x-1 h-8">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: (isListening || isSpeaking) ? ['20%', '100%', '20%'] : '20%' }}
                transition={{ 
                  duration: isSpeaking ? 0.4 : 0.8, 
                  repeat: Infinity, 
                  delay: i * 0.1,
                  ease: 'easeInOut'
                }}
                className={`w-1.5 rounded-t ${isListening ? 'bg-neon-pink' : isSpeaking ? 'bg-neon-blue' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
