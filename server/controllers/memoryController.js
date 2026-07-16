import { supabase } from '../config/supabase.js';
import { ensureDefaultMemories } from '../services/memoryService.js';
import { getAIOptions } from './aiController.js';
import * as groqService from '../services/groqService.js';
import * as geminiService from '../services/geminiService.js';
import { analyzeActivityAndLearn } from '../services/learningEngine.js';

const mapMemory = (m) => ({
  _id: m.id,
  id: m.id,
  userId: m.user_id,
  category: m.category,
  key: m.key,
  value: m.value,
  isPinned: m.is_pinned,
  metadata: m.metadata || {},
  createdAt: m.created_at,
  updatedAt: m.updated_at,
});

export const getMemories = async (req, res) => {
  try {
    const userId = req.user._id;
    await ensureDefaultMemories(userId);

    const { q, category } = req.query;

    let query = supabase
      .from('brain_memory')
      .select('*')
      .eq('user_id', userId)
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false });

    if (category) query = query.eq('category', category);
    if (q) query = query.or(`key.ilike.%${q}%,value::text.ilike.%${q}%`);

    const { data: memories, error } = await query;
    if (error) throw error;
    res.json({ memories: (memories || []).map(mapMemory) });
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

    const { data: memory, error } = await supabase
      .from('brain_memory')
      .insert({
        user_id: req.user._id,
        category,
        key,
        value,
        is_pinned: !!isPinned,
        metadata: metadata || {},
      })
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Memory created successfully', memory: mapMemory(memory) });
  } catch (err) {
    res.status(500).json({ message: 'Error creating memory', error: err.message });
  }
};

export const updateMemory = async (req, res) => {
  try {
    const { key, value, isPinned, metadata } = req.body;
    const updates = {};
    if (key !== undefined) updates.key = key;
    if (value !== undefined) updates.value = value;
    if (isPinned !== undefined) updates.is_pinned = isPinned;
    if (metadata !== undefined) updates.metadata = metadata;

    const { data: memory, error } = await supabase
      .from('brain_memory')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.user._id)
      .select('*')
      .single();

    if (error) return res.status(404).json({ message: 'Memory not found' });
    res.json({ message: 'Memory updated successfully', memory: mapMemory(memory) });
  } catch (err) {
    res.status(500).json({ message: 'Error updating memory', error: err.message });
  }
};

export const togglePinMemory = async (req, res) => {
  try {
    const { data: current, error: fetchErr } = await supabase
      .from('brain_memory')
      .select('is_pinned')
      .eq('id', req.params.id)
      .eq('user_id', req.user._id)
      .single();

    if (fetchErr || !current) return res.status(404).json({ message: 'Memory not found' });

    const { data: memory, error } = await supabase
      .from('brain_memory')
      .update({ is_pinned: !current.is_pinned })
      .eq('id', req.params.id)
      .eq('user_id', req.user._id)
      .select('*')
      .single();

    if (error) throw error;
    const mapped = mapMemory(memory);
    res.json({ message: `Memory ${mapped.isPinned ? 'pinned' : 'unpinned'} successfully`, memory: mapped });
  } catch (err) {
    res.status(500).json({ message: 'Error toggling pin status', error: err.message });
  }
};

export const deleteMemory = async (req, res) => {
  try {
    const { error } = await supabase
      .from('brain_memory')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user._id);

    if (error) return res.status(404).json({ message: 'Memory not found' });
    res.json({ message: 'Memory deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting memory', error: err.message });
  }
};

export const exportMemories = async (req, res) => {
  try {
    const { data: memories, error } = await supabase
      .from('brain_memory')
      .select('*')
      .eq('user_id', req.user._id)
      .order('category', { ascending: true })
      .order('key', { ascending: true });

    if (error) throw error;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=harvox_brain_memories.json');
    res.send(JSON.stringify((memories || []).map(mapMemory), null, 2));
  } catch (err) {
    res.status(500).json({ message: 'Error exporting memories', error: err.message });
  }
};

