import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';
dotenv.config();

async function runDiagnostics() {
  console.log('--- Supabase Auth Diagnostics ---');
  try {
    const { data: users, error: listErr } = await supabase.auth.admin.listUsers();
    if (listErr) {
      console.error('Error listing users via admin API:', listErr);
    } else {
      console.log(`Successfully listed users. Total: ${users.users.length}`);
      users.users.forEach(u => {
        console.log(`- ID: ${u.id}, Email: ${u.email}, Confirmed: ${!!u.email_confirmed_at}`);
      });
    }

    console.log('\n--- Fetching users from public.users table ---');
    const { data: dbUsers, error: dbErr } = await supabase.from('users').select('*');
    if (dbErr) {
      console.error('Error fetching public.users table:', dbErr);
    } else {
      console.log(`Public users table count: ${dbUsers.length}`);
      dbUsers.forEach(u => {
        console.log(`- ID: ${u.id}, Email: ${u.email}, Role: ${u.role}, Subscription: ${u.subscription}`);
      });
    }

  } catch (err) {
    console.error('Critical exception:', err);
  }
}

runDiagnostics();
