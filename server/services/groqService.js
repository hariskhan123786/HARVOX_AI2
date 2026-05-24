import Groq from 'groq-sdk';

let groq = null;

const getClient = () => {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
};

export const chat = async ({ messages, systemPrompt, model = 'llama-3.3-70b-versatile', temperature = 0.7, max_tokens = 4096, stream = false, apiKey = null }) => {
  try {
    let client;
    if (apiKey && apiKey.trim() !== '') {
      client = new Groq({ apiKey });
    } else {
      client = getClient();
    }
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature,
      max_tokens,
      stream,
    });

    if (stream) return response;

    return response.choices[0]?.message?.content || 'No response generated.';
  } catch (error) {
    if (error.status === 429) {
      throw Object.assign(new Error('Rate limit exceeded. Please try again later.'), { code: 'RATE_LIMIT' });
    }
    if (error.status === 401) {
      throw Object.assign(new Error('Invalid Groq API key.'), { code: 'API_KEY' });
    }
    throw Object.assign(new Error(error.message || 'AI service error'), { code: 'AI_ERROR' });
  }
};

export const isAIConfigured = () => Boolean(process.env.GROQ_API_KEY);