export const summarizeIdentity = async (req, res) => {
  try {
    const userId = req.user._id;

    const { data: memories, error } = await supabase
      .from('brain_memory')
      .select('*')
      .eq('user_id', userId)
      .in('category', ['identity', 'preferences', 'project']);

    if (error) throw error;
    if (!memories || memories.length === 0) {
      return res.json({ summary: 'No identity or preferences data found in Brain Core to summarize.' });
    }

    const dataText = memories.map((m) => `Category: ${m.category}, Key: ${m.key}, Value: ${m.value}`).join('\n');
    const aiOptions = await getAIOptions(userId);
    const aiService = aiOptions.provider === 'gemini' ? geminiService : groqService;

    const systemPrompt = "You are the HARVOX OS Identity Analyzer. Review the user's identity details and preferences and synthesize a concise, highly professional narrative summary of the operator. Keep it under 150 words and use a sleek, futuristic, command-line intelligence voice. Do not output markdown lists, just a single cohesive paragraph.";

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

    const { data: memories, error } = await supabase
      .from('brain_memory')
      .select('*')
      .eq('user_id', userId)
      .neq('category', 'activity');

    if (error) throw error;
    if (!memories || memories.length === 0) return res.json({ conflicts: [] });

    const dataText = memories.map((m) => `ID: ${m.id}, Category: ${m.category}, Key: ${m.key}, Value: ${m.value}`).join('\n');
    const aiOptions = await getAIOptions(userId);
    const aiService = aiOptions.provider === 'gemini' ? geminiService : groqService;

    const systemPrompt = `You are the HARVOX Brain Core Synapse Conflict Detector. Analyze the provided memory list for any contradictions, redundancies, or conflicting preferences/roles. Return a JSON array of conflict objects with fields: severity, message, conflictingIds, keyName. Return ONLY valid JSON, no other text. If no conflicts, return [].`;

    const reply = await aiService.chat({
      messages: [{ role: 'user', content: `Analyze this memory list:\n\n${dataText}` }],
      systemPrompt,
      model: aiOptions.model,
      temperature: 0.2,
      max_tokens: 1024,
      apiKey: aiOptions.apiKey,
    });

    let cleanReply = reply.trim().replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
    let conflicts = [];
    try {
      conflicts = JSON.parse(cleanReply);
      if (!Array.isArray(conflicts)) conflicts = [];
    } catch {
      conflicts = [];
    }

    // Local fallback
    const keyMap = {};
    memories.forEach((m) => {
      if (m.category === 'activity') return;
      const combKey = `${m.category}:${m.key.toLowerCase()}`;
      if (!keyMap[combKey]) keyMap[combKey] = [];
      keyMap[combKey].push(m);
    });

    Object.entries(keyMap).forEach(([, list]) => {
      if (list.length > 1) {
        const values = list.map((x) => String(x.value));
        const uniqueValues = [...new Set(values)];
        if (uniqueValues.length > 1) {
          const exists = conflicts.some((c) => c.keyName?.toLowerCase() === list[0].key.toLowerCase());
          if (!exists) {
            conflicts.push({
              severity: 'warning',
              message: `Multiple conflicting values for key '${list[0].key}' in category '${list[0].category}': ${uniqueValues.join(' vs ')}`,
              conflictingIds: list.map((x) => x.id),
              keyName: list[0].key,
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

    const systemPrompt = `You are the HARVOX OS Memory Tagging Assistant. Analyze the provided key and value of a memory node and return a JSON object with fields: category, description, details, tags. Return ONLY a valid JSON object.`;

    const reply = await aiService.chat({
      messages: [{ role: 'user', content: `Key: ${key}\nValue: ${value}` }],
      systemPrompt,
      model: aiOptions.model,
      temperature: 0.3,
      max_tokens: 512,
      apiKey: aiOptions.apiKey,
    });

    let cleanReply = reply.trim().replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
    let suggestions = {};
    try {
      suggestions = JSON.parse(cleanReply);
    } catch {
      suggestions = { category: 'preferences', description: `Operator reference for ${key}`, details: `Recorded key: ${key} with value: ${value}`, tags: 'sync, memory' };
    }

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: 'Error auto-tagging memory', error: err.message });
  }
};

export const triggerLearning = async (req, res) => {
  try {
    const userId = req.user._id;
    const insights = await analyzeActivityAndLearn(userId);
    res.json({
      success: true,
      message: insights.length > 0
        ? `Compiled ${insights.length} new preference profile(s).`
        : 'Telemetry checked. No new operator pattern updates detected.',
      insights,
    });
  } catch (err) {
    res.status(500).json({ message: 'Machine learning pipeline run failed', error: err.message });
  }
};
