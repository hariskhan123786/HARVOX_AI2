import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';
dotenv.config();

const operatorId = 'cb117555-b61d-4840-b16e-22428ebb1651'; // Your user ID from check_supabase.js
const operatorEmail = 'hariskhangamer4@gmail.com';

const operatorMemories = [
  { category: 'identity', key: 'creator', value: 'Haris Khan', is_pinned: true },
  { category: 'identity', key: 'email', value: operatorEmail, is_pinned: true },
  { category: 'identity', key: 'role', value: 'Full Stack Developer', is_pinned: true },
  { category: 'identity', key: 'education', value: 'BSCS Student', is_pinned: true },
  { category: 'identity', key: 'university', value: 'University of Balochistan', is_pinned: true },
  { category: 'preferences', key: 'preferredLanguage', value: 'JavaScript', is_pinned: false },
  { category: 'preferences', key: 'preferredFramework', value: 'React', is_pinned: false },
  { category: 'preferences', key: 'themePreference', value: 'cyberpunk', is_pinned: false },
  { category: 'preferences', key: 'favoriteModel', value: 'Gemini 2.5 Flash', is_pinned: false },
  {
    category: 'project',
    key: 'activeProject',
    value: 'HARVOX AI Workspace',
    is_pinned: true,
    metadata: {
      description: 'Autonomous AI Operating System and Interactive Developer Environment.',
      architecture: 'Vite React + Node.js/Express + Supabase PostgreSQL + WebSockets',
      status: 'Phase 14 — Supabase Migration Complete',
    },
  }
];

async function seedOperatorMemory() {
  console.log(`=== Seeding Operator Memory for: ${operatorEmail} ===\n`);

  try {
    // 1. Ensure public.users entry exists for the operator
    let { data: user } = await supabase.from('users').select('id').eq('id', operatorId).maybeSingle();
    if (!user) {
      console.log('Inserting missing public.users record for operator...');
      const { error: userErr } = await supabase.from('users').insert({
        id: operatorId,
        email: operatorEmail,
        role: 'admin',
        subscription: 'pro'
      });
      if (userErr) {
        console.error('Failed to create public user record:', userErr.message);
        return;
      }
    } else {
      // Ensure role is admin, subscription is pro, and email is correctly formatted
      await supabase.from('users').update({ role: 'admin', subscription: 'pro', email: operatorEmail }).eq('id', operatorId);
    }

    // 2. Ensure public.profiles entry exists
    let { data: profile } = await supabase.from('profiles').select('id').eq('id', operatorId).maybeSingle();
    if (!profile) {
      console.log('Inserting missing public.profiles record for operator...');
      const { error: profErr } = await supabase.from('profiles').insert({
        id: operatorId,
        name: 'Haris Khan',
        developer_role: 'Full Stack Developer',
        experience_level: 'Advanced',
        skills: ['React', 'Node.js', 'PostgreSQL', 'JavaScript', 'HTML', 'CSS', 'Docker']
      });
      if (profErr) console.error('Failed to create profile record:', profErr.message);
    }

    // 3. Clear existing operator memories to avoid duplicates
    console.log('Cleaning old operator memories...');
    const { error: clearErr } = await supabase.from('brain_memory').delete().eq('user_id', operatorId);
    if (clearErr) {
      console.error('Failed to clear old memories:', clearErr.message);
    }

    // 4. Insert new memories
    console.log('Inserting operator memories into brain_memory table...');
    const records = operatorMemories.map(m => ({
      user_id: operatorId,
      category: m.category,
      key: m.key,
      value: JSON.stringify(m.value), // Serialize value as JSONB
      is_pinned: m.is_pinned,
      metadata: m.metadata || {}
    }));

    const { error: insertErr } = await supabase.from('brain_memory').insert(records);
    if (insertErr) {
      console.error('Failed to insert memories:', insertErr.message);
    } else {
      console.log('Successfully seeded Operator Long-Term Memory Core!');
    }
  } catch (err) {
    console.error('Critical exception:', err);
  }
}

seedOperatorMemory();
