import FloatingParticles from './FloatingParticles';
import GradientBlobs from './GradientBlobs';
import CyberGrid from './CyberGrid';
import HologramWaves from './HologramWaves';
import AuroraBorealis from './AuroraBorealis';
import Starfield3D from './Starfield3D';
import WireframeBackground from './WireframeBackground';

export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 z-[-50] bg-[#070B14] overflow-hidden pointer-events-none perspective-1200">
      <Starfield3D />
      <AuroraBorealis />
      <GradientBlobs />
      <HologramWaves />
      <CyberGrid />
      <FloatingParticles />
      <WireframeBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070B14]/50 to-[#070B14] z-0 pointer-events-none" />
    </div>
  );
}
