import Note from '../../models/Note.js';
import UserAnalytics from '../../models/UserAnalytics.js';
import { PROMPTS } from '../../config/prompts.js';
import * as aiProviderManager from '../../services/aiProviderManager.js';
import { incrementUsage } from '../../services/usageService.js';
import { getAIOptions } from './chatController.js';

export const generateCode = async (req, res) => {
  try {
    const { prompt, language, context } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

    const userMessage = `Language: ${language || 'JavaScript'}\nContext: ${context || 'N/A'}\nInstructions: ${prompt}`;
    const aiOptions = await getAIOptions(req.user._id);

    if (req.body.stream) {
      let result;
      try {
        result = await aiProviderManager.chat({
          userId: req.user._id,
          messages: [{ role: 'user', content: userMessage }],
          systemPrompt: PROMPTS.CODE_GENERATOR,
          provider: aiOptions.provider,
          model: aiOptions.model,
          temperature: aiOptions.temperature,
          max_tokens: aiOptions.max_tokens,
          stream: true,
          apiKeys: aiOptions.apiKeys,
        });
      } catch (initErr) {
        return res.status(500).json({ message: initErr.message || 'Stream initiation failed' });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let fullReply = '';
      let clientDisconnected = false;

      req.on('close', () => {
        clientDisconnected = true;
      });

      for await (const chunk of result.responseStream) {
        if (clientDisconnected) break;
        const content = chunk.content;
        if (content) {
          fullReply += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      await incrementUsage(req.user._id, 'codeGen');

      if (req.body.saveNote && !clientDisconnected) {
        await Note.create({
          userId: req.user._id,
          title: prompt.slice(0, 60),
          content: fullReply,
          source: 'code',
        });
      }

      res.write(`data: ${JSON.stringify({ done: true, code: fullReply })}\n\n`);
      return res.end();
    }

    const result = await aiProviderManager.chat({
      userId: req.user._id,
      messages: [{ role: 'user', content: userMessage }],
      systemPrompt: PROMPTS.CODE_GENERATOR,
      provider: aiOptions.provider,
      model: aiOptions.model,
      temperature: aiOptions.temperature,
      max_tokens: aiOptions.max_tokens,
      stream: false,
      apiKeys: aiOptions.apiKeys,
    });

    await incrementUsage(req.user._id, 'codeGen');

    if (req.body.saveNote) {
      await Note.create({
        userId: req.user._id,
        title: prompt.slice(0, 60),
        content: result.text,
        source: 'code',
      });
    }

    res.json({ code: result.text });
  } catch (error) {
    res.status(500).json({ message: error.message, code: error.code });
  }
};

export const debugCode = async (req, res) => {
  try {
    const { error, code } = req.body;
    const content = `Error/Stack trace:\n${error || 'N/A'}\n\nCode:\n${code || 'N/A'}`;
    const aiOptions = await getAIOptions(req.user._id);
    
    const result = await aiProviderManager.chat({
      userId: req.user._id,
      messages: [{ role: 'user', content }],
      systemPrompt: PROMPTS.DEBUG_ASSISTANT,
      provider: aiOptions.provider,
      model: aiOptions.model,
      temperature: aiOptions.temperature,
      max_tokens: aiOptions.max_tokens,
      stream: false,
      apiKeys: aiOptions.apiKeys,
    });
    
    await incrementUsage(req.user._id, 'chats');

    try {
      let analytics = await UserAnalytics.findOne({ userId: req.user._id });
      if (!analytics) {
        analytics = new UserAnalytics({ userId: req.user._id });
      }
      analytics.debuggingSessions += 1;
      analytics.activityLog.push({
        date: new Date(),
        actionType: 'debug',
        details: 'Resolved compiler/runtime crash error',
      });
      if (analytics.activityLog.length > 20) {
        analytics.activityLog.shift();
      }
      await analytics.save();
    } catch (e) {
      console.error('Failed to sync debug session analytics:', e);
    }

    res.json({ analysis: result.text });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const explainCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Code is required' });
    const aiOptions = await getAIOptions(req.user._id);
    
    const result = await aiProviderManager.chat({
      userId: req.user._id,
      messages: [{ role: 'user', content: code }],
      systemPrompt: PROMPTS.EXPLAIN_CODE,
      provider: aiOptions.provider,
      model: aiOptions.model,
      temperature: aiOptions.temperature,
      max_tokens: aiOptions.max_tokens,
      stream: false,
      apiKeys: aiOptions.apiKeys,
    });
    await incrementUsage(req.user._id, 'chats');
    res.json({ explanation: result.text });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
