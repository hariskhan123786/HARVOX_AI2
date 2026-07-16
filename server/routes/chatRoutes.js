import express from 'express';
import { protect } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();
router.use(protect);

const mapChat = (session, messages = []) => ({
  _id: session.id,
  id: session.id,
  userId: session.user_id,
  title: session.title,
  pinned: session.pinned,
  archived: session.archived,
  messages: messages.map((m) => ({
    _id: m.id,
    role: m.role,
    content: m.content,
    bookmarked: m.bookmarked,
    createdAt: m.created_at,
  })),
  createdAt: session.created_at,
  updatedAt: session.updated_at,
});

// List all chat sessions
router.get('/', async (req, res) => {
  try {
    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', req.user._id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json({ chats: (sessions || []).map((s) => mapChat(s)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single chat with all messages
router.get('/:id', async (req, res) => {
  try {
    const { data: session, error: sessErr } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user._id)
      .maybeSingle();

    if (sessErr) throw sessErr;
    if (!session) return res.status(404).json({ message: 'Chat not found' });

    const { data: messages, error: msgsErr } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });

    if (msgsErr) throw msgsErr;
    res.json({ chat: mapChat(session, messages || []) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete chat
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user._id);

    if (error) throw error;
    res.json({ message: 'Chat deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bookmark a message by message ID
router.patch('/bookmark', async (req, res) => {
  try {
    const { chatId, messageId, bookmarked } = req.body;

    // Verify the chat belongs to the user
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', chatId)
      .eq('user_id', req.user._id)
      .maybeSingle();

    if (!session) return res.status(404).json({ message: 'Chat not found' });

    await supabase
      .from('chat_messages')
      .update({ bookmarked: !!bookmarked })
      .eq('id', messageId)
      .eq('session_id', chatId);

    res.json({ message: 'Message bookmark updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
