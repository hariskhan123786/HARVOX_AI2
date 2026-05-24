import Project from '../models/Project.js';
import Chat from '../models/Chat.js';
import CommandHistory from '../models/CommandHistory.js';

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description, framework } = req.body;
    const project = await Project.create({
      userId: req.user._id,
      name,
      description,
      framework,
    });
    res.status(201).json({ project });
  } catch (err) {
    res.status(500).json({ message: 'Error creating project' });
  }
};

export const getProjectDetails = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Fetch associated memory
    const chats = await Chat.find({ projectId: project._id }).select('title createdAt');
    const commands = await CommandHistory.find({ projectId: project._id }).sort({ createdAt: -1 }).limit(20);
    
    res.json({ project, chats, commands });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching project details' });
  }
};

export const updateProjectLayout = async (req, res) => {
  try {
    const { layout } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { 'settings.layout': layout },
      { new: true }
    );
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: 'Error updating layout' });
  }
};
