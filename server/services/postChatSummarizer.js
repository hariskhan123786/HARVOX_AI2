import { supabase } from '../config/supabase.js';
import { getAIOptions } from '../controllers/aiController.js';
import * as groqService from './groqService.js';
import * as geminiService from './geminiService.js';

/**
 * HARVOX AI — Post-Chat Automatic Memory Learning Pipeline
 * Analyzes conversation messages, extracts user goals, coding style, framework choices,
 * productivity habits, ignoring greetings/temporary chatter, and updates the Memory Core.
 */
export async function summarizeConversationAndExtractMemories(userId, sessionId) {
  try {
    if (!userId || !sessionId) return;

    // Fetch the chat session and messages
    const { data: messages, error: msgErr } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(30);

    if (msgErr || !messages || messages.length < 2) return;

    // Build plain text exchange
    const chatTranscript = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content.slice(0, 500)}`)
      .join('\n');

    // Fetch AI provider options
    const aiOptions = await getAIOptions(userId);
    const aiService = aiOptions.provider === 'gemini' ? geminiService : groqService;

    const systemPrompt = `You are HARVOX Memory Extractor. Analyze this conversation transcript and extract persistent user information.
IGNORE: Greetings (hello, hi, thanks), temporary queries, one-time debug requests.
EXTRACT:
- User Goals (long term / current project goals)
- Coding Style & Preferences (languages, frameworks, tabs/spaces, design patterns)
- Favorite AI Models / Themes / Tools
- Productivity Habits & Workflow Preferences

Return ONLY a valid JSON array of memory objects with format:
[
  {
    "category": "goals" | "coding_style" | "preferences" | "project",
    "key": "short_unique_key_snake_case",
    "title": "Human readable short title",
    "value": "Exact memory value or summary statement",
    "content": "Detailed context explanation",
    "tags": ["tag1", "tag2"],
    "importance_score": 0.8,
    "confidence_score": 0.9
  }
]
If nothing worth persisting, return [].`;

    const reply = await aiService.chat({
      messages: [{ role: 'user', content: `Transcript:\n${chatTranscript}` }],
      systemPrompt,
      model: aiOptions.model,
      temperature: 0.2,
      max_tokens: 1024,
      apiKey: aiOptions.apiKey,
    });

    let cleanReply = reply.trim().replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
    let extracted = [];
    try {
      extracted = JSON.parse(cleanReply);
    } catch {
      extracted = [];
    }

    if (!Array.isArray(extracted) || extracted.length === 0) return;

    // Upsert extracted memories into brain_memory
    for (const item of extracted) {
      if (!item.key || !item.value || !item.category) continue;

      // Check if memory key already exists for user
      const { data: existing } = await supabase
        .from('brain_memory')
        .select('id, value, importance_score')
        .eq('user_id', userId)
        .eq('key', item.key)
        .maybeSingle();

      if (existing) {
        // Update existing record
        await supabase
          .from('brain_memory')
          .update({
            value: item.value,
            title: item.title || item.key,
            content: item.content || String(item.value),
            tags: item.tags || ['chat_auto'],
            importance_score: item.importance_score || 0.7,
            confidence_score: item.confidence_score || 0.85,
            last_accessed: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        // Insert new record
        await supabase.from('brain_memory').insert({
          user_id: userId,
          category: item.category,
          key: item.key,
          value: item.value,
          title: item.title || item.key,
          content: item.content || String(item.value),
          tags: item.tags || ['chat_auto'],
          importance_score: item.importance_score || 0.7,
          confidence_score: item.confidence_score || 0.85,
          source: 'chat_auto',
          is_pinned: false,
          archived: false,
        });
      }
    }
  } catch (err) {
    console.error('[PostChatSummarizer] Auto-learning extraction failed:', err.message);
  }
}
