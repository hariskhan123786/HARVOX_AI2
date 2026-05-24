import { useState } from 'react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { aiAPI } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import NeonButton from '../../components/ui/NeonButton';
import LoadingOrb from '../../components/ui/LoadingOrb';
import ChatMessage from '../../components/chat/ChatMessage';
import { useAuthStore } from '../../store/authStore';
import PremiumLockOverlay from '../../components/ui/PremiumLockOverlay';

const types = ['MERN FYP', 'Full Stack Web', 'Mobile App', 'AI/ML Project', 'Desktop App'];

export default function ProjectGenerator() {
  const { user } = useAuthStore();
  const isPro = user?.subscription === 'pro' || user?.role === 'admin';

  if (!isPro) {
    return (
      <PremiumLockOverlay
        featureName="AI Project Generator"
        description="Scaffold complete, industry-standard project templates and auto-generated repository structures."
      />
    );
  }

  const [idea, setIdea] = useState('');
  const [type, setType] = useState('MERN FYP');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async (e) => {
    e.preventDefault();
    if (!idea.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const { data } = await aiAPI.project({ idea, type });
      setResult(data.content);
    } catch (err) {
      setResult(err.response?.data?.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const download = async () => {
    try {
      const zip = new JSZip();
      
      // Save the full AI generated plan as README.md
      zip.file("README.md", result);

      // Extract all file blocks matching: **File: path**\n```lang\ncontent\n```
      const fileRegex = /\*\*File:\s*(.+?)\*\*\s*\n*```[a-zA-Z0-9_\-+]*\s*\n([\s\S]*?)```/g;
      
      let match;
      while ((match = fileRegex.exec(result)) !== null) {
        const filePath = match[1].trim();
        const fileContent = match[2].trim();
        zip.file(filePath, fileContent);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, `harvox-project-${Date.now()}.zip`);
    } catch (err) {
      console.error("Error creating zip:", err);
      // Fallback
      saveAs(new Blob([result], { type: 'text/markdown' }), `harvox-project-${Date.now()}.md`);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="font-orbitron text-2xl font-bold">Project Generator</h1>
      <GlassCard hover={false}>
        <form onSubmit={generate} className="space-y-4">
          <select value={type} onChange={(e) => setType(e.target.value)} className="input-neon">
            {types.map((t) => (
              <option key={t} value={t} className="bg-secondary">{t}</option>
            ))}
          </select>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your FYP idea or project concept..."
            className="input-neon min-h-[120px]"
            required
          />
          <NeonButton type="submit" disabled={loading}>Generate Project Plan</NeonButton>
        </form>
      </GlassCard>
      {loading && <LoadingOrb text="Architecting your project..." />}
      {result && (
        <GlassCard hover={false}>
          <div className="mb-3 flex justify-end">
            <NeonButton variant="secondary" onClick={download} className="text-xs">Download Plan</NeonButton>
          </div>
          <ChatMessage role="assistant" content={result} />
        </GlassCard>
      )}
    </div>
  );
}
