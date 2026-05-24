import express from 'express';
import { protect, requireAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import SystemSettings from '../models/SystemSettings.js';
import UserAnalytics from '../models/UserAnalytics.js';

const router = express.Router();
router.use(protect);
router.use(requireAdmin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);
    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user subscription
router.put('/users/:id/subscription', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { subscription: req.body.subscription },
      { new: true }
    ).select('-password');

    // Also update Subscription document
    await Subscription.findOneAndUpdate(
      { userId: req.params.id },
      { plan: req.body.subscription, status: 'active' },
      { upsert: true }
    );

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle ban
router.put('/users/:id/ban', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isBanned = !user.isBanned;
    await user.save();
    res.json({ user: { _id: user._id, isBanned: user.isBanned } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all payment requests
router.get('/payments', async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      'paymentHistory.0': { $exists: true },
    }).populate('userId', 'name email');
    
    const payments = [];
    for (const sub of subscriptions) {
      for (const payment of sub.paymentHistory) {
        payments.push({
          _id: payment._id,
          userId: sub.userId,
          subscriptionId: sub._id,
          ...payment.toObject(),
        });
      }
    }
    payments.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve payment
router.put('/payments/:id/approve', async (req, res) => {
  try {
    const sub = await Subscription.findOne({ 'paymentHistory._id': req.params.id });
    if (!sub) return res.status(404).json({ message: 'Payment not found' });

    const payment = sub.paymentHistory.id(req.params.id);
    payment.status = 'approved';
    sub.plan = 'pro';
    sub.status = 'active';
    await sub.save();

    // Upgrade user
    await User.findByIdAndUpdate(sub.userId, { subscription: 'pro', role: 'pro' });

    res.json({ message: 'Payment approved, user upgraded to Pro' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject payment
router.put('/payments/:id/reject', async (req, res) => {
  try {
    const sub = await Subscription.findOne({ 'paymentHistory._id': req.params.id });
    if (!sub) return res.status(404).json({ message: 'Payment not found' });

    const payment = sub.paymentHistory.id(req.params.id);
    payment.status = 'rejected';
    payment.rejectionReason = req.body.reason || 'Invalid payment';
    await sub.save();

    res.json({ message: 'Payment rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get analytics
router.get('/analytics', async (_req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const proUsers = await User.countDocuments({ subscription: 'pro' });
    const freeUsers = totalUsers - proUsers;
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt');

    res.json({
      totalUsers,
      proUsers,
      freeUsers,
      bannedUsers,
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get admin system settings
router.get('/settings', async (_req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) settings = await SystemSettings.create({});
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update admin system settings
router.put('/settings', async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) settings = new SystemSettings();
    Object.assign(settings, req.body);
    await settings.save();
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
