import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import Subscription from '../models/Subscription.js';
import SystemSettings from '../models/SystemSettings.js';
import User from '../models/User.js';

const router = express.Router();
router.use(protect);

// Get payment settings (JazzCash / EasyPaisa numbers)
router.get('/settings', async (_req, res) => {
  try {
    const settings = await SystemSettings.findOne();
    res.json({
      jazzCashNumber: settings?.jazzCashNumber || '',
      jazzCashName: settings?.jazzCashName || '',
      easyPaisaNumber: settings?.easyPaisaNumber || '',
      easyPaisaName: settings?.easyPaisaName || '',
      proPriceMonthly: settings?.proPriceMonthly || 500,
      proPriceYearly: settings?.proPriceYearly || 5000,
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

    let sub = await Subscription.findOne({ userId: req.user._id });
    if (!sub) {
      sub = new Subscription({ userId: req.user._id });
    }

    // Automatically verify screenshot presence and approve Pro subscription
    sub.paymentHistory.push({
      amount: Number(amount),
      method,
      transactionId,
      plan: plan || 'pro',
      status: 'approved',
      screenshotUrl: req.file.filename,
    });

    sub.plan = 'pro';
    sub.status = 'active';
    await sub.save();

    // Upgrade user subscription tier and role
    const user = await User.findById(req.user._id);
    if (user.role === 'free') {
      user.role = 'pro';
    }
    user.subscription = 'pro';
    await user.save();

    res.status(201).json({
      message: 'Screenshot verified! Subscription upgraded to Pro.',
      user: {
        subscription: 'pro',
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current subscription status
router.get('/status', async (req, res) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user._id });
    if (!sub) {
      return res.json({ plan: 'free', status: 'active', paymentHistory: [], payment: null });
    }

    const payment = sub.paymentHistory.length > 0
      ? sub.paymentHistory[sub.paymentHistory.length - 1]
      : null;

    res.json({
      plan: sub.plan,
      status: sub.status,
      paymentHistory: sub.paymentHistory,
      payment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
