import { useState } from 'react';
import { Play, Copy, Check } from 'lucide-react';
import NeonButton from './NeonButton';
import GlassCard from './GlassCard';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeExecutor({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassCard className="overflow-hidden mt-4">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <span className="text-xs font-mono text-muted uppercase">{language || 'code'}</span>
        <div className="flex space-x-2">
          <button onClick={handleCopy} className="p-1.5 text-muted hover:text-white transition-colors" title="Copy code">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
        <SyntaxHighlighter
          language={language || 'javascript'}
          style={vscDarkPlus}
          customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </GlassCard>
  );
}
