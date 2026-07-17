import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';
dotenv.config();

const operatorId = 'cb117555-b61d-4840-b16e-22428ebb1651';
const operatorEmail = 'hariskhangamer4@gmail.com';

// Allowed brain_memory categories: 'identity' | 'preferences' | 'activity'
const operatorMemories = [
  // ── IDENTITY ──────────────────────────────────────────────────────────────
  { category: 'identity', key: 'creator_name', value: 'Haris Khan',                                       is_pinned: true  },
  { category: 'identity', key: 'address_as',   value: 'Haris',                                            is_pinned: true  },
  { category: 'identity', key: 'email',        value: operatorEmail,                                       is_pinned: true  },
  { category: 'identity', key: 'country',      value: 'Pakistan',                                         is_pinned: true  },
  { category: 'identity', key: 'education',    value: 'BS Computer Science',                              is_pinned: true  },
  { category: 'identity', key: 'university',   value: 'University of Balochistan',                        is_pinned: true  },
  { category: 'identity', key: 'role',         value: 'Full Stack Developer',                             is_pinned: true  },
  { category: 'identity', key: 'account_tier', value: 'admin / pro',                                     is_pinned: true  },
  { category: 'identity', key: 'current_goal', value: 'Build HARVOX AI into a professional AI Operating System as Final Year Project (FYP)', is_pinned: true },
  {
    category: 'identity',
    key: 'project',
    value: 'HARVOX AI',
    is_pinned: true,
    metadata: {
      type: ['AI OS', 'AI Assistant', 'Developer Productivity Platform', 'Automation Platform'],
      mission: 'Compete with ChatGPT, Claude, Gemini, and Copilot — focused on automation and developer productivity',
      status: 'Phase 14 — Unified Vercel Serverless Deployment Complete',
      capabilities: 'AI Chat, Voice Assistant, Long-term Memory, Automation, Code Generation, Task Planning, Workspace Management, Knowledge Base',
      planned: ['Screen Understanding', 'Git Workflow Automation', 'Browser Assistance', 'Study Assistance'],
    },
  },
  {
    category: 'identity',
    key: 'tech_stack',
    value: 'Vite + React + TypeScript + Supabase + Vercel Serverless',
    is_pinned: true,
    metadata: {
      frontend: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Framer Motion'],
      backend: 'Supabase (PostgreSQL + Auth + Storage) + Vercel Serverless Functions (Express)',
      ai: 'OpenRouter / Groq SDK',
      tools: ['VS Code', 'GitHub', 'Vercel'],
    },
  },

  // ── CODING PREFERENCES ─────────────────────────────────────────────────────
  {
    category: 'preferences',
    key: 'coding_style',
    value: 'Clean, production-ready, modular, reusable components. TypeScript preferred.',
    is_pinned: true,
    metadata: {
      principles: ['DRY', 'SOLID', 'Clean Code', 'Scalable', 'Maintainable'],
      rules: ['Write clean code', 'Prefer modular architecture', 'Use TypeScript whenever possible', 'Explain major architectural decisions', 'Avoid unnecessary complexity'],
    },
  },
  { category: 'preferences', key: 'preferred_language',  value: 'TypeScript / JavaScript',   is_pinned: false },
  { category: 'preferences', key: 'preferred_framework', value: 'React + Vite',               is_pinned: false },
  { category: 'preferences', key: 'preferred_ai_model',  value: 'Gemini 2.5 Flash',           is_pinned: false },
  { category: 'preferences', key: 'os',                  value: 'Windows',                    is_pinned: false },
  { category: 'preferences', key: 'editor',              value: 'VS Code',                    is_pinned: false },
  { category: 'preferences', key: 'deploy_platform',     value: 'Vercel',                     is_pinned: true  },
  { category: 'preferences', key: 'database',            value: 'Supabase PostgreSQL',        is_pinned: true  },
  { category: 'preferences', key: 'auth_provider',       value: 'Supabase Auth',              is_pinned: true  },

  // ── UI / DESIGN STYLE ─────────────────────────────────────────────────────
  {
    category: 'preferences',
    key: 'design_style',
    value: 'Futuristic Dark Glassmorphism with Neon / Holographic effects',
    is_pinned: true,
    metadata: {
      themes: ['Futuristic', 'Dark Theme', 'Glassmorphism', 'Neon Effects', '3D', 'Holographic', 'Animated', 'Smooth Transitions'],
      feel: 'Premium SaaS — Professional Dashboard — Modern Workspace',
      inspirations: ['ChatGPT', 'Claude', 'Linear', 'Notion', 'Arc Browser', 'VS Code'],
      priorities: ['Keep UI modern and premium', 'Smooth micro-animations', 'Vibrant curated palettes', 'No generic/plain styling'],
    },
  },

  // ── AI PERSONALITY ────────────────────────────────────────────────────────
  {
    category: 'preferences',
    key: 'ai_personality',
    value: 'Friendly, professional, supportive, conversational — senior software engineer mindset',
    is_pinned: true,
    metadata: {
      tone: 'Confident but honest. Never pretend to know something unknown.',
      verbosity: 'Concise by default, detailed when requested.',
      problem_solving: 'Analyze → Plan → Explain → Implement → Optimize',
      considerations: ['Deployment', 'Security', 'Scalability', 'Performance', 'User Experience'],
      never: ['Claim emotions', 'Fabricate information', 'Invent memories'],
      always: ['Help Haris learn', 'Encourage good architecture', 'Prefer maintainable over quick-fix'],
    },
  },

  // ── AUTOMATION ────────────────────────────────────────────────────────────
  {
    category: 'preferences',
    key: 'automation_goals',
    value: 'File organization, Git workflows, task planning, developer productivity',
    is_pinned: false,
    metadata: {
      goals: ['Opening dev tools', 'Managing coding projects', 'File organization', 'Git workflows', 'Browser assistance', 'Media controls', 'Study assistance', 'Project management'],
      policy: 'Always respect user preferences before executing any sensitive system action',
    },
  },

  // ── MEMORY RULES ─────────────────────────────────────────────────────────
  {
    category: 'preferences',
    key: 'memory_rules',
    value: 'Remember across sessions: HARVOX features, project architecture, roadmap, tech stack, UI/coding preferences, implementation ideas discussed',
    is_pinned: true,
    metadata: {
      constraints: ['Do not invent memories', 'Do not fabricate information', 'If something is unknown, ask Haris'],
    },
  },
];

