import { useRef, useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  useInView,
} from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);
import {
  MessageSquare, Code2, Bug, Mic, Upload, FolderKanban,
  Zap, Sparkles, ChevronDown, Star, ArrowRight,
  Terminal, LayoutGrid, Cpu, Layers, Globe, Github, Linkedin, Twitter
} from 'lucide-react';
import BackgroundEffects from '../../components/background/BackgroundEffects';
import NeonButton from '../../components/ui/NeonButton';
import GlassCard from '../../components/ui/GlassCard';
import Spotlight from '../../components/ui/spotlight';
import SplineComponent from '../../components/ui/spline';
import HologramCard from '../../components/ui/hologram-card';
import { Card } from '../../components/ui/card';
import FOMOBadge from '../../components/ui/FOMOBadge';

// Lazy load heavy 3D components
const HologramOrb = lazy(() => import('../../components/ui/HologramOrb'));

/* ─── Lenis Smooth Scroll ───────────────────────────────────────────────── */
function useLenis() {
  useEffect(() => {
    let lenis;
    let rafId;

    async function initLenis() {
      try {
        const { default: Lenis } = await import('@studio-freight/lenis');
        lenis = new Lenis({
          duration: 1.1,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 0.9,
          touchMultiplier: 1.5,
        });

        function raf(time) {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);
      } catch {
        // Lenis not installed — graceful fallback
      }
    }

    initLenis();
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
  }, []);
}

/* ─── Data ──────────────────────────────────────────────────────────────── */
const features = [
  { icon: MessageSquare, title: 'AI Chat', desc: 'Intelligent conversations with syntax-highlighted code responses.', color: 'text-neon-blue' },
  { icon: Code2, title: 'Code Generator', desc: 'Generate production-ready code in multiple languages instantly.', color: 'text-neon-purple' },
  { icon: Bug, title: 'Debug Assistant', desc: 'Paste errors and get explanations plus fixed code.', color: 'text-neon-pink' },
  { icon: Layers, title: 'Multi-Project Scaffold', desc: 'Auto-scaffold Next.js, Node/Express, React, Vue, Python, Svelte, or Electron.', color: 'text-neon-blue' },
  { icon: Upload, title: 'File Analyzer', desc: 'Upload PDFs and code files for AI summarization and Q&A.', color: 'text-neon-purple' },
  { icon: Mic, title: 'Voice Assistant', desc: 'Speak naturally and hear AI responses aloud.', color: 'text-neon-pink' },
  { icon: Cpu, title: 'Multi-Agent Orchestrator', desc: 'Execute steps using dedicated CEO, Dev, UI, Research, and Deployment agents.', color: 'text-neon-blue' },
  { icon: Terminal, title: 'Local OS Automation', desc: 'Safely execute system shell commands, directory sorting, and project backups.', color: 'text-neon-purple' },
  { icon: LayoutGrid, title: 'Command Center', desc: 'Futuristic telemetry dashboard featuring BSCS study hours and log terminal.', color: 'text-neon-pink' },
];

const articles = [
  {
    image: '/holo-brain.png',
    badge: 'COGNITIVE ENGINE',
    title: 'Intelligence That Understands You',
    description: 'HARVOX AI is powered by a holographic cognitive engine trained on millions of lines of production code. It maps your learning patterns in real-time, understands context, and thinks like a senior engineer — available 24/7 at your command.',
    accent: 'from-neon-purple/40 to-neon-blue/20',
    badgeColor: 'text-neon-blue border-neon-blue/30 bg-neon-blue/10',
  },
  {
    image: '/award-badge.png',
    badge: 'ACHIEVEMENT SYSTEM',
    title: 'Earn Badges. Level Up. Dominate.',
    description: 'Every interaction earns you XP. Complete challenges, unlock hexagonal achievement badges, and climb the leaderboard. HARVOX transforms your development journey into an immersive RPG-style progression experience.',
    accent: 'from-neon-pink/40 to-neon-purple/20',
    badgeColor: 'text-neon-purple border-neon-purple/30 bg-neon-purple/10',
  },
  {
    image: '/ai-chat-3d.png',
    badge: 'AI CHAT INTERFACE',
    title: 'Conversations That Build Things',
    description: 'Talk to HARVOX like a senior developer. Our 3D-rendered glassmorphic chat interface supports code generation, debugging, file analysis, and voice — all in one seamless neural conversation flow.',
    accent: 'from-neon-blue/40 to-neon-pink/20',
    badgeColor: 'text-neon-pink border-neon-pink/30 bg-neon-pink/10',
  },
];

