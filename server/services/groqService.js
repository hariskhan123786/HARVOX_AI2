import Groq from 'groq-sdk';

let groq = null;

const getClient = () => {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw Object.assign(new Error('GROQ_API_KEY is not configured. Switching to next provider.'), { code: 'RATE_LIMIT' });
    }
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
};

export const chat = async ({ messages, systemPrompt, model = 'openai/gpt-oss-120b', temperature = 0.7, max_tokens = 4096, stream = false, apiKey = null }) => {
  try {
    let client;
    if (apiKey && apiKey.trim() !== '') {
      client = new Groq({ apiKey });
    } else {
      client = getClient();
    }
    let effectiveModel = model;
    // Map legacy / deprecated model names to current active Groq models
    if (
      effectiveModel.includes('llama') ||
      effectiveModel.includes('mixtral') ||
      effectiveModel === 'openai/gpt-oss-120b' ||
      !effectiveModel
    ) {
      effectiveModel = 'openai/gpt-oss-120b';
    } else if (effectiveModel.includes('qwen')) {
      effectiveModel = 'qwen/qwen3.6-27b';
    }

    const response = await client.chat.completions.create({
      model: effectiveModel,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature,
      max_tokens,
      stream,
    });

    if (stream) return response;

    const text = response.choices[0]?.message?.content || 'No response generated.';
    return {
      text,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      }
    };
  } catch (error) {
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('rate limit')) {
      throw Object.assign(new Error('Rate limit exceeded. Please try again later.'), { code: 'RATE_LIMIT' });
    }
    if (error.status === 401 || error.status === 400 || error.status === 404 || error.message?.includes('model_not_found') || error.message?.includes('does not exist') || error.message?.includes('Invalid API Key') || error.message?.includes('invalid_api_key')) {
      throw Object.assign(new Error('Groq model unavailable or invalid key. Switching to fallback provider.'), { code: 'RATE_LIMIT' });
    }
    throw Object.assign(new Error(error.message || 'AI service error'), { code: 'RATE_LIMIT' });
  }
};

export const isAIConfigured = () => Boolean(process.env.GROQ_API_KEY);
