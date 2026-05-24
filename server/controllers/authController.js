import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import UserSettings from '../models/UserSettings.js';
import UserAnalytics from '../models/UserAnalytics.js';
import Achievements from '../models/Achievements.js';
import Subscription from '../models/Subscription.js';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const sendUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  bio: user.bio,
  location: user.location,
  developerRole: user.developerRole,
  experienceLevel: user.experienceLevel,
  skills: user.skills,
  socialLinks: user.socialLinks,
  role: user.role,
  subscription: user.subscription,
  usage: user.usage,
  createdAt: user.createdAt,
});

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
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password });
    
    // Create default records
    await UserSettings.create({ userId: user._id });
    await UserAnalytics.create({ userId: user._id });
    await Achievements.create({ userId: user._id });
    await Subscription.create({ userId: user._id, plan: 'free', status: 'active' });

    res.status(201).json({
      token: generateToken(user._id),
      user: sendUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase().trim();
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({
      token: generateToken(user._id),
      user: sendUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: sendUser(req.user) });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, avatar, bio, location, developerRole, experienceLevel, skills, socialLinks, password } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (name !== undefined) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (developerRole !== undefined) user.developerRole = developerRole;
    if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
    if (skills !== undefined) user.skills = skills;
    if (socialLinks !== undefined) user.socialLinks = { ...user.socialLinks, ...socialLinks };

    if (password) {
      if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
      user.password = password;
    }

    await user.save();
    res.json({ user: sendUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link was sent.' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 3600000;
    await user.save();
    if (process.env.NODE_ENV === 'development') {
      console.log('Reset token (dev only):', resetToken);
    }
    res.json({ message: 'If that email exists, a reset link was sent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
