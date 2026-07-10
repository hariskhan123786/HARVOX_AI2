export default function GradientBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
      <style>{`
        @keyframes blob1 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(100px, -100px, 0) scale(1.2); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-150px, 150px, 0) scale(1.3); }
        }
        @keyframes blob3 {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(50px, 50px, 0); }
        }
        .animate-blob1 { animation: blob1 25s infinite linear; }
        .animate-blob2 { animation: blob2 30s infinite linear; }
        .animate-blob3 { animation: blob3 28s infinite linear; }
      `}</style>
      <div
        className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-neon-purple blur-[120px] opacity-30 mix-blend-screen will-change-transform animate-blob1"
      />
      <div
        className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-neon-blue blur-[100px] opacity-20 mix-blend-screen will-change-transform animate-blob2"
      />
      <div
        className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-neon-pink blur-[150px] opacity-20 mix-blend-screen will-change-transform animate-blob3"
      />
    </div>
  );
}

