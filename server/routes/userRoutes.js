import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Note from '../models/Note.js';
import File from '../models/File.js';
import Project from '../models/Project.js';

const router = express.Router();
router.use(protect);

// User stats (for dashboard)
router.get('/stats', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('usage subscription');
    const chatCount = await Chat.countDocuments({ userId: req.user._id });
    const noteCount = await Note.countDocuments({ userId: req.user._id });
    const fileCount = await File.countDocuments({ userId: req.user._id });
    const projectCount = await Project.countDocuments({ userId: req.user._id });

    res.json({
      usage: user.usage,
      subscription: user.subscription,
      counts: { chats: chatCount, notes: noteCount, files: fileCount, projects: projectCount },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User files
router.get('/files', async (req, res) => {
  try {
    const files = await File.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ files });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
