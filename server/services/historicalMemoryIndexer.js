import { supabase } from '../config/supabase.js';
import { summarizeConversationAndExtractMemories } from './postChatSummarizer.js';

// In-memory status tracker for user indexing tasks
const indexerStatus = new Map();

/**
 * HARVOX AI — First Login Historical Chat Memory Indexer
 * Scans all historical conversations belonging exclusively to the authenticated user,
 * extracts memories, removes duplicates, and populates the Memory Core in background.
 */
export function getIndexerStatus(userId) {
  return indexerStatus.get(userId) || { status: 'idle', progress: 0, processedSessions: 0, totalSessions: 0 };
}

export function setIndexerStatus(userId, update) {
  const current = getIndexerStatus(userId);
  indexerStatus.set(userId, { ...current, ...update });
}

export async function runHistoricalChatIndexer(userId, options = {}) {
  const status = getIndexerStatus(userId);
  if (status.status === 'running' && !options.force) {
    return status;
  }

  try {
    setIndexerStatus(userId, { status: 'running', progress: 5, processedSessions: 0 });

    // Fetch user's chat sessions
    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('id, title')
      .eq('user_id', userId);

    if (error || !sessions || sessions.length === 0) {
      setIndexerStatus(userId, { status: 'completed', progress: 100, processedSessions: 0, totalSessions: 0 });
      return getIndexerStatus(userId);
    }

    const totalSessions = sessions.length;
    setIndexerStatus(userId, { totalSessions });

    for (let i = 0; i < sessions.length; i++) {
      // Check if paused or cancelled
      const currentStatus = getIndexerStatus(userId);
      if (currentStatus.status === 'paused') {
        return currentStatus;
      }
      if (currentStatus.status === 'cancelled') {
        setIndexerStatus(userId, { status: 'idle', progress: 0, processedSessions: 0 });
        return getIndexerStatus(userId);
      }

      const session = sessions[i];
      await summarizeConversationAndExtractMemories(userId, session.id);

      const processed = i + 1;
      const progress = Math.min(99, Math.round((processed / totalSessions) * 100));
      setIndexerStatus(userId, { processedSessions: processed, progress });
    }

    setIndexerStatus(userId, { status: 'completed', progress: 100 });
    return getIndexerStatus(userId);
  } catch (err) {
    console.error('[HistoricalMemoryIndexer] Error running historical indexer:', err.message);
    setIndexerStatus(userId, { status: 'error', error: err.message });
    return getIndexerStatus(userId);
  }
}
