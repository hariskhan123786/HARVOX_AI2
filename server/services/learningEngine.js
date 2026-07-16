/**
 * HARVOX AI — Central Learning Engine (Phase 14)
 *
 * Analyzes telemetry and activity logs in the operator's Memory Core
 * to discover workflows, frequency patterns, preferences, and anomalies.
 * Writes learned memories back to the Memory Core to optimize future AI responses.
 */

import { supabase } from '../config/supabase.js';
import { logActivity } from './memoryService.js';

/**
 * Run analytics on the last N activity logs to identify and save user patterns.
 * @param {string} userId
 * @returns {Promise<Array<{insight: string, category: string}>>}
 */
export async function analyzeActivityAndLearn(userId) {
  try {
    const { data: logs, error } = await supabase
      .from('brain_memory')
      .select('*')
      .eq('user_id', userId)
      .eq('category', 'activity')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    if (!logs || logs.length < 5) {
      return []; // Not enough telemetry data yet
    }

    const insights = [];

    // Helper: upsert a preference memory
    const upsertPreference = async (key, value, isPinned = false) => {
      const { data: existing } = await supabase
        .from('brain_memory')
        .select('id, value')
        .eq('user_id', userId)
        .eq('category', 'preferences')
        .eq('key', key)
        .maybeSingle();

      if (existing) {
        if (existing.value !== value) {
          await supabase.from('brain_memory').update({ value, is_pinned: isPinned }).eq('id', existing.id);
          return true; // updated
        }
        return false; // no change
      } else {
        await supabase.from('brain_memory').insert({
          user_id: userId,
          category: 'preferences',
          key,
          value,
          is_pinned: isPinned,
        });
        return true; // inserted
      }
    };

    // Pattern 1: Identify favorite applications
    const openAppLogs = logs.filter((l) => l.key === 'open_app' || l.key === 'launch_app');
    const appCounts = {};
    openAppLogs.forEach((l) => {
      const app = l.metadata?.app || String(l.value).replace(/Launched (application|via protocol): /i, '').trim();
      if (app) appCounts[app] = (appCounts[app] || 0) + 1;
    });

    const favoriteApp = Object.entries(appCounts).sort((a, b) => b[1] - a[1])[0];
    if (favoriteApp && favoriteApp[1] >= 3) {
      const updated = await upsertPreference('favoriteApp', favoriteApp[0], true);
      if (updated) {
        insights.push({
          insight: `Learned that your favorite application is "${favoriteApp[0]}" (opened ${favoriteApp[1]} times).`,
          category: 'app_usage',
        });
      }
    }

    // Pattern 2: Identify favorite music query
    const musicLogs = logs.filter((l) => ['spotify_play', 'youtube_play', 'play_music'].includes(l.key));
    const songCounts = {};
    musicLogs.forEach((l) => {
      const song = l.metadata?.song || String(l.value).replace(/Played on Spotify: /i, '').replace(/"/g, '').trim();
      if (song) songCounts[song] = (songCounts[song] || 0) + 1;
    });

    const favoriteSong = Object.entries(songCounts).sort((a, b) => b[1] - a[1])[0];
    if (favoriteSong && favoriteSong[1] >= 2) {
      const updated = await upsertPreference('favoriteMusic', favoriteSong[0], false);
      if (updated) {
        insights.push({
          insight: `Learned that you like to listen to "${favoriteSong[0]}" while working.`,
          category: 'music_preference',
        });
      }
    }

    // Pattern 3: Most active hours
    const hourCounts = Array(24).fill(0);
    logs.forEach((l) => {
      const hour = new Date(l.created_at).getHours();
      hourCounts[hour]++;
    });

    let peakHour = 0, peakCount = 0;
    hourCounts.forEach((count, hour) => {
      if (count > peakCount) { peakCount = count; peakHour = hour; }
    });

    if (peakCount >= 5) {
      const ampm = peakHour >= 12 ? 'PM' : 'AM';
      const displayHour = peakHour % 12 || 12;
      const peakString = `${displayHour} ${ampm}`;
      const updated = await upsertPreference('peakUsageTime', peakString, false);
      if (updated) {
        insights.push({
          insight: `Learned that your peak system activity time is around ${peakString}.`,
          category: 'schedule',
        });
      }
    }

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
