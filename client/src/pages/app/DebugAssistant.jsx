import { useState } from 'react';
import { aiAPI } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import NeonButton from '../../components/ui/NeonButton';
import { Bug, Send, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function DebugAssistant() {
  const [errorMsg, setErrorMsg] = useState('');
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDebug = async () => {
    if (!errorMsg && !code) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await aiAPI.debug({ error: errorMsg, code });
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <Bug className="w-8 h-8 text-neon-pink" />
        <h1 className="text-3xl font-bold">Debug Assistant</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <GlassCard className="p-4">
            <label className="block text-sm font-medium text-muted mb-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
              Error Message / Stack Trace
            </label>
            <textarea
              value={errorMsg}
              onChange={(e) => setErrorMsg(e.target.value)}
              className="w-full h-32 bg-primary/50 border border-white/10 rounded-lg p-3 text-white font-mono text-sm resize-none outline-none focus:border-neon-pink/50 transition-colors"
              placeholder="Paste the error message here..."
            />
          </GlassCard>

          <GlassCard className="p-4">
            <label className="block text-sm font-medium text-muted mb-2">
              Problematic Code
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-64 bg-primary/50 border border-white/10 rounded-lg p-3 text-white font-mono text-sm resize-none outline-none focus:border-neon-pink/50 transition-colors"
              placeholder="Paste the relevant code here..."
            />
          </GlassCard>

          <NeonButton 
            variant="outline" 
            className="w-full justify-center border-neon-pink text-neon-pink hover:bg-neon-pink/10"
            onClick={handleDebug}
            disabled={loading || (!errorMsg && !code)}
          >
            {loading ? 'Analyzing...' : (
              <>
                <Bug className="w-5 h-5 mr-2" />
                Find the Bug
              </>
            )}
          </NeonButton>
          
          {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
        </div>

        <GlassCard className="p-6 h-full flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-neon-blue">AI Analysis & Fix</h2>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {analysis ? (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg !bg-[#0D1117] border border-white/10 my-4"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-white/10 rounded px-1.5 py-0.5" {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {analysis}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted opacity-50 flex-col">
                <Bug className="w-16 h-16 mb-4" />
                <p>Provide an error and code to get a detailed fix.</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
