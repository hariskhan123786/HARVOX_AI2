import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import NeonButton from '../ui/NeonButton';

export default function PromptBar() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/app/chat', { state: { initialPrompt: prompt } });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-purple to-neon-blue rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative flex items-center bg-primary rounded-xl border border-white/10 p-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask me anything, e.g. 'Build a React auth flow'..."
          className="flex-1 bg-transparent border-none outline-none text-white px-4 placeholder:text-muted"
        />
        <NeonButton type="submit" variant="primary" className="py-2 px-4 shrink-0">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate
        </NeonButton>
      </div>
    </form>
  );
}
