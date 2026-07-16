/**
 * AI Provider Models Configuration — Phase 11
 * Supports: Groq, Gemini, OpenRouter (free), OpenAI, Ollama, Hugging Face, Auto
 */

export const AI_PROVIDERS = {
  GROQ: 'groq',
  GEMINI: 'gemini',
  OPENROUTER: 'openrouter',
  OPENAI: 'openai',
  OLLAMA: 'ollama',
  HUGGINGFACE: 'huggingface',
  CEREBRAS: 'cerebras',
  AUTO: 'auto',
};

export const AI_PROVIDER_META = [
  {
    id: 'groq',
    label: 'Groq',
    desc: 'Ultra-fast inference',
    badge: 'Fast',
    badgeColor: '#00F0FF',
    requiresKey: false, // Admin key available
  },
  {
    id: 'gemini',
    label: 'Google Gemini',
    desc: 'Advanced multimodal AI',
    badge: 'Smart',
    badgeColor: '#4285F4',
    requiresKey: false,
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    desc: 'Free OSS models',
    badge: 'Free',
    badgeColor: '#8A2BE2',
    requiresKey: true,
  },
  {
    id: 'openai',
    label: 'OpenAI',
    desc: 'GPT-4o & beyond',
    badge: 'Premium',
    badgeColor: '#10A37F',
    requiresKey: true,
  },
  {
    id: 'ollama',
    label: 'Ollama (Local)',
    desc: 'Run models offline',
    badge: 'Local',
    badgeColor: '#FF6B35',
    requiresKey: false,
  },
  {
    id: 'huggingface',
    label: 'Hugging Face',
    desc: 'Open source AI hub',
    badge: 'OSS',
    badgeColor: '#FFD21E',
    requiresKey: true,
  },
  {
    id: 'cerebras',
    label: 'Cerebras',
    desc: 'Ultra-fast silicon AI',
    badge: '⚡ Fastest',
    badgeColor: '#FF6B35',
    requiresKey: false, // Admin key available
  },
  {
    id: 'auto',
    label: 'Auto Routing',
    desc: 'Smart prompt-based selection',
    badge: 'AI',
    badgeColor: '#FF00C8',
    requiresKey: false,
  },
];

export const GROQ_MODELS = [
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B',
    provider: 'groq',
    speed: 'Fast',
    capability: 'Excellent',
    category: 'general',
    costPer1M: 0.59,
    free: false,
  },
  {
    id: 'llama-3.1-70b-versatile',
    name: 'Llama 3.1 70B',
    provider: 'groq',
    speed: 'Fast',
    capability: 'Great',
    category: 'general',
    costPer1M: 0.59,
    free: false,
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    provider: 'groq',
    speed: 'Very Fast',
    capability: 'Good',
    category: 'general',
    costPer1M: 0.24,
    free: false,
  },
];

export const GEMINI_MODELS = [
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'gemini',
    speed: 'Very Fast',
    capability: 'Excellent',
    category: 'general',
    costPer1M: 0.075,
    free: false,
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    speed: 'Moderate',
    capability: 'Excellent',
    category: 'reasoning',
    costPer1M: 1.25,
    free: false,
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    speed: 'Fast',
    capability: 'Great',
    category: 'general',
    costPer1M: 0.075,
    free: false,
  },
  {
    id: 'gemini-1.5-flash-8b',
    name: 'Gemini 1.5 Flash 8B',
    provider: 'gemini',
    speed: 'Very Fast',
    capability: 'Good',
    category: 'general',
    costPer1M: 0.0375,
    free: false,
  },
];

export const OPENROUTER_MODELS = [
  {
    id: 'openrouter/free',
    name: 'Smart Free Router',
    provider: 'openrouter',
    speed: 'Fast',
    capability: 'Excellent',
    category: 'general',
    costPer1M: 0,
    free: true,
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1',
    provider: 'openrouter',
    speed: 'Moderate',
    capability: 'Excellent',
    category: 'reasoning',
    costPer1M: 0,
    free: true,
  },
  {
    id: 'qwen/qwen-2.5-coder-32b-instruct:free',
    name: 'Qwen 2.5 Coder 32B',
    provider: 'openrouter',
    speed: 'Moderate',
    capability: 'Excellent',
    category: 'coding',
    costPer1M: 0,
    free: true,
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct:free',
    name: 'Qwen 2.5 72B',
    provider: 'openrouter',
    speed: 'Moderate',
    capability: 'Great',
    category: 'reasoning',
    costPer1M: 0,
    free: true,
  },
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'Llama 3.2 3B',
    provider: 'openrouter',
    speed: 'Very Fast',
    capability: 'Good',
    category: 'general',
    costPer1M: 0,
    free: true,
  },
  {
    id: 'google/gemma-2-9b-it:free',
    name: 'Gemma 2 9B',
    provider: 'openrouter',
    speed: 'Fast',
    capability: 'Good',
    category: 'general',
    costPer1M: 0,
    free: true,
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B',
    provider: 'openrouter',
    speed: 'Very Fast',
    capability: 'Good',
    category: 'general',
    costPer1M: 0,
    free: true,
  },
];