async function seedOperatorMemory() {
  console.log('\n===================================================');
  console.log('  HARVOX AI — Seeding Full Creator Memory Core');
  console.log(`  Operator : ${operatorEmail}`);
  console.log(`  User ID  : ${operatorId}`);
  console.log('===================================================\n');

  try {
    // 1. Verify/create public.users record
    console.log('[1/4] Verifying public.users record...');
    const { data: user } = await supabase.from('users').select('id').eq('id', operatorId).maybeSingle();
    if (!user) {
      const { error } = await supabase.from('users').insert({ id: operatorId, email: operatorEmail, role: 'admin', subscription: 'pro' });
      if (error) { console.error('      ✗ Failed to create user:', error.message); return; }
      console.log('      → Created new users record');
    } else {
      await supabase.from('users').update({ role: 'admin', subscription: 'pro', email: operatorEmail }).eq('id', operatorId);
      console.log('      ✓ users record OK (updated to admin/pro)');
    }

    // 2. Verify/create public.profiles record
    console.log('[2/4] Verifying public.profiles record...');
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', operatorId).maybeSingle();
    const profileData = {
      name: 'Haris Khan',
      developer_role: 'Full Stack Developer',
      experience_level: 'Advanced',
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Supabase', 'JavaScript', 'HTML', 'CSS', 'Docker', 'Git'],
    };
    if (!profile) {
      const { error } = await supabase.from('profiles').insert({ id: operatorId, ...profileData });
      if (error) console.error('      ✗ Failed to create profile:', error.message);
      else console.log('      → Created new profiles record');
    } else {
      await supabase.from('profiles').update(profileData).eq('id', operatorId);
      console.log('      ✓ profiles record OK (updated)');
    }

    // 3. Clear existing memories
    console.log('[3/4] Clearing old memory entries...');
    const { error: clearErr } = await supabase.from('brain_memory').delete().eq('user_id', operatorId);
    if (clearErr) console.error('      ✗ Failed to clear memories:', clearErr.message);
    else console.log('      ✓ Old memories cleared');

    // 4. Seed full memory core
    console.log(`[4/4] Seeding ${operatorMemories.length} memory records...`);
    const records = operatorMemories.map(m => ({
      user_id: operatorId,
      category: m.category,
      key: m.key,
      value: JSON.stringify(m.value),
      is_pinned: m.is_pinned ?? false,
      metadata: m.metadata || {},
    }));

    const { error: insertErr } = await supabase.from('brain_memory').insert(records);
    if (insertErr) {
      console.error(`      ✗ Failed to seed memories: ${insertErr.message}`);
    } else {
      console.log(`      ✓ ${records.length} memory records seeded!`);
    }

    console.log('\n===================================================');
    console.log('  ✅  Creator Memory Core fully seeded!');
    console.log('===================================================\n');
  } catch (err) {
    console.error('\n[CRITICAL]', err);
  }

  process.exit(0);
}

seedOperatorMemory();
