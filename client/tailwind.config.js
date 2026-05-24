/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#070B14',
        secondary: '#0D1117',
        neon: {
          purple: '#8A2BE2',
          blue: '#00F0FF',
          pink: '#FF00C8',
        },
        muted: '#B8C0CC',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(138, 43, 226, 0.4), 0 0 40px rgba(138, 43, 226, 0.2)',
        'neon-blue': '0 0 20px rgba(0, 240, 255, 0.4)',
        'neon-pink': '0 0 20px rgba(255, 0, 200, 0.4)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #8A2BE2 0%, #00F0FF 100%)',
        'gradient-pro': 'linear-gradient(135deg, #8A2BE2 0%, #FF00C8 100%)',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(138, 43, 226, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 240, 255, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-18px) rotate(2deg)' },
          '66%': { transform: 'translateY(-8px) rotate(-2deg)' },
        },
        cyberGrid: {
          '0%': { transform: 'rotateX(60deg) translateY(0)' },
          '100%': { transform: 'rotateX(60deg) translateY(40px)' },
        },
        sweep: {
          '0%': { transform: 'translateX(-100%) skewX(-12deg)' },
          '100%': { transform: 'translateX(300%) skewX(-12deg)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        scanLine: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        aurora: {
          '0%': { backgroundPosition: '50% 50%, 50% 50%' },
          '100%': { backgroundPosition: '350% 50%, 350% 50%' },
        },
        depthFloat: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -20px, 20px)' },
        },
        holoPulse: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.1)' },
        },
        ringOrbit: {
          '0%': { transform: 'rotateX(60deg) rotateZ(0deg)' },
          '100%': { transform: 'rotateX(60deg) rotateZ(360deg)' },
        },
        particleDrift: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-100px, -100px, 50px)' },
        },
      },
      animation: {
        pulseNeon: 'pulseNeon 2s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        floatSlow: 'floatSlow 8s ease-in-out infinite',
        sweep: 'sweep 2.5s ease-in-out infinite',
        glowPulse: 'glowPulse 3s ease-in-out infinite',
        scanLine: 'scanLine 4s linear infinite',
        shimmer: 'shimmer 3s linear infinite',
        aurora: 'aurora 20s linear infinite',
        depthFloat: 'depthFloat 6s ease-in-out infinite',
        holoPulse: 'holoPulse 4s ease-in-out infinite',
        ringOrbit: 'ringOrbit 8s linear infinite',
        particleDrift: 'particleDrift 10s linear infinite',
      },
    },
  },
  plugins: [],
};
