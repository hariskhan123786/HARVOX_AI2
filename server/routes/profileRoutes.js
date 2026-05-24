import express from 'express';
import { protect } from '../middleware/auth.js';
import UserAnalytics from '../models/UserAnalytics.js';
import Achievements from '../models/Achievements.js';

const router = express.Router();
router.use(protect);

// Get full profile data (analytics + achievements)
router.get('/data', async (req, res) => {
  try {
    let analytics = await UserAnalytics.findOne({ userId: req.user._id });
    if (!analytics) {
      analytics = await UserAnalytics.create({ userId: req.user._id });
    }

    let achievements = await Achievements.findOne({ userId: req.user._id });
    if (!achievements) {
      achievements = await Achievements.create({ userId: req.user._id });
    }

    res.json({ analytics, achievements });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update achievements
router.post('/achievements', async (req, res) => {
  try {
    let achievements = await Achievements.findOne({ userId: req.user._id });
    if (!achievements) {
      achievements = new Achievements({ userId: req.user._id });
    }
    const { badge, xp } = req.body;
    if (badge) {
      const exists = achievements.badges.some((b) => b.id === badge.id);
      if (!exists) achievements.badges.push(badge);
    }
    if (xp) achievements.totalXp += xp;
    achievements.level = Math.floor(achievements.totalXp / 100) + 1;
    await achievements.save();
    res.json({ achievements });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get notifications (simple placeholder)
router.get('/notifications', async (_req, res) => {
  res.json({ notifications: [] });
});

export default router;
