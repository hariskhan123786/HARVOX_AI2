import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, useScroll, useInView } from 'framer-motion';
import {
  MessageSquare, Code2, Bug, Mic, Upload, FolderKanban,
  Zap, Sparkles, ChevronDown, Brain, Shield, Star, ArrowRight,
} from 'lucide-react';
import ParticleBackground from '../../components/ui/ParticleBackground';
import NeonButton from '../../components/ui/NeonButton';
import GlassCard from '../../components/ui/GlassCard';
import HologramOrb from '../../components/ui/HologramOrb';
import Holographic3DCard from '../../components/ui/Holographic3DCard';

/* ─── Data ─────────────────────────────────────────────────────────────── */
const features = [
  { icon: MessageSquare, title: 'AI Chat', desc: 'Intelligent conversations with syntax-highlighted code responses.', color: 'text-neon-blue' },
  { icon: Code2, title: 'Code Generator', desc: 'Generate production-ready code in multiple languages instantly.', color: 'text-neon-purple' },
  { icon: Bug, title: 'Debug Assistant', desc: 'Paste errors and get explanations plus fixed code.', color: 'text-neon-pink' },
  { icon: FolderKanban, title: 'Project Generator', desc: 'FYP ideas, MERN structures, and full documentation outlines.', color: 'text-neon-blue' },
  { icon: Upload, title: 'File Analyzer', desc: 'Upload PDFs and code files for AI summarization and Q&A.', color: 'text-neon-purple' },
  { icon: Mic, title: 'Voice Assistant', desc: 'Speak naturally and hear AI responses aloud.', color: 'text-neon-pink' },
];

const articles = [
  {
    image: '/holo-brain.png',
    badge: 'COGNITIVE ENGINE',
    title: 'Intelligence That Understands You',
    description:
      'HARVOX AI is powered by a holographic cognitive engine trained on millions of lines of production code. It maps your learning patterns in real-time, understands context, and thinks like a senior engineer — available 24/7 at your command.',
    accent: 'from-neon-purple/40 to-neon-blue/20',
    badgeColor: 'text-neon-blue border-neon-blue/30 bg-neon-blue/10',
  },
  {
    image: '/award-badge.png',
    badge: 'ACHIEVEMENT SYSTEM',
    title: 'Earn Badges. Level Up. Dominate.',
    description:
      'Every interaction earns you XP. Complete challenges, unlock hexagonal achievement badges, and climb the leaderboard. HARVOX transforms your development journey into an immersive RPG-style progression experience.',
    accent: 'from-neon-pink/40 to-neon-purple/20',
    badgeColor: 'text-neon-purple border-neon-purple/30 bg-neon-purple/10',
  },
  {
    image: '/ai-chat-3d.png',
    badge: 'AI CHAT INTERFACE',
    title: 'Conversations That Build Things',
    description:
      'Talk to HARVOX like a senior developer. Our 3D-rendered glassmorphic chat interface supports code generation, debugging, file analysis, and voice — all in one seamless neural conversation flow.',
    accent: 'from-neon-blue/40 to-neon-pink/20',
    badgeColor: 'text-neon-pink border-neon-pink/30 bg-neon-pink/10',
  },
];

