import React, { useState } from 'react';
import XTerm from './XTerm';
import { Terminal as TerminalIcon, Plus, X, Maximize2, Sparkles } from 'lucide-react';
import Holographic3DCard from '../ui/Holographic3DCard';

export default function TerminalPanel() {
  const [tabs, setTabs] = useState([{ id: 1, title: 'bash' }]);
  const [activeTab, setActiveTab] = useState(1);

  const addTab = () => {
    const newId = Math.max(0, ...tabs.map(t => t.id)) + 1;
    setTabs([...tabs, { id: newId, title: 'bash' }]);
    setActiveTab(newId);
  };

  const closeTab = (e, id) => {
    e.stopPropagation();
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTab === id && newTabs.length > 0) {
      setActiveTab(newTabs[newTabs.length - 1].id);
    }
  };

  return (
    <Holographic3DCard className="h-full flex flex-col p-0 overflow-hidden">
      {/* Terminal Header Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 bg-secondary/50 px-2 py-1">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <div 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-t-md cursor-pointer transition-colors ${activeTab === tab.id ? 'bg-[#070B14] text-neon-blue border-t border-neon-blue/50 shadow-[0_-2px_10px_rgba(0,240,255,0.1)]' : 'text-muted hover:text-white hover:bg-white/5'}`}
            >
              <TerminalIcon size={12} />
              {tab.title}
              {tabs.length > 1 && (
                <button onClick={(e) => closeTab(e, tab.id)} className="hover:text-neon-pink ml-1">
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
          <button onClick={addTab} className="p-1.5 text-muted hover:text-white transition-colors">
            <Plus size={14} />
          </button>
        </div>
        
        {/* Terminal Actions */}
        <div className="flex items-center gap-2 px-2 text-muted">
          <button className="hover:text-neon-purple transition-colors flex items-center gap-1 text-xs" title="Ask AI about terminal errors">
            <Sparkles size={14} /> <span className="hidden sm:inline">AI Help</span>
          </button>
          <button className="hover:text-white transition-colors ml-2">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 bg-[#070B14] relative p-1">
        {tabs.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted flex-col gap-4">
            <TerminalIcon size={48} className="opacity-20" />
            <p className="font-orbitron">No active terminal sessions</p>
            <button onClick={addTab} className="px-4 py-2 border border-white/10 rounded-lg hover:border-neon-blue transition-colors text-sm">
              Start new session
            </button>
          </div>
        ) : (
          /* Render active terminal (In a real app, we'd keep them all mounted but hidden to preserve state) */
          <div className="absolute inset-2">
            {tabs.map(tab => (
              <div key={tab.id} className={`h-full w-full ${activeTab === tab.id ? 'block' : 'hidden'}`}>
                {activeTab === tab.id && <XTerm key={tab.id} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </Holographic3DCard>
  );
}
