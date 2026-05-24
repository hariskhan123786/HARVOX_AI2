export default function HologramWaves() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-10">
      <div className="absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-blue to-transparent animate-scanLine" />
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-purple to-transparent animate-scanLine" style={{ animationDelay: '2s' }} />
      <div className="absolute top-3/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-pink to-transparent animate-scanLine" style={{ animationDelay: '1s' }} />
    </div>
  );
}
