import { Activity, Cpu, Gauge } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { usePerformanceMode } from './PerformanceProvider';

const MODE_LABELS = { high: 'HIGH FIDELITY', balanced: 'BALANCED', lite: 'LITE MODE' };

export default function PerformanceMonitor() {
  const { mode, fps, reason } = usePerformanceMode();
  const healthy = fps === null || fps >= 45;

  return (
    <GlassCard hover={false} className="border-white/5 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue">
            <Gauge size={14} />
          </div>
          <div>
            <h3 className="font-orbitron text-[10px] font-bold tracking-widest text-white">PERFORMANCE MODE</h3>
            <p className="text-[8px] font-mono text-gray-600">Automatic device optimization</p>
          </div>
        </div>
        <span className={`text-[8px] font-orbitron font-bold tracking-wider ${mode === 'lite' ? 'text-amber-400' : 'text-emerald-400'}`}>
          {MODE_LABELS[mode]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-white/5 bg-black/20 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-gray-600"><Activity size={11} /><span className="text-[8px] font-mono">FRAME RATE</span></div>
          <p className={`mt-1 font-orbitron text-sm font-bold ${healthy ? 'text-neon-blue' : 'text-amber-400'}`}>{fps ? `${fps} FPS` : 'MEASURING'}</p>
        </div>
        <div className="rounded-lg border border-white/5 bg-black/20 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-gray-600"><Cpu size={11} /><span className="text-[8px] font-mono">RENDERING</span></div>
          <p className="mt-1 font-orbitron text-sm font-bold text-white uppercase">{mode}</p>
        </div>
      </div>

      <p className="text-[9px] leading-relaxed text-gray-500 border-t border-white/5 pt-3">{reason}. Effects are reduced automatically when sustained frame drops are detected.</p>
    </GlassCard>
  );
}
