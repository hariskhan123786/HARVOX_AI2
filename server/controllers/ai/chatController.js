import Chat from '../../models/Chat.js';
import UserSettings from '../../models/UserSettings.js';
import SystemSettings from '../../models/SystemSettings.js';
import AICallLog from '../../models/AICallLog.js';
import { PROMPTS, PERSONALITIES } from '../../config/prompts.js';
import * as aiProviderManager from '../../services/aiProviderManager.js';
import { incrementUsage } from '../../services/usageService.js';
import { getContextPrompt, logActivity } from '../../services/memoryService.js';
import { detectIntent, looksLikeAutomation } from '../../services/intentEngine.js';
import { generatePlan } from '../../services/plannerService.js';

export const getAIOptions = async (userId, overrideProvider = null, overrideModel = null) => {
  const options = {
    provider: overrideProvider || 'cerebras',
    model: overrideModel || 'gpt-oss-120b',
    temperature: 0.7,
    max_tokens: 2048,
    personalityMode: 'professional',
    apiKeys: {},
  };

  try {
    const settings = await UserSettings.findOne({ userId }).select('+apiKeys.groq +apiKeys.gemini +apiKeys.openrouter +apiKeys.openai +apiKeys.huggingface +apiKeys.ollamaUrl +apiKeys.cerebras');
    if (settings) {
      if (!overrideProvider && settings.ai?.provider) options.provider = settings.ai.provider;
      if (!overrideModel && settings.ai?.model) {
        options.model = settings.ai.model;
      }
      if (options.model === 'llama3-70b-8192') {
        options.model = 'llama-3.3-70b-versatile';
      }
      if (overrideProvider && !overrideModel) {
        if (overrideProvider === 'gemini') options.model = 'gemini-2.0-flash';
        else if (overrideProvider === 'groq') options.model = 'llama-3.3-70b-versatile';
        else if (overrideProvider === 'openrouter') options.model = 'meta-llama/llama-3.2-3b-instruct:free';
        else if (overrideProvider === 'openai') options.model = 'gpt-4o';
        else if (overrideProvider === 'ollama') options.model = 'llama3';
        else if (overrideProvider === 'huggingface') options.model = 'meta-llama/Llama-3.2-3B-Instruct';
        else if (overrideProvider === 'cerebras') options.model = 'gpt-oss-120b';
      }
      if (settings.ai?.creativity !== undefined) options.temperature = settings.ai.creativity;
      if (settings.ai?.responseLength) {
        options.max_tokens = settings.ai.responseLength === 'short'
          ? 512
          : settings.ai.responseLength === 'long'
          ? 4096
          : 2048;
      }
      if (settings.ai?.personalityMode) {
        options.personalityMode = settings.ai.personalityMode;
      }
      options.apiKeys = {
        groq: settings.apiKeys?.groq || '',
        gemini: settings.apiKeys?.gemini || '',
        openrouter: settings.apiKeys?.openrouter || '',
        openai: settings.apiKeys?.openai || '',
        huggingface: settings.apiKeys?.huggingface || '',
        ollamaUrl: settings.apiKeys?.ollamaUrl || '',
        cerebras: settings.apiKeys?.cerebras || '',
      };
    }
  } catch (err) {
    console.error('Error fetching UserSettings in AI options:', err);
  }

  try {
    const globalSettings = await SystemSettings.findOne();
    if (!options.apiKeys.groq && globalSettings?.groqKey) {
      options.apiKeys.groq = globalSettings.groqKey;
    }
    if (!options.apiKeys.gemini && globalSettings?.geminiKey) {
      options.apiKeys.gemini = globalSettings.geminiKey;
    }
    if (!options.apiKeys.cerebras && globalSettings?.cerebrasKey) {
      options.apiKeys.cerebras = globalSettings.cerebrasKey;
    }
  } catch (err) {
    console.error('Error fetching SystemSettings in AI options:', err);
  }

  return options;
};

