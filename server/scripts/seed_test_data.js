import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';
dotenv.config();

const testUsers = [
  {
    email: 'alex.dev@harvox.ai',
    password: 'PasswordAlex123!',
    name: 'Alex Developer',
    role: 'free',
    subscription: 'free',
    developerRole: 'Frontend Developer',
    experienceLevel: 'Beginner',
    skills: ['React', 'HTML', 'CSS', 'JavaScript']
  },
  {
    email: 'sarah.pro@harvox.ai',
    password: 'PasswordSarah123!',
    name: 'Sarah Architect',
    role: 'pro',
    subscription: 'pro',
    developerRole: 'Solutions Architect',
    experienceLevel: 'Advanced',
    skills: ['Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Kubernetes']
  },
  {
    email: 'james.admin@harvox.ai',
    password: 'PasswordJames123!',
    name: 'James Admin',
    role: 'admin',
    subscription: 'pro',
    developerRole: 'DevOps Engineer',
    experienceLevel: 'Expert',
    skills: ['CI/CD', 'Terraform', 'Linux', 'Security', 'Python']
  }
];

async function seedData() {
  console.log('=== HARVOX AI: Seeding Test Users & Mock Data ===\n');

  try {
    for (const u of testUsers) {
      console.log(`Processing user: ${u.email}...`);

      // Check if user already exists in auth.users
      const { data: listData, error: listErr } = await supabase.auth.admin.listUsers();
      if (listErr) {
        console.error('Error checking user list:', listErr);
        continue;
      }

      let authUser = listData.users.find(user => user.email === u.email);

      if (!authUser) {
        // 1. Create in Supabase Auth
        const { data: createData, error: createErr } = await supabase.auth.admin.createUser({
          email: u.email,
          password: u.password,
          email_confirm: true,
          user_metadata: { name: u.name },
        });

        if (createErr) {
          console.error(`Failed to create Auth user for ${u.email}:`, createErr.message);
          continue;
        }

        authUser = createData.user;
        console.log(`- Created Auth user: ${authUser.id}`);
      } else {
        console.log(`- User already exists in Auth: ${authUser.id}`);
      }

      const uid = authUser.id;

      // 2. Ensure public.users entry
      const { data: existingUser } = await supabase.from('users').select('id').eq('id', uid).maybeSingle();
      if (!existingUser) {
        const { error: userErr } = await supabase.from('users').insert({
          id: uid,
          email: u.email,
          role: u.role,
          subscription: u.subscription,
        });
        if (userErr) console.error(`Error inserting public.users for ${u.email}:`, userErr.message);
        else console.log('- Created public.users record');
      } else {
        // Update role and subscription to match
        await supabase.from('users').update({ role: u.role, subscription: u.subscription }).eq('id', uid);
        console.log('- Verified public.users record');
      }

      // 3. Ensure public.profiles entry
      const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', uid).maybeSingle();
      if (!existingProfile) {
        const { error: profErr } = await supabase.from('profiles').insert({
          id: uid,
          name: u.name,
          developer_role: u.developerRole,
          experience_level: u.experienceLevel,
          skills: u.skills,
          total_xp: 1500,
          level: 3,
        });
        if (profErr) console.error(`Error inserting profile for ${u.email}:`, profErr.message);
        else console.log('- Created public.profiles record');
      } else {
        console.log('- Verified public.profiles record');
      }

      // 4. Ensure settings, subscription, and user preferences exist
      const { data: setRec } = await supabase.from('settings').select('id').eq('user_id', uid).maybeSingle();
      if (!setRec) {
        await supabase.from('settings').insert({ user_id: uid });
      }

      const { data: subRec } = await supabase.from('subscriptions').select('id').eq('user_id', uid).maybeSingle();
      if (!subRec) {
        await supabase.from('subscriptions').insert({ user_id: uid, plan: u.subscription, status: 'active' });
      }

      const { data: prefRec } = await supabase.from('user_preferences').select('id').eq('user_id', uid).maybeSingle();
      if (!prefRec) {
        await supabase.from('user_preferences').insert({ user_id: uid });
      }
      console.log('- Configured settings, subscriptions, and user_preferences');

      // 5. Seed some mock Chat sessions & messages
      const { data: existingChats } = await supabase.from('chat_sessions').select('id').eq('user_id', uid).limit(1);
      if (!existingChats || existingChats.length === 0) {
        console.log('- Seeding mock chat sessions...');
        const { data: chatSession, error: chatErr } = await supabase.from('chat_sessions').insert({
          user_id: uid,
          title: 'Project Architecture Discussion',
        }).select('*').single();

        if (!chatErr && chatSession) {
          await supabase.from('chat_messages').insert([
            {
              session_id: chatSession.id,
              role: 'user',
              content: 'How should we configure the database schema for our scale?'
            },
            {
              session_id: chatSession.id,
              role: 'assistant',
              content: 'I recommend using PostgreSQL on Supabase. Enable RLS (Row Level Security) and configure indexes for performance. We can define our public tables referencing `auth.users` for secure row access.'
            }
          ]);
          console.log('  -> Seeded 1 chat session with 2 messages');
        }
      }

      // 6. Seed mock Documents (Notes)
      const { data: existingDocs } = await supabase.from('documents').select('id').eq('user_id', uid).limit(1);
      if (!existingDocs || existingDocs.length === 0) {
        console.log('- Seeding mock notes...');
        await supabase.from('documents').insert([
          {
            user_id: uid,
            title: 'Project Roadmap',
            content: '# Project Alpha Roadmap\n- [x] Design DB schema\n- [ ] Integrate Supabase Auth\n- [ ] Deploy to Vercel/Railway',
            source: 'manual',
            tags: ['roadmap', 'planning']
          },
          {
            user_id: uid,
            title: 'Supabase Cheat Sheet',
            content: 'Use `supabase.auth.admin.createUser` to create verified users directly from the backend server.',
            source: 'code',
            tags: ['supabase', 'backend']
          }
        ]);
        console.log('  -> Seeded 2 mock notes');
      }

      // 7. Seed mock Tasks
      const { data: existingTasks } = await supabase.from('tasks').select('id').eq('user_id', uid).limit(1);
      if (!existingTasks || existingTasks.length === 0) {
        console.log('- Seeding mock tasks...');
        await supabase.from('tasks').insert([
          {
            user_id: uid,
            title: 'Finalize Auth Flow',
            description: 'Ensure backend and frontend are aligned on Supabase authentication.',
            priority: 'high',
            status: 'pending',
            deadline: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
          },
          {
            user_id: uid,
            title: 'Verify Vercel Routing',
            description: 'Check vercel.json configuration and env variables.',
            priority: 'medium',
            status: 'completed',
          }
        ]);
        console.log('  -> Seeded 2 mock tasks');
      }

      console.log(`Finished seeding for ${u.email}\n`);
    }

    console.log('=== Seeding Completed Successfully ===');
  } catch (err) {
    console.error('Critical seeding error:', err);
  }
}

seedData();
