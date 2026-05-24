import { useState, useRef } from 'react';
import { aiAPI } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import NeonButton from '../../components/ui/NeonButton';
import { FileUp, File, Settings, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function FileAnalyzer() {
  const [file, setFile] = useState(null);
  const [action, setAction] = useState('summarize');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', action);
    if (action === 'question') {
      formData.append('question', question);
    }

    try {
      const { data } = await aiAPI.analyzeFile(formData);
      setResult(data.analysis);
    } catch (err) {
      setResult(err.response?.data?.message || 'Error analyzing file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <FileUp className="w-8 h-8 text-neon-purple" />
        <h1 className="text-3xl font-bold">Document Analyzer</h1>
      </div>

      <GlassCard className="p-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column: Controls */}
          <div className="space-y-6">
            <div 
              className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-neon-purple/50 transition-colors cursor-pointer bg-primary/30"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.md,.json"
              />
              <File className="w-12 h-12 mx-auto mb-4 text-muted" />
              {file ? (
                <div>
                  <p className="text-white font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <>
                  <p className="text-white font-medium mb-1">Click to upload a document</p>
                  <p className="text-xs text-muted">Supports PDF, DOCX, TXT, MD (Max 10MB)</p>
                </>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-muted">Analysis Type</label>
              <div className="grid grid-cols-2 gap-3">
                {['summarize', 'notes', 'question'].map((opt) => (
                  <div
                    key={opt}
                    onClick={() => setAction(opt)}
                    className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
                      action === opt 
                        ? 'bg-neon-purple/20 border-neon-purple text-white' 
                        : 'bg-primary/50 border-white/10 text-muted hover:border-white/30'
                    }`}
                  >
                    <span className="capitalize">{opt}</span>
                  </div>
                ))}
              </div>
            </div>

            {action === 'question' && (
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Your Question</label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="input-neon"
                  placeholder="What is this document about?"
                />
              </div>
            )}

            <NeonButton 
              variant="primary" 
              className="w-full justify-center" 
              onClick={handleAnalyze}
              disabled={!file || loading || (action === 'question' && !question)}
            >
              {loading ? (
                'Analyzing Document...'
              ) : (
                <>
                  <Settings className="w-5 h-5 mr-2" /> Start Analysis
                </>
              )}
            </NeonButton>
          </div>

          {/* Right Column: Results */}
          <div className="bg-primary/30 border border-white/10 rounded-xl p-6 h-[500px] flex flex-col">
            <h2 className="text-lg font-medium mb-4 text-neon-purple border-b border-white/10 pb-2">
              Results
            </h2>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {result ? (
                <div className="prose prose-invert max-w-none text-sm">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted opacity-50">
                  Select a file and click analyze to see results here.
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