export const chatAI = async (req, res) => {
  try {
    const { message, chatId, stream, provider, model, personalityMode } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    let chat = chatId ? await Chat.findOne({ _id: chatId, userId: req.user._id }) : null;
    if (!chat) {
      chat = await Chat.create({
        userId: req.user._id,
        title: message.slice(0, 50),
        messages: [],
      });
    }

    const history = chat.messages
      .filter((m) => m.content && m.content.trim())
      .map((m) => ({ role: m.role, content: m.content }));
    history.push({ role: 'user', content: message });

    const aiOptions = await getAIOptions(req.user._id, provider, model);
    if (personalityMode) {
      aiOptions.personalityMode = personalityMode;
    }
    const memoryContext = await getContextPrompt(req.user._id);

    // ── Phase 13.2 Check: Automatic Intent Detection & Plan Generation ─────────
    if (looksLikeAutomation(message)) {
      try {
        const intent = await detectIntent(message, { userId: req.user._id, conversationHistory: history.slice(0, -1), memoryContext }, aiOptions);
        const plan = generatePlan(intent, { userId: req.user._id });

        if (plan) {
          const planString = `Here is the execution plan I generated to automate your request:\n\n---TASK_PLAN_START---\n${JSON.stringify(plan, null, 2)}\n---TASK_PLAN_END---\n\nPlease review the sequence and click **ALLOW PLAN** to begin executing these commands on your computer.`;

          chat.messages.push({ role: 'user', content: message });
          chat.messages.push({ role: 'assistant', content: planString });
          await chat.save();
          await incrementUsage(req.user._id, 'chats');
          await logActivity(req.user._id, 'intent_detected', `Auto-generated task plan: ${intent.summary}`, { planId: plan.planId });

          if (stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.write(`data: ${JSON.stringify({ content: planString })}\n\n`);
            res.write(`data: ${JSON.stringify({ done: true, chat })}\n\n`);
            return res.end();
          } else {
            return res.json({
              chat,
              reply: planString,
              provider: aiOptions.provider,
              model: aiOptions.model,
              isPlan: true,
            });
          }
        }
      } catch (intentErr) {
        console.warn('[ChatAI] Intent auto-planning fallback:', intentErr.message);
      }
    }

    const personalityText = PERSONALITIES[aiOptions.personalityMode] || PERSONALITIES.professional;
    const systemPrompt = `${PROMPTS.CHAT_ASSISTANT}\n\n==================================================\nPERSONALITY CONFIGURATION:\n${personalityText}\n==================================================\n${memoryContext}`;

    await logActivity(req.user._id, 'ai_interaction', `Chat query: "${message.slice(0, 50)}"`, { chatId: chat._id });

    if (stream) {
      let result;
      try {
        result = await aiProviderManager.chat({
          userId: req.user._id,
          chatId: chat._id,
          messages: history,
          systemPrompt,
          provider: aiOptions.provider,
          model: aiOptions.model,
          temperature: aiOptions.temperature,
          max_tokens: aiOptions.max_tokens,
          stream: true,
          apiKeys: aiOptions.apiKeys,
        });
      } catch (initErr) {
        return res.status(500).json({
          message: initErr.message || 'Failed to initialize AI stream',
          code: initErr.code || 'STREAM_INIT_ERROR',
        });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let fullReply = '';
      let clientDisconnected = false;

      req.on('close', () => {
        clientDisconnected = true;
      });

      try {
        for await (const chunk of result.responseStream) {
          if (clientDisconnected) break;

          if (chunk.isFailoverNotice) {
            res.write(`data: ${JSON.stringify({
              isFailoverNotice: true,
              failoverFromProvider: chunk.failoverFromProvider,
              failoverFromModel: chunk.failoverFromModel,
              currentProvider: chunk.currentProvider,
              currentModel: chunk.currentModel
            })}\n\n`);
            continue;
          }

          const content = chunk.content;
          if (content) {
            fullReply += content;
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        }
      } catch (streamErr) {
        console.error('Stream iteration error:', streamErr);
        if (!clientDisconnected) {
          const errMsg = streamErr.message || 'Stream interrupted';
          if (!fullReply) {
            fullReply = 'Unable to generate response. Please try again.';
          }
          res.write(`data: ${JSON.stringify({ error: errMsg })}\n\n`);
        }
      }

      if (!clientDisconnected) {
        try {
          chat.messages.push({ role: 'user', content: message });
          const assistantReply = (fullReply || '').trim();
          chat.messages.push({ role: 'assistant', content: assistantReply || 'Unable to generate response.' });
           const isFreeOR = result.provider === 'openrouter' && (String(result.model).endsWith(':free') || result.model === 'openrouter/free');
           if (!isFreeOR) {
             await incrementUsage(req.user._id, 'chats');
           }

          res.write(`data: ${JSON.stringify({ 
            done: true, 
            chat,
            provider: result.provider,
            model: result.model,
            isFailover: result.isFailover
          })}\n\n`);
        } catch (saveErr) {
          console.error('Chat save error:', saveErr);
          res.write(`data: ${JSON.stringify({ error: 'Failed to save conversation', done: true })}\n\n`);
        }
        return res.end();
      }
    }

    const result = await aiProviderManager.chat({
      userId: req.user._id,
      chatId: chat._id,
      messages: history,
      systemPrompt,
      provider: aiOptions.provider,
      model: aiOptions.model,
      temperature: aiOptions.temperature,
      max_tokens: aiOptions.max_tokens,
      stream: false,
      apiKeys: aiOptions.apiKeys,
    });

    chat.messages.push({ role: 'user', content: message });
    const replyText = (result.text || '').trim();
    chat.messages.push({ role: 'assistant', content: replyText || 'Unable to generate response.' });
    await chat.save();
    const isFreeOR = result.provider === 'openrouter' && (String(result.model).endsWith(':free') || result.model === 'openrouter/free');
    if (!isFreeOR) {
      await incrementUsage(req.user._id, 'chats');
    }

    res.json({
      chat,
      reply: result.text,
      provider: result.provider,
      model: result.model,
      isFailover: result.isFailover,
    });
  } catch (error) {
    res.status(error.code === 'RATE_LIMIT' ? 429 : 500).json({
      message: error.message,
      code: error.code,
    });
  }
};

export const getAIMetrics = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await AICallLog.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$cost' },
          totalTokens: { $sum: '$totalTokens' },
          avgLatency: { $avg: '$latencyMs' },
          totalCalls: { $sum: 1 },
          successCalls: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] },
          },
          failoverCalls: {
            $sum: { $cond: [{ $eq: ['$isFailover', true] }, 1, 0] },
          },
        },
      },
    ]);

    const recentLogs = await AICallLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('provider model latencyMs cost status isFailover createdAt');

    const metrics = stats[0] || {
      totalCost: 0,
      totalTokens: 0,
      avgLatency: 0,
      totalCalls: 0,
      successCalls: 0,
      failoverCalls: 0,
    };

    const successRate = metrics.totalCalls > 0
      ? Number(((metrics.successCalls / metrics.totalCalls) * 100).toFixed(1))
      : 100;

    res.json({
      totalCost: Number(metrics.totalCost.toFixed(6)),
      totalTokens: metrics.totalTokens,
      avgLatency: Math.round(metrics.avgLatency),
      successRate,
      totalCalls: metrics.totalCalls,
      failoverCalls: metrics.failoverCalls,
      recentLogs,
    });
  } catch (error) {
    console.error('Error fetching AI metrics:', error);
    res.status(500).json({ message: 'Failed to fetch telemetry metrics' });
  }
};
