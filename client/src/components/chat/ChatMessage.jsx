import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Bot, User } from 'lucide-react';
import TaskPlanWidget from './TaskPlanWidget';

/**
 * SafeMarkdown — wraps ReactMarkdown in try/catch with plain text fallback.
 * Prevents crashes from malformed markdown during streaming.
 */
function SafeMarkdown({ content }) {
  if (!content) return null;

  try {
    return (
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
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
              <code className="bg-white/10 text-purple-300 rounded px-1.5 py-0.5 text-[13px]" {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    );
  } catch {
    // Fallback: render as plain text if markdown parsing crashes
    return (
      <pre className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">
        {content}
      </pre>
    );
  }
}

/**
 * ChatMessage — renders a single chat message with markdown support.
 * @param {string} role — 'user' or 'assistant'
 * @param {string} content — message text content
 * @param {boolean} compact — if true, skips the avatar/bubble wrapper (used inside MessageBubble)
 */
function ChatMessage({ role, content, compact = false }) {
  const isAi = role === 'assistant';
  const safeContent = content || '';

  // Extract task plan if present
  const planRegex = /---TASK_PLAN_START---([\s\S]*?)---TASK_PLAN_END---/;
  const match = safeContent.match(planRegex);
  let plan = null;
  let textContent = safeContent;

  if (match) {
    try {
      plan = JSON.parse(match[1].trim());
      textContent = safeContent.replace(planRegex, ''); // Remove the JSON block from text rendering
    } catch (err) {
      console.error("Failed to parse task plan JSON:", err);
    }
  }

  // Compact mode: just render the markdown content without wrapper
  if (compact) {
    return (
      <div className="prose prose-invert max-w-none text-sm leading-relaxed">
        <SafeMarkdown content={textContent} />
        {plan && <TaskPlanWidget plan={plan} />}
      </div>
    );
  }

  // Full mode with avatar + bubble wrapper
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
          <SafeMarkdown content={textContent} />
          {plan && <TaskPlanWidget plan={plan} />}
        </div>
      </div>
    </div>
  );
}

export default memo(ChatMessage);
