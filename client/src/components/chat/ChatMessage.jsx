import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Bot, User } from 'lucide-react';

export default function ChatMessage({ role, content }) {
  const isAi = role === 'assistant';

  return (
    <div className={`flex items-start space-x-4 mb-6 ${isAi ? '' : 'flex-row-reverse space-x-reverse'}`}>
      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
        isAi 
          ? 'bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-neon-purple/50' 
          : 'bg-white/5 border border-white/10'
      }`}>
        {isAi ? <Bot className="w-6 h-6 text-neon-blue" /> : <User className="w-6 h-6 text-muted" />}
      </div>
      
      <div className={`flex-1 rounded-2xl p-4 shadow-xl backdrop-blur-sm ${
        isAi 
          ? 'bg-primary/50 border border-white/5' 
          : 'bg-white/5 border border-white/10'
      }`}>
        <div className="prose prose-invert max-w-none text-sm">
          <ReactMarkdown
            components={{
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-xl !bg-[#0d1117] border border-white/10 my-4 shadow-inner"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-white/10 text-neon-pink rounded px-1.5 py-0.5" {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
