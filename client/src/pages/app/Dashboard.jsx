import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { chatAPI } from '../../services/api';
import PromptBar from '../../components/dashboard/PromptBar';
import QuickActionCards from '../../components/dashboard/QuickActionCards';
import GlassCard from '../../components/ui/GlassCard';
import HologramOrb from '../../components/ui/HologramOrb';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    chatAPI.list().then(({ data }) => setChats(data.chats?.slice(0, 5) || [])).catch(() => {});
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Developer';

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <p className="text-muted">Hey there, {firstName} 👋</p>
          <h1 className="mt-1 font-orbitron text-2xl font-bold lg:text-3xl">
            How can I help you <span className="gradient-text">today?</span>
          </h1>
          <div className="mt-6 max-w-2xl">
            <PromptBar />
          </div>
        </div>
        <div className="hidden shrink-0 lg:block mt-8">
          <div className="h-48 w-48">
            <HologramOrb />
          </div>
        </div>
      </div>

      <QuickActionCards />

      <GlassCard hover={false}>
        <h2 className="mb-4 font-orbitron text-lg">Recent Chats</h2>
        <div className="space-y-3">
          {chats.length === 0 ? (
            <p className="text-sm text-muted">No chats yet. Start a conversation above!</p>
          ) : (
            chats.map((c) => (
              <Link
                key={c._id}
                to="/app/chat"
                state={{ chatId: c._id }}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 transition hover:border-neon-purple/30"
              >
                <span className="text-sm">{c.title}</span>
                <span className="text-xs text-muted">{new Date(c.updatedAt).toLocaleDateString()}</span>
              </Link>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
