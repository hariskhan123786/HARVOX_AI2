/**
 * HARVOX Automation Engine — Study Module
 * Skills: Generate notes, MCQs, flashcards, and log study progress for BSCS
 * Phase 13.3 — Study Assistant
 */

import Note from '../../../models/Note.js';
import LearningTrack from '../../../models/LearningTrack.js';
import { logActivity } from '../../memoryService.js';
import { registerModule } from '../automationRegistry.js';
import * as aiProviderManager from '../../aiProviderManager.js';
import { getAIOptions } from '../../../controllers/ai/chatController.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_DIR = path.resolve(__dirname, '../../../../uploads/workspace');

// ─── Generate Notes ───────────────────────────────────────────────────────────

async function generateNotes(userId, args) {
  const topic = args[0] || 'Machine Learning';
  const subject = args[1] || 'AI'; // AI, Database, Software Engineering, etc.
  
  const prompt = `Write detailed, well-structured, and comprehensive BSCS study notes for the topic: "${topic}". Group the content under introduction, core concepts, examples, and key summary points.`;
  const aiOptions = await getAIOptions(userId);

  const result = await aiProviderManager.chat({
    userId,
    messages: [{ role: 'user', content: prompt }],
    systemPrompt: 'You are an elite academic professor in Computer Science. Write detailed, textbook-quality notes in Markdown format.',
    provider: aiOptions.provider,
    model: aiOptions.model,
    temperature: 0.5,
    apiKeys: aiOptions.apiKeys,
  });

  const noteContent = result.text || '';
  
  // Save to Database
  const note = await Note.create({
    userId,
    title: `Notes: ${topic}`,
    content: noteContent,
    source: 'chat',
    tags: [subject, 'study-notes'],
  });

  // Save to Workspace
  const filename = `Notes_${topic.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
  await fs.mkdir(WORKSPACE_DIR, { recursive: true }).catch(() => {});
  await fs.writeFile(path.join(WORKSPACE_DIR, filename), noteContent, 'utf-8');

  await logActivity(userId, 'generate_notes', `Generated notes on "${topic}"`, { subject, noteId: note._id });
  return { 
    success: true, 
    message: `🎓 Study notes for "${topic}" generated successfully. Saved in long-term memory and as workspace file "${filename}".`,
    noteId: note._id,
    file: filename
  };
}

// ─── Generate MCQs ────────────────────────────────────────────────────────────

async function generateMCQs(userId, args) {
  const topic = args[0] || 'SQL Normalization';
  const count = parseInt(args[1] || '5', 10);
  
  const prompt = `Generate exactly ${count} multiple-choice questions (MCQs) for the topic: "${topic}". Each question must have 4 options (A, B, C, D), indicate the correct answer, and provide a brief explanation. Format neatly in Markdown.`;
  const aiOptions = await getAIOptions(userId);

  const result = await aiProviderManager.chat({
    userId,
    messages: [{ role: 'user', content: prompt }],
    systemPrompt: 'You are a Computer Science exam creator. Create rigorous and accurate MCQs with keys and explanations.',
    provider: aiOptions.provider,
    model: aiOptions.model,
    temperature: 0.6,
    apiKeys: aiOptions.apiKeys,
  });

  const mcqContent = result.text || '';

  // Save to Workspace
  const filename = `MCQs_${topic.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
  await fs.mkdir(WORKSPACE_DIR, { recursive: true }).catch(() => {});
  await fs.writeFile(path.join(WORKSPACE_DIR, filename), mcqContent, 'utf-8');

  await logActivity(userId, 'generate_mcqs', `Generated ${count} MCQs on "${topic}"`);
  return { 
    success: true, 
    message: `📝 Generated ${count} MCQs for "${topic}". Saved to workspace as "${filename}".`,
    content: mcqContent,
    file: filename
  };
}

// ─── Generate Flashcards ──────────────────────────────────────────────────────

async function generateFlashcards(userId, args) {
  const topic = args[0] || 'Assembly Registers';
  
  const prompt = `Create a list of 5 study flashcards for the topic: "${topic}". Format each card with a clear "Question / Front" and "Answer / Back".`;
  const aiOptions = await getAIOptions(userId);

  const result = await aiProviderManager.chat({
    userId,
    messages: [{ role: 'user', content: prompt }],
    systemPrompt: 'You are a helpful educational coach. Create clear, concise Q&A style flashcards.',
    provider: aiOptions.provider,
    model: aiOptions.model,
    temperature: 0.5,
    apiKeys: aiOptions.apiKeys,
  });

  const flashcardContent = result.text || '';

  // Save to Database Note
  const note = await Note.create({
    userId,
    title: `Flashcards: ${topic}`,
    content: flashcardContent,
    source: 'chat',
    tags: ['flashcards', topic],
  });

  await logActivity(userId, 'generate_flashcards', `Generated flashcards on "${topic}"`);
  return {
    success: true,
    message: `⚡ Flashcards for "${topic}" created and saved to your Notes.`,
    content: flashcardContent,
    noteId: note._id
  };
}

// ─── Track Study Progress ────────────────────────────────────────────────────

async function logStudy(userId, args) {
  const subject = args[0] || 'AI'; // AI, Database, Software Engineering, Assembly Language
  const hours = parseFloat(args[1] || '1');
  const notes = args[2] || 'Autonomous study session';

  if (!['AI', 'Database', 'Software Engineering', 'Assembly Language'].includes(subject)) {
    throw new Error('Invalid BSCS subject. Choose from: AI, Database, Software Engineering, Assembly Language');
  }

  let track = await LearningTrack.findOne({ userId, subject });
  if (track) {
    track.hours += hours;
    track.notes = notes;
    track.lastStudied = new Date();
    await track.save();
  } else {
    track = await LearningTrack.create({
      userId,
      subject,
      hours,
      notes,
      lastStudied: new Date()
    });
  }

  await logActivity(userId, 'log_learning', `Logged ${hours}h study progress for ${subject}`, { subject, hours });
  return {
    success: true,
    message: `📈 Logged ${hours} hours of study for "${subject}". Total time: ${track.hours} hours.`,
    track
  };
}

// ─── Register Module ──────────────────────────────────────────────────────────

registerModule(
  'study',
  { name: 'Study Assistant', icon: '🎓', description: 'Academic aids — generate notes, MCQs, flashcards, track progress' },
  [
    {
      action: 'generate_notes',
      label: 'Generate Study Notes',
      sensitive: false,
      estimatedMs: 8000,
      voiceAliases: ['generate notes on', 'create notes for', 'make study notes'],
      category: 'academic',
      handler: generateNotes
    },
    {
      action: 'generate_mcqs',
      label: 'Generate MCQs',
      sensitive: false,
      estimatedMs: 6000,
      voiceAliases: ['generate mcqs on', 'create quiz for', 'quiz me on'],
      category: 'academic',
      handler: generateMCQs
    },
    {
      action: 'generate_flashcards',
      label: 'Generate Flashcards',
      sensitive: false,
      estimatedMs: 5000,
      voiceAliases: ['create flashcards on', 'make flashcards for'],
      category: 'academic',
      handler: generateFlashcards
    },
    {
      action: 'log_study',
      label: 'Log Study Progress',
      sensitive: false,
      estimatedMs: 1000,
      voiceAliases: ['log study session', 'track study time'],
      category: 'academic',
      handler: logStudy
    }
  ]
);

console.log('[StudyModule] ✅ Study module registered (notes, MCQs, flashcards, tracking)');
