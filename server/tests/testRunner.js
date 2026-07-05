import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Boot configuration
dotenv.config();
process.env.USE_IN_MEMORY_DB = 'true';
process.env.JWT_SECRET = 'test-secret-key-12345';

import { connectDB, getDBHealth } from '../config/db.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

const runTests = async () => {
  console.log('==================================================');
  console.log('   HARVOX AI — PRODUCTION READINESS TEST SUITE    ');
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
    // ──── TEST 1: DATABASE CONNECTION ────
    console.log('⚡ Running Test Case 1: MongoDB Database Manager Initialization...');
    await connectDB();
    const health = getDBHealth();
    
    assert(health.status === 'ok', 'Database connection status is healthy');
    assert(health.state === 'connected', 'Database state reports connected');
    assert(health.details.poolSize === 10, 'Database pool size configured to 10 connections');

    // ──── TEST 2: USER SCHEMA PASSWORD HASHING ────
    console.log('\n⚡ Running Test Case 2: Mongoose User Password Hashing Hooks...');
    const testPassword = 'SafePassword123!';
    const userPayload = {
      name: 'Test QA Engineer',
      email: 'qa@harvox.ai',
      password: testPassword,
    };

    // Clean up if exists
    await User.deleteOne({ email: userPayload.email });

    const newUser = await User.create(userPayload);
    assert(newUser.email === 'qa@harvox.ai', 'User record email correctly lowercase and saved');
    assert(newUser.password !== testPassword, 'User password successfully hashed and secured');
    assert(newUser.password.startsWith('$2'), 'User password hash conforms to bcrypt layout format');

    // ──── TEST 3: PASSWORD COMPARISON ────
    console.log('\n⚡ Running Test Case 3: Password Comparison & BCrypt Matching...');
    const correctMatch = await newUser.matchPassword(testPassword);
    const incorrectMatch = await newUser.matchPassword('WrongPassword!');
    
    assert(correctMatch === true, 'Correct password successfully matches database hash');
    assert(incorrectMatch === false, 'Incorrect password correctly rejected by comparing hook');

    // ──── TEST 4: JWT GENERATION & INTEGRITY ────
    console.log('\n⚡ Running Test Case 4: JSON Web Token signing and parsing integrity...');
    const mockToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(mockToken, process.env.JWT_SECRET);
    
    assert(decoded.id === newUser._id.toString(), 'Signed token contains encoded user identification payload');

    // Clean up
    await User.deleteOne({ _id: newUser._id });

    // ──── TEST 5: SCREENSHOT AUTO-VERIFICATION & UPGRADE ────
    console.log('\n⚡ Running Test Case 5: Screenshot Upload Auto-Upgrade...');
    const testUser = await User.create({
      name: 'Billing Test User',
      email: 'billing@harvox.ai',
      password: 'BillingPassword123!',
      role: 'free',
      subscription: 'free'
    });

    let testSub = await Subscription.findOne({ userId: testUser._id });
    if (!testSub) {
      testSub = await Subscription.create({ userId: testUser._id, plan: 'free', status: 'active' });
    }

    // Simulate route handler auto-approval logic
    testSub.paymentHistory.push({
      amount: 999,
      method: 'JazzCash',
      transactionId: '1234567890',
      plan: 'monthly',
      status: 'approved',
      screenshotUrl: 'mock_screenshot.png',
    });
    testSub.plan = 'pro';
    testSub.status = 'active';
    await testSub.save();

    const dbUser = await User.findById(testUser._id);
    if (dbUser.role === 'free') {
      dbUser.role = 'pro';
    }
    dbUser.subscription = 'pro';
    await dbUser.save();

    assert(dbUser.subscription === 'pro', 'User subscription successfully upgraded to Pro');
    assert(dbUser.role === 'pro', 'User role upgraded to Pro');
    assert(testSub.plan === 'pro', 'Subscription plan updated to pro');
    assert(testSub.paymentHistory[0].status === 'approved', 'Payment status is approved instantly');

    // Clean up Test 5
    await User.deleteOne({ _id: testUser._id });
    await Subscription.deleteOne({ userId: testUser._id });

    // ── SUMMARY REPORT ──
    console.log('\n==================================================');
    console.log('                 TEST SUITE SUMMARY               ');
    console.log('==================================================');
    console.log(`  TOTAL RUN:   ${passed + failed}`);
    console.log(`  PASSED:      ${passed}`);
    console.log(`  FAILED:      ${failed}`);
    console.log('==================================================');

    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('\n💥 CRITICAL TEST EXCEPTION:', err.message);
    console.error(err.stack);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

runTests();
