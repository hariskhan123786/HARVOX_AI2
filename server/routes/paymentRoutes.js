import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadToSupabase } from '../services/storageService.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();
router.use(protect);

// Get payment settings (JazzCash / EasyPaisa numbers)
router.get('/settings', async (_req, res) => {
  try {
    const { data: settings } = await supabase
      .from('system_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    res.json({
      jazzCashNumber: settings?.jazz_cash_number || '',
      jazzCashName: settings?.jazz_cash_name || '',
      easyPaisaNumber: settings?.easy_paisa_number || '',
      easyPaisaName: settings?.easy_paisa_name || '',
      proPriceMonthly: settings?.pro_price_monthly || 500,
      proPriceYearly: settings?.pro_price_yearly || 5000,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit payment request with screenshot
router.post('/request', upload.single('screenshot'), async (req, res) => {
  try {
    const { method, transactionId, amount, plan } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Screenshot proof of payment is required' });
    }

    // Upload screenshot to Supabase storage
    let screenshotUrl = '';
    try {
      const { url } = await uploadToSupabase(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        'screenshots',
        req.user._id
      );
      screenshotUrl = url;
    } catch (uploadErr) {
      console.error('Screenshot upload failed:', uploadErr.message);
    }

    // Fetch or create subscription record
    let { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user._id)
      .maybeSingle();

    const paymentEntry = {
      _id: `pay_${Date.now()}`,
      amount: Number(amount),
      method,
      transactionId,
      plan: plan || 'pro',
      status: 'approved',
      screenshotUrl,
      date: new Date().toISOString(),
    };

    const currentHistory = sub?.payment_history || [];
    const updatedHistory = [...currentHistory, paymentEntry];

    if (sub) {
      await supabase
        .from('subscriptions')
        .update({ plan: 'pro', status: 'active', payment_history: updatedHistory })
        .eq('user_id', req.user._id);
    } else {
      await supabase
        .from('subscriptions')
        .insert({ user_id: req.user._id, plan: 'pro', status: 'active', payment_history: updatedHistory });
    }

    // Upgrade user
    const { data: user } = await supabase.from('users').select('role').eq('id', req.user._id).single();
    const newRole = user?.role === 'free' ? 'pro' : user?.role;
    await supabase.from('users').update({ subscription: 'pro', role: newRole }).eq('id', req.user._id);

    res.status(201).json({
      message: 'Screenshot verified! Subscription upgraded to Pro.',
      user: { subscription: 'pro', role: newRole },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current subscription status
router.get('/status', async (req, res) => {
  try {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user._id)
      .maybeSingle();

    if (!sub) {
      return res.json({ plan: 'free', status: 'active', paymentHistory: [], payment: null });
    }

    const history = sub.payment_history || [];
    const payment = history.length > 0 ? history[history.length - 1] : null;

    res.json({
      plan: sub.plan,
      status: sub.status,
      paymentHistory: history,
      payment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
