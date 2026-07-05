import Memory from '../models/Memory.js';
import { ensureDefaultMemories } from '../services/memoryService.js';
import { getAIOptions } from './aiController.js';
import * as groqService from '../services/groqService.js';
import * as geminiService from '../services/geminiService.js';
import { analyzeActivityAndLearn } from '../services/learningEngine.js';

export const getMemories = async (req, res) => {
  try {
    const userId = req.user._id;
    await ensureDefaultMemories(userId);

    const { q, category } = req.query;
    const filter = { userId };

    if (category) {
      filter.category = category;
    }

    if (q) {
      const searchRegex = new RegExp(q, 'i');
      filter.$or = [
        { key: searchRegex },
        { value: searchRegex.test(req.query.q) ? searchRegex : { $regex: searchRegex } },
        { 'metadata.description': searchRegex },
        { 'metadata.architecture': searchRegex },
        { 'metadata.details': searchRegex }
      ];
    }

    const memories = await Memory.find(filter).sort({ isPinned: -1, updatedAt: -1 });
    res.json({ memories });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving memories', error: err.message });
  }
};

export const createMemory = async (req, res) => {
  try {
    const { category, key, value, isPinned, metadata } = req.body;
    if (!category || !key || !value) {
      return res.status(400).json({ message: 'Category, key, and value are required.' });
    }

    const memory = await Memory.create({
      userId: req.user._id,
      category,
      key,
      value,
      isPinned: !!isPinned,
      metadata: metadata || {}
    });

    res.status(201).json({ message: 'Memory created successfully', memory });
  } catch (err) {
    res.status(500).json({ message: 'Error creating memory', error: err.message });
  }
};

export const updateMemory = async (req, res) => {
  try {
    const { key, value, isPinned, metadata } = req.body;
    const memory = await Memory.findOne({ _id: req.params.id, userId: req.user._id });

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    if (key !== undefined) memory.key = key;
    if (value !== undefined) memory.value = value;
    if (isPinned !== undefined) memory.isPinned = isPinned;
    if (metadata !== undefined) memory.metadata = metadata;

    await memory.save();
    res.json({ message: 'Memory updated successfully', memory });
  } catch (err) {
    res.status(500).json({ message: 'Error updating memory', error: err.message });
  }
};

export const togglePinMemory = async (req, res) => {
  try {
    const memory = await Memory.findOne({ _id: req.params.id, userId: req.user._id });

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    memory.isPinned = !memory.isPinned;
    await memory.save();

    res.json({ message: `Memory ${memory.isPinned ? 'pinned' : 'unpinned'} successfully`, memory });
  } catch (err) {
    res.status(500).json({ message: 'Error toggling pin status', error: err.message });
  }
};

