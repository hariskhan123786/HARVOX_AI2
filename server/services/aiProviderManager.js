import * as geminiProvider from './geminiService.js';
import * as groqProvider from './groqService.js';
import * as openrouterProvider from './providers/openrouterProvider.js';
import * as openaiProvider from './providers/openaiProvider.js';
import * as ollamaProvider from './providers/ollamaProvider.js';
import * as huggingfaceProvider from './providers/huggingfaceProvider.js';
import * as cerebrasProvider from './providers/cerebrasProvider.js';
import AICallLog from '../models/AICallLog.js';

// Provider registry mapping
const providers = {
  gemini: geminiProvider,
  groq: groqProvider,
  openrouter: openrouterProvider,
  openai: openaiProvider,
  ollama: ollamaProvider,
  huggingface: huggingfaceProvider,
  cerebras: cerebrasProvider,
};

const MODEL_PRICING = {
  // Free OpenRouter models
  'openrouter/free': [0.0, 0.0],
  'deepseek/deepseek-r1:free': [0.0, 0.0],
  'qwen/qwen-2.5-coder-32b-instruct:free': [0.0, 0.0],
  'qwen/qwen-2.5-72b-instruct:free': [0.0, 0.0],
  'meta-llama/llama-3.2-3b-instruct:free': [0.0, 0.0],
  'google/gemma-2-9b-it:free': [0.0, 0.0],
  'mistralai/mistral-7b-instruct:free': [0.0, 0.0],
  // Standard Models
  'gemini-2.0-flash': [0.075, 0.30],
  'gemini-1.5-pro': [1.25, 5.00],
  'gemini-1.5-flash': [0.075, 0.30],
  'gemini-1.5-flash-8b': [0.0375, 0.15],
  'llama-3.3-70b-versatile': [0.59, 0.79],
  'llama-3.1-70b-versatile': [0.59, 0.79],
  'mixtral-8x7b-32768': [0.24, 0.24],
  'gpt-4o': [5.00, 15.00],
  'gpt-3.5-turbo': [0.50, 1.50],
  // Local (free)
  'ollama': [0.0, 0.0],
  // Cerebras — ultra-fast silicon inference (per million tokens)
  'llama-4-scout-17b-16e-instruct': [0.30, 0.30],
  'llama-3.3-70b': [0.85, 1.20],
  'llama3.1-70b': [0.85, 1.20],
  'llama3.1-8b': [0.10, 0.10],
  'deepseek-r1-distill-llama-70b': [0.85, 1.20],
};

// Failover Chain configuration
const FAILOVER_CHAIN = {
  // OpenRouter Free -> Groq or Gemini
  'openrouter/free': { provider: 'gemini', model: 'gemini-2.0-flash' },
  'deepseek/deepseek-r1:free': { provider: 'gemini', model: 'gemini-2.0-flash' },
  'qwen/qwen-2.5-coder-32b-instruct:free': { provider: 'groq', model: 'llama-3.3-70b-versatile' },
  'qwen/qwen-2.5-72b-instruct:free': { provider: 'gemini', model: 'gemini-1.5-pro' },
  'meta-llama/llama-3.2-3b-instruct:free': { provider: 'groq', model: 'mixtral-8x7b-32768' },
  'google/gemma-2-9b-it:free': { provider: 'gemini', model: 'gemini-2.0-flash' },
  'mistralai/mistral-7b-instruct:free': { provider: 'groq', model: 'mixtral-8x7b-32768' },
  // Gemini -> Cerebras (then Groq)
  'gemini-2.0-flash': { provider: 'cerebras', model: 'llama-3.3-70b' },
  'gemini-1.5-pro': { provider: 'cerebras', model: 'llama-3.3-70b' },
  'gemini-1.5-flash': { provider: 'groq', model: 'mixtral-8x7b-32768' },
  // Groq -> Cerebras
  'llama-3.3-70b-versatile': { provider: 'cerebras', model: 'llama-3.3-70b' },
  'llama-3.1-70b-versatile': { provider: 'cerebras', model: 'llama3.1-70b' },
  'mixtral-8x7b-32768': { provider: 'gemini', model: 'gemini-1.5-flash-8b' },
  // OpenAI -> Gemini
  'gpt-4o': { provider: 'gemini', model: 'gemini-1.5-pro' },
  'gpt-3.5-turbo': { provider: 'gemini', model: 'gemini-2.0-flash' },
  // Cerebras -> Groq (failover)
  'llama-4-scout-17b-16e-instruct': { provider: 'groq', model: 'llama-3.3-70b-versatile' },
  'llama-3.3-70b': { provider: 'groq', model: 'llama-3.3-70b-versatile' },
  'llama3.1-70b': { provider: 'groq', model: 'llama-3.1-70b-versatile' },
  'llama3.1-8b': { provider: 'groq', model: 'llama-3.3-70b-versatile' },
  'deepseek-r1-distill-llama-70b': { provider: 'groq', model: 'llama-3.3-70b-versatile' },
};

