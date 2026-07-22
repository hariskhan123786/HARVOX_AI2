import { PROMPTS, PERSONALITIES } from '../../config/prompts.js';
import * as aiProviderManager from '../../services/aiProviderManager.js';
import { incrementUsage } from '../../services/usageService.js';
import { getContextPrompt, logActivity } from '../../services/memoryService.js';
import { summarizeConversationAndExtractMemories } from '../../services/postChatSummarizer.js';
import { detectIntent, looksLikeAutomation } from '../../services/intentEngine.js';
import { generatePlan } from '../../services/plannerService.js';
import { supabase } from '../../config/supabase.js';

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
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

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
        groq: settings.api_keys?.groq || '',
        gemini: settings.api_keys?.gemini || '',
        openrouter: settings.api_keys?.openrouter || '',
        openai: settings.api_keys?.openai || '',
        huggingface: settings.api_keys?.huggingface || '',
        ollamaUrl: settings.api_keys?.ollamaUrl || '',
        cerebras: settings.api_keys?.cerebras || '',
      };
    }
  } catch (err) {
    console.error('Error fetching settings in AI options:', err);
  }

  try {
    const { data: globalSettings } = await supabase
      .from('system_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (globalSettings) {
      if (!options.apiKeys.groq && globalSettings.groq_key) {
        options.apiKeys.groq = globalSettings.groq_key;
      }
      if (!options.apiKeys.gemini && globalSettings.gemini_key) {
        options.apiKeys.gemini = globalSettings.gemini_key;
      }
      if (!options.apiKeys.cerebras && globalSettings.cerebras_key) {
        options.apiKeys.cerebras = globalSettings.cerebras_key;
      }
    }
  } catch (err) {
    console.error('Error fetching global system settings in AI options:', err);
  }

  return options;
};

