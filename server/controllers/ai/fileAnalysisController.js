import { PROMPTS } from '../../config/prompts.js';
import * as aiProviderManager from '../../services/aiProviderManager.js';
import { incrementUsage } from '../../services/usageService.js';
import { getAIOptions } from './chatController.js';
import { supabase } from '../../config/supabase.js';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import path from 'path';

export const analyzeFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const buffer = req.file.buffer; // multer.memoryStorage()
    let extractedText = '';
    const ext = path.extname(req.file.originalname).toLowerCase();

    if (ext === '.pdf') {
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      extractedText = buffer.toString('utf-8');
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

    // Save file record in Supabase
    const { data: fileRecord, error: insertErr } = await supabase
      .from('uploaded_files')
      .insert({
        user_id: req.user._id,
        file_name: req.file.originalname,
        file_url: '',
        mime_type: req.file.mimetype,
        analysis: result.text,
        extracted_text: extractedText.slice(0, 5000),
      })
      .select('*')
      .single();

    if (insertErr) throw insertErr;

    await incrementUsage(req.user._id, 'files');

    res.json({
      file: {
        _id: fileRecord.id,
        fileName: fileRecord.file_name,
        fileUrl: fileRecord.file_url,
        mimeType: fileRecord.mime_type,
        analysis: fileRecord.analysis,
        extractedText: fileRecord.extracted_text,
        createdAt: fileRecord.created_at,
      },
      analysis: result.text,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
