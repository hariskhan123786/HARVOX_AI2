import { supabase } from '../config/supabase.js';

const sendUser = (user, profile) => ({
  _id: user.id,
  id: user.id,
  name: profile?.name || '',
  email: user.email,
  avatar: profile?.avatar || '',
  bio: profile?.bio || '',
  location: profile?.location || '',
  developerRole: profile?.developer_role || 'Full Stack Developer',
  experienceLevel: profile?.experience_level || 'Intermediate',
  skills: profile?.skills || [],
  socialLinks: profile?.social_links || { github: '', twitter: '', linkedin: '', website: '' },
  role: user.role,
  subscription: user.subscription,
  usage: {
    chats: user.usage_chats || 0,
    codeGen: user.usage_code_gen || 0,
    files: user.usage_files || 0,
    projects: user.usage_projects || 0,
  },
  createdAt: user.created_at,
});

const ensurePublicRecords = async (userId, email, name) => {
  // Check users
  let { data: user, error: userErr } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (!user) {
    const { data: newUser, error: createErr } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        role: 'free',
        subscription: 'free',
      })
      .select('*')
      .single();
    if (createErr) throw createErr;
    user = newUser;
  }

  // Check profiles
  let { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (!profile) {
    const { data: newProfile, error: createProfErr } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name: name || email.split('@')[0],
      })
      .select('*')
      .single();
    if (createProfErr) throw createProfErr;
    profile = newProfile;
  }

  // Ensure settings, subscriptions, and preferences exist
  const { data: settings } = await supabase.from('settings').select('id').eq('user_id', userId).maybeSingle();
  if (!settings) {
    await supabase.from('settings').insert({ user_id: userId });
  }

  const { data: subscription } = await supabase.from('subscriptions').select('id').eq('user_id', userId).maybeSingle();
  if (!subscription) {
    await supabase.from('subscriptions').insert({ user_id: userId, plan: 'free', status: 'active' });
  }

  const { data: pref } = await supabase.from('user_preferences').select('id').eq('user_id', userId).maybeSingle();
  if (!pref) {
    await supabase.from('user_preferences').insert({ user_id: userId });
  }

  return { user, profile };
};

export const register = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }
    email = email.toLowerCase().trim();
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // 1. Sign up user in Supabase Auth via Admin API (which auto-confirms email)
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (signUpError) {
      return res.status(400).json({ message: signUpError.message });
    }

    const authUser = signUpData.user;
    if (!authUser) {
      return res.status(400).json({ message: 'Failed to create authentication user.' });
    }

    // 2. Ensure all public records are created and populated (Self-Healing)
    const { user, profile } = await ensurePublicRecords(authUser.id, email, name);

    // 3. Log in to get session token (which will now succeed immediately since email is confirmed)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return res.status(201).json({
        token: '',
        user: sendUser(user, profile),
      });
    }

    res.status(201).json({
      token: signInData.session.access_token,
      user: sendUser(user, profile),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    email = email.toLowerCase().trim();

    // 1. Sign in with Supabase Auth
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const authUser = signInData.user;

    // 2. Fetch public user and profile records & auto-heal if missing
    const { user, profile } = await ensurePublicRecords(
      authUser.id,
      authUser.email,
      authUser.user_metadata?.name
    );

    if (user.is_banned) {
      return res.status(403).json({ message: 'Account has been suspended' });
    }

    res.json({
      token: signInData.session.access_token,
      user: sendUser(user, profile),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: sendUser(req.user, req.user) });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, avatar, bio, location, developerRole, experienceLevel, skills, socialLinks, password } = req.body;
    const userId = req.user._id;

    // Update profile table
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
    if (developerRole !== undefined) updates.developer_role = developerRole;
    if (experienceLevel !== undefined) updates.experience_level = experienceLevel;
    if (skills !== undefined) updates.skills = skills;
    if (socialLinks !== undefined) {
      const currentSocial = req.user.socialLinks || {};
      updates.social_links = { ...currentSocial, ...socialLinks };
    }

    let profile = null;
    if (Object.keys(updates).length > 0) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select('*')
        .single();

      if (error) throw error;
      profile = data;
    } else {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      profile = data;
    }

    // Update password in Supabase Auth if provided
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      const { error: pwdError } = await supabase.auth.admin.updateUserById(userId, {
        password,
      });
      if (pwdError) throw pwdError;
    }

    const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();

    res.json({ user: sendUser(user, profile) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Determine frontend origin dynamically to send reset link to the right UI URL
    const origin = req.headers.origin || req.headers.referer || 'http://localhost:5173';
    let cleanOrigin = origin;
    try {
      cleanOrigin = new URL(origin).origin;
    } catch (e) {
      // Fallback if origin is not a fully qualified URL
    }
    const redirectToUrl = `${cleanOrigin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
      redirectTo: redirectToUrl
    });
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    // In production/local, Supabase returns success even if email doesn't exist for security
    res.json({ message: 'If that email exists, a reset link was sent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