const plans = [
  { name: 'Free', price: 'PKR 0', features: ['20 AI requests/day', 'Core AI tools', 'Chat history', 'Notes'], cta: 'Get Started', highlight: true },
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

/* ─── Sub-components ─────────────────────────────────────────────────────── */

/** 3-D tilt card with mouse tracking */
function TiltCard3D({ image, badge, badgeColor, title, description, accent, reverse, index }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mx = useSpring(x, { stiffness: 150, damping: 20 });
  const my = useSpring(y, { stiffness: 150, damping: 20 });
  const rotX = useTransform(my, [-0.5, 0.5], ['14deg', '-14deg']);
  const rotY = useTransform(mx, [-0.5, 0.5], ['-14deg', '14deg']);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80, x: reverse ? 60 : -60 }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.9, ease: 'easeOut', delay: index * 0.1 }}
      className={`flex flex-col gap-12 md:items-center ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} mb-28 md:mb-40`}
    >
      {/* Image side */}
      <div className="flex-1" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ perspective: 1200 }}>
        <motion.div
          style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
          className="relative rounded-3xl cursor-none group"
        >
          {/* Glow behind */}
          <div className={`absolute -inset-4 rounded-3xl bg-gradient-to-br ${accent} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700`} />

          {/* Card frame */}
          <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden shadow-2xl"
               style={{ transformStyle: 'preserve-3d' }}>
            {/* Scan-line effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
              <div className="absolute left-0 right-0 h-px bg-neon-blue/20 animate-scanLine" />
            </div>
            {/* Shimmer sweep */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-sweep" />
            </div>

            <img
              src={image}
              alt={title}
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ transform: 'translateZ(30px)' }}
            />

            {/* Badge overlay */}
            <div className="absolute top-4 left-4 z-20">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-orbitron text-[10px] tracking-widest backdrop-blur-md ${badgeColor}`}>
                <Sparkles size={10} />
                {badge}
              </span>
            </div>
          </div>

          {/* Floating orb */}
          <motion.div
            animate={{ y: [0, -12, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-6 -right-6 h-12 w-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue opacity-70 blur-sm"
          />
        </motion.div>
      </div>

      {/* Text side */}
      <motion.div
        initial={{ opacity: 0, x: reverse ? -40 : 40 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.9, ease: 'easeOut', delay: index * 0.1 + 0.2 }}
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
      </motion.div>
    </motion.div>
  );
}

/** Scroll-triggered feature card */
function FeatureCard({ feature, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.92 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.08 }}
    >
      <GlassCard className="h-full group cursor-none">
        <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all duration-300 group-hover:scale-110 group-hover:border-neon-purple/40 ${feature.color}`}>
          <feature.icon size={22} />
        </div>
        <h3 className="font-orbitron font-semibold text-sm">{feature.title}</h3>
        <p className="mt-2 text-xs text-muted leading-relaxed">{feature.desc}</p>
      </GlassCard>
    </motion.div>
  );
}

/** Stat counter */
function StatItem({ value, label, delay }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="text-center"
    >
      <p className="font-orbitron text-4xl font-bold gradient-text">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </motion.div>
  );
}

