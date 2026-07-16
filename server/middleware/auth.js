import { supabase } from '../config/supabase.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
    if (error || !authUser) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*, profiles(*)')
      .eq('id', authUser.id)
      .maybeSingle();

    if (!user) {
      return res.status(401).json({ message: 'User record not found' });
    }

    if (user.is_banned) {
      return res.status(403).json({ message: 'Account has been suspended' });
    }

    // Attach user in a backwards-compatible format with Mongoose models
    req.user = {
      _id: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
      subscription: user.subscription,
      isBanned: user.is_banned,
      usage: {
        chats: user.usage_chats || 0,
        codeGen: user.usage_code_gen || 0,
        files: user.usage_files || 0,
        projects: user.usage_projects || 0,
      },
      dailyUsage: user.daily_usage || 0,
      lastUsageDate: user.last_usage_date,
      name: user.profiles?.name || '',
      avatar: user.profiles?.avatar || '',
      bio: user.profiles?.bio || '',
      location: user.profiles?.location || '',
      developerRole: user.profiles?.developer_role || 'Full Stack Developer',
      experienceLevel: user.profiles?.experience_level || 'Intermediate',
      skills: user.profiles?.skills || [],
      socialLinks: user.profiles?.social_links || { github: '', twitter: '', linkedin: '', website: '' },
    };

    req.token = token; // Save token for user-scoped operations
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};
