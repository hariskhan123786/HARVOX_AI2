import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import Subscription from '../models/Subscription.js';
import SystemSettings from '../models/SystemSettings.js';

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
    const { method, transactionId, amount } = req.body;

    let sub = await Subscription.findOne({ userId: req.user._id });
    if (!sub) {
      sub = new Subscription({ userId: req.user._id });
    }

    sub.paymentHistory.push({
      amount: Number(amount),
      method,
      transactionId,
      status: 'pending',
      screenshotUrl: req.file ? req.file.filename : '',
    });

    await sub.save();
    res.status(201).json({ message: 'Payment request submitted for review' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current subscription status
router.get('/status', async (req, res) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user._id });
    if (!sub) {
      return res.json({ plan: 'free', status: 'active', paymentHistory: [] });
    }
    res.json({
      plan: sub.plan,
      status: sub.status,
      paymentHistory: sub.paymentHistory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