const estimateTokens = (text) => {
  if (!text) return 0;
  // Standard approximation: 1 token ~ 4 chars
  return Math.ceil(text.length / 4);
};

const calculateCost = (model, promptTokens, completionTokens) => {
  const rates = MODEL_PRICING[model] || [0.0, 0.0];
  const inputCost = (promptTokens / 1000000) * rates[0];
  const outputCost = (completionTokens / 1000000) * rates[1];
  return Number((inputCost + outputCost).toFixed(6));
};

const saveLog = async (logData) => {
  // Skip telemetry for internal engine calls that have no userId (e.g. intentEngine)
  if (!logData.userId) return;
  try {
    await AICallLog.create(logData);
  } catch (err) {
    console.error('[AI Provider Manager] Telemetry save error:', err.message);
  }
};

/**
 * Parses user input to auto-route to the best suited model.
 */
export const routePrompt = (promptText, keys = {}) => {
  const text = (promptText || '').toLowerCase();

  const isCoding = /code|regex|react|javascript|python|html|css|function|bug|compile|async|developer|program|github|database|sql/i.test(text);
  const isMath = /calculate|equation|math|formula|integral|algebra|matrix|geometry|sum|fraction/i.test(text);
  const isCreative = /write a story|poem|creative|roleplay|essay|lyrics|fiction|novel|joke/i.test(text);
  const isResearch = /reason|why|analyze|compare|research|philosophical|explain the concept/i.test(text);

  const hasOpenRouter = Boolean(keys.openrouter || process.env.OPENROUTER_API_KEY);
  const hasGemini = Boolean(keys.gemini || process.env.GEMINI_API_KEY);
  const hasGroq = Boolean(keys.groq || process.env.GROQ_API_KEY);
  const hasOpenAI = Boolean(keys.openai || process.env.OPENAI_API_KEY);
  const hasCerebras = Boolean(keys.cerebras || process.env.CEREBRAS_API_KEY);

  if (isCoding) {
    // Cerebras is exceptionally fast for coding tasks
    if (hasCerebras) return { provider: 'cerebras', model: 'llama-4-scout-17b-16e-instruct' };
    if (hasOpenRouter) return { provider: 'openrouter', model: 'qwen/qwen-2.5-coder-32b-instruct:free' };
    if (hasGroq) return { provider: 'groq', model: 'llama-3.3-70b-versatile' };
  }
  if (isMath) {
    if (hasOpenRouter) return { provider: 'openrouter', model: 'qwen/qwen-2.5-72b-instruct:free' };
    if (hasCerebras) return { provider: 'cerebras', model: 'llama-3.3-70b' };
    if (hasGemini) return { provider: 'gemini', model: 'gemini-1.5-pro' };
  }
  if (isCreative) {
    if (hasOpenAI) return { provider: 'openai', model: 'gpt-4o' };
    if (hasGemini) return { provider: 'gemini', model: 'gemini-2.0-flash' };
  }
  if (isResearch) {
    if (hasOpenRouter) return { provider: 'openrouter', model: 'deepseek/deepseek-r1:free' };
    if (hasCerebras) return { provider: 'cerebras', model: 'llama-3.3-70b' };
    if (hasGemini) return { provider: 'gemini', model: 'gemini-1.5-pro' };
  }

  // Default — prefer Cerebras for speed when available
  if (hasCerebras) return { provider: 'cerebras', model: 'llama-3.3-70b' };
  if (hasGemini) return { provider: 'gemini', model: 'gemini-2.0-flash' };
  if (hasGroq) return { provider: 'groq', model: 'llama-3.3-70b-versatile' };
  return { provider: 'gemini', model: 'gemini-2.0-flash' };
};

