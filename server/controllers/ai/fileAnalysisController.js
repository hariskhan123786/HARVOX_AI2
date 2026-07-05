import File from '../../models/File.js';
import { PROMPTS } from '../../config/prompts.js';
import * as aiProviderManager from '../../services/aiProviderManager.js';
import { incrementUsage } from '../../services/usageService.js';
import { getAIOptions } from './chatController.js';
import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

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

    const aiOptions = await getAIOptions(req.user._id);

    const result = await aiProviderManager.chat({
      userId: req.user._id,
      messages: [{ role: 'user', content: userPrompt }],
      systemPrompt: PROMPTS.FILE_ANALYZER,
      provider: aiOptions.provider,
      model: aiOptions.model,
      temperature: aiOptions.temperature,
      max_tokens: aiOptions.max_tokens,
      stream: false,
      apiKeys: aiOptions.apiKeys,
    });

    const fileRecord = await File.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      fileUrl: req.file.filename,
      mimeType: req.file.mimetype,
      analysis: result.text,
      extractedText: extractedText.slice(0, 5000),
    });

    await incrementUsage(req.user._id, 'files');
    await fs.unlink(filePath).catch(() => {});

    res.json({ file: fileRecord, analysis: result.text });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
