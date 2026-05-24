import User from '../models/User.js';
import UserAnalytics from '../models/UserAnalytics.js';

export const incrementUsage = async (userId, field) => {
  const validFields = ['chats', 'codeGen', 'files', 'projects'];
  if (!validFields.includes(field)) return;
  
  // 1. Increment User usage counter
  await User.findByIdAndUpdate(userId, { $inc: { [`usage.${field}`]: 1 } });

  // 2. Synchronize to UserAnalytics
  try {
    let analytics = await UserAnalytics.findOne({ userId });
    if (!analytics) {
      analytics = new UserAnalytics({ userId });
    }

    let actionType = 'chat';
    let details = 'Initiated a conversation with AI assistant';

    if (field === 'chats') {
      analytics.totalChats += 1;
      actionType = 'chat';
      details = 'Initiated a conversation with AI assistant';
    } else if (field === 'codeGen') {
      analytics.generatedCodeCount += 1;
      actionType = 'code_gen';
      details = 'Generated source code template';
    } else if (field === 'files') {
      analytics.uploadedFiles += 1;
      actionType = 'upload';
      details = 'Analyzed uploaded document/file';
    } else if (field === 'projects') {
      actionType = 'project';
      details = 'Scaffolded complete project configuration';
    }

    // Push new activity
    analytics.activityLog.push({
      date: new Date(),
      actionType,
      details,
    });

    // Cap the activity log to the last 20 records
    if (analytics.activityLog.length > 20) {
      analytics.activityLog.shift();
    }

    await analytics.save();
  } catch (err) {
    console.error('Failed to sync user analytics inside usageService:', err);
  }
};