const plans = [
  { name: 'Free', price: 'PKR 0', features: ['20 AI requests/day', 'Core AI tools', 'Chat history', 'Notes'], cta: 'Get Started', highlight: false },
  { name: 'Pro', price: 'PKR 1500', features: ['500 AI requests/day', 'All AI tools', 'Priority responses', 'Export & bookmarks', 'Project generator'], cta: 'Upgrade Now', highlight: true },
];

const testimonials = [
  { name: 'Sarah K.', role: 'CS Student', text: 'HARVOX helped me debug my MERN stack FYP in hours instead of days.', icon: '🎓' },
  { name: 'Ahmed R.', role: 'Junior Developer', text: 'The code generator is incredibly fast. It feels like having a senior dev beside you.', icon: '💻' },
  { name: 'Priya M.', role: 'Bootcamp Graduate', text: 'Voice assistant + chat combo made learning React so much easier.', icon: '🚀' },
];

const faqs = [
  { q: 'What is HARVOX AI?', a: 'HARVOX AI is an intelligent developer and learning assistant platform for students, developers, and creators.' },
  { q: 'Which AI model powers HARVOX?', a: 'HARVOX uses state-of-the-art LLM models for high-quality code generation, debugging, and tutoring.' },
  { q: 'Can I use it for my FYP?', a: 'Yes! Project Generator and learning tools are designed specifically for final year projects.' },
  { q: 'Is my data secure?', a: 'Yes. Passwords are encrypted with bcrypt and all API communication is secured over HTTPS.' },
];

/* ─── Shared viewport config ────────────────────────────────────────────── */
const VP = { once: true, amount: 0.05 };

/* ─── TiltCard3D ─────────────────────────────────────────────────────────── */
function TiltCard3D({ image, badge, badgeColor, title, description, accent, reverse, index }) {
  // Motion values for 3D tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mx = useSpring(x, { stiffness: 120, damping: 22 });
  const my = useSpring(y, { stiffness: 120, damping: 22 });
  const rotX = useTransform(my, [-0.5, 0.5], ['12deg', '-12deg']);
  const rotY = useTransform(mx, [-0.5, 0.5], ['-12deg', '12deg']);

  // Always handle mouse — no shouldReduceMotion block here
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      className={`flex flex-col gap-12 md:items-center ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} mb-28 md:mb-40 scroll-article-card`}
    >
      {/* Image side — z-10 so it receives pointer events above background */}
      <div
        className="flex-1 relative z-10"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: 1000 }}
      >
        <motion.div
          style={{
            rotateX: rotX,
            rotateY: rotY,
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
          className="relative rounded-3xl group"
        >
          {/* Glow */}
          <div className={`absolute -inset-4 rounded-3xl bg-gradient-to-br ${accent} blur-2xl opacity-50 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none`} />

          {/* Card frame */}
          <div
            className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden shadow-2xl"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Scan-line */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent shadow-[0_0_8px_#00F0FF] animate-scanLine" />
            </div>
            {/* Shimmer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-sweep" />
            </div>

            <img
              src={image}
              alt={title}
              loading="lazy"
              decoding="async"
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ transform: 'translateZ(20px)', willChange: 'transform' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />

            {/* Badge overlay */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-orbitron text-[10px] tracking-widest backdrop-blur-md ${badgeColor}`}>
                <Sparkles size={10} />{badge}
              </span>
            </div>
          </div>

          {/* Floating orb */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ willChange: 'transform' }}
            className="absolute -top-6 -right-6 h-12 w-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue opacity-70 blur-sm pointer-events-none"
          />
        </motion.div>
      </div>

      {/* Text side */}
      <div
        className="flex-1 space-y-5 px-2"
      >
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-orbitron text-[10px] tracking-widest ${badgeColor}`}>
          <Sparkles size={10} />{badge}
        </span>
        <h2 className="font-orbitron text-3xl font-bold leading-tight lg:text-4xl">
          <span className="gradient-text">{title}</span>
        </h2>
        <p className="text-muted leading-relaxed text-base">{description}</p>
        <Link to="/register">
          <NeonButton className="mt-2 flex items-center gap-2 text-sm">
            Get Started <ArrowRight size={16} />
          </NeonButton>
        </Link>
      </div>
    </div>
  );
}

