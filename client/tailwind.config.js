/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      colors: {
        primary: '#070B14',
        secondary: '#0D1117',
        neon: {
          purple: 'var(--color-accent-primary, #8A2BE2)',
          blue: 'var(--color-accent-primary, #00F0FF)',
          pink: 'var(--color-accent-primary, #FF00C8)',
        },
        muted: '#B8C0CC',
        void: '#000000',
        carbon: '#050505',
        graphite: '#0D0D0D',
        smoke: '#1A1A1A',
        acid: '#DFFF00',
        lime: '#CCFF00',
        volt: '#AAFF00',
        cyan: '#00FFFF',
        ice: '#E0F7FA',
        plasma: '#BF5AF2',
        ember: '#FF6B35',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        hero: ['Space Grotesk', 'Syncopate', 'Cabinet Grotesk', 'Orbitron', 'sans-serif'],
        body: ['DM Sans', 'Satoshi', 'Outfit', 'Poppins', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Playfair Display', 'EB Garamond', 'serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'fluid-hero': 'var(--fs-hero)',
        'fluid-title': 'var(--fs-title)',
        'fluid-heading': 'var(--fs-heading)',
        'fluid-lead': 'var(--fs-lead)',
        'fluid-body': 'var(--fs-body)',
        'fluid-caption': 'var(--fs-caption)',
        'fluid-mono': 'var(--fs-mono)',
      },
      transitionTimingFunction: {
        'smooth': 'var(--ease-smooth)',
        'spring': 'var(--ease-spring)',
        'sharp': 'var(--ease-sharp)',
        'expo': 'var(--ease-expo)',
        'brutal': 'var(--ease-brutal)',
      },
      boxShadow: {
        'neon-purple': '0 0 20px var(--color-accent-glow, rgba(138, 43, 226, 0.4)), 0 0 40px var(--color-accent-glow, rgba(138, 43, 226, 0.2))',
        'neon-blue': '0 0 20px var(--color-accent-glow, rgba(0, 240, 255, 0.4))',
        'neon-pink': '0 0 20px var(--color-accent-glow, rgba(255, 0, 200, 0.4))',
        'neon-acid': '0 0 20px rgba(223, 255, 0, 0.4), 0 0 40px rgba(223, 255, 0, 0.2)',
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
