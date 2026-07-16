import express from 'express';
import { protect } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();
router.use(protect);

// User stats (for dashboard)
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      { count: chatCount },
      { count: noteCount },
      { count: fileCount },
      { count: projectCount },
      { data: user },
    ] = await Promise.all([
      supabase.from('chat_sessions').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('uploaded_files').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('users').select('usage_chats, usage_code_gen, usage_files, usage_projects, subscription').eq('id', userId).single(),
    ]);

    res.json({
      usage: {
        chats: user?.usage_chats || 0,
        codeGen: user?.usage_code_gen || 0,
        files: user?.usage_files || 0,
        projects: user?.usage_projects || 0,
      },
      subscription: user?.subscription || 'free',
      counts: {
        chats: chatCount || 0,
        notes: noteCount || 0,
        files: fileCount || 0,
        projects: projectCount || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User projects
router.get('/projects', async (req, res) => {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', req.user._id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json({
      projects: (projects || []).map((p) => ({
        _id: p.id,
        name: p.name,
        description: p.description,
        framework: p.framework,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User files
router.get('/files', async (req, res) => {
  try {
    const { data: files, error } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('user_id', req.user._id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({
      files: (files || []).map((f) => ({
        _id: f.id,
        fileName: f.file_name,
        fileUrl: f.file_url,
        mimeType: f.mime_type,
        analysis: f.analysis,
        createdAt: f.created_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