/* ─── Landing Page ────────────────────────────────────────────────────────── */
export default function Landing() {
  const [openFaq, setOpenFaq] = useState(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="relative min-h-screen cursor-none" style={{ cursor: 'none' }}>
      <ParticleBackground count={100} />

      {/* ── Navbar ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 lg:px-16 border-b border-white/5 backdrop-blur-sm">
        <Link to="/" className="font-orbitron text-xl font-bold gradient-text tracking-widest">
          HARVOX AI
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted hover:text-white transition-colors">Features</a>
          <a href="#articles" className="text-sm text-muted hover:text-white transition-colors">Technology</a>
          <a href="#pricing" className="text-sm text-muted hover:text-white transition-colors">Pricing</a>
          <Link to="/login" className="text-sm text-muted hover:text-white transition-colors">Login</Link>
          <Link to="/register"><NeonButton className="text-sm py-2 px-5">Get Started</NeonButton></Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative z-10 overflow-hidden px-6 pt-20 pb-32 text-center lg:pt-36 lg:pb-48 lg:px-16">
        <motion.div style={{ y: heroY, opacity: heroOpacity }}>
          {/* Floating orbs */}
          <motion.div animate={{ y: [0,-20,0], x:[0,10,0] }} transition={{ duration: 7, repeat: Infinity, ease:'easeInOut' }}
            className="absolute left-1/4 top-10 h-64 w-64 rounded-full bg-neon-purple/10 blur-3xl pointer-events-none" />
          <motion.div animate={{ y: [0,20,0], x:[0,-10,0] }} transition={{ duration: 9, repeat: Infinity, ease:'easeInOut', delay:1 }}
            className="absolute right-1/4 top-20 h-80 w-80 rounded-full bg-neon-blue/10 blur-3xl pointer-events-none" />

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-neon-blue/30 bg-neon-blue/10 px-4 py-1.5 font-orbitron text-xs tracking-widest text-neon-blue"
          >
            <Sparkles size={12} /> CODE SMARTER. LEARN FASTER. BUILD BETTER.
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="mx-auto max-w-5xl font-orbitron text-5xl font-bold leading-tight lg:text-7xl"
          >
            Your Intelligent{' '}
            <span className="relative inline-block gradient-text">
              Development Companion
              <motion.span
                className="absolute -bottom-1 left-0 h-px w-full bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink"
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.8 }}
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mt-8 max-w-2xl text-lg text-muted leading-relaxed"
          >
            AI-powered platform for code generation, debugging, project planning, voice assistance,
            and learning — built for the next generation of developers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link to="/register"><NeonButton className="px-8 py-3 text-sm">Get Started Free</NeonButton></Link>
            <Link to="/login"><NeonButton variant="secondary" className="px-8 py-3 text-sm">Sign In</NeonButton></Link>
          </motion.div>

          {/* Hero 3D floating icons */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.7 }}
            className="relative mx-auto mt-20 max-w-4xl"
          >
            {/* Glowing platform */}
            <div className="relative flex items-end justify-center gap-6">
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="flex flex-col items-center gap-4 group"
              >
                <div className="h-48 w-48">
                  <HologramOrb />
                </div>
                <span className="font-orbitron text-xs tracking-widest text-muted">Neural Engine</span>
              </motion.div>
            </div>
            {/* Ground reflection line */}
            <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-neon-purple/40 to-transparent" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
            className="mt-16"
          >
            <ChevronDown className="mx-auto text-muted" size={24} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.02] py-12 px-6 lg:px-16">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
          <StatItem value="10K+" label="Active Developers" delay={0} />
          <StatItem value="500K+" label="Code Generations" delay={0.1} />
          <StatItem value="99.9%" label="Uptime" delay={0.2} />
          <StatItem value="4.9★" label="User Rating" delay={0.3} />
        </div>
      </section>

      {/* ── 3D Article Sections ── */}
      <section id="articles" className="relative z-10 px-6 py-24 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-20 text-center"
        >
          <p className="mb-3 font-orbitron text-xs tracking-widest text-neon-purple">CORE TECHNOLOGY</p>
          <h2 className="font-orbitron text-3xl font-bold lg:text-5xl">
            Built for the <span className="gradient-text">Future of Dev</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Three pillars that make HARVOX AI the most advanced developer companion ever created.
          </p>
        </motion.div>

        <div className="mx-auto max-w-6xl">
          {articles.map((article, i) => (
            <TiltCard3D key={i} {...article} reverse={i % 2 === 1} index={i} />
          ))}
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="relative z-10 px-6 py-20 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <p className="mb-3 font-orbitron text-xs tracking-widest text-neon-blue">CAPABILITIES</p>
          <h2 className="font-orbitron text-3xl font-bold lg:text-4xl">
            Powerful <span className="gradient-text">AI Tools</span>
          </h2>
        </motion.div>
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => <FeatureCard key={f.title} feature={f} index={i} />)}
        </div>
      </section>

      {/* ── Voice Showcase ── */}
      <section className="relative z-10 overflow-hidden px-6 py-20 text-center lg:px-16">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-purple/5 to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="mb-3 font-orbitron text-xs tracking-widest text-neon-pink">VOICE INTERFACE</p>
          <h2 className="mb-10 font-orbitron text-3xl font-bold lg:text-4xl">
            Talk to <span className="gradient-text">HARVOX</span>
          </h2>
          <div className="mx-auto flex max-w-sm flex-col items-center gap-6">
            <div className="relative">
              {[1,2,3].map(i => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.2 * i * 0.5, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                  className="absolute inset-0 rounded-full border border-neon-purple"
                  style={{ margin: `-${i * 16}px` }}
                />
              ))}
              <div className="relative h-32 w-32 animate-pulseNeon rounded-full border-2 border-neon-purple bg-gradient-to-br from-neon-purple/30 to-neon-blue/20 flex items-center justify-center shadow-neon-purple">
                <Mic size={48} className="text-neon-blue" />
              </div>
            </div>
            <p className="text-muted leading-relaxed">
              Voice input and AI speech synthesis for hands-free coding help — powered by browser-native speech APIs.
            </p>
            <Link to="/register">
              <NeonButton variant="secondary" className="flex items-center gap-2 text-sm">
                Try Voice AI <Mic size={14} />
              </NeonButton>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="relative z-10 px-6 py-20 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <p className="mb-3 font-orbitron text-xs tracking-widest text-neon-blue">PRICING</p>
          <h2 className="font-orbitron text-3xl font-bold lg:text-4xl">
            Simple <span className="gradient-text">Pricing</span>
          </h2>
        </motion.div>
        <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Holographic3DCard className={`h-full ${p.highlight ? 'ring-2 ring-neon-purple/50 shadow-neon-purple rounded-2xl' : ''}`}>
                {p.highlight && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="rounded-full bg-neon-purple/20 border border-neon-purple/40 px-2 py-0.5 font-orbitron text-[9px] tracking-widest text-neon-purple">
                      POPULAR
                    </span>
                  </div>
                )}
                <h3 className="font-orbitron text-xl">{p.name}</h3>
                <p className="mt-3 font-orbitron text-5xl font-bold">
                  {p.price}<span className="text-sm text-muted font-normal">/mo</span>
                </p>
                <ul className="mt-6 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted">
                      <Zap size={14} className="text-neon-blue shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="mt-8 block relative z-10">
                  <NeonButton variant={p.highlight ? 'pro' : 'secondary'} className="w-full">
                    {p.cta}
                  </NeonButton>
                </Link>
              </Holographic3DCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="relative z-10 px-6 py-16 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12 text-center"
        >
          <h2 className="font-orbitron text-2xl font-bold lg:text-3xl">
            Loved by <span className="gradient-text">Developers</span>
          </h2>
        </motion.div>
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
            >
              <GlassCard hover={false} className="h-full">
                <div className="mb-3 text-2xl">{t.icon}</div>
                <p className="text-sm text-muted leading-relaxed">"{t.text}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-neon-purple to-neon-blue font-orbitron text-xs font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-orbitron text-xs font-semibold">{t.name}</p>
                    <p className="text-[10px] text-neon-purple">{t.role}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, si) => <Star key={si} size={10} className="fill-neon-blue text-neon-blue" />)}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-16 lg:px-12">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center font-orbitron text-2xl font-bold"
        >
          FAQ
        </motion.h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <motion.div
              key={f.q}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <button
                className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-left transition-colors hover:border-neon-purple/30 hover:bg-white/8"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-orbitron text-sm font-semibold">{f.q}</span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={16} className="text-muted" />
                  </motion.span>
                </div>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="mt-3 text-sm text-muted leading-relaxed">{f.a}</p>
                </motion.div>
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative z-10 px-6 py-16 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-neon-purple/30 bg-gradient-to-br from-neon-purple/20 via-neon-blue/10 to-neon-pink/10 p-12 text-center relative"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-sweep" />
          </div>
          <div className="relative flex justify-center gap-6 mb-6">
            <img src="/holo-brain.png" alt="" className="w-16 h-16 object-contain animate-float" />
            <img src="/award-badge.png" alt="" className="w-16 h-16 object-contain animate-floatSlow" />
            <img src="/ai-chat-3d.png" alt="" className="w-16 h-16 object-contain animate-float" style={{ animationDelay: '1s' }} />
          </div>
          <h2 className="font-orbitron text-3xl font-bold lg:text-4xl mb-4">
            Ready to <span className="gradient-text">Level Up?</span>
          </h2>
          <p className="mx-auto max-w-md text-muted mb-8">
            Join thousands of developers building smarter with HARVOX AI.
          </p>
          <Link to="/register">
            <NeonButton className="px-10 py-3 text-sm flex items-center gap-2 mx-auto">
              Start For Free <ArrowRight size={16} />
            </NeonButton>
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/10 px-6 py-12 text-center lg:px-16">
        <div className="flex justify-center gap-6 mb-6">
          <img src="/holo-brain.png" alt="" className="w-8 h-8 object-contain opacity-60 hover:opacity-100 transition-opacity" />
          <img src="/award-badge.png" alt="" className="w-8 h-8 object-contain opacity-60 hover:opacity-100 transition-opacity" />
          <img src="/ai-chat-3d.png" alt="" className="w-8 h-8 object-contain opacity-60 hover:opacity-100 transition-opacity" />
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
