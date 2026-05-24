import { useNavigate } from 'react-router-dom';
import { Code2, BookOpen, Bug, MessageSquare } from 'lucide-react';
import Holographic3DCard from '../ui/Holographic3DCard';

const actions = [
  { icon: Code2, title: 'Code Generator', desc: 'Generate code in seconds.', path: '/app/code-generator', color: 'text-neon-purple' },
  { icon: BookOpen, title: 'Explain Code', desc: 'Understand any code.', path: '/app/chat', state: { mode: 'explain' }, color: 'text-neon-blue' },
  { icon: Bug, title: 'Debug Code', desc: 'Find & fix errors instantly.', path: '/app/debug', color: 'text-neon-pink' },
  { icon: MessageSquare, title: 'AI Chat', desc: 'General AI conversation.', path: '/app/chat', color: 'text-neon-blue' },
];

export default function QuickActionCards() {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((a) => (
        <div key={a.title} onClick={() => navigate(a.path, { state: a.state })}>
          <Holographic3DCard className="h-full">
            <a.icon className={`mb-3 ${a.color}`} size={24} />
            <h3 className="font-orbitron text-sm font-semibold">{a.title}</h3>
            <p className="mt-1 text-xs text-muted">{a.desc}</p>
          </Holographic3DCard>
        </div>
      ))}
    </div>
  );
}
