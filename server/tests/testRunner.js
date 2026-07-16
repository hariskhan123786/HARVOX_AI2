import dotenv from 'dotenv';
dotenv.config();

import { connectDB, getDBHealth } from '../config/db.js';
import { supabase } from '../config/supabase.js';

const runTests = async () => {
  console.log('==================================================');
  console.log('   HARVOX AI — PRODUCTION READINESS TEST SUITE    ');
  console.log('   (Supabase Edition — Phase 14)                  ');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`  ✅ [PASS] - ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] - ${message}`);
      failed++;
    }
  };

  try {
    // ──── TEST 1: SUPABASE CONNECTION ────
    console.log('⚡ Running Test Case 1: Supabase Database Connection Check...');
    await connectDB();
    const health = getDBHealth();
    assert(health !== null, 'Database health object returned successfully');
    assert(['ok', 'degraded'].includes(health.status), 'Database health status is valid (ok or degraded)');
    assert(health.details?.dbName === 'Supabase PostgreSQL', 'Database reports correct Supabase identity');

    // ──── TEST 2: SUPABASE SYSTEM SETTINGS TABLE ────
    console.log('\n⚡ Running Test Case 2: Supabase system_settings table access...');
    const { data: settings, error: settingsErr } = await supabase
      .from('system_settings')
      .select('id')
      .limit(1)
      .maybeSingle();
    assert(!settingsErr, `system_settings table accessible (error: ${settingsErr?.message || 'none'})`);

    // ──── TEST 3: SUPABASE AUTH (sign in with Supabase) ────
    console.log('\n⚡ Running Test Case 3: Supabase Auth Connection...');
    const { data: authData, error: authErr } = await supabase.auth.admin.listUsers({ perPage: 1 });
    assert(!authErr, `Supabase Auth admin API accessible (error: ${authErr?.message || 'none'})`);

    // ──── TEST 4: SUPABASE AI CALL LOGS TABLE ────
    console.log('\n⚡ Running Test Case 4: ai_call_logs table existence...');
    const { error: callLogErr } = await supabase.from('ai_call_logs').select('id').limit(1);
    assert(!callLogErr, `ai_call_logs table accessible (error: ${callLogErr?.message || 'none'})`);

    // ──── TEST 5: SUPABASE BRAIN MEMORY TABLE ────
    console.log('\n⚡ Running Test Case 5: brain_memory table existence...');
    const { error: memErr } = await supabase.from('brain_memory').select('id').limit(1);
    assert(!memErr, `brain_memory table accessible (error: ${memErr?.message || 'none'})`);

    // ── SUMMARY REPORT ──
    console.log('\n==================================================');
    console.log('                 TEST SUITE SUMMARY               ');
    console.log('==================================================');
    console.log(`  TOTAL RUN:   ${passed + failed}`);
    console.log(`  PASSED:      ${passed}`);
    console.log(`  FAILED:      ${failed}`);
    console.log('==================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('\n💥 CRITICAL TEST EXCEPTION:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
};

runTests();
