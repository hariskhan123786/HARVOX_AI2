import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const PerformanceContext = createContext({ mode: 'balanced', fps: null, reason: 'Measuring device performance' });
const GRAPHICS_MODES = new Set(['auto', 'balanced', 'performance', 'ultra']);

function getStoredGraphicsMode() {
  const stored = window.localStorage.getItem('harvox_graphics_mode');
  return GRAPHICS_MODES.has(stored) ? stored : 'auto';
}

function getManualProfile(graphicsMode) {
  if (graphicsMode === 'ultra') return { mode: 'high', reason: 'Ultra graphics mode selected' };
  if (graphicsMode === 'performance') return { mode: 'lite', reason: 'Performance graphics mode selected' };
  return { mode: 'balanced', reason: 'Balanced graphics mode selected' };
}

function getInitialProfile() {
  const navigatorInfo = window.navigator;
  const connection = navigatorInfo.connection || navigatorInfo.mozConnection || navigatorInfo.webkitConnection;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const lowPower = reducedMotion
    || navigatorInfo.hardwareConcurrency <= 4
    || navigatorInfo.deviceMemory <= 4
    || connection?.saveData
    || ['slow-2g', '2g'].includes(connection?.effectiveType);

  if (lowPower) return { mode: 'lite', reason: reducedMotion ? 'Reduced motion preference' : 'Device resource profile' };
  if (navigatorInfo.hardwareConcurrency <= 6 || navigatorInfo.deviceMemory <= 6) {
    return { mode: 'balanced', reason: 'Balanced device resource profile' };
  }
  return { mode: 'high', reason: 'High performance device profile' };
}

export function PerformanceProvider({ children }) {
  const [graphicsMode, setGraphicsModeState] = useState(getStoredGraphicsMode);
  const [profile, setProfile] = useState(() => graphicsMode === 'auto' ? getInitialProfile() : getManualProfile(graphicsMode));
  const [fps, setFps] = useState(null);

  const setGraphicsMode = (nextMode) => {
    if (!GRAPHICS_MODES.has(nextMode)) return;
    window.localStorage.setItem('harvox_graphics_mode', nextMode);
    setGraphicsModeState(nextMode);
    setProfile(nextMode === 'auto' ? getInitialProfile() : getManualProfile(nextMode));
  };

  useEffect(() => {
    let frameId;
    let lastFrame = performance.now();
    let sampleStartedAt = lastFrame;
    let frames = 0;
    let lowSamples = 0;

    const measure = (now) => {
      if (document.hidden) {
        lastFrame = now;
        frameId = requestAnimationFrame(measure);
        return;
      }

      frames += 1;
      if (now - sampleStartedAt >= 2000) {
        const nextFps = Math.round((frames * 1000) / (now - sampleStartedAt));
        setFps(nextFps);
        lowSamples = nextFps < 38 ? lowSamples + 1 : 0;

        // Degrade only after sustained frame drops to avoid visual mode flicker.
        if (graphicsMode === 'auto' && lowSamples >= 2) {
          setProfile(current => current.mode === 'lite'
            ? current
            : { mode: 'lite', reason: 'Sustained low frame rate detected' });
        }
        frames = 0;
        sampleStartedAt = now;
      }
      lastFrame = now;
      frameId = requestAnimationFrame(measure);
    };

    frameId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frameId);
  }, [graphicsMode]);

  useEffect(() => {
    document.documentElement.dataset.performanceMode = profile.mode;
  }, [profile.mode]);

  const value = useMemo(() => ({ ...profile, fps, graphicsMode, setGraphicsMode }), [profile, fps, graphicsMode]);
  return <PerformanceContext.Provider value={value}>{children}</PerformanceContext.Provider>;
}

export function usePerformanceMode() {
  return useContext(PerformanceContext);
}
