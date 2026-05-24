import mongoose from 'mongoose';

const activityLogEntry = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  actionType: { type: String, enum: ['chat', 'code_gen', 'debug', 'upload', 'project', 'login'], default: 'chat' },
  details: { type: String, default: '' },
});

const userAnalyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    totalChats: { type: Number, default: 0 },
    generatedCodeCount: { type: Number, default: 0 },
    uploadedFiles: { type: Number, default: 0 },
    debuggingSessions: { type: Number, default: 0 },
    totalTokensUsed: { type: Number, default: 0 },
    activityLog: [activityLogEntry],
    streakDays: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('UserAnalytics', userAnalyticsSchema);
