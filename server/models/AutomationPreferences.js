import mongoose from 'mongoose';

const automationPreferencesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // Preferred music service
    preferredMusicService: {
      type: String,
      enum: ['spotify', 'youtube', 'youtube_music', 'auto'],
      default: 'auto',
    },

    // Favorite contacts (for WhatsApp automation)
    favoriteContacts: [
      {
        name: { type: String, trim: true },
        phone: { type: String, trim: true },
        lastUsed: { type: Date, default: Date.now },
      },
    ],

    // Frequently opened apps
    frequentApps: [
      {
        name: { type: String, trim: true },
        useCount: { type: Number, default: 1 },
        lastUsed: { type: Date, default: Date.now },
      },
    ],

    // Frequently visited sites
    frequentSites: [
      {
        url: { type: String, trim: true },
        label: { type: String, trim: true },
        useCount: { type: Number, default: 1 },
        lastUsed: { type: Date, default: Date.now },
      },
    ],

    // Saved workflow templates
    savedWorkflows: [
      {
        name: { type: String, trim: true },
        description: { type: String, trim: true },
        steps: [
          {
            action: String,
            description: String,
            args: [String],
            agent: String,
            sensitive: Boolean,
            estimatedMs: Number,
          },
        ],
        useCount: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Productivity preferences
    pomodoroMinutes: { type: Number, default: 25 },
    breakMinutes: { type: Number, default: 5 },

    // Automation statistics
    stats: {
      totalRuns: { type: Number, default: 0 },
      successCount: { type: Number, default: 0 },
      failureCount: { type: Number, default: 0 },
      lastRunAt: { type: Date },
    },

    // Feature flags / permissions granted
    permissions: {
      allowWhatsAppSend: { type: Boolean, default: false },
      allowFileDeletion: { type: Boolean, default: false },
      allowGitPush: { type: Boolean, default: false },
      allowShellCommands: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Static helper: upsert preferences doc for a user
automationPreferencesSchema.statics.getOrCreate = async function (userId) {
  let prefs = await this.findOne({ userId });
  if (!prefs) {
    prefs = await this.create({ userId });
  }
  return prefs;
};

// Record a successful automation run
automationPreferencesSchema.methods.recordRun = async function (success = true) {
  this.stats.totalRuns += 1;
  if (success) this.stats.successCount += 1;
  else this.stats.failureCount += 1;
  this.stats.lastRunAt = new Date();
  await this.save();
};

// Track frequent app usage
automationPreferencesSchema.methods.trackApp = async function (appName) {
  const existing = this.frequentApps.find(
    (a) => a.name.toLowerCase() === appName.toLowerCase()
  );
  if (existing) {
    existing.useCount += 1;
    existing.lastUsed = new Date();
  } else {
    this.frequentApps.push({ name: appName, useCount: 1, lastUsed: new Date() });
  }
  // Keep only top 20
  this.frequentApps.sort((a, b) => b.useCount - a.useCount);
  if (this.frequentApps.length > 20) this.frequentApps = this.frequentApps.slice(0, 20);
  await this.save();
};

const AutomationPreferences = mongoose.model('AutomationPreferences', automationPreferencesSchema);
export default AutomationPreferences;
