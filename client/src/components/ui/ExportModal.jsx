import { useState } from 'react';
import { Download, Copy, X } from 'lucide-react';
import GlassCard from './GlassCard';
import NeonButton from './NeonButton';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

export default function ExportModal({ onClose, messages, title }) {
  const [exporting, setExporting] = useState(false);

  const exportAsText = () => {
    const text = messages.map(m => `${m.role.toUpperCase()}:\n${m.content}\n\n`).join('---\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${title || 'chat'}-export.txt`);
    onClose();
  };

  const exportAsPDF = async () => {
    setExporting(true);
    try {
      const element = document.getElementById('chat-messages-container');
      if (!element) return;
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0A0A10' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${title || 'chat'}-export.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <GlassCard className="w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <h3 className="text-xl font-bold mb-6 flex items-center">
          <Download className="w-5 h-5 mr-2 text-neon-blue" />
          Export Chat
        </h3>
        
        <div className="space-y-4">
          <NeonButton variant="outline" className="w-full justify-center text-sm" onClick={exportAsText}>
            <Copy className="w-4 h-4 mr-2" />
            Export as Text (.txt)
          </NeonButton>
          
          <NeonButton variant="primary" className="w-full justify-center text-sm" onClick={exportAsPDF} disabled={exporting}>
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Generating PDF...' : 'Export as PDF'}
          </NeonButton>
        </div>
      </GlassCard>
    </div>
  );
}
