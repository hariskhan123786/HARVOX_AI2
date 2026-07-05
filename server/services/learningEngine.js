/**
 * HARVOX AI — Central Learning Engine (Phase 13.5)
 *
 * Analyzes telemetry and activity logs in the operator's Memory Core
 * to discover workflows, frequency patterns, preferences, and anomalies.
 * Writes learned memories back to the Memory Core to optimize future AI responses.
 */

import Memory from '../models/Memory.js';
import { logActivity } from './memoryService.js';

/**
 * Run analytics on the last N activity logs to identify and save user patterns.
 * @param {string} userId
 * @returns {Promise<Array<{insight: string, category: string}>>}
 */
export async function analyzeActivityAndLearn(userId) {
  try {
    const logs = await Memory.find({ userId, category: 'activity' })
      .sort({ createdAt: -1 })
      .limit(100);

    if (logs.length < 5) {
      return []; // Not enough telemetry data yet to learn patterns
    }

    const insights = [];

    // Pattern 1: Identify favorite applications
    const openAppLogs = logs.filter(l => l.key === 'open_app' || l.key === 'launch_app');
    const appCounts = {};
    openAppLogs.forEach(l => {
      const app = l.metadata?.app || l.value.replace(/Launched (application|via protocol): /i, '').trim();
      if (app) appCounts[app] = (appCounts[app] || 0) + 1;
    });

    const favoriteApp = Object.entries(appCounts).sort((a, b) => b[1] - a[1])[0];
    if (favoriteApp && favoriteApp[1] >= 3) {
      const existing = await Memory.findOne({ userId, category: 'preferences', key: 'favoriteApp' });
      if (!existing || existing.value !== favoriteApp[0]) {
        await Memory.findOneAndUpdate(
          { userId, category: 'preferences', key: 'favoriteApp' },
          { value: favoriteApp[0], isPinned: true },
          { upsert: true, new: true }
        );
        insights.push({
          insight: `Learned that your favorite application is "${favoriteApp[0]}" (opened ${favoriteApp[1]} times).`,
          category: 'app_usage'
        });
      }
    }

    // Pattern 2: Identify favorite music query
    const musicLogs = logs.filter(l => l.key === 'spotify_play' || l.key === 'youtube_play' || l.key === 'play_music');
    const songCounts = {};
    musicLogs.forEach(l => {
      const song = l.metadata?.song || l.value.replace(/Played on Spotify: /i, '').replace(/"/g, '').trim();
      if (song) songCounts[song] = (songCounts[song] || 0) + 1;
    });

    const favoriteSong = Object.entries(songCounts).sort((a, b) => b[1] - a[1])[0];
    if (favoriteSong && favoriteSong[1] >= 2) {
      const existing = await Memory.findOne({ userId, category: 'preferences', key: 'favoriteMusic' });
      if (!existing || existing.value !== favoriteSong[0]) {
        await Memory.findOneAndUpdate(
          { userId, category: 'preferences', key: 'favoriteMusic' },
          { value: favoriteSong[0], isPinned: false },
          { upsert: true, new: true }
        );
        insights.push({
          insight: `Learned that you like to listen to "${favoriteSong[0]}" while working.`,
          category: 'music_preference'
        });
      }
    }

    // Pattern 3: Most active hours
    const hourCounts = Array(24).fill(0);
    logs.forEach(l => {
      const hour = new Date(l.createdAt).getHours();
      hourCounts[hour]++;
    });
    
    let peakHour = 0;
    let peakCount = 0;
    hourCounts.forEach((count, hour) => {
      if (count > peakCount) {
        peakCount = count;
        peakHour = hour;
      }
    });

    if (peakCount >= 5) {
      const ampm = peakHour >= 12 ? 'PM' : 'AM';
      const displayHour = peakHour % 12 || 12;
      const peakString = `${displayHour} ${ampm}`;
      
      const existing = await Memory.findOne({ userId, category: 'preferences', key: 'peakUsageTime' });
      if (!existing || existing.value !== peakString) {
        await Memory.findOneAndUpdate(
          { userId, category: 'preferences', key: 'peakUsageTime' },
          { value: peakString, isPinned: false },
          { upsert: true, new: true }
        );
        insights.push({
          insight: `Learned that your peak system activity time is around ${peakString}.`,
          category: 'schedule'
        });
      }
    }

    // Record learning activity
    if (insights.length > 0) {
      await logActivity(
        userId,
        'system_learn',
        `Autonomous Learning completed: compiled ${insights.length} operator preferences`,
        { insightsCount: insights.length }
      );
    }

    return insights;
  } catch (err) {
    console.error('[LearningEngine] Failed to run machine learning pipeline:', err.message);
    return [];
  }
}
