import React, { useState, useEffect } from 'react';
import { automationAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music, Globe, MessageCircle, Mail, FolderOpen, Code2, Target,
  AppWindow, Workflow, Zap, Play, Check, XCircle, Plus, Trash2,
  Settings, History, Terminal, Loader2, ShieldAlert, Volume2,
  VolumeX, Maximize, SkipForward, Subtitles, ThumbsUp, Clock,
  Activity, User, PlusCircle, Sparkles, Send, Keyboard, Cpu
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import NeonButton from '../../components/ui/NeonButton';

// Map icon string names to Lucide icons
const ICON_MAP = {
  Music,
  Globe,
  MessageCircle,
  Mail,
  FolderOpen,
  Code2,
  Target,
  AppWindow,
  Workflow
};

/**
 * Calls the desktop agent running on the user's local machine (localhost:8765).
 * This is needed in production where the server can't run PowerShell/exec.
 */
async function callDesktopAgent(action, args, token, agentPort = 8765) {
  const url = `http://127.0.0.1:${agentPort}/execute`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ step: { action, args } }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Agent returned an error');
    return { success: true, message: data.message || 'Executed on your PC.' };
  } catch (err) {
    if (err.message?.includes('fetch') || err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
      throw new Error(
        '🖥️ Desktop Agent not running!\n\nTo use OS automation, start the agent on your PC:\n' +
        '  cd desktop-agent\n  node agent.mjs'
      );
    }
    throw err;
  }
}