/* ─── FeatureCard ───────────────────────────────────────────────────────── */
function FeatureCard({ feature }) {
  return (
    <div className="scroll-feature-card">
      <GlassCard className="h-full group cursor-none">
        <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all duration-300 group-hover:scale-110 group-hover:border-neon-purple/40 ${feature.color}`}>
          <feature.icon size={22} />
        </div>
        <h3 className="font-orbitron font-semibold text-sm">{feature.title}</h3>
        <p className="mt-2 text-xs text-muted leading-relaxed">{feature.desc}</p>
      </GlassCard>
    </div>
  );
}

/* ─── CountUp ───────────────────────────────────────────────────────────── */
function CountUp({ target, duration = 1.5, start = 0 }) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    const num = parseFloat(target);
    if (isNaN(num)) return;

    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const current = progress * (num - start) + start;
      
      if (target.includes('.')) {
        setCount(current.toFixed(1));
      } else {
        setCount(Math.floor(current));
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, start]);

  return <>{count}</>;
}

/* ─── StatItem ──────────────────────────────────────────────────────────── */
function StatItem({ value, label, delay }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [startCount, setStartCount] = useState(false);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setStartCount(true);
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, delay]);

  const match = value.match(/^([\d.]+)(.*)$/);
  const numStr = match ? match[1] : '';
  const suffix = match ? match[2] : '';

  return (
    <div
      ref={ref}
      className="text-center scroll-stat-item"
    >
      <p className="font-hero text-fluid-title font-bold gradient-text">
        {startCount && numStr ? <CountUp target={numStr} /> : (numStr || value)}
        {suffix}
      </p>
      <p className="mt-1 font-body text-fluid-caption text-muted tracking-wider uppercase">{label}</p>
    </div>
  );
}

/* ─── Landing Page ──────────────────────────────────────────────────────── */
export default function Landing() {
  useLenis();

  const [openFaq, setOpenFaq] = useState(null);
  const heroRef = useRef(null);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  useGSAP(() => {
    const ctx = containerRef.current;
    if (!ctx) return;

    // Safety: ensure all animated elements start visible by default.
    // gsap.from() will override these at animation start, but this prevents
    // permanent invisible state if ScrollTrigger never fires.
    const allAnimated = ctx.querySelectorAll(
      '.hero-badge,.hero-title,.hero-desc,.hero-cta,.hero-widgets-item,' +
      '.scroll-stat-item,.articles-header,.scroll-article-card,' +
      '.features-header,.scroll-feature-card,.pricing-header,' +
      '.scroll-pricing-card,.testimonials-header,.scroll-testimonial-card'
    );
    allAnimated.forEach(el => { el.style.opacity = '1'; });

    // 1. Hero timeline — scoped to container
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .fromTo('.hero-badge',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.7 })
      .fromTo('.hero-title',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out' }, '-=0.5')
      .fromTo('.hero-desc',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
      .fromTo('.hero-cta',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
      .fromTo('.hero-widgets-item',
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, stagger: 0.08, duration: 0.6, ease: 'back.out(1.5)' }, '-=0.4');

    // Helper to create a safe scrollTrigger animation that uses fromTo
    // so elements are never permanently hidden
    const scrollReveal = (selector, vars, triggerEl) => {
      const els = ctx.querySelectorAll(selector);
      if (!els.length) return;
      gsap.fromTo(els,
        { opacity: 0, y: vars.y ?? 30, scale: vars.scale ?? 1 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: vars.duration ?? 0.7,
          stagger: vars.stagger ?? 0,
          ease: vars.ease ?? 'power2.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: triggerEl ?? els[0],
            start: vars.start ?? 'top 88%',
            toggleActions: 'play none none none',
            onEnter: () => {},
          },
        }
      );
    };

    // 2. Stats Bar
    scrollReveal('.scroll-stat-item', { y: 25, duration: 0.6, stagger: 0.1 });

    // 3. Articles section
    scrollReveal('.articles-header', { y: 30, duration: 0.8 }, ctx.querySelector('#articles'));
    scrollReveal('.scroll-article-card', { y: 80, duration: 1, stagger: 0.2, start: 'top 80%' }, ctx.querySelector('#articles'));

    // 4. Features section
    scrollReveal('.features-header', { y: 30, duration: 0.8 }, ctx.querySelector('#features'));
    scrollReveal('.scroll-feature-card', { y: 45, duration: 0.7, stagger: 0.08, scale: 0.92, start: 'top 80%' }, ctx.querySelector('#features'));

    // 5. Pricing section
    scrollReveal('.pricing-header', { y: 30, duration: 0.8 }, ctx.querySelector('#pricing'));
    scrollReveal('.scroll-pricing-card', { y: 45, duration: 0.8, stagger: 0.15, start: 'top 80%' }, ctx.querySelector('#pricing'));

    // 6. Testimonials
    scrollReveal('.testimonials-header', { y: 30, duration: 0.8 });
    scrollReveal('.scroll-testimonial-card', { y: 40, duration: 0.7, stagger: 0.12, start: 'top 85%' });

    // Fallback: after 2s force-show any elements that are still invisible
    // (guards against Lenis/timing race conditions)
    const fallbackTimer = setTimeout(() => {
      allAnimated.forEach(el => {
        if (parseFloat(getComputedStyle(el).opacity) < 0.1) {
          gsap.to(el, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out' });
        }
      });
    }, 2000);

    return () => clearTimeout(fallbackTimer);
  }, { scope: containerRef, dependencies: [] });

  return (
    <div ref={containerRef} className="relative min-h-screen">
      <BackgroundEffects />

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 lg:px-16 border-b border-white/5 bg-[#000000]/60 backdrop-blur-xl transition-all duration-300">
        <Link to="/" className="font-hero text-fluid-heading font-black tracking-[0.2em] gradient-text-animated">
          HARVOX AI
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {['features', 'articles', 'pricing', 'creator'].map((link) => (
            <a 
              key={link}
              href={`#${link}`} 
              className="text-xs font-orbitron font-bold tracking-widest text-muted hover:text-neon-blue transition-all duration-300 relative group uppercase"
            >
              {link}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-blue transition-all duration-300 group-hover:w-full shadow-[0_0_8px_#00F0FF]" />
            </a>
          ))}
          <div className="h-4 w-px bg-white/10" />
          <Link to="/login" className="text-xs font-orbitron font-bold tracking-widest text-muted hover:text-white transition-colors uppercase">Login</Link>
          <Link to="/register">
            <NeonButton magnetic={true} className="text-[10px] font-bold tracking-wider py-2 px-5 uppercase" variant="pro">
              Get Started
            </NeonButton>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative z-10 overflow-hidden px-6 pt-20 pb-32 lg:pt-28 lg:pb-36 lg:px-16">
        {/* Interactive Cyber Spotlight Overlay */}
        <Spotlight interactive={true} size={450} className="opacity-90" />

        <motion.div style={{ y: heroY, willChange: 'transform' }} className="relative z-10 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">

            {/* Hero Left Text Column */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6 text-left relative z-10">
              <div
                className="inline-flex items-center gap-2 rounded-full border border-neon-purple/30 bg-neon-purple/10 px-4 py-1.5 backdrop-blur-md hero-badge"
              >
                <FOMOBadge />
              </div>

              <h1
                className="font-hero text-fluid-hero font-bold leading-tight text-white hero-title"
              >
                Your Intelligent{' '}
                <span className="relative inline-block gradient-text">
                  Development Companion
                  <span
                    className="absolute -bottom-1 left-0 h-px w-full bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink"
                    style={{ transformOrigin: 'left', willChange: 'transform' }}
                  />
                </span>
              </h1>

              <p
                className="font-body text-fluid-lead text-muted leading-relaxed max-w-xl hero-desc"
              >
                An immersive AI-powered operating system for code generation, debugging, project planning, voice assistance,
                and interactive learning — crafted for modern developers.
              </p>

              {/* Glowing CTA Buttons */}
              <div
                className="flex flex-wrap gap-4 pt-2 hero-cta"
              >
                <Link to="/register">
                  <NeonButton magnetic={true} className="px-8 py-3 text-sm shadow-neon-purple hover:scale-105 transition-all duration-300">
                    Get Started Free
                  </NeonButton>
                </Link>
                <Link to="/login">
                  <NeonButton variant="secondary" magnetic={true} className="px-8 py-3 text-sm hover:scale-105 transition-all duration-300">
                    Sign In
                  </NeonButton>
                </Link>
              </div>

              {/* Floating UI Widgets under CTA */}
              <div
                className="flex flex-wrap gap-4 items-center pt-6 border-t border-white/5 hero-widgets"
              >
                <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-2 backdrop-blur-md hero-widgets-item">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-orbitron text-xs text-neutral-300">Neural Link Online</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-2 backdrop-blur-md hero-widgets-item">
                  <span className="font-orbitron text-xs text-neutral-400">Response Speed:</span>
                  <span className="font-orbitron text-xs text-neon-blue font-bold">14ms</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-2 backdrop-blur-md hero-widgets-item">
                  <span className="font-orbitron text-xs text-neutral-400">GPU Rendering:</span>
                  <span className="font-orbitron text-xs text-neon-pink font-bold">ON</span>
                </div>
              </div>
            </div>

            {/* Right Hologram Spline Column */}
            <div className="lg:col-span-5 relative w-full h-[400px] lg:h-[500px] flex items-center justify-center">
              {/* Ambient neon radial glow */}
              <div className="absolute inset-0 bg-radial-gradient from-neon-purple/20 via-neon-blue/5 to-transparent blur-2xl pointer-events-none" />

              {/* Animated Floating Neon Rings */}
              <div className="absolute w-[280px] h-[280px] md:w-[350px] md:h-[350px] rounded-full border border-dashed border-neon-purple/20 animate-spinSlow pointer-events-none" />
              <div className="absolute w-[320px] h-[320px] md:w-[400px] md:h-[400px] rounded-full border border-dotted border-neon-blue/10 animate-reverseSpin pointer-events-none" />

              {/* Premium 3D Spline Scene Viewport */}
              <div className="w-[300px] h-[300px] md:w-[380px] md:h-[380px] rounded-full overflow-hidden relative z-10 border border-white/10 shadow-[0_0_30px_rgba(138,43,226,0.3)] bg-black/40">
                <SplineComponent scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" />
              </div>

              {/* Holographic float status overlays */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-8 right-0 md:right-4 z-20 rounded-xl border border-neon-pink/40 bg-black/85 p-3 backdrop-blur-md shadow-[0_0_15px_rgba(255,0,127,0.3)] pointer-events-none"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-neon-pink animate-pulse" />
                  <span className="font-orbitron text-[10px] tracking-widest text-neon-pink">AI ASSISTANT</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute bottom-8 left-0 md:left-4 z-20 rounded-xl border border-neon-blue/40 bg-black/85 p-3 backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.3)] pointer-events-none"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-neon-blue animate-pulse" />
                  <span className="font-orbitron text-[10px] tracking-widest text-neon-blue">NEURAL STREAM</span>
                </div>
              </motion.div>
            </div>

          </div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ willChange: 'transform' }}
            className="mt-16 text-center"
          >
            <ChevronDown className="mx-auto text-muted cursor-pointer hover:text-white transition-colors" size={24} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Logo Ticker / Marquee ── */}
      <div className="ticker relative z-10" aria-hidden="true">
        <div className="ticker-track">
          <span>GYMS ★ CLINICS ★ REAL ESTATE ★ RESTAURANTS ★ TECH AGENCIES ★ SAAS STARTUPS ★ CREATIVE STUDIOS ★</span>
          <span>GYMS ★ CLINICS ★ REAL ESTATE ★ RESTAURANTS ★ TECH AGENCIES ★ SAAS STARTUPS ★ CREATIVE STUDIOS ★</span>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.02] py-12 px-6 lg:px-16">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
          <StatItem value="10K+" label="Active Developers" delay={0} />
          <StatItem value="500K+" label="Code Generations" delay={0.08} />
          <StatItem value="99.9%" label="Uptime" delay={0.16} />
          <StatItem value="4.9★" label="User Rating" delay={0.24} />
        </div>
      </section>

      {/* ── 3D Article Sections ── */}
      <section id="articles" className="relative z-10 px-6 py-24 lg:px-16">
        <div
          className="mb-20 text-center articles-header"
        >
          <p className="mb-3 font-hero text-xs tracking-widest text-neon-purple">CORE TECHNOLOGY</p>
          <h2 className="font-hero text-fluid-title font-bold">
            Built for the <span className="gradient-text">Future of Dev</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-body text-fluid-body text-muted">
            Three pillars that make HARVOX AI the most advanced developer companion ever created.
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          {articles.map((article, i) => (
            <TiltCard3D key={i} {...article} reverse={i % 2 === 1} index={i} />
          ))}
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="relative z-10 px-6 py-20 lg:px-16">
        <div
          className="mb-14 text-center features-header"
        >
          <p className="mb-3 font-hero text-xs tracking-widest text-neon-blue">CAPABILITIES</p>
          <h2 className="font-hero text-fluid-title font-bold">
            Powerful <span className="gradient-text">AI Tools</span>
          </h2>
        </div>
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => <FeatureCard key={f.title} feature={f} index={i} />)}
        </div>
      </section>

      {/* ── Voice Showcase ── */}
      <section className="relative z-10 overflow-hidden px-6 py-20 text-center lg:px-16">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-purple/5 to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={VP}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 font-hero text-xs tracking-widest text-neon-pink">VOICE INTERFACE</p>
          <h2 className="mb-10 font-hero text-fluid-title font-bold">
            Talk to <span className="gradient-text">HARVOX</span>
          </h2>
          <div className="mx-auto flex max-w-sm flex-col items-center gap-6">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Outer pulsing neon rings */}
              {[1, 2, 3, 4].map(i => (
                <motion.div
                  key={i}
                  animate={{ 
                    scale: [0.9, 1.2 + i * 0.25, 0.9], 
                    opacity: [0.7, 0, 0.7],
                    rotate: i % 2 === 0 ? [0, 360] : [360, 0]
                  }}
                  transition={{ 
                    duration: 3 + i * 0.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  style={{ 
                    width: `${80 + i * 40}px`,
                    height: `${80 + i * 40}px`,
                    willChange: 'transform, opacity'
                  }}
                  className={`absolute rounded-full border border-dashed pointer-events-none ${
                    i % 3 === 0 ? 'border-neon-pink/30 shadow-[0_0_12px_rgba(255,0,200,0.15)]' :
                    i % 3 === 1 ? 'border-neon-blue/30 shadow-[0_0_12px_rgba(0,240,255,0.15)]' :
                    'border-neon-purple/30 shadow-[0_0_12px_rgba(138,43,226,0.15)]'
                  }`}
                />
              ))}
              <div className="relative h-28 w-28 animate-pulseNeon rounded-full border border-neon-pink bg-gradient-to-br from-neon-purple/30 via-neon-blue/20 to-neon-pink/30 flex items-center justify-center shadow-[0_0_30px_rgba(255,0,200,0.4)]">
                <Mic size={40} className="text-neon-blue drop-shadow-[0_0_8px_rgba(0,240,255,0.6)] animate-pulse" />
              </div>
            </div>
            <p className="font-body text-fluid-body text-muted leading-relaxed">
              Voice input and AI speech synthesis for hands-free coding help — powered by browser-native speech APIs.
            </p>
            <Link to="/register">
              <NeonButton variant="secondary" magnetic={true} className="flex items-center gap-2 text-sm">
                Try Voice AI <Mic size={14} />
              </NeonButton>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="relative z-10 px-6 py-20 lg:px-16">
        <div
          className="mb-14 text-center pricing-header"
        >
          <p className="mb-3 font-hero text-xs tracking-widest text-neon-blue">PRICING</p>
          <h2 className="font-hero text-fluid-title font-bold">
            Simple <span className="gradient-text">Pricing</span>
          </h2>
        </div>
        <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
          {plans.map((p, i) => (
            <div
              key={p.name}
              className="relative group/card scroll-pricing-card"
            >
              {p.highlight && (
                <>
                  {/* Outer spinning gradient ring 1 */}
                  <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink opacity-75 blur-md animate-spinSlow group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  {/* Inner spinning gradient ring 2 (reverse) */}
                  <div className="absolute -inset-0.5 rounded-[2.5rem] bg-gradient-to-r from-neon-pink via-neon-blue to-neon-purple opacity-90 blur-sm animate-reverseSpin pointer-events-none" />
                </>
              )}
              <HologramCard
                glowColor={p.highlight ? "from-neon-purple/40 via-neon-blue/20 to-neon-pink/40" : "from-white/5 to-white/5"}
                borderColor={p.highlight ? "border-neon-purple/50" : "border-white/10"}
                className="h-full"
              >
                {p.highlight && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="rounded-full bg-neon-purple/20 border border-neon-purple/40 px-2 py-0.5 font-hero text-[9px] tracking-widest text-neon-purple">
                      POPULAR
                    </span>
                  </div>
                )}
                <h3 className="font-hero text-fluid-heading font-semibold">{p.name}</h3>
                <p className="mt-3 font-hero text-4xl font-bold">
                  {p.price}<span className="text-sm text-muted font-normal">/mo</span>
                </p>
                <ul className="mt-6 space-y-3 font-body text-fluid-body">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted">
                      <Zap size={14} className="text-neon-blue shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="mt-8 block relative z-10">
                  <NeonButton variant={p.highlight ? 'pro' : 'secondary'} magnetic={true} className="w-full">
                    {p.cta}
                  </NeonButton>
                </Link>
              </HologramCard>
            </div>
          ))}
        </div>
      </section>

      {/* ── Creator Profile Section ── */}
      <section id="creator" className="relative z-10 px-6 py-20 lg:px-16 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-neon-purple/20 to-neon-blue/10 blur-3xl opacity-60 pointer-events-none" />

        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VP}
            transition={{ duration: 0.7 }}
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 md:p-12 shadow-[0_0_50px_rgba(0,240,255,0.1)] relative"
          >
            {/* Design accents */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-neon-blue/10 to-transparent rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-neon-purple/10 to-transparent rounded-bl-3xl" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
              
              {/* Image Column */}
              <div className="md:col-span-5 flex justify-center">
                <div className="relative group w-full max-w-[320px]">
                  {/* Neon border glow */}
                  <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink opacity-75 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                  
                  {/* Frame */}
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-neutral-950 aspect-[4/3] md:aspect-square flex items-center justify-center">
                    <img 
                      src="/creator.jpg" 
                      alt="Haris Khan - Creator of HARVOX AI" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Scanlines / Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 left-4 font-orbitron text-[10px] tracking-widest text-neon-blue bg-black/60 px-3 py-1 rounded border border-neon-blue/30 backdrop-blur-sm">
                      CHIEF ARCHITECT
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Column */}
              <div className="md:col-span-7 flex flex-col space-y-6">
                <div>
                  <span className="font-orbitron text-xs tracking-widest text-neon-purple uppercase">THE BRAIN BEHIND HARVOX</span>
                  <h2 className="mt-2 font-hero text-fluid-title font-bold text-white">
                    Meet the <span className="gradient-text">Creator</span>
                  </h2>
                </div>

                <div className="border-l-2 border-neon-purple pl-4 italic text-xs text-neutral-300 font-body leading-relaxed">
                  "The best way to predict the future is to build it. HARVOX is my vision of an intelligence-driven development cockpit, turning full-stack engineering and learning tracking into a beautiful, immersive, host-native ecosystem." — Haris Khan
                </div>

                <div className="space-y-4 font-body text-fluid-body text-muted leading-relaxed">
                  <p>
                    Hi, I'm Haris Khan, the creator of <strong>HARVOX AI</strong>. Driven by a passion to democratize advanced developer tools, 
                    I designed HARVOX AI to bridge the gap between complex full-stack engineering and intuitive AI assistance.
                  </p>
                </div>

                {/* Core Pillars Sub-grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-md hover:border-neon-purple/20 transition-colors">
                    <span className="text-neon-purple font-orbitron text-[10px] tracking-wide font-bold block mb-1">Visual Perfection</span>
                    <span className="text-[9px] text-gray-400 leading-relaxed block">High-density typography, glowing neon interfaces, and premium glassmorphic cards.</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-md hover:border-neon-blue/20 transition-colors">
                    <span className="text-neon-blue font-orbitron text-[10px] tracking-wide font-bold block mb-1">Host-Native Power</span>
                    <span className="text-[9px] text-gray-400 leading-relaxed block">Runs Node/Express, Vite dev servers, system tasks, and directories directly on your OS.</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-md hover:border-neon-pink/20 transition-colors">
                    <span className="text-neon-pink font-orbitron text-[10px] tracking-wide font-bold block mb-1">Safety First</span>
                    <span className="text-[9px] text-gray-400 leading-relaxed block">Built-in execution guards that intercept and protect against malicious terminal commands.</span>
                  </div>
                </div>

                {/* Social links & Credits */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-white/5">
                  <div className="flex flex-wrap gap-2.5">
                    <a href="https://github.com/hariskhan123786" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10 hover:border-neon-purple/40 text-[10px] font-orbitron font-bold transition-all">
                      <Github size={12} className="text-neon-purple" /> GitHub
                    </a>
                    <a href="https://linkedin.com/in/hariskhan" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10 hover:border-neon-blue/40 text-[10px] font-orbitron font-bold transition-all">
                      <Linkedin size={12} className="text-neon-blue" /> LinkedIn
                    </a>
                    <a href="https://twitter.com/hariskhan" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10 hover:border-neon-pink/40 text-[10px] font-orbitron font-bold transition-all">
                      <Twitter size={12} className="text-neon-pink" /> Twitter
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5">
                      <span className="text-xs">🏆</span>
                      <p className="font-orbitron text-[9px] text-neon-purple tracking-widest uppercase">HARVOX AI © 2026</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="relative z-10 px-6 py-16 lg:px-16">
        <div
          className="mb-12 text-center testimonials-header"
        >
          <h2 className="font-hero text-fluid-title font-bold">
            Loved by <span className="gradient-text">Developers</span>
          </h2>
        </div>
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="scroll-testimonial-card"
            >
              <GlassCard hover={false} className="h-full">
                <div className="mb-3 text-2xl">{t.icon}</div>
                <p className="font-body text-fluid-body text-muted leading-relaxed">"{t.text}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-neon-purple to-neon-blue font-hero text-xs font-bold text-black">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-hero text-xs font-semibold">{t.name}</p>
                    <p className="font-body text-[10px] text-neon-purple">{t.role}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, si) => <Star key={si} size={10} className="fill-neon-blue text-neon-blue" />)}
                  </div>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-16 lg:px-12">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VP}
          className="mb-10 text-center font-hero text-fluid-title font-bold"
        >
          FAQ
        </motion.h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <motion.div
              key={f.q}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={VP}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              style={{ willChange: 'transform, opacity' }}
            >
              <button
                className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-left transition-colors hover:border-neon-purple/30 hover:bg-white/[0.08]"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-hero text-sm font-semibold">{f.q}</span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ChevronDown size={16} className="text-muted" />
                  </motion.span>
                </div>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="mt-3 font-body text-fluid-body text-muted leading-relaxed">{f.a}</p>
                </motion.div>
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ End ── */}

      {/* ── CTA Banner ── */}
      <section className="relative z-10 px-6 py-16 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VP}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-neon-purple/30 bg-gradient-to-br from-neon-purple/20 via-neon-blue/10 to-neon-pink/10 p-12 text-center relative"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-sweep" />
          </div>
          <div className="relative flex justify-center gap-6 mb-6">
            <img src="/holo-brain.png" alt="" loading="lazy" className="w-16 h-16 object-contain animate-float" onError={(e) => e.target.style.display = 'none'} />
            <img src="/award-badge.png" alt="" loading="lazy" className="w-16 h-16 object-contain animate-floatSlow" onError={(e) => e.target.style.display = 'none'} />
            <img src="/ai-chat-3d.png" alt="" loading="lazy" className="w-16 h-16 object-contain animate-float" onError={(e) => e.target.style.display = 'none'} style={{ animationDelay: '1s' }} />
          </div>
          <h2 className="font-hero text-fluid-title font-bold mb-4">
            Ready to <span className="gradient-text">Level Up?</span>
          </h2>
          <p className="mx-auto max-w-md font-body text-fluid-body text-muted mb-8">
            Join thousands of developers building smarter with HARVOX AI.
          </p>
          <Link to="/register">
            <NeonButton magnetic={true} className="px-10 py-3 text-sm flex items-center gap-2 mx-auto">
              Start For Free <ArrowRight size={16} />
            </NeonButton>
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/10 px-6 py-12 text-center lg:px-16">
        <div className="flex justify-center gap-6 mb-6">
          <img src="/holo-brain.png" alt="" loading="lazy" className="w-8 h-8 object-contain opacity-60 hover:opacity-100 transition-opacity" onError={(e) => e.target.style.display = 'none'} />
          <img src="/award-badge.png" alt="" loading="lazy" className="w-8 h-8 object-contain opacity-60 hover:opacity-100 transition-opacity" onError={(e) => e.target.style.display = 'none'} />
          <img src="/ai-chat-3d.png" alt="" loading="lazy" className="w-8 h-8 object-contain opacity-60 hover:opacity-100 transition-opacity" onError={(e) => e.target.style.display = 'none'} />
        </div>
        <p className="font-orbitron text-lg gradient-text">HARVOX AI</p>
        <p className="mt-2 text-sm text-muted">Code Smarter. Learn Faster. Build Better.</p>
        <div className="mt-4 flex justify-center gap-6 text-sm text-muted">
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <Link to="/login" className="hover:text-white transition-colors">Login</Link>
        </div>
        <p className="mt-6 text-xs text-muted/60">© {new Date().getFullYear()} HARVOX AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
