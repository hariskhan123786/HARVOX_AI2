import { GoogleGenerativeAI } from '@google/generative-ai';

let geminiClient = null;

const getClient = () => {
  if (!geminiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return geminiClient;
};

export const chat = async ({ 
  messages, 
  systemPrompt, 
  model = 'gemini-2.0-flash', 
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
    if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      throw Object.assign(new Error('Rate limit exceeded. Please try again later.'), { code: 'RATE_LIMIT' });
    }
    if (error.message?.includes('401') || error.message?.includes('UNAUTHENTICATED') || error.message?.includes('Invalid API key')) {
      throw Object.assign(new Error('Invalid Gemini API key.'), { code: 'API_KEY' });
    }
    throw Object.assign(new Error(error.message || 'AI service error'), { code: 'AI_ERROR' });
  }
};

export const isAIConfigured = () => Boolean(process.env.GEMINI_API_KEY);