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
  model = 'gemini-pro', 
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

    const genAI = client;
    const genModel = genAI.getGenerativeModel({ model });

    // Convert chat history to Gemini format
    const history = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = genModel.startChat({
      history: history,
      generationConfig: {
        temperature,
        maxOutputTokens: max_tokens,
      },
      systemInstruction: systemPrompt,
    });

    if (stream) {
      // For streaming responses
      const result = await chat.sendMessageStream(
        history.length > 0 ? history[history.length - 1].parts[0].text : ''
      );
      return result;
    }

    // For non-streaming responses
    const userMessage = history.length > 0 ? history[history.length - 1].parts[0].text : '';
    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    
    return response.text() || 'No response generated.';
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
