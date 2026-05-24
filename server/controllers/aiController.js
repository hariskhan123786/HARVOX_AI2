import Chat from '../models/Chat.js';
import Note from '../models/Note.js';
import Project from '../models/Project.js';
import File from '../models/File.js';
import UserAnalytics from '../models/UserAnalytics.js';
import UserSettings from '../models/UserSettings.js';
import SystemSettings from '../models/SystemSettings.js';
import { PROMPTS } from '../config/prompts.js';
import * as groqService from '../services/groqService.js';
import { incrementUsage } from '../services/usageService.js';
import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const getGroqOptions = async (userId) => {
  const options = {
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 2048,
    apiKey: null,
  };

  try {
    const settings = await UserSettings.findOne({ userId });
    if (settings) {
      if (settings.ai?.model) options.model = settings.ai.model;
      if (settings.ai?.creativity !== undefined) options.temperature = settings.ai.creativity;
      if (settings.ai?.responseLength) {
        options.max_tokens = settings.ai.responseLength === 'short'
          ? 512
          : settings.ai.responseLength === 'long'
          ? 4096
          : 2048;
      }
      if (settings.apiKeys) {
        options.apiKey = settings.apiKeys;
      }
    }
  } catch (err) {
    console.error('Error fetching UserSettings in AI options:', err);
  }

  // Fallback to Admin's Global SystemSettings if no user API key is set
  if (!options.apiKey) {
    try {
      const globalSettings = await SystemSettings.findOne();
      if (globalSettings && globalSettings.groqKey) {
        options.apiKey = globalSettings.groqKey;
      }
    } catch (err) {
      console.error('Error fetching SystemSettings in AI options:', err);
    }
  }

  return options;
};

