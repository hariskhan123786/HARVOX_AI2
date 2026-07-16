import express from 'express';
import { protect } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();
router.use(protect);

const mapNote = (n) => ({
  _id: n.id,
  id: n.id,
  userId: n.user_id,
  title: n.title,
  content: n.content,
  source: n.source,
  tags: n.tags || [],
  pinned: n.pinned,
  createdAt: n.created_at,
  updatedAt: n.updated_at,
});

// List notes
router.get('/', async (req, res) => {
  try {
    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', req.user._id)
      .order('pinned', { ascending: false })
      .order('updated_at', { ascending: false });

    if (req.query.search) {
      query = query.or(`title.ilike.%${req.query.search}%,content.ilike.%${req.query.search}%`);
    }

    const { data: notes, error } = await query;
    if (error) throw error;
    res.json({ notes: (notes || []).map(mapNote) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search notes
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ notes: [] });

    const { data: notes, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', req.user._id)
      .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json({ notes: (notes || []).map(mapNote) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create note
router.post('/', async (req, res) => {
  try {
    const { title, content, source, tags, pinned } = req.body;
    const { data: note, error } = await supabase
      .from('documents')
      .insert({
        user_id: req.user._id,
        title: title || 'Untitled Note',
        content: content || '',
        source: source || 'manual',
        tags: tags || [],
        pinned: !!pinned,
      })
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json({ note: mapNote(note) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update note
router.put('/:id', async (req, res) => {
  try {
    const { title, content, source, tags, pinned } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (source !== undefined) updates.source = source;
    if (tags !== undefined) updates.tags = tags;
    if (pinned !== undefined) updates.pinned = pinned;

    const { data: note, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.user._id)
      .select('*')
      .single();

    if (error) return res.status(404).json({ message: 'Note not found' });
    res.json({ note: mapNote(note) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user._id);

    if (error) throw error;
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
