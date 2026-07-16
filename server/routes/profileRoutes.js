import express from 'express';
import { protect } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();
router.use(protect);

// Get full profile data (analytics + subscription from Supabase tables)
router.get('/data', async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch activity stats from activity_logs
    const { data: actLogs } = await supabase
      .from('activity_logs')
      .select('action_type')
      .eq('user_id', userId);

    const totalChats = (actLogs || []).filter((l) => l.action_type === 'chat').length;
    const generatedCodeCount = (actLogs || []).filter((l) => l.action_type === 'code_gen').length;
    const uploadedFiles = (actLogs || []).filter((l) => l.action_type === 'upload').length;
    const debuggingSessions = (actLogs || []).filter((l) => l.action_type === 'debug').length;

    const analytics = {
      totalChats,
      generatedCodeCount,
      uploadedFiles,
      debuggingSessions,
      activityLog: (actLogs || []).slice(-20).map((l) => ({ actionType: l.action_type })),
    };

    // Fetch profile badges and XP
    const { data: profile } = await supabase
      .from('profiles')
      .select('badges, level, total_xp')
      .eq('id', userId)
      .maybeSingle();

    const achievements = {
      badges: profile?.badges || [],
      totalXp: profile?.total_xp || 0,
      level: profile?.level || 1,
    };

    // Fetch subscription
    let { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!subscription) {
      const { data: newSub } = await supabase
        .from('subscriptions')
        .insert({ user_id: userId, plan: 'free', status: 'active' })
        .select('*')
        .single();
      subscription = newSub;
    }

    res.json({ analytics, achievements, subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update achievements (badges & XP on the profiles table)
router.post('/achievements', async (req, res) => {
  try {
    const userId = req.user._id;
    const { badge, xp } = req.body;

    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('badges, total_xp, level')
      .eq('id', userId)
      .single();

    if (profErr) throw profErr;

    const currentBadges = profile.badges || [];
    const currentXp = Number(profile.total_xp || 0);

    const updates = {};
    if (badge) {
      const exists = currentBadges.some((b) => b.id === badge.id);
      if (!exists) updates.badges = [...currentBadges, badge];
    }
    if (xp) {
      const newXp = currentXp + xp;
      updates.total_xp = newXp;
      updates.level = Math.floor(newXp / 100) + 1;
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from('profiles').update(updates).eq('id', userId);
    }

    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('badges, total_xp, level')
      .eq('id', userId)
      .single();

    res.json({
      achievements: {
        badges: updatedProfile.badges || [],
        totalXp: updatedProfile.total_xp || 0,
        level: updatedProfile.level || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get notifications
router.get('/notifications', async (req, res) => {
  try {
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user._id)
      .order('created_at', { ascending: false })
      .limit(20);

    res.json({ notifications: notifications || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
