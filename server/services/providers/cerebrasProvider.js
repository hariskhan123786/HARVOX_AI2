/**
 * Cerebras Inference Provider
 * OpenAI-compatible API — ultra-fast Llama inference on Cerebras Silicon.
 *
 * Supported models (as of mid-2026):
 *   llama-4-scout-17b-16e-instruct  — Llama 4 Scout MoE (fastest)
 *   llama-3.3-70b                   — Llama 3.3 70B
 *   llama3.1-70b                    — Llama 3.1 70B
 *   llama3.1-8b                     — Llama 3.1 8B  (fastest/cheapest)
 *   deepseek-r1-distill-llama-70b   — DeepSeek R1 Distill (private preview)
 *
 * Base URL: https://api.cerebras.ai/v1
 */

const CEREBRAS_BASE_URL = 'https://api.cerebras.ai/v1';

export const chat = async ({
  messages,
  systemPrompt,
  model = 'llama-3.3-70b',
  temperature = 0.7,
  max_tokens = 2048,
  stream = false,
  apiKey = null,
}) => {
  const key = apiKey || process.env.CEREBRAS_API_KEY;
  if (!key) {
    throw new Error('Cerebras API Key is not configured. Please set CEREBRAS_API_KEY.');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${key}`,
  };

  const formattedMessages = [];
  if (systemPrompt) {
    formattedMessages.push({ role: 'system', content: systemPrompt });
  }
  formattedMessages.push(...messages);

  const body = JSON.stringify({
    model,
    messages: formattedMessages,
    temperature,
    max_tokens,
    stream,
  });

  const response = await fetch(`${CEREBRAS_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorJson;
    try {
      errorJson = JSON.parse(errorText);
    } catch {
      // Ignored — keep raw text
    }
    const errMsg = errorJson?.error?.message || errorText || 'Failed to fetch from Cerebras';
    if (response.status === 429) {
      throw Object.assign(new Error(`Rate limit exceeded on Cerebras: ${errMsg}`), { code: 'RATE_LIMIT' });
    }
    if (response.status === 401 || response.status === 400) {
      throw Object.assign(new Error(`Invalid Cerebras API key or model not found: ${errMsg}`), { code: 'RATE_LIMIT' });
    }
    // Tag all other errors as RATE_LIMIT so aiProviderManager always retries
    throw Object.assign(new Error(`Cerebras Error (${response.status}): ${errMsg}`), { code: 'RATE_LIMIT' });
  }

  // ── Non-streaming ──────────────────────────────────────────────────────────
  if (!stream) {
    const data = await response.json();
    return {
      text: data.choices?.[0]?.message?.content || 'No response generated.',
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  }

  // ── SSE Streaming ──────────────────────────────────────────────────────────
  return {
    stream: true,
    responseStream: (async function* () {
      const bodyStream = response.body;
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      for await (const chunk of bodyStream) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;

          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const content = data.choices?.[0]?.delta?.content || '';
              if (content) {
                yield { content };
              }
            } catch {
              // Ignore malformed SSE chunks
            }
          }
        }
      }
    })(),
  };
};

export const isConfigured = () => Boolean(process.env.CEREBRAS_API_KEY);

/**
 * Convenience helper — list available Cerebras models.
 * Returns a resolved array or an empty array on failure.
 */
export const listModels = async (apiKey = null) => {
  const key = apiKey || process.env.CEREBRAS_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch(`${CEREBRAS_BASE_URL}/models`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).map((m) => m.id);
  } catch {
    return [];
  }
};
