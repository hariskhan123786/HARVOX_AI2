import express from 'express';
import Chat from '../models/Chat.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// List all chats
router.get('/', async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select('title messages createdAt updatedAt');
    res.json({ chats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single chat
router.get('/:id', async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json({ chat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete chat
router.delete('/:id', async (req, res) => {
  try {
    await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Chat deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bookmark a message
router.patch('/bookmark', async (req, res) => {
  try {
    const { chatId, messageIndex, bookmarked } = req.body;
    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (chat.messages[messageIndex]) {
      chat.messages[messageIndex].bookmarked = bookmarked;
      await chat.save();
    }
    res.json({ chat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
