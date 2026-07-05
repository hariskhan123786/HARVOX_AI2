/**
 * OpenAI Direct Provider
 * Supports streaming and non-streaming completions for OpenAI models.
 */
export const chat = async ({
  messages,
  systemPrompt,
  model = 'gpt-4o',
  temperature = 0.7,
  max_tokens = 2048,
  stream = false,
  apiKey = null,
}) => {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('OpenAI API Key is not configured. Please set OPENAI_API_KEY.');
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

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
      // Ignored
    }
    const errMsg = errorJson?.error?.message || errorText || 'Failed to fetch from OpenAI';
    throw new Error(`OpenAI Error: ${errMsg}`);
  }

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

  // Return a unified async generator for streaming
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
            } catch (err) {
              // Ignore partial or malformed chunks
            }
          }
        }
      }
    })(),
  };
}

export const isConfigured = () => Boolean(process.env.OPENAI_API_KEY);
