import React, { Suspense, useState, useEffect } from 'react';
import HologramOrb from './HologramOrb';
import LoadingOrb from './LoadingOrb';

// Lazy load react-spline to prevent initial bundle bloat and page block
const SplineReact = React.lazy(() => import('@splinetool/react-spline'));

// Class Error Boundary to catch any heavy 3D/WebGL rendering exceptions gracefully
class SplineErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Spline Rendering Exception caught:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError();
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function SplineComponent({
  scene = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode',
  className = '',
  fallbackToOrb = true,
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkScreen = () => {
      // Disable heavy 3D rendering on small screens (mobile) for supreme fluid performance
      setIsMobile(window.innerWidth < 768);
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  // If on mobile or Spline failed to load/render, fall back to our lightweight, premium CSS HologramOrb
  if (isMobile || (hasError && fallbackToOrb)) {
    return (
      <div className={`flex items-center justify-center w-full h-full ${className}`}>
        <HologramOrb className="w-48 h-48 md:w-64 md:h-64" />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full min-h-[300px] overflow-hidden ${className}`}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full">
          <LoadingOrb text="Initializing Neural Scene..." />
        </div>
      )}

      {/* Cyber Hologram Ambient Overlays */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Holographic grid scanline */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(138,43,226,0.05)_50%)] bg-[length:100%_4px]" />
        
        {/* Glowing holographic pulse */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-neon-purple/5 to-black/30 mix-blend-overlay" />
      </div>

      {/* Wrapping the 3D scene in an Error Boundary and Suspense to prevent blank screen crashes */}
      <SplineErrorBoundary
        fallback={
          <div className="flex items-center justify-center w-full h-full">
            <HologramOrb className="w-48 h-48 md:w-64 md:h-64" />
          </div>
        }
        onError={handleError}
      >
        <Suspense fallback={<div className="flex items-center justify-center w-full h-full"><LoadingOrb text="Activating Hologram..." /></div>}>
          <SplineReact
            scene={scene}
            onLoad={handleLoad}
            onError={handleError}
            className="w-full h-full object-cover"
          />
        </Suspense>
      </SplineErrorBoundary>
    </div>
  );
}
