/**
 * Ollama Local Provider
 * Supports streaming and non-streaming completions for local Ollama models.
 */
export const chat = async ({
  messages,
  systemPrompt,
  model = 'llama3',
  temperature = 0.7,
  max_tokens = 2048,
  stream = false,
  apiKey = null, // Can hold custom Ollama URL
}) => {
  // Use custom URL if passed (e.g. from userSettings.apiKeys.ollamaUrl)
  const ollamaUrl = apiKey || process.env.OLLAMA_URL || 'http://localhost:11434';
  const url = `${ollamaUrl.replace(/\/$/, '')}/api/chat`;

  const formattedMessages = [];
  if (systemPrompt) {
    formattedMessages.push({ role: 'system', content: systemPrompt });
  }
  formattedMessages.push(...messages);

  const body = JSON.stringify({
    model,
    messages: formattedMessages,
    options: {
      temperature,
      num_predict: max_tokens,
    },
    stream,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama Error: ${errorText || response.statusText || 'Failed to connect to local Ollama service'}`);
  }

  if (!stream) {
    const data = await response.json();
    return {
      text: data.message?.content || 'No response generated.',
      usage: {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
      },
    };
  }

  // Return a unified async generator for streaming
  return {
    stream: true,
    responseStream: (async function* () {
      const bodyStream = response.body;
      let buffer = '';
      
      for await (const chunk of bodyStream) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          
          try {
            const data = JSON.parse(trimmed);
            const content = data.message?.content || '';
            if (content) {
              yield { content };
            }
          } catch (err) {
            // Ignore partial or malformed chunks
          }
        }
      }
    })(),
  };
};

export const isConfigured = () => true; // Ollama is local, always assume available or handled by failover
