import { supabase } from '../config/supabase.js';

const mapProject = (p) => {
  if (!p) return null;
  return {
    _id: p.id,
    id: p.id,
    userId: p.user_id,
    name: p.name,
    description: p.description,
    framework: p.framework,
    content: p.content,
    path: p.path,
    fileTree: p.file_tree,
    settings: p.settings,
    memory: p.memory,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
};

export const getProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json({ projects: (projects || []).map(mapProject) });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
};

export const createProject = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, description, framework } = req.body;
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        name,
        description,
        framework,
      })
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json({ project: mapProject(project) });
  } catch (err) {
    res.status(500).json({ message: 'Error creating project' });
  }
};

export const getProjectDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const projectId = req.params.id;

    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Fetch associated chats (chat_sessions)
    const { data: chats, error: chatsError } = await supabase
      .from('chat_sessions')
      .select('id, title, created_at')
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (chatsError) throw chatsError;

    // Fetch associated command histories (developer_history)
    const { data: commands, error: commandsError } = await supabase
      .from('developer_history')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (commandsError) throw commandsError;

    res.json({
      project: mapProject(project),
      chats: (chats || []).map(c => ({ _id: c.id, title: c.title, createdAt: c.created_at })),
      commands: (commands || []).map(cmd => ({
        _id: cmd.id,
        command: cmd.command,
        output: cmd.output,
        exitCode: cmd.exit_code,
        success: cmd.success,
        aiExplanation: cmd.ai_explanation,
        createdAt: cmd.created_at,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching project details' });
  }
};

export const updateProjectLayout = async (req, res) => {
  try {
    const userId = req.user._id;
    const projectId = req.params.id;
    const { layout } = req.body;

    // Fetch project settings
    const { data: projectData, error: fetchError } = await supabase
      .from('projects')
      .select('settings')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    const updatedSettings = { ...projectData.settings, layout };

    const { data: project, error } = await supabase
      .from('projects')
      .update({ settings: updatedSettings })
      .eq('id', projectId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    res.json({ project: mapProject(project) });
  } catch (err) {
    res.status(500).json({ message: 'Error updating layout' });
  }
};
