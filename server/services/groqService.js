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

export const chat = async ({ messages, systemPrompt, model = 'llama-3.1-8b-instant', temperature = 0.7, max_tokens = 4096, stream = false, apiKey = null }) => {
  try {
    let client;
    if (apiKey && apiKey.trim() !== '') {
      client = new Groq({ apiKey });
    } else {
      client = getClient();
    }
    let effectiveModel = model;
    if (effectiveModel === 'llama-3.1-8b-instant' || effectiveModel === 'llama3-8b-8192') {
      effectiveModel = 'llama-3.3-70b-versatile';
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
