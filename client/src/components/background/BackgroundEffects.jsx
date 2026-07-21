import GradientBlobs from './GradientBlobs';
import CyberGrid from './CyberGrid';
import HologramWaves from './HologramWaves';
import Starfield3D from './Starfield3D';
import { usePerformanceMode } from '../performance/PerformanceProvider';

export default function BackgroundEffects() {
  const { mode } = usePerformanceMode();

  return (
    <div className="fixed inset-0 z-[-50] bg-[#070B14] overflow-hidden pointer-events-none perspective-1200">
      {mode !== 'lite' && <Starfield3D density={mode === 'high' ? 200 : 90} />}
      <GradientBlobs simplified={mode === 'lite'} />
      {mode === 'high' && <HologramWaves />}
      <CyberGrid />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070B14]/50 to-[#070B14] z-0 pointer-events-none" />
    </div>
  );
}