export const chatAI = async (req, res) => {
  try {
    const { message, chatId, stream } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    let chat = chatId ? await Chat.findOne({ _id: chatId, userId: req.user._id }) : null;
    if (!chat) {
      chat = await Chat.create({
        userId: req.user._id,
        title: message.slice(0, 50),
        messages: [],
      });
    }

    const history = chat.messages.map((m) => ({ role: m.role, content: m.content }));
    history.push({ role: 'user', content: message });

    const groqOptions = await getGroqOptions(req.user._id);

    if (stream) {
      const responseStream = await groqService.chat({
        messages: history,
        systemPrompt: PROMPTS.CHAT_ASSISTANT,
        stream: true,
        ...groqOptions,
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let fullReply = '';
      for await (const chunk of responseStream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullReply += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      chat.messages.push({ role: 'user', content: message });
      chat.messages.push({ role: 'assistant', content: fullReply });
      await chat.save();
      await incrementUsage(req.user._id, 'chats');

      res.write(`data: ${JSON.stringify({ done: true, chat })}\n\n`);
      return res.end();
    }

    const reply = await groqService.chat({
      messages: history,
      systemPrompt: PROMPTS.CHAT_ASSISTANT,
      ...groqOptions,
    });

    chat.messages.push({ role: 'user', content: message });
    chat.messages.push({ role: 'assistant', content: reply });
    await chat.save();
    await incrementUsage(req.user._id, 'chats');

    res.json({ chat, reply });
  } catch (error) {
    res.status(error.code === 'RATE_LIMIT' ? 429 : 500).json({
      message: error.message,
      code: error.code,
    });
  }
};

export const generateCode = async (req, res) => {
  try {
    const { prompt, language, stream } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

    const userMessage = language
      ? `Generate ${language} code for: ${prompt}`
      : prompt;

    const groqOptions = await getGroqOptions(req.user._id);

    if (stream) {
      const responseStream = await groqService.chat({
        messages: [{ role: 'user', content: userMessage }],
        systemPrompt: PROMPTS.CODE_GENERATOR,
        stream: true,
        ...groqOptions,
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let fullReply = '';
      for await (const chunk of responseStream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullReply += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      await incrementUsage(req.user._id, 'codeGen');

      if (req.body.saveNote) {
        await Note.create({
          userId: req.user._id,
          title: prompt.slice(0, 60),
          content: fullReply,
          source: 'code',
        });
      }

      res.write(`data: ${JSON.stringify({ done: true, code: fullReply })}\n\n`);
      return res.end();
    }

    const reply = await groqService.chat({
      messages: [{ role: 'user', content: userMessage }],
      systemPrompt: PROMPTS.CODE_GENERATOR,
      ...groqOptions,
    });

    await incrementUsage(req.user._id, 'codeGen');

    if (req.body.saveNote) {
      await Note.create({
        userId: req.user._id,
        title: prompt.slice(0, 60),
        content: reply,
        source: 'code',
      });
    }

    res.json({ code: reply });
  } catch (error) {
    res.status(500).json({ message: error.message, code: error.code });
  }
};

export const debugCode = async (req, res) => {
  try {
    const { error, code } = req.body;
    const content = `Error/Stack trace:\n${error || 'N/A'}\n\nCode:\n${code || 'N/A'}`;
    const groqOptions = await getGroqOptions(req.user._id);
    const reply = await groqService.chat({
      messages: [{ role: 'user', content }],
      systemPrompt: PROMPTS.DEBUG_ASSISTANT,
      ...groqOptions,
    });
    
    await incrementUsage(req.user._id, 'chats');

    // Sync to UserAnalytics for debugging sessions
    try {
      let analytics = await UserAnalytics.findOne({ userId: req.user._id });
      if (!analytics) {
        analytics = new UserAnalytics({ userId: req.user._id });
      }
      analytics.debuggingSessions += 1;
      analytics.activityLog.push({
        date: new Date(),
        actionType: 'debug',
        details: 'Resolved compiler/runtime crash error',
      });
      if (analytics.activityLog.length > 20) {
        analytics.activityLog.shift();
      }
      await analytics.save();
    } catch (e) {
      console.error('Failed to sync debug session analytics:', e);
    }

    res.json({ analysis: reply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const explainCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Code is required' });
    const groqOptions = await getGroqOptions(req.user._id);
    const reply = await groqService.chat({
      messages: [{ role: 'user', content: code }],
      systemPrompt: PROMPTS.EXPLAIN_CODE,
      ...groqOptions,
    });
    await incrementUsage(req.user._id, 'chats');
    res.json({ explanation: reply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generateProject = async (req, res) => {
  try {
    const { idea, type } = req.body;
    if (!idea) return res.status(400).json({ message: 'Project idea is required' });
    const prompt = `Project type: ${type || 'MERN FYP'}\nIdea: ${idea}`;
    const reply = await groqService.chat({
      messages: [{ role: 'user', content: prompt }],
      systemPrompt: PROMPTS.PROJECT_GENERATOR,
    });
    const project = await Project.create({
      userId: req.user._id,
      projectName: idea.slice(0, 80),
      stack: type || 'MERN',
      description: idea,
      content: reply,
    });
    await incrementUsage(req.user._id, 'projects');
    res.json({ project, content: reply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const analyzeFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const filePath = req.file.path;
    let extractedText = '';
    const ext = path.extname(req.file.originalname).toLowerCase();

    if (ext === '.pdf') {
      const buffer = await fs.readFile(filePath);
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else {
      extractedText = await fs.readFile(filePath, 'utf-8');
    }

    const { action, question } = req.body;
    let userPrompt = `Document content:\n\n${extractedText.slice(0, 12000)}`;
    if (action === 'summarize') {
      userPrompt = `Summarize this document:\n\n${extractedText.slice(0, 12000)}`;
    } else if (action === 'notes') {
      userPrompt = `Generate study notes from this document:\n\n${extractedText.slice(0, 12000)}`;
    } else if (action === 'question' && question) {
      userPrompt = `Based on this document, answer: ${question}\n\nDocument:\n${extractedText.slice(0, 12000)}`;
    }

    const analysis = await groqService.chat({
      messages: [{ role: 'user', content: userPrompt }],
      systemPrompt: PROMPTS.FILE_ANALYZER,
    });

    const fileRecord = await File.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      fileUrl: req.file.filename,
      mimeType: req.file.mimetype,
      analysis,
      extractedText: extractedText.slice(0, 5000),
    });

    await incrementUsage(req.user._id, 'files');
    await fs.unlink(filePath).catch(() => {});

    res.json({ file: fileRecord, analysis });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
