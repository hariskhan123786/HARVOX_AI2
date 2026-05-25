/**
 * AI Provider Models Configuration
 * Includes Groq and Gemini models available for users
 */

export const AI_PROVIDERS = {
  GROQ: 'groq',
  GEMINI: 'gemini'
};

export const GROQ_MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Expert)', speed: 'Moderate', capability: 'Excellent' },
  { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B (Fast)', speed: 'Fast', capability: 'Great' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (Lite)', speed: 'Very Fast', capability: 'Good' }
];

export const GEMINI_MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Recommended)', speed: 'Very Fast', capability: 'Excellent' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Most Capable)', speed: 'Moderate', capability: 'Excellent' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Balanced)', speed: 'Fast', capability: 'Great' },
  { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B (Lightweight)', speed: 'Very Fast', capability: 'Good' },
];

export const getModelsByProvider = (provider) => {
  return provider === AI_PROVIDERS.GEMINI ? GEMINI_MODELS : GROQ_MODELS;
};

export const getDefaultModelForProvider = (provider) => {
  const models = getModelsByProvider(provider);
  return models[0].id;
};
