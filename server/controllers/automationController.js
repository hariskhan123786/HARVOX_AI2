import { executeAutomationStep } from '../services/automationService.js';
import Task from '../models/Task.js';
import LearningTrack from '../models/LearningTrack.js';
import Project from '../models/Project.js';
import Memory from '../models/Memory.js';
import { logActivity } from '../services/memoryService.js';

export const executeStep = async (req, res) => {
  try {
    const { step } = req.body;

    if (!step || !step.action) {
      return res.status(400).json({ message: 'Invalid automation step: missing required field "action".' });
    }

    // ── Schema normalisation ────────────────────────────────────────────────
    if (!Array.isArray(step.args)) {
      if (step.target !== undefined) {
        step.args = [String(step.target)];
      } else {
        step.args = [];
      }
    }

    const result = await executeAutomationStep(req.user._id, step);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to execute automation step',
      error: err.message,
    });
  }
};

/**
 * Fetch all dashboard stats (tasks, projects, BSCS study tracks, recent log activity)
 */
export const getDashboardInfo = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch all tasks for checklist
    const tasks = await Task.find({ userId }).sort({ deadline: 1, createdAt: -1 });

    // 2. Fetch learning tracking progress
    const studyTrack = await LearningTrack.find({ userId });

    // 3. Fetch active projects
    const projects = await Project.find({ userId }).select('name framework updatedAt');

    // 4. Fetch telemetry / activity logs
    const activities = await Memory.find({ userId, category: 'activity' })
      .sort({ createdAt: -1 })
      .limit(15);

    res.json({
      tasks,
      studyTrack,
      projects,
      activities
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to retrieve dashboard data',
      error: err.message,
    });
  }
};

/**
 * Task CRUD
 */
export const createTask = async (req, res) => {
  try {
    const { title, description, deadline, priority } = req.body;
    const task = await Task.create({
      userId: req.user._id,
      title,
      description,
      deadline,
      priority
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task', error: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, priority, status } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { title, description, deadline, priority, status },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task', error: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully', task });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
};

/**
 * Study Tracking
 */
export const logStudyProgress = async (req, res) => {
  try {
    const { subject, hours, notes } = req.body;
    if (!['AI', 'Database', 'Software Engineering', 'Assembly Language'].includes(subject)) {
      return res.status(400).json({ message: 'Invalid BSCS subject. Must be AI, Database, Software Engineering, or Assembly Language.' });
    }

    let track = await LearningTrack.findOne({ userId: req.user._id, subject });
    if (track) {
      track.hours += Number(hours);
      if (notes) track.notes = notes;
      track.lastStudied = new Date();
      await track.save();
    } else {
      track = await LearningTrack.create({
        userId: req.user._id,
        subject,
        hours: Number(hours),
        notes,
        lastStudied: new Date()
      });
    }

    await logActivity(req.user._id, 'log_learning', `Studied ${subject} for ${hours} hours`, { subject, hours });

    res.json(track);
  } catch (err) {
    res.status(500).json({ message: 'Failed to log study progress', error: err.message });
  }
};

export const getStudyProgress = async (req, res) => {
  try {
    const progress = await LearningTrack.find({ userId: req.user._id });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve study progress', error: err.message });
  }
};
