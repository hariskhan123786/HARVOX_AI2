import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    appearance: {
      mode: { type: String, enum: ['dark', 'light'], default: 'dark' },
      theme: { type: String, default: 'Cyberpunk Neon' },
      accentColor: { type: String, default: 'purple' },
      fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
      uiDensity: { type: String, default: 'comfortable' },
    },
    ai: {
      provider: { type: String, enum: ['groq', 'gemini'], default: 'groq' },
      model: { type: String, default: 'llama-3.3-70b-versatile' },
      creativity: { type: Number, min: 0, max: 2, default: 0.7 },
      responseLength: { type: String, enum: ['short', 'medium', 'long'], default: 'medium' },
      codingMode: { type: String, enum: ['standard', 'strict', 'creative'], default: 'standard' },
      expertiseLevel: { type: String, enum: ['beginner', 'intermediate', 'expert'], default: 'intermediate' },
      streaming: { type: Boolean, default: true },
    },
    voice: {
      enabled: { type: Boolean, default: false },
      speed: { type: Number, min: 0.5, max: 2, default: 1 },
      voiceSelection: { type: String, default: 'female' },
      wakeWord: { type: String, default: 'Hey Harvox' },
      autoReplies: { type: Boolean, default: false },
      language: { type: String, default: 'en-US' },
    },
    notifications: {
      email: { type: Boolean, default: true },
      aiAlerts: { type: Boolean, default: true },
      soundEffects: { type: Boolean, default: true },
      desktop: { type: Boolean, default: false },
      security: { type: Boolean, default: true },
    },
    memory: {
      rememberConversations: { type: Boolean, default: true },
      projectMemory: { type: Boolean, default: true },
      smartSuggestions: { type: Boolean, default: true },
      memoryDepth: { type: Number, min: 1, max: 10, default: 5 },
    },
    workspace: {
      sidebarCollapsed: { type: Boolean, default: false },
      layoutType: { type: String, default: 'default' },
      hiddenModules: [{ type: String }],
    },
    apiKeys: {
      groq: { type: String, default: '', select: false },
      gemini: { type: String, default: '', select: false },
    }
  },
  { timestamps: true }
);

export default mongoose.model('UserSettings', userSettingsSchema);