export const OPENAI_MODELS = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    speed: 'Moderate',
    capability: 'Excellent',
    category: 'general',
    costPer1M: 5.0,
    free: false,
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    speed: 'Fast',
    capability: 'Great',
    category: 'general',
    costPer1M: 0.5,
    free: false,
  },
];

export const OLLAMA_MODELS = [
  {
    id: 'llama3',
    name: 'Llama 3 (Local)',
    provider: 'ollama',
    speed: 'Fast',
    capability: 'Good',
    category: 'local',
    costPer1M: 0,
    free: true,
  },
  {
    id: 'mistral',
    name: 'Mistral (Local)',
    provider: 'ollama',
    speed: 'Fast',
    capability: 'Good',
    category: 'local',
    costPer1M: 0,
    free: true,
  },
  {
    id: 'codellama',
    name: 'CodeLlama (Local)',
    provider: 'ollama',
    speed: 'Moderate',
    capability: 'Great',
    category: 'coding',
    costPer1M: 0,
    free: true,
  },
];

export const HUGGINGFACE_MODELS = [
  {
    id: 'meta-llama/Llama-3.2-3B-Instruct',
    name: 'Llama 3.2 3B (HF)',
    provider: 'huggingface',
    speed: 'Very Fast',
    capability: 'Good',
    category: 'general',
    costPer1M: 0,
    free: true,
  },
  {
    id: 'HuggingFaceH4/zephyr-7b-beta',
    name: 'Zephyr 7B Beta',
    provider: 'huggingface',
    speed: 'Fast',
    capability: 'Good',
    category: 'general',
    costPer1M: 0,
    free: true,
  },
];

export const CEREBRAS_MODELS = [
  {
    id: 'gpt-oss-120b',
    name: 'GPT OSS 120B (Cerebras)',
    provider: 'cerebras',
    speed: 'Very Fast',
    capability: 'Excellent',
    category: 'general',
    costPer1M: 0.30,
    free: false,
  },
  {
    id: 'gemma-4-31b',
    name: 'Gemma 4 31B (Cerebras)',
    provider: 'cerebras',
    speed: 'Very Fast',
    capability: 'Great',
    category: 'general',
    costPer1M: 0.30,
    free: false,
  },
  {
    id: 'zai-glm-4.7',
    name: 'GLM 4.7 (Cerebras)',
    provider: 'cerebras',
    speed: 'Very Fast',
    capability: 'Good',
    category: 'general',
    costPer1M: 0.30,
    free: false,
  },
];

export const ALL_MODELS = [
  ...GROQ_MODELS,
  ...GEMINI_MODELS,
  ...OPENROUTER_MODELS,
  ...OPENAI_MODELS,
  ...OLLAMA_MODELS,
  ...HUGGINGFACE_MODELS,
  ...CEREBRAS_MODELS,
];

export const getModelsByProvider = (provider) => {
  switch (provider) {
    case 'gemini': return GEMINI_MODELS;
    case 'openrouter': return OPENROUTER_MODELS;
    case 'openai': return OPENAI_MODELS;
    case 'ollama': return OLLAMA_MODELS;
    case 'huggingface': return HUGGINGFACE_MODELS;
    case 'cerebras': return CEREBRAS_MODELS;
    case 'auto': return [];
    default: return GROQ_MODELS;
  }
};

export const getDefaultModelForProvider = (provider) => {
  const models = getModelsByProvider(provider);
  return models[0]?.id || 'llama-3.3-70b-versatile';
};

export const getModelById = (modelId) =>
  ALL_MODELS.find((m) => m.id === modelId) || null;