export const chatAI = async (req, res) => {
  try {
    const { message, chatId, stream, provider, model, personalityMode } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    let session = null;
    if (chatId) {
      const { data } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', chatId)
        .eq('user_id', req.user._id)
        .maybeSingle();
      session = data;
    }

    if (!session) {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: req.user._id,
          title: message.slice(0, 50),
        })
        .select('*')
        .single();
      
      if (error) throw error;
      session = data;
    }

    // Fetch message history
    const { data: dbMessages, error: msgsErr } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });

    if (msgsErr) throw msgsErr;

    const history = (dbMessages || [])
      .filter((m) => m.content && m.content.trim())
      .map((m) => ({ role: m.role, content: m.content }));
    history.push({ role: 'user', content: message });

    const aiOptions = await getAIOptions(req.user._id, provider, model);
    if (personalityMode) {
      aiOptions.personalityMode = personalityMode;
    }
    const memoryContext = await getContextPrompt(req.user._id);

    // Build chat response helper to send Mongoose-style chat object to frontend
    const buildChatResponse = async () => {
      const { data: allMsgs } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });

      return {
        _id: session.id,
        id: session.id,
        userId: session.user_id,
        title: session.title,
        messages: (allMsgs || []).map(m => ({
          _id: m.id,
          role: m.role,
          content: m.content,
          bookmarked: m.bookmarked,
          createdAt: m.created_at,
        })),
        createdAt: session.created_at,
        updatedAt: session.updated_at,
      };
    };

    // ── Phase 13.2 Check: Automatic Intent Detection & Plan Generation ─────────
    if (looksLikeAutomation(message)) {
      try {
        const intent = await detectIntent(message, { userId: req.user._id, conversationHistory: history.slice(0, -1), memoryContext }, aiOptions);
        const plan = generatePlan(intent, { userId: req.user._id });

        if (plan) {
          const planString = `Here is the execution plan I generated to automate your request:\n\n---TASK_PLAN_START---\n${JSON.stringify(plan, null, 2)}\n---TASK_PLAN_END---\n\nPlease review the sequence and click **ALLOW PLAN** to begin executing these commands on your computer.`;

          await supabase.from('chat_messages').insert([
            { session_id: session.id, role: 'user', content: message },
            { session_id: session.id, role: 'assistant', content: planString }
          ]);

          const chatObj = await buildChatResponse();
          await incrementUsage(req.user._id, 'chats');
          await logActivity(req.user._id, 'intent_detected', `Auto-generated task plan: ${intent.summary}`, { planId: plan.planId });

          if (stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.write(`data: ${JSON.stringify({ content: planString })}\n\n`);
            res.write(`data: ${JSON.stringify({ done: true, chat: chatObj })}\n\n`);
            return res.end();
          } else {
            return res.json({
              chat: chatObj,
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

    await logActivity(req.user._id, 'ai_interaction', `Chat query: "${message.slice(0, 50)}"`, { chatId: session.id });

    if (stream) {
      let result;
      try {
        result = await aiProviderManager.chat({
          userId: req.user._id,
          chatId: session.id,
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
          const assistantReply = (fullReply || '').trim();
          await supabase.from('chat_messages').insert([
            { session_id: session.id, role: 'user', content: message },
            { session_id: session.id, role: 'assistant', content: assistantReply || 'Unable to generate response.' }
          ]);

          const isFreeOR = result.provider === 'openrouter' && (String(result.model).endsWith(':free') || result.model === 'openrouter/free');
          if (!isFreeOR) {
            await incrementUsage(req.user._id, 'chats');
          }

          const chatObj = await buildChatResponse();

          res.write(`data: ${JSON.stringify({ 
            done: true, 
            chat: chatObj,
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
      chatId: session.id,
      messages: history,
      systemPrompt,
      provider: aiOptions.provider,
      model: aiOptions.model,
      temperature: aiOptions.temperature,
      max_tokens: aiOptions.max_tokens,
      stream: false,
      apiKeys: aiOptions.apiKeys,
    });

    const replyText = (result.text || '').trim();
    await supabase.from('chat_messages').insert([
      { session_id: session.id, role: 'user', content: message },
      { session_id: session.id, role: 'assistant', content: replyText || 'Unable to generate response.' }
    ]);

    const isFreeOR = result.provider === 'openrouter' && (String(result.model).endsWith(':free') || result.model === 'openrouter/free');
    if (!isFreeOR) {
      await incrementUsage(req.user._id, 'chats');
    }

    const chatObj = await buildChatResponse();

    // Trigger non-blocking automatic conversation memory extraction
    summarizeConversationAndExtractMemories(req.user._id, session.id).catch((e) =>
      console.error('[AutoMemory] Background extraction error:', e.message)
    );

    res.json({
      chat: chatObj,
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

    // Fetch all logs for this user to aggregate metrics in JS
    const { data: callLogs, error: fetchErr } = await supabase
      .from('ai_call_logs')
      .select('cost, total_tokens, latency_ms, status, is_failover')
      .eq('user_id', userId);

    if (fetchErr) throw fetchErr;

    // Fetch the 10 most recent logs
    const { data: recentLogs, error: recentErr } = await supabase
      .from('ai_call_logs')
      .select('provider, model, latency_ms, cost, status, is_failover, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentErr) throw recentErr;

    const metrics = {
      totalCost: 0,
      totalTokens: 0,
      avgLatency: 0,
      totalCalls: 0,
      successCalls: 0,
      failoverCalls: 0,
    };

    if (callLogs && callLogs.length > 0) {
      let sumLatency = 0;
      callLogs.forEach(log => {
        metrics.totalCost += Number(log.cost || 0);
        metrics.totalTokens += Number(log.total_tokens || 0);
        metrics.totalCalls += 1;
        sumLatency += Number(log.latency_ms || 0);
        if (log.status === 'success') {
          metrics.successCalls += 1;
        }
        if (log.is_failover) {
          metrics.failoverCalls += 1;
        }
      });
      metrics.avgLatency = sumLatency / metrics.totalCalls;
    }

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
      recentLogs: (recentLogs || []).map(log => ({
        provider: log.provider,
        model: log.model,
        latencyMs: log.latency_ms,
        cost: log.cost,
        status: log.status,
        isFailover: log.is_failover,
        createdAt: log.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching AI metrics:', error);
    res.status(500).json({ message: 'Failed to fetch telemetry metrics' });
  }
};
