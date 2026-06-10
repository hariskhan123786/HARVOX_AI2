import { useEffect, useState } from 'react';

export default function FOMOBadge({ className }) {
  const [onlineCount, setOnlineCount] = useState(847);

  // Slightly fluctuate online count to simulate live dynamic activity
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = prev + delta;
        return next > 800 && next < 900 ? next : prev;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`fomo-badge select-none ${className || ''}`}>
      <span className="fomo-dot" />
      <span>Live: {onlineCount} Developers Online</span>
    </div>
  );
}