export default function AutomationCenter() {
  const { token } = useAuthStore();
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [history, setHistory] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('skills'); // skills | history | workflows | preferences
  
  // Execution State
  const [command, setCommand] = useState('');
  const [executionPlan, setExecutionPlan] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(-1);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Settings State
  const [musicPref, setMusicPref] = useState('auto');
  const [pomoMin, setPomoMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [waPerm, setWaPerm] = useState(false);
  const [delPerm, setDelPerm] = useState(false);
  const [gitPerm, setGitPerm] = useState(false);

  // Load Initial Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [modulesRes, historyRes, prefsRes, workflowsRes] = await Promise.all([
        automationAPI.getModules(),
        automationAPI.getHistory({ limit: 15 }),
        automationAPI.getPreferences(),
        automationAPI.getWorkflows()
      ]);

      setModules(modulesRes.data?.modules || []);
      setHistory(historyRes.data?.activities || []);
      setPreferences(prefsRes.data?.preferences || null);
      setWorkflows(workflowsRes.data?.workflows || []);

      // Prepopulate form preferences
      if (prefsRes.data?.preferences) {
        const p = prefsRes.data.preferences;
        setMusicPref(p.preferredMusicService || 'auto');
        setPomoMin(p.pomodoroMinutes || 25);
        setBreakMin(p.breakMinutes || 5);
        setWaPerm(p.permissions?.allowWhatsAppSend || false);
        setDelPerm(p.permissions?.allowFileDeletion || false);
        setGitPerm(p.permissions?.allowGitPush || false);
      }
    } catch (err) {
      console.error('Failed to load Automation Engine data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addLog = (text, type = 'info') => {
    setConsoleLogs(prev => [...prev, { text, type, time: new Date().toLocaleTimeString() }]);
  };

  // Quick Action execution (directly execute one step)
  const handleQuickAction = async (action, label, defaultArgs = []) => {
    try {
      addLog(`Initiating quick action: ${label || action}...`, 'info');
      const { data } = await automationAPI.quickAction(action, defaultArgs);

      // ── Production: server returned a desktop-agent proxy instruction ──
      if (data.requiresDesktopAgent) {
        addLog('⚡ Forwarding to your Desktop Agent...', 'info');
        const agentResult = await callDesktopAgent(data.action, data.args, token, data.agentPort);
        addLog(`[Agent] ${agentResult.message}`, 'success');
      } else {
        addLog(`[Success] ${data.message || 'Action executed successfully.'}`, 'success');
        if (data.output) addLog(`[Output] ${data.output}`, 'stdout');
      }

      // Reload history logs
      const historyRes = await automationAPI.getHistory({ limit: 15 });
      setHistory(historyRes.data?.activities || []);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      addLog(`[Error] Action failed: ${errMsg}`, 'error');
    }
  };

  // Smart natural language parser to generate a client-side execution plan
  const handleGeneratePlan = () => {
    if (!command.trim()) return;

    const lowerCmd = command.toLowerCase().trim();
    let title = 'Custom Automation Sequence';
    let steps = [];

    // Rule-based parsing to construct a visual execution plan
    if (lowerCmd.includes('play') && (lowerCmd.includes('spotify') || lowerCmd.includes('playlist'))) {
      const query = command.replace(/play/i, '').replace(/on spotify/i, '').replace(/playlist/i, '').trim();
      title = `Spotify Stream: ${query || 'Music'}`;
      steps = [
        {
          action: 'spotify_play',
          description: `Open Spotify and search for "${query || 'relaxing music'}"`,
          args: [query || 'relaxing music'],
          agent: 'media',
          estimatedMs: 6000
        }
      ];
    } else if (lowerCmd.includes('play') && lowerCmd.includes('youtube')) {
      const query = command.replace(/play/i, '').replace(/on youtube/i, '').replace(/youtube/i, '').trim();
      title = `YouTube: ${query || 'Music'}`;
      steps = [
        {
          action: 'youtube_play',
          description: `Open browser and play "${query || 'lofi hip hop'}" on YouTube`,
          args: [query || 'lofi hip hop'],
          agent: 'media',
          estimatedMs: 8000
        }
      ];
    } else if (lowerCmd.startsWith('play ') || (lowerCmd.includes('play') && (lowerCmd.includes('song') || lowerCmd.includes('music') || lowerCmd.includes('beat') || lowerCmd.includes('mix') || lowerCmd.includes('track')))) {
      // Generic "play [song name]" → YouTube
      const query = command
        .replace(/^play\s+/i, '')
        .replace(/\bsong\b|\bmusic\b|\bfor me\b|\bplease\b/gi, '')
        .trim();
      title = `▶ Playing: ${query || 'Lofi Beats'}`;
      steps = [
        {
          action: 'youtube_play',
          description: `Search YouTube and auto-play "${query || 'lofi hip hop'}"`,
          args: [query || 'lofi hip hop'],
          agent: 'media',
          estimatedMs: 8000
        }
      ];
    } else if (lowerCmd.includes('search') && lowerCmd.includes('google')) {
      const query = lowerCmd.replace(/search google for/i, '').replace(/search/i, '').replace(/on google/i, '').trim();
      title = `Web Search: ${query}`;
      steps = [
        {
          action: 'search_google',
          description: `Search Google for "${query}"`,
          args: [query],
          agent: 'browser',
          estimatedMs: 2000
        }
      ];
    } else if (lowerCmd.includes('whatsapp') || lowerCmd.includes('message')) {
      // Send WhatsApp message: Ali: message text
      let contact = 'Contact';
      let msg = 'Hello!';
      if (lowerCmd.includes('to')) {
        const parts = command.split(/to/i);
        const contactPart = parts[1]?.trim().split(/[:\s]/);
        contact = contactPart ? contactPart[0] : 'Contact';
        msg = command.substring(command.toLowerCase().indexOf(contact.toLowerCase()) + contact.length).trim().replace(/^:/, '').trim();
      }
      title = `Send WhatsApp to ${contact}`;
      steps = [
        {
          action: 'whatsapp_open_chat',
          description: `Locate contact and open chat window with "${contact}"`,
          args: [contact],
          agent: 'whatsapp',
          estimatedMs: 3000
        },
        {
          action: 'whatsapp_send_message',
          description: `Preview and send message: "${msg}"`,
          args: [contact, msg],
          agent: 'whatsapp',
          sensitive: true,
          estimatedMs: 8000
        }
      ];
    } else if (lowerCmd.includes('folder') || lowerCmd.includes('mkdir') || lowerCmd.includes('directory')) {
      const folderName = lowerCmd.replace(/create folder/i, '').replace(/mkdir/i, '').replace(/create directory/i, '').trim() || 'new-folder';
      title = `Workspace Scaffolding: Create "${folderName}"`;
      steps = [
        {
          action: 'file_create_folder',
          description: `Create directory "${folderName}" in active workspace`,
          args: [folderName],
          agent: 'file',
          estimatedMs: 1000
        }
      ];
    } else if (lowerCmd.includes('pomodoro') || lowerCmd.includes('timer')) {
      const mins = lowerCmd.match(/\d+/) ? lowerCmd.match(/\d+/)[0] : '25';
      title = `Start Focus Timer: ${mins} minutes`;
      steps = [
        {
          action: 'pomodoro_start',
          description: `Activate Pomodoro timer for ${mins} minutes`,
          args: [mins],
          agent: 'productivity',
          estimatedMs: 2000
        }
      ];
    } else if (lowerCmd.includes('focus')) {
      title = 'DND Focus Mode';
      steps = [
        {
          action: 'focus_mode_enable',
          description: 'Close all distracting applications and silent workspace',
          args: [],
          agent: 'productivity',
          estimatedMs: 3000
        }
      ];
    } else if (lowerCmd.includes('study')) {
      title = 'Study Mode Activation';
      steps = [
        {
          action: 'study_mode_enable',
          description: 'Activate study mode (VS Code, close social apps)',
          args: [],
          agent: 'productivity',
          estimatedMs: 5000
        }
      ];
    } else if (lowerCmd.includes('clean') || lowerCmd.includes('organize') || lowerCmd.includes('downloads')) {
      title = 'System Hygiene: Organize Downloads';
      steps = [
        {
          action: 'file_organize_downloads',
          description: 'Organize Windows Downloads folder by file category',
          args: [],
          agent: 'file',
          estimatedMs: 5000
        }
      ];
    } else if (lowerCmd.includes('readme')) {
      title = 'Generate Documentation';
      steps = [
        {
          action: 'dev_generate_readme',
          description: 'Generate README.md and write to workspace root',
          args: ['my-app', 'AI-powered project developed with HARVOX'],
          agent: 'developer',
          estimatedMs: 2000
        }
      ];
    } else {
      // Generic Web search or open app fallback
      title = `Launch Workflow: ${command}`;
      steps = [
        {
          action: 'search_google',
          description: `Search Google for "${command}"`,
          args: [command],
          agent: 'browser',
          estimatedMs: 2000
        }
      ];
    }

    setExecutionPlan({ title, steps });
    setConsoleLogs([]);
    setShowPlanModal(true);
  };

  const handleRunPlan = async () => {
    if (!executionPlan) return;
    setIsExecuting(true);
    setShowPlanModal(false);
    setActiveTab('skills');
    setConsoleLogs([]);
    
    addLog(`Uplinking planned sequence: "${executionPlan.title}"...`, 'info');

    for (let i = 0; i < executionPlan.steps.length; i++) {
      setCurrentStepIdx(i);
      const step = executionPlan.steps[i];
      addLog(`Running step ${i + 1}/${executionPlan.steps.length}: ${step.description}`, 'info');

      try {
        const { data } = await automationAPI.executeStep(step);

        // ── Production: server returned a desktop-agent proxy instruction ──
        if (data.requiresDesktopAgent) {
          addLog('⚡ Forwarding to your Desktop Agent...', 'info');
          const agentResult = await callDesktopAgent(data.action, data.args, token, data.agentPort);
          addLog(`Step ${i + 1} completed via agent: ${agentResult.message}`, 'success');
        } else {
          addLog(`Step ${i + 1} completed: ${data.message || 'Done'}`, 'success');
          if (data.output) addLog(`[Output] ${data.output}`, 'stdout');
        }
      } catch (err) {
        const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
        addLog(`[Fault] Step ${i + 1} failed: ${errMsg}`, 'error');
        setIsExecuting(false);
        setCurrentStepIdx(-1);
        return;
      }
    }

    setIsExecuting(false);
    setCurrentStepIdx(-1);
    addLog('All steps in sequence executed successfully.', 'success');
    
    // Refresh history
    const historyRes = await automationAPI.getHistory({ limit: 15 });
    setHistory(historyRes.data?.activities || []);
  };

  // Settings Save
  const handleSaveSettings = async () => {
    try {
      addLog('Saving automation preferences...', 'info');
      await automationAPI.savePreferences({
        preferredMusicService: musicPref,
        pomodoroMinutes: pomoMin,
        breakMinutes: breakMin,
        permissions: {
          allowWhatsAppSend: waPerm,
          allowFileDeletion: delPerm,
          allowGitPush: gitPerm
        }
      });
      addLog('Automation preferences saved successfully.', 'success');
      loadData();
    } catch (err) {
      addLog(`Failed to save preferences: ${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-[#F8FAFC] p-6 space-y-6 select-none font-sans relative overflow-hidden pb-16">
      
      {/* Background Neural Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/10 via-[#020617] to-[#020617] pointer-events-none" />
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 relative z-10">
        <div>
          <span className="text-[10px] font-orbitron font-bold tracking-[0.25em] text-[#be5cf6] uppercase block">
            AI Operating System
          </span>
          <h1 className="text-2xl font-orbitron font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-[#be5cf6] to-[#ff007f]">
            HARVOX Automation Engine
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-3 py-1.5 rounded-xl text-[10px] font-mono">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
            <span>ENGINE STATUS: ACTIVE</span>
          </div>
          <button 
            onClick={loadData}
            className="p-2 border border-white/5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all"
            title="Reload Data"
          >
            <Activity size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Console Box (Command Input) */}
      <div className="grid grid-cols-1 gap-6 relative z-10">
        <GlassCard hover={false} className="border-[#be5cf6]/20 bg-[#0e0a1b]/40">
          <div className="flex flex-col md:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <Keyboard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Enter automation command (e.g. 'Play relaxing music on Spotify', 'Start 25 min Pomodoro', 'Organize downloads')..."
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGeneratePlan()}
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs font-mono placeholder-gray-700 text-white focus:outline-none focus:border-[#be5cf6]/50 focus:shadow-[0_0_15px_rgba(190,92,246,0.1)] transition-all"
              />
            </div>
            <NeonButton variant="primary" onClick={handleGeneratePlan} className="font-orbitron font-bold text-[11px] tracking-wider py-3">
              <Sparkles size={13} />
              COMPILE PLAN
            </NeonButton>
          </div>
        </GlassCard>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-2 relative z-10">
        {[
          { id: 'skills', label: 'Engine Skills', icon: Zap },
          { id: 'history', label: 'Telemetry Logs', icon: History },
          { id: 'workflows', label: 'Saved Workflows', icon: Workflow },
          { id: 'preferences', label: 'Guard Policies', icon: Settings },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-orbitron font-bold tracking-wider rounded-xl transition-all ${
              activeTab === t.id
                ? 'bg-[#be5cf6]/10 text-[#be5cf6] border border-[#be5cf6]/25'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
            }`}
          >
            <t.icon size={12} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Main View Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 items-start">
        
        {/* Left 2 Columns: Tabs Content */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* 1. SKILLS TAB */}
            {activeTab === 'skills' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Module Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modules.map(mod => {
                    const Icon = ICON_MAP[mod.icon] || Zap;
                    const isSelected = selectedModule?.moduleName === mod.moduleName;
                    
                    return (
                      <div 
                        key={mod.moduleName}
                        onClick={() => setSelectedModule(isSelected ? null : mod)}
                      >
                        <GlassCard 
                          hover 
                          className={`border-white/5 transition-all ${
                            isSelected ? 'border-[#be5cf6]/40 shadow-[0_0_15px_rgba(190,92,246,0.1)]' : ''
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div 
                              className="p-3 rounded-xl border shrink-0" 
                              style={{ 
                                backgroundColor: `${mod.color || '#be5cf6'}0d`, 
                                borderColor: `${mod.color || '#be5cf6'}25`,
                                color: mod.color || '#be5cf6'
                              }}
                            >
                              <Icon size={18} />
                            </div>
                            <div className="space-y-1">
                              <h3 className="font-orbitron font-black text-xs text-white tracking-wide">
                                {mod.name}
                              </h3>
                              <p className="text-[10px] text-gray-500 leading-normal">
                                {mod.description}
                              </p>
                              <span className="text-[8px] font-mono text-gray-600 block uppercase pt-1">
                                {mod.skills.length} skills registered
                              </span>
                            </div>
                          </div>
                        </GlassCard>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Module Detail Panel */}
                {selectedModule && (
                  <GlassCard hover={false} className="border-white/10 bg-[#0e0a1b]/20">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                      <div>
                        <span className="text-[8px] font-mono text-[#be5cf6] block uppercase font-bold">ACTIVE REGISTRY MODULE</span>
                        <h2 className="font-orbitron font-black text-sm text-white">{selectedModule.name} Skills</h2>
                      </div>
                      <button 
                        onClick={() => setSelectedModule(null)} 
                        className="text-xs text-gray-500 hover:text-white"
                      >
                        Close [x]
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedModule.skills.map(skill => (
                        <div 
                          key={skill.action}
                          className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 hover:border-[#be5cf6]/20 transition-all group"
                        >
                          <div>
                            <p className="text-[11px] font-bold text-gray-300">{skill.label}</p>
                            <span className="text-[8px] font-mono text-gray-600 block uppercase">
                              Action: {skill.action}
                            </span>
                            {skill.sensitive && (
                              <span className="inline-block text-[7px] font-orbitron font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-1 py-0.5 rounded mt-1">
                                ⚠️ GUARD CONFIRMATION
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleQuickAction(skill.action, skill.label)}
                            className="p-2 bg-[#be5cf6]/10 text-[#be5cf6] border border-[#be5cf6]/20 hover:bg-[#be5cf6] hover:text-black rounded-lg transition-all"
                            title="Execute Action Directly"
                          >
                            <Play size={10} fill="currentColor" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}
              </motion.div>
            )}

            {/* 2. HISTORY TAB */}
            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <GlassCard hover={false}>
                  <h3 className="font-orbitron font-bold text-xs text-white mb-4">Telemetry Logs & Activities</h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin pr-2">
                    {history.map(item => (
                      <div 
                        key={item._id}
                        className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                            <Activity size={12} className="text-gray-400" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-gray-300">{item.summary}</p>
                            <span className="text-[8px] font-mono text-gray-600 uppercase block">
                              Action: {item.action} • {new Date(item.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {history.length === 0 && (
                      <p className="text-[10px] text-gray-600 text-center py-8">No automation telemetry logged yet.</p>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* 3. WORKFLOWS TAB */}
            {activeTab === 'workflows' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <GlassCard hover={false}>
                  <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                    <h3 className="font-orbitron font-bold text-xs text-white">Saved Multi-Step Workflows</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workflows.map(flow => (
                      <GlassCard key={flow._id} className="border-white/10 bg-[#0e0a1b]/10">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-orbitron font-bold text-xs text-[#be5cf6]">{flow.name}</h4>
                            <p className="text-[10px] text-gray-500 leading-normal">{flow.description}</p>
                          </div>
                        </div>
                        <div className="space-y-1 mb-4 border-t border-white/5 pt-2">
                          {flow.steps.map((st, sIdx) => (
                            <div key={sIdx} className="text-[9px] font-mono text-gray-500 flex items-center gap-1.5">
                              <span className="text-[#00f0ff]">0{sIdx + 1}</span>
                              <span className="truncate">{st.description}</span>
                            </div>
                          ))}
                        </div>
                        <NeonButton
                          variant="secondary"
                          onClick={() => {
                            setExecutionPlan({ title: flow.name, steps: flow.steps });
                            setConsoleLogs([]);
                            setShowPlanModal(true);
                          }}
                          className="w-full text-[9px] font-orbitron tracking-wider py-1.5"
                        >
                          <Play size={10} fill="currentColor" />
                          RUN WORKFLOW
                        </NeonButton>
                      </GlassCard>
                    ))}
                    
                    {/* Add Custom Workflow Placeholder */}
                    <GlassCard hover className="border-dashed border-white/10 flex flex-col items-center justify-center py-10">
                      <PlusCircle size={24} className="text-gray-600 mb-2" />
                      <span className="text-[10px] font-orbitron text-gray-500">Record Custom Workflow</span>
                      <p className="text-[8px] text-gray-600 text-center max-w-[160px] leading-normal mt-1">
                        Use chat voice commands to automatically record custom tasks
                      </p>
                    </GlassCard>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* 4. PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <GlassCard hover={false}>
                  <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-6">
                    <h3 className="font-orbitron font-bold text-xs text-white">System Guard & Safety Policies</h3>
                  </div>

                  <div className="space-y-6">
                    {/* Guard Policies */}
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-orbitron font-bold tracking-wider text-[#be5cf6] uppercase">Execution Guards</h4>
                      
                      <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                        <div>
                          <p className="text-[11px] font-bold text-gray-300">WhatsApp Dispatch Guard</p>
                          <p className="text-[9px] text-gray-500">Require operator verification before transmitting WhatsApp payloads.</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={!waPerm} 
                          onChange={(e) => setWaPerm(!e.target.checked)} 
                          className="w-4 h-4 accent-[#be5cf6]"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                        <div>
                          <p className="text-[11px] font-bold text-gray-300">Destructive File Operations Guard</p>
                          <p className="text-[9px] text-gray-500">Block or request confirmation for directory delete / unlink actions.</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={!delPerm} 
                          onChange={(e) => setDelPerm(!e.target.checked)}
                          className="w-4 h-4 accent-[#be5cf6]"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                        <div>
                          <p className="text-[11px] font-bold text-gray-300">GitHub Remote Sync Guard</p>
                          <p className="text-[9px] text-gray-500">Force operator validation before pushing repository trees upstream.</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={!gitPerm} 
                          onChange={(e) => setGitPerm(!e.target.checked)}
                          className="w-4 h-4 accent-[#be5cf6]"
                        />
                      </div>
                    </div>

                    {/* App Config */}
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-orbitron font-bold tracking-wider text-[#be5cf6] uppercase">Preference Defaults</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-orbitron uppercase text-gray-500 block">Default Streaming Platform</label>
                          <select 
                            value={musicPref} 
                            onChange={(e) => setMusicPref(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#be5cf6]/50"
                          >
                            <option value="auto">Auto-detect Spotify/YouTube</option>
                            <option value="spotify">Spotify Client</option>
                            <option value="youtube">YouTube Web</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-orbitron uppercase text-gray-500 block">Focus Period (Min)</label>
                            <input 
                              type="number" 
                              value={pomoMin} 
                              onChange={(e) => setPomoMin(Number(e.target.value))}
                              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#be5cf6]/50"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-orbitron uppercase text-gray-500 block">Break Period (Min)</label>
                            <input 
                              type="number" 
                              value={breakMin} 
                              onChange={(e) => setBreakMin(Number(e.target.value))}
                              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#be5cf6]/50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4">
                      <NeonButton variant="primary" onClick={handleSaveSettings} className="font-orbitron font-bold text-[10px] tracking-wider">
                        SAVE CONFIG POLICIES
                      </NeonButton>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Execution Output Console */}
        <div className="space-y-6">
          <GlassCard hover={false} className="border-white/5 bg-black/30">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-[#be5cf6]" />
                <span className="font-orbitron font-bold text-[10px] tracking-wider text-white">Execution Console</span>
              </div>
              {consoleLogs.length > 0 && (
                <button 
                  onClick={() => setConsoleLogs([])} 
                  className="text-[9px] font-mono text-gray-500 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Console Log Area */}
            <div className="h-96 bg-black/60 border border-white/5 rounded-xl p-3 overflow-y-auto font-mono text-[9px] space-y-1 scrollbar-thin select-text">
              {consoleLogs.map((log, i) => (
                <div 
                  key={i} 
                  className={`leading-relaxed whitespace-pre-wrap ${
                    log.type === 'success' 
                      ? 'text-green-400' 
                      : log.type === 'error'
                      ? 'text-rose-400 font-bold'
                      : log.type === 'stdout'
                      ? 'text-cyan-400 pl-2 border-l border-cyan-500/25'
                      : 'text-gray-400'
                  }`}
                >
                  <span className="text-gray-700 mr-1.5">[{log.time}]</span>
                  {log.text}
                </div>
              ))}

              {isExecuting && (
                <div className="flex items-center gap-1.5 text-cyan-400 animate-pulse mt-2">
                  <Loader2 size={10} className="animate-spin" />
                  <span>Processing neural pipeline step...</span>
                </div>
              )}

              {consoleLogs.length === 0 && (
                <div className="text-gray-700 text-center py-20">
                  <Terminal size={18} className="mx-auto opacity-30 mb-2" />
                  <span>Console idle. Submit command or action above.</span>
                </div>
              )}
            </div>

            {/* Running Step Details */}
            {isExecuting && currentStepIdx !== -1 && executionPlan && (
              <div className="mt-4 p-3 rounded-xl bg-[#be5cf6]/5 border border-[#be5cf6]/20">
                <span className="text-[8px] font-orbitron font-bold tracking-wider text-[#be5cf6] uppercase block">
                  EXECUTING STEP {currentStepIdx + 1} OF {executionPlan.steps.length}
                </span>
                <p className="text-xs font-semibold text-white mt-1">
                  {executionPlan.steps[currentStepIdx].description}
                </p>
                <div className="mt-2 bg-white/5 h-1.5 w-full rounded-full overflow-hidden">
                  <div 
                    className="bg-[#be5cf6] h-full transition-all duration-300"
                    style={{ width: `${((currentStepIdx + 1) / executionPlan.steps.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Plan Preview Approval Modal */}
      {showPlanModal && executionPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0b0816] border border-[#be5cf6]/35 rounded-2xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(190,92,246,0.15)] relative overflow-hidden">
            
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#be5cf6] to-transparent" />
            
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <ShieldAlert size={16} />
              <span className="text-[9px] font-orbitron font-bold tracking-widest uppercase">Operator Auth Required</span>
            </div>

            <h3 className="font-orbitron font-black text-sm text-white tracking-wide mb-3">
              {executionPlan.title}
            </h3>

            {/* Steps list */}
            <div className="space-y-2 mb-6">
              {executionPlan.steps.map((st, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-black/40 border border-white/5 text-left items-start">
                  <span className="text-[10px] font-mono text-gray-500 mt-0.5">0{i + 1}</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[11px] font-semibold text-gray-300">{st.description}</p>
                      {st.sensitive && (
                        <span className="text-[7px] font-orbitron font-bold text-red-400 border border-red-400/25 px-1 py-0.2 rounded bg-red-400/5">
                          SENSITIVE
                        </span>
                      )}
                    </div>
                    <span className="text-[8px] font-mono text-gray-600 block uppercase mt-0.5">
                      Action: {st.action} ({st.args.join(', ') || 'no arguments'})
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
              <button
                onClick={() => setShowPlanModal(false)}
                className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-[10px] font-orbitron font-bold tracking-wider text-gray-400 hover:text-white transition-all"
              >
                ABORT PLAN
              </button>
              <button
                onClick={handleRunPlan}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#be5cf6] hover:bg-[#a844de] text-black font-orbitron font-black text-[10px] tracking-wider rounded-xl shadow-lg shadow-[#be5cf6]/10 transition-all hover:scale-102"
              >
                <Play size={10} fill="currentColor" />
                ALLOW UPLINK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
