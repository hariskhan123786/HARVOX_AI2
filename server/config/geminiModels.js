/**
 * Gemini API Available Models
 * Updated: May 2026
 * Reference: https://ai.google.dev/models
 */

export const GEMINI_MODELS = {
  // Latest Gemini Models
  'gemini-2.0-flash': {
    name: 'Gemini 2.0 Flash',
    description: 'Fastest Gemini model, optimized for speed and efficiency',
    inputTokens: 1000000, // 1M tokens
    outputTokens: 4096,
    costPer1kInputTokens: 0.075,
    costPer1kOutputTokens: 0.3,
    featured: true,
    streaming: true,
    vision: true,
  },
  'gemini-1.5-pro': {
    name: 'Gemini 1.5 Pro',
    description: 'Most capable model, best for complex tasks and reasoning',
    inputTokens: 1000000,
    outputTokens: 4096,
    costPer1kInputTokens: 1.25,
    costPer1kOutputTokens: 5.0,
    featured: true,
    streaming: true,
    vision: true,
  },
  'gemini-1.5-flash': {
    name: 'Gemini 1.5 Flash',
    description: 'Fast and efficient, ideal for most use cases',
    inputTokens: 1000000,
    outputTokens: 4096,
    costPer1kInputTokens: 0.075,
    costPer1kOutputTokens: 0.3,
    featured: true,
    streaming: true,
    vision: true,
  },
  'gemini-1.5-flash-8b': {
    name: 'Gemini 1.5 Flash 8B',
    description: 'Lightweight model for faster inference',
    inputTokens: 1000000,
    outputTokens: 4096,
    costPer1kInputTokens: 0.0375,
    costPer1kOutputTokens: 0.15,
    featured: false,
    streaming: true,
    vision: true,
  },
  'gemini-pro': {
    name: 'Gemini Pro (Legacy)',
    description: 'Previous generation, use latest models when possible',
    inputTokens: 32000,
    outputTokens: 8192,
    costPer1kInputTokens: 0.5,
    costPer1kOutputTokens: 1.5,
    featured: false,
    streaming: true,
    vision: false,
  },
  'gemini-pro-vision': {
    name: 'Gemini Pro Vision (Legacy)',
    description: 'Legacy vision model, use gemini-1.5-flash or pro for vision',
    inputTokens: 32000,
    outputTokens: 8192,
    costPer1kInputTokens: 0.5,
    costPer1kOutputTokens: 1.5,
    featured: false,
    streaming: false,
    vision: true,
  },
};

export const DEFAULT_GEMINI_MODEL = 'gemini-1.5-flash';

export const GEMINI_SYSTEM_PROMPTS = {
  CHAT_ASSISTANT: `You are Harvox AI, an advanced intelligent assistant designed to help developers, coders, and tech enthusiasts. 
You provide clear, concise, and helpful responses. You're an expert in multiple programming languages, frameworks, and technologies.
Be conversational but professional. Help users solve problems, learn new concepts, and build amazing projects.`,

  CODE_GENERATOR: `You are an expert code generator. Generate clean, well-documented, and production-ready code.
Follow best practices, use proper naming conventions, and include comments where necessary.
Always consider performance, security, and maintainability.
Return only the code without additional explanation unless specifically asked.`,

  DEBUG_ASSISTANT: `You are an expert debugger. Analyze errors and provide clear solutions.
Explain what went wrong, why it happened, and how to fix it.
Provide step-by-step debugging guidance and best practices to prevent similar issues.`,

  EXPLAIN_CODE: `You are an expert at explaining code. Break down complex code into understandable parts.
Explain what each section does, why it's written that way, and any potential improvements.
Use analogies and examples to make concepts clear.`,

  PROJECT_SCAFFOLDER: `You are an expert in project structure and architecture.
Generate well-organized project configurations and scaffolding.
Include best practices, proper folder structure, and configuration files.
Consider scalability, maintainability, and industry standards.`,

  FILE_ANALYZER: `You are an expert at analyzing documents and files.
Extract key information, summarize content, and provide insights.
Be thorough but concise. Highlight important details and patterns.`,
};