export const deleteMemory = async (req, res) => {
  try {
    const result = await Memory.deleteOne({ _id: req.params.id, userId: req.user._id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    res.json({ message: 'Memory deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting memory', error: err.message });
  }
};

export const exportMemories = async (req, res) => {
  try {
    const memories = await Memory.find({ userId: req.user._id }).sort({ category: 1, key: 1 });
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=harvox_brain_memories.json');
    res.send(JSON.stringify(memories, null, 2));
  } catch (err) {
    res.status(500).json({ message: 'Error exporting memories', error: err.message });
  }
};

export const summarizeIdentity = async (req, res) => {
  try {
    const userId = req.user._id;
    const memories = await Memory.find({ userId, category: { $in: ['identity', 'preferences', 'project'] } });

    if (memories.length === 0) {
      return res.json({ summary: "No identity or preferences data found in Brain Core to summarize." });
    }

    const dataText = memories.map(m => `Category: ${m.category}, Key: ${m.key}, Value: ${m.value}`).join('\n');

    const aiOptions = await getAIOptions(userId);
    const aiService = aiOptions.provider === 'gemini' ? geminiService : groqService;

    const systemPrompt = "You are the HARVOX OS Identity Analyzer. Review the user's identity details and preferences and synthesize a concise, highly professional narrative summary of the operator. Keep it under 150 words and use a sleek, futuristic, command-line intelligence voice (e.g. referencing uplinks, developer matrix, operator profiles). Do not output markdown lists, just a single cohesive paragraph.";

    const reply = await aiService.chat({
      messages: [{ role: 'user', content: `Here is the operator matrix data:\n\n${dataText}\n\nGenerate the operator profile summary.` }],
      systemPrompt,
      model: aiOptions.model,
      temperature: 0.7,
      max_tokens: 512,
      apiKey: aiOptions.apiKey,
    });

    res.json({ summary: reply });
  } catch (err) {
    res.status(500).json({ message: 'Error summarizing identity', error: err.message });
  }
};

export const detectConflicts = async (req, res) => {
  try {
    const userId = req.user._id;
    const memories = await Memory.find({ userId, category: { $ne: 'activity' } });

    if (memories.length === 0) {
      return res.json({ conflicts: [] });
    }

    const dataText = memories.map(m => `ID: ${m._id}, Category: ${m.category}, Key: ${m.key}, Value: ${m.value}`).join('\n');

    const aiOptions = await getAIOptions(userId);
    const aiService = aiOptions.provider === 'gemini' ? geminiService : groqService;

    const systemPrompt = `You are the HARVOX Brain Core Synapse Conflict Detector.
Analyze the provided memory list for any contradictions, redundancies, or conflicting preferences/roles. 
For example, if there are two 'role' keys with conflicting values, or contradictory programming language preferences, or duplicate records.
Return a JSON array of conflict objects. Each conflict object must have:
- severity: 'warning' | 'info' | 'critical'
- message: A short explanation of the conflict and why it is flagged.
- conflictingIds: An array of MongoDB IDs (from the provided list) that are involved in this conflict.
- keyName: The key name related to the conflict.

Ensure you return ONLY a valid JSON array, with no other text, conversational filler, or code block syntax. If there are no conflicts, return [].`;

    const reply = await aiService.chat({
      messages: [{ role: 'user', content: `Analyze this memory list:\n\n${dataText}` }],
      systemPrompt,
      model: aiOptions.model,
      temperature: 0.2,
      max_tokens: 1024,
      apiKey: aiOptions.apiKey,
    });

    // Clean JSON response
    let cleanReply = reply.trim();
    if (cleanReply.startsWith('```json')) {
      cleanReply = cleanReply.substring(7);
    }
    if (cleanReply.startsWith('```')) {
      cleanReply = cleanReply.substring(3);
    }
    if (cleanReply.endsWith('```')) {
      cleanReply = cleanReply.substring(0, cleanReply.length - 3);
    }
    cleanReply = cleanReply.trim();

    let conflicts = [];
    try {
      conflicts = JSON.parse(cleanReply);
      if (!Array.isArray(conflicts)) {
        conflicts = [];
      }
    } catch (parseErr) {
      console.error('LLM conflict detector returned invalid JSON:', reply);
      conflicts = [];
    }

    // Local fallback/addition checking (always double-check key conflicts as fallback)
    const keyMap = {};
    memories.forEach(m => {
      if (m.category === 'activity') return;
      const combKey = `${m.category}:${m.key.toLowerCase()}`;
      if (!keyMap[combKey]) {
        keyMap[combKey] = [];
      }
      keyMap[combKey].push(m);
    });

    Object.entries(keyMap).forEach(([k, list]) => {
      if (list.length > 1) {
        const values = list.map(x => String(x.value));
        const uniqueValues = [...new Set(values)];
        if (uniqueValues.length > 1) {
          // Check if this conflict is already present in conflicts array
          const exists = conflicts.some(c => c.keyName?.toLowerCase() === list[0].key.toLowerCase() && c.conflictingIds?.some(id => String(id) === String(list[0]._id)));
          if (!exists) {
            conflicts.push({
              severity: 'warning',
              message: `Multiple conflicting values for key '${list[0].key}' in category '${list[0].category}': ${uniqueValues.join(' vs ')}`,
              conflictingIds: list.map(x => x._id),
              keyName: list[0].key
            });
          }
        }
      }
    });

    res.json({ conflicts });
  } catch (err) {
    res.status(500).json({ message: 'Error detecting conflicts', error: err.message });
  }
};

export const autoTagMemory = async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || !value) {
      return res.status(400).json({ message: 'Key and Value are required for auto-tagging.' });
    }

    const aiOptions = await getAIOptions(req.user._id);
    const aiService = aiOptions.provider === 'gemini' ? geminiService : groqService;

    const systemPrompt = `You are the HARVOX OS Memory Tagging Assistant.
Analyze the provided key and value of a memory node and return a JSON object with suggested fields:
- category: One of ['identity', 'preferences', 'project', 'conversation']
- description: A short 1-sentence description of the memory's purpose.
- details: Brief notes or details about the entry.
- tags: A comma-separated string of 2-3 relevant tags.

Ensure you return ONLY a valid JSON object, with no other text, conversational filler, or code block syntax.`;

    const reply = await aiService.chat({
      messages: [{ role: 'user', content: `Key: ${key}\nValue: ${value}` }],
      systemPrompt,
      model: aiOptions.model,
      temperature: 0.3,
      max_tokens: 512,
      apiKey: aiOptions.apiKey,
    });

    let cleanReply = reply.trim();
    if (cleanReply.startsWith('```json')) {
      cleanReply = cleanReply.substring(7);
    }
    if (cleanReply.startsWith('```')) {
      cleanReply = cleanReply.substring(3);
    }
    if (cleanReply.endsWith('```')) {
      cleanReply = cleanReply.substring(0, cleanReply.length - 3);
    }
    cleanReply = cleanReply.trim();

    let suggestions = {};
    try {
      suggestions = JSON.parse(cleanReply);
    } catch (parseErr) {
      console.error('LLM auto-tagger returned invalid JSON:', reply);
      suggestions = {
        category: 'preferences',
        description: `Operator reference for ${key}`,
        details: `Recorded key: ${key} with value: ${value}`,
        tags: 'sync, memory'
      };
    }

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: 'Error auto-tagging memory', error: err.message });
  }
};

/**
 * POST /memory/learn
 * Run the Machine Learning pipeline on user activity logs to discover and record preferences.
 */
export const triggerLearning = async (req, res) => {
  try {
    const userId = req.user._id;
    const insights = await analyzeActivityAndLearn(userId);
    res.json({
      success: true,
      message: insights.length > 0
        ? `Compiled ${insights.length} new preference profile(s).`
        : 'Telemetry checked. No new operator pattern updates detected.',
      insights
    });
  } catch (err) {
    res.status(500).json({ message: 'Machine learning pipeline run failed', error: err.message });
  }
};
