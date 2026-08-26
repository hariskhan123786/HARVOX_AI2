import { GoogleGenerativeAI } from '@google/generative-ai';

let geminiClient = null;

const getClient = () => {
  if (!geminiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw Object.assign(new Error('GEMINI_API_KEY is not configured. Switching to next provider.'), { code: 'RATE_LIMIT' });
    }
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return geminiClient;
};

export const chat = async ({ 
  messages, 
  systemPrompt, 
  model = 'gemini-2.0-flash-001', 
  temperature = 0.7, 
  max_tokens = 4096, 
  stream = false, 
  apiKey = null 
}) => {
  try {
    let client;
    if (apiKey && apiKey.trim() !== '') {
      client = new GoogleGenerativeAI(apiKey);
    } else {
      client = getClient();
    }

    // ✅ FIX 1: Pass systemInstruction here in getGenerativeModel, not in startChat
    const genModel = client.getGenerativeModel({
      model,
      systemInstruction: systemPrompt || undefined,
    });

    // ✅ FIX 2: History = all messages EXCEPT the last user message
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // ✅ FIX 3: Last message is sent separately via sendMessage
    const lastMessage = messages[messages.length - 1]?.content || '';

    const chatSession = genModel.startChat({
      history,
      generationConfig: {
        temperature,
        maxOutputTokens: max_tokens,
      },
    });

    if (stream) {
      // sendMessageStream makes the HTTP request immediately — 400/401 errors surface here
      // before we return, so the outer try/catch correctly tags them for failover routing
      const result = await chatSession.sendMessageStream(lastMessage);
      return result;
    }

    const result = await chatSession.sendMessage(lastMessage);
    const text = result.response.text() || 'No response generated.';
    return {
      text,
      usage: {
        promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
        completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: result.response.usageMetadata?.totalTokenCount || 0,
      }
    };

  } catch (error) {
    const msg = error.message || '';
    if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
      throw Object.assign(new Error('Rate limit exceeded. Please try again later.'), { code: 'RATE_LIMIT' });
    }
    // Catch all invalid key variants: 400 Bad Request, API_KEY_INVALID, 401, UNAUTHENTICATED
    if (
      msg.includes('400') ||
      msg.includes('API_KEY_INVALID') ||
      msg.includes('401') ||
      msg.includes('UNAUTHENTICATED') ||
      msg.includes('Invalid API key') ||
      msg.includes('API key not valid')
    ) {
      throw Object.assign(new Error('Invalid Gemini API key. Switching to fallback provider.'), { code: 'RATE_LIMIT' });
    }
    throw Object.assign(new Error(msg || 'AI service error'), { code: 'AI_ERROR' });
  }
};

export const isAIConfigured = () => Boolean(process.env.GEMINI_API_KEY);