/**
 * Unified Chat Interface with Fallback and Telemetry Logging
 */
export const chat = async ({
  userId,
  chatId,
  messages,
  systemPrompt,
  provider,
  model,
  temperature = 0.7,
  max_tokens = 2048,
  stream = false,
  apiKeys = {},
}) => {
  let currentProvider = provider;
  let currentModel = model;
  let attempt = 0;
  let isFailover = false;
  let failoverFromProvider = null;
  let failoverFromModel = null;
  let lastError = null;
  // Track every provider+model combination tried to avoid cycles
  const triedProviders = new Set();

  // Resolve Auto Routing first
  if (currentProvider === 'auto') {
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const routed = routePrompt(lastUserMessage, apiKeys);
    currentProvider = routed.provider;
    currentModel = routed.model;
  }

  while (attempt < 5) {
    const startTime = Date.now();
    try {
      // Mark this combination as tried
      triedProviders.add(`${currentProvider}:${currentModel}`);

      const providerModule = providers[currentProvider];
      if (!providerModule) {
        throw new Error(`Unsupported provider: ${currentProvider}`);
      }

      // Extract specific API key for this provider
      let apiKey = apiKeys[currentProvider];
      if (currentProvider === 'ollama') {
        apiKey = apiKeys.ollamaUrl;
      }

      const result = await providerModule.chat({
        messages,
        systemPrompt,
        model: currentModel,
        temperature,
        max_tokens,
        stream,
        apiKey,
      });

      if (!stream) {
        const endTime = Date.now();
        const latency = endTime - startTime;
        const promptTokens = result.usage?.promptTokens || estimateTokens(systemPrompt + JSON.stringify(messages));
        const completionTokens = result.usage?.completionTokens || estimateTokens(result.text);
        const totalTokens = promptTokens + completionTokens;
        const cost = calculateCost(currentModel, promptTokens, completionTokens);

        await saveLog({
          userId,
          chatId,
          provider: currentProvider,
          model: currentModel,
          promptTokens,
          completionTokens,
          totalTokens,
          latencyMs: latency,
          cost,
          status: 'success',
          isFailover,
          failoverFromProvider,
          failoverFromModel,
        });

        return {
          text: result.text,
          provider: currentProvider,
          model: currentModel,
          isFailover,
          failoverFromProvider,
          failoverFromModel,
        };
      }

      // Return stream adapter that intercepts completion for logging
      const responseStream = result.responseStream || result; // Fallback for geminiService stream result
      const wrappedStream = (async function* () {
        let fullText = '';
        const streamStartTime = Date.now();
        try {
          // If a failover occurred, prepend a payload notifying the frontend
          if (isFailover) {
            yield {
              content: '',
              isFailoverNotice: true,
              failoverFromProvider,
              failoverFromModel,
              currentProvider,
              currentModel,
            };
          }

          // Handle both Gemini SDK streaming structure and unified chunks
          if (currentProvider === 'gemini' && responseStream.stream) {
            for await (const chunk of responseStream.stream) {
              const text = chunk.text();
              if (text) {
                fullText += text;
                yield { content: text };
              }
            }
          } else {
            for await (const chunk of responseStream) {
              // Standard chunk yield
              const content = chunk.choices?.[0]?.delta?.content || chunk.content || '';
              if (content) {
                fullText += content;
                yield { content };
              }
            }
          }

          // Log Success
          const endTime = Date.now();
          const latency = endTime - streamStartTime;
          const promptTokens = estimateTokens(systemPrompt + JSON.stringify(messages));
          const completionTokens = estimateTokens(fullText);
          const totalTokens = promptTokens + completionTokens;
          const cost = calculateCost(currentModel, promptTokens, completionTokens);

          await saveLog({
            userId,
            chatId,
            provider: currentProvider,
            model: currentModel,
            promptTokens,
            completionTokens,
            totalTokens,
            latencyMs: latency,
            cost,
            status: 'success',
            isFailover,
            failoverFromProvider,
            failoverFromModel,
          });
        } catch (streamErr) {
          const endTime = Date.now();
          const latency = endTime - streamStartTime;
          const promptTokens = estimateTokens(systemPrompt + JSON.stringify(messages));
          const completionTokens = estimateTokens(fullText);
          const totalTokens = promptTokens + completionTokens;
          const cost = calculateCost(currentModel, promptTokens, completionTokens);

          await saveLog({
            userId,
            chatId,
            provider: currentProvider,
            model: currentModel,
            promptTokens,
            completionTokens,
            totalTokens,
            latencyMs: latency,
            cost,
            status: 'failed',
            isFailover,
            failoverFromProvider,
            failoverFromModel,
            error: streamErr.message,
          });
          throw streamErr;
        }
      })();

      return {
        stream: true,
        responseStream: wrappedStream,
        provider: currentProvider,
        model: currentModel,
        isFailover,
        failoverFromProvider,
        failoverFromModel,
      };

    } catch (err) {
      const isLimitExceeded = (err.message || '').toLowerCase().match(
        /limit|quota|exceeded|429|throttled|too many requests|rate.?limit|overloaded|capacity/i
      );
      const emoji = isLimitExceeded ? '⚠️ LIMIT' : '❌ ERROR';
      console.warn(`[AI Provider Manager] ${emoji} on ${currentProvider}/${currentModel}: ${err.message}`);
      lastError = err;

      // ── Step 1: Look up pre-defined failover chain ──
      let fallback = FAILOVER_CHAIN[currentModel];

      // Skip if already tried
      if (fallback && triedProviders.has(`${fallback.provider}:${fallback.model}`)) {
        fallback = null;
      }

      // ── Step 2: Dynamic fallback from available keys (env + user apiKeys) ──
      if (!fallback) {
        const candidates = [
          // User-supplied keys take priority
          (apiKeys.cerebras || process.env.CEREBRAS_API_KEY) ? { provider: 'cerebras',   model: 'llama-3.3-70b' }             : null,
          (apiKeys.gemini || process.env.GEMINI_API_KEY)    ? { provider: 'gemini',      model: 'gemini-2.0-flash' }          : null,
          (apiKeys.groq   || process.env.GROQ_API_KEY)      ? { provider: 'groq',        model: 'llama-3.3-70b-versatile' }   : null,
          (apiKeys.openrouter || process.env.OPENROUTER_API_KEY) ? { provider: 'openrouter', model: 'openrouter/free' }        : null,
          (apiKeys.openai || process.env.OPENAI_API_KEY)    ? { provider: 'openai',      model: 'gpt-4o' }                    : null,
        ]
          .filter(Boolean)
          .filter((c) => !triedProviders.has(`${c.provider}:${c.model}`));

        fallback = candidates[0] || null;
      }

      if (!fallback) {
        console.warn('[AI Provider Manager] No more fallback providers available. Giving up.');
        break;
      }

      console.log(
        `[AI Provider Manager] 🔄 Auto-switching: ${currentProvider}/${currentModel} → ${fallback.provider}/${fallback.model}`
      );

      if (!isFailover) {
        // Only capture the original on first failover
        failoverFromProvider = currentProvider;
        failoverFromModel = currentModel;
      }
      currentProvider = fallback.provider;
      currentModel = fallback.model;
      isFailover = true;
      attempt++;
    }
  }

  throw lastError || new Error('All AI providers exhausted. Please check your API keys or try again later.');
};
