import Project from '../../models/Project.js';
import { PROMPTS } from '../../config/prompts.js';
import * as aiProviderManager from '../../services/aiProviderManager.js';
import { incrementUsage } from '../../services/usageService.js';
import { getAIOptions } from './chatController.js';

export const generateProject = async (req, res) => {
  try {
    const { idea, type, complexity } = req.body;
    if (!idea) return res.status(400).json({ message: 'Project idea is required' });
    const prompt = `Project type: ${type || 'MERN FYP'}\nComplexity: ${complexity || 'ADVANCED'}\nIdea: ${idea}`;
    const aiOptions = await getAIOptions(req.user._id);
    
    const result = await aiProviderManager.chat({
      userId: req.user._id,
      messages: [{ role: 'user', content: prompt }],
      systemPrompt: PROMPTS.PROJECT_GENERATOR,
      provider: aiOptions.provider,
      model: aiOptions.model,
      temperature: aiOptions.temperature,
      max_tokens: aiOptions.max_tokens,
      stream: false,
      apiKeys: aiOptions.apiKeys,
    });
    const project = await Project.create({
      userId: req.user._id,
      name: idea.slice(0, 80),
      framework: type || 'MERN',
      description: idea,
      content: result.text,
    });
    await incrementUsage(req.user._id, 'projects');
    res.json({ project, content: result.text });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
