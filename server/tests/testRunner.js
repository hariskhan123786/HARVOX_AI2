import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Boot configuration
dotenv.config();
process.env.USE_IN_MEMORY_DB = 'true';
process.env.JWT_SECRET = 'test-secret-key-12345';

import { connectDB, getDBHealth } from '../config/db.js';
import User from '../models/User.js';

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
