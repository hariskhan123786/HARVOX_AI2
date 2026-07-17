import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';
dotenv.config();

async function testAdminCreate() {
  const email = `testuser_${Date.now()}@example.com`;
  const password = 'TestPassword123!';
  const name = 'Test User';

  console.log(`Attempting to create user: ${email}...`);
  try {
    const { data: createData, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (createErr) {
      console.error('Error creating user:', createErr);
      return;
    }

    const authUser = createData.user;
    console.log('User created successfully in Auth:', authUser.id, authUser.email, 'Confirmed:', authUser.email_confirmed_at);

    console.log('Attempting to sign in with password...');
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInErr) {
      console.error('Error signing in:', signInErr);
    } else {
      console.log('Sign in successful. Token prefix:', signInData.session.access_token.substring(0, 20));
    }

    // Clean up
    console.log('Cleaning up test user...');
    const { error: delErr } = await supabase.auth.admin.deleteUser(authUser.id);
    if (delErr) {
      console.error('Error deleting test user:', delErr);
    } else {
      console.log('Test user cleaned up.');
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

testAdminCreate();
