import express from 'express';
import { protect, requireAdmin } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();
router.use(protect);
router.use(requireAdmin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('users')
      .select('id, email, role, subscription, is_banned, created_at, profiles(name, avatar)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (role) query = query.eq('role', role);
    if (search) {
      query = query.or(`email.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query;
    if (error) throw error;

    const mapped = (users || []).map((u) => ({
      _id: u.id,
      id: u.id,
      email: u.email,
      name: u.profiles?.name || '',
      role: u.role,
      subscription: u.subscription,
      isBanned: u.is_banned,
      createdAt: u.created_at,
    }));

    res.json({
      users: mapped,
      total: count || 0,
      page: Number(page),
      pages: Math.ceil((count || 0) / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .update({ role: req.body.role })
      .eq('id', req.params.id)
      .select('id, email, role, subscription, is_banned')
      .single();

    if (error) throw error;
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user subscription
router.put('/users/:id/subscription', async (req, res) => {
  try {
    const { subscription } = req.body;
    const { data: user, error } = await supabase
      .from('users')
      .update({ subscription })
      .eq('id', req.params.id)
      .select('id, email, role, subscription, is_banned')
      .single();

    if (error) throw error;

    // Also update subscriptions table
    await supabase
      .from('subscriptions')
      .update({ plan: subscription, status: 'active' })
      .eq('user_id', req.params.id);

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle ban
router.put('/users/:id/ban', async (req, res) => {
  try {
    const { data: existing } = await supabase
      .from('users')
      .select('is_banned')
      .eq('id', req.params.id)
      .single();

    const { data: user, error } = await supabase
      .from('users')
      .update({ is_banned: !existing.is_banned })
      .eq('id', req.params.id)
      .select('id, email, is_banned')
      .single();

    if (error) throw error;
    res.json({ user: { _id: user.id, isBanned: user.is_banned } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    // Delete from auth as well using admin API
    await supabase.auth.admin.deleteUser(req.params.id);
    // public.users row will cascade-delete
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all payment requests
router.get('/payments', async (req, res) => {
  try {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*, users(email, profiles(name))')
      .neq('payment_history', '[]');

    if (error) throw error;

    const payments = [];
    for (const sub of subscriptions || []) {
      const history = sub.payment_history || [];
      for (const payment of history) {
        payments.push({
          _id: payment._id || payment.id,
          userId: {
            _id: sub.user_id,
            email: sub.users?.email,
            name: sub.users?.profiles?.name,
          },
          subscriptionId: sub.id,
          ...payment,
        });
      }
    }
    payments.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    res.json({ payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve payment
router.put('/payments/:id/approve', async (req, res) => {
  try {
    const paymentId = req.params.id;

    // Find subscription containing this payment
    const { data: subs } = await supabase.from('subscriptions').select('*');
    let targetSub = null;
    let paymentIdx = -1;
    for (const sub of subs || []) {
      const idx = (sub.payment_history || []).findIndex((p) => String(p._id || p.id) === paymentId);
      if (idx !== -1) { targetSub = sub; paymentIdx = idx; break; }
    }
    if (!targetSub || paymentIdx === -1) return res.status(404).json({ message: 'Payment not found' });

    const updatedHistory = [...(targetSub.payment_history || [])];
    updatedHistory[paymentIdx] = { ...updatedHistory[paymentIdx], status: 'approved' };

    await supabase
      .from('subscriptions')
      .update({ plan: 'pro', status: 'active', payment_history: updatedHistory })
      .eq('id', targetSub.id);

    await supabase
      .from('users')
      .update({ subscription: 'pro', role: 'pro' })
      .eq('id', targetSub.user_id);

    res.json({ message: 'Payment approved, user upgraded to Pro' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject payment
router.put('/payments/:id/reject', async (req, res) => {
  try {
    const paymentId = req.params.id;
    const { data: subs } = await supabase.from('subscriptions').select('*');
    let targetSub = null;
    let paymentIdx = -1;
    for (const sub of subs || []) {
      const idx = (sub.payment_history || []).findIndex((p) => String(p._id || p.id) === paymentId);
      if (idx !== -1) { targetSub = sub; paymentIdx = idx; break; }
    }
    if (!targetSub || paymentIdx === -1) return res.status(404).json({ message: 'Payment not found' });

    const updatedHistory = [...(targetSub.payment_history || [])];
    updatedHistory[paymentIdx] = {
      ...updatedHistory[paymentIdx],
      status: 'rejected',
      rejectionReason: req.body.reason || 'Invalid payment',
    };

    await supabase
      .from('subscriptions')
      .update({ payment_history: updatedHistory })
      .eq('id', targetSub.id);

    res.json({ message: 'Payment rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get analytics
router.get('/analytics', async (_req, res) => {
  try {
    const [
      { count: totalUsers },
      { count: proUsers },
      { count: bannedUsers },
      { data: recentUsers },
      { data: subscriptions },
      { data: recentGrowthUsers },
      { data: topUsersRaw },
      { data: usageData }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('subscription', 'pro'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_banned', true),
      supabase.from('users').select('id, email, created_at, profiles(name)').order('created_at', { ascending: false }).limit(5),
      supabase.from('subscriptions').select('payment_history'),
      supabase.from('users').select('created_at').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('users').select('id, email, subscription, daily_usage, profiles(name)').order('daily_usage', { ascending: false }).limit(5),
      supabase.from('users').select('usage_chats, usage_code_gen, usage_files, usage_projects')
    ]);

    // Calculate revenue
    let revenue = 0;
    for (const sub of subscriptions || []) {
      const history = sub.payment_history || [];
      for (const payment of history) {
        if (payment.status === 'approved') {
          revenue += Number(payment.amount || 0);
        }
      }
    }

    // Calculate growth data (7 days)
    const growthMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      growthMap[dateStr] = 0;
    }
    for (const u of recentGrowthUsers || []) {
      const dateStr = new Date(u.created_at).toISOString().split('T')[0];
      if (growthMap[dateStr] !== undefined) {
        growthMap[dateStr]++;
      }
    }
    const growthData = Object.entries(growthMap).map(([date, users]) => ({
      date,
      users,
    }));

    // Calculate top users
    const topUsers = (topUsersRaw || []).map(u => ({
      name: u.profiles?.name || u.email.split('@')[0],
      email: u.email,
      subscription: u.subscription || 'free',
      chats: u.daily_usage || 0,
    }));

    // Sum AI usage stats
    let chats = 0;
    let codeGen = 0;
    let files = 0;
    let projects = 0;
    for (const u of usageData || []) {
      chats += u.usage_chats || 0;
      codeGen += u.usage_code_gen || 0;
      files += u.usage_files || 0;
      projects += u.usage_projects || 0;
    }

    res.json({
      totalUsers: totalUsers || 0,
      proUsers: proUsers || 0,
      freeUsers: (totalUsers || 0) - (proUsers || 0),
      bannedUsers: bannedUsers || 0,
      activeUsers: (totalUsers || 0) - (bannedUsers || 0),
      revenue,
      growthData,
      topUsers,
      aiUsageStats: {
        chats,
        codeGen,
        files,
        projects,
      },
      recentUsers: (recentUsers || []).map((u) => ({
        _id: u.id,
        email: u.email,
        name: u.profiles?.name || '',
        createdAt: u.created_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get admin system settings
router.get('/settings', async (_req, res) => {
  try {
    let { data: settings } = await supabase.from('system_settings').select('*').limit(1).maybeSingle();
    if (!settings) {
      const { data: newSettings } = await supabase
        .from('system_settings')
        .insert({
          jazz_cash_number: '03001234567',
          jazz_cash_name: 'HARVOX AI SAAS',
          easy_paisa_number: '03451234567',
          easy_paisa_name: 'HARVOX AI SAAS',
          announcement: 'Welcome to HARVOX AI!',
        })
        .select('*')
        .single();
      settings = newSettings;
    }
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update admin system settings
router.put('/settings', async (req, res) => {
  try {
    let { data: existing } = await supabase.from('system_settings').select('id').limit(1).maybeSingle();

    const allowedFields = [
      'jazz_cash_number', 'jazz_cash_name', 'easy_paisa_number', 'easy_paisa_name',
      'announcement', 'groq_key', 'gemini_key', 'cerebras_key',
      'maintenance_mode', 'pro_price_monthly', 'pro_price_yearly',
    ];
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
      // Support camelCase keys from frontend
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      if (req.body[camelKey] !== undefined) updates[key] = req.body[camelKey];
    }

    let settings;
    if (existing) {
      const { data } = await supabase
        .from('system_settings')
        .update(updates)
        .eq('id', existing.id)
        .select('*')
        .single();
      settings = data;
    } else {
      const { data } = await supabase.from('system_settings').insert(updates).select('*').single();
      settings = data;
    }

    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
