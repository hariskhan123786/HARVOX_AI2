import React, { useState } from 'react';
import { automationAPI } from '../../services/api';
import { 
  CheckCircle2, XCircle, Play, Check, AlertTriangle, 
  Terminal, ShieldCheck, Loader2, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


const AGENT_BADGES = {
  ceo: { label: 'CEO AGENT', style: 'border-[#fbbf24] text-[#fbbf24] bg-[#fbbf24]/5 shadow-[0_0_8px_rgba(251,191,36,0.15)]' },
  ui: { label: 'UI AGENT', style: 'border-[#be5cf6] text-[#be5cf6] bg-[#be5cf6]/5 shadow-[0_0_8px_rgba(190,92,246,0.15)]' },
  dev: { label: 'DEVELOPER AGENT', style: 'border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/5 shadow-[0_0_8px_rgba(0,240,255,0.15)]' },
  research: { label: 'RESEARCH AGENT', style: 'border-[#34d399] text-[#34d399] bg-[#34d399]/5 shadow-[0_0_8px_rgba(52,211,153,0.15)]' },
  deploy: { label: 'DEPLOYMENT AGENT', style: 'border-[#f87171] text-[#f87171] bg-[#f87171]/5 shadow-[0_0_8px_rgba(248,113,113,0.15)]' },
};

export default function TaskPlanWidget({ plan }) {
  const [steps, setSteps] = useState(
    plan.steps.map(step => ({ ...step, status: 'pending_approval' }))
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [planState, setPlanState] = useState('pending_approval'); // pending_approval, executing, completed, denied, failed
  const [consoleLogs, setConsoleLogs] = useState([]);

  const addLog = (text, type = 'info') => {
    setConsoleLogs(prev => [...prev, { text, type, time: new Date().toLocaleTimeString() }]);
  };

  const handleDeny = () => {
    setPlanState('denied');
    setSteps(prev => prev.map(s => ({ ...s, status: 'denied' })));
    addLog('Operator denied execution permission request.', 'error');
  };

  const handleAllow = async () => {
    setPlanState('executing');
    addLog('Operator granted permission. Initiating task sequence...', 'success');
    
    // Set all steps to pending
    const resetSteps = steps.map(s => ({ ...s, status: 'pending' }));
    setSteps(resetSteps);
    
    executeStepSequence(resetSteps, 0);
  };

  const executeStepSequence = async (currentSteps, index) => {
    if (index >= currentSteps.length) {
      setPlanState('completed');
      addLog('Task plan execution sequence completed successfully.', 'success');
      return;
    }

    setCurrentStepIndex(index);
    
    // Mark current step as running
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, status: 'running' } : s));
    const step = currentSteps[index];
    addLog(`Running step ${index + 1}/${currentSteps.length}: ${step.description}...`, 'info');

    try {
      // Execute the step using the automation API
      const { data } = await automationAPI.executeStep(step);
      
      // Update step status to completed
      setSteps(prev => prev.map((s, i) => i === index ? { ...s, status: 'completed' } : s));
      
      if (data.output) {
        addLog(`[STDOUT] ${data.output}`, 'stdout');
      }
      addLog(`Step ${index + 1} completed.`, 'success');
      
      // Proceed to the next step
      executeStepSequence(
        currentSteps.map((s, i) => i === index ? { ...s, status: 'completed' } : s),
        index + 1
      );
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Unknown execution failure';
      
      // Update step status to failed
      setSteps(prev => prev.map((s, i) => i === index ? { ...s, status: 'failed' } : s));
      setPlanState('failed');
      addLog(`Execution failed at step ${index + 1}: ${errMsg}`, 'error');
      
      if (err.response?.data?.error) {
        addLog(`[STDERR] ${err.response.data.error}`, 'error');
      }
    }
  };

  return (
    <div className="my-4 border border-purple-500/20 bg-[#0e0a1b]/60 backdrop-blur-md rounded-2xl p-5 shadow-[0_0_30px_rgba(138,43,226,0.1)] relative overflow-hidden">
      
      {/* Laser Top Glow Grid */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#be5cf6] to-transparent" />

      {/* Plan Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[9px] font-orbitron font-bold tracking-widest text-[#be5cf6] uppercase block">
            Neural Task Planning Engine
          </span>
          <h4 className="font-orbitron font-black text-sm text-white tracking-wide mt-0.5">
            {plan.title || 'Execute Automation Plan'}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {planState === 'pending_approval' && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded-lg animate-pulse">
              <ShieldCheck size={11} />
              AWAITING UPLINK PERMISSION
            </span>
          )}
          {planState === 'executing' && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-neon-blue bg-neon-blue/10 border border-neon-blue/20 px-2.5 py-1 rounded-lg">
              <Loader2 size={11} className="animate-spin" />
              EXECUTING
            </span>
          )}
          {planState === 'completed' && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-lg">
              <Check size={11} />
              COMPLETED SUCCESSFULLY
            </span>
          )}
          {planState === 'denied' && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">
              <XCircle size={11} />
              OPERATOR DENIED
            </span>
          )}
          {planState === 'failed' && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-400/10 border border-rose-400/20 px-2.5 py-1 rounded-lg">
              <AlertTriangle size={11} />
              SEQUENCE FAULT
            </span>
          )}
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-2 mb-4">
        {steps.map((step, idx) => (
          <div 
            key={step.id || idx}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
              idx === currentStepIndex 
                ? 'bg-purple-950/20 border-neon-purple/30 shadow-[0_0_15px_rgba(138,43,226,0.1)]' 
                : step.status === 'completed'
                ? 'bg-green-950/5 border-green-500/10'
                : step.status === 'failed'
                ? 'bg-rose-950/5 border-rose-500/15'
                : 'bg-[#120e24]/40 border-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-gray-600">0{idx + 1}</span>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className={`text-xs font-semibold leading-none ${idx === currentStepIndex ? 'text-white' : 'text-gray-400'}`}>
                    {step.description}
                  </p>
                  {step.agent && AGENT_BADGES[step.agent.toLowerCase()] && (
                    <span className={`text-[7px] font-orbitron font-bold border px-1.5 py-0.5 rounded-md ${AGENT_BADGES[step.agent.toLowerCase()].style} shrink-0`}>
                      {AGENT_BADGES[step.agent.toLowerCase()].label}
                    </span>
                  )}
                </div>
                <span className="text-[8px] font-mono text-gray-600 block uppercase">
                  Action: {step.action} ({step.args?.join(', ') || 'no arguments'})
                </span>
              </div>
            </div>

            <div className="flex items-center shrink-0">
              {step.status === 'pending_approval' && (
                <span className="text-[8px] font-mono text-yellow-500/60 uppercase">Needs Auth</span>
              )}
              {step.status === 'pending' && (
                <span className="text-[8px] font-mono text-gray-600 uppercase">Queued</span>
              )}
              {step.status === 'running' && (
                <Loader2 size={13} className="text-neon-blue animate-spin" />
              )}
              {step.status === 'completed' && (
                <CheckCircle2 size={13} className="text-green-400" />
              )}
              {step.status === 'failed' && (
                <XCircle size={13} className="text-rose-400" />
              )}
              {step.status === 'denied' && (
                <span className="text-[8px] font-mono text-rose-500/50 uppercase">Cancelled</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Console log drawer */}
      {consoleLogs.length > 0 && (
        <div className="mb-4 bg-[#080510] border border-white/5 rounded-xl p-3 max-h-36 overflow-y-auto font-mono text-[10px] space-y-1 scrollbar-thin">
          <div className="flex items-center gap-1.5 text-gray-500 border-b border-white/5 pb-1 mb-1.5">
            <Terminal size={10} />
            <span>Plan Execution Console Logs</span>
          </div>
          {consoleLogs.map((log, i) => (
            <div 
              key={i} 
              className={`leading-relaxed whitespace-pre-wrap ${
                log.type === 'success' 
                  ? 'text-green-400' 
                  : log.type === 'error'
                  ? 'text-rose-400'
                  : log.type === 'stdout'
                  ? 'text-cyan-400 pl-2 border-l border-cyan-500/20'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-gray-700 mr-1.5">[{log.time}]</span>
              {log.text}
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons for approval */}
      {planState === 'pending_approval' && (
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <p className="text-[10px] text-gray-500 max-w-xs leading-normal">
            HARVOX AI requires permission to execute these commands on your PC. Allowing will launch tasks.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDeny}
              className="px-4 py-2 border border-rose-950/20 bg-rose-950/10 hover:bg-rose-950/20 text-rose-400 rounded-xl text-[10px] font-orbitron font-bold tracking-widest transition-all"
            >
              DENY
            </button>
            <button
              onClick={handleAllow}
              className="flex items-center gap-1 px-5 py-2 bg-green-500 text-black hover:bg-green-400 rounded-xl text-[10px] font-orbitron font-black tracking-widest shadow-lg shadow-green-500/10 transition-all hover:scale-102"
            >
              ALLOW PLAN <ArrowRight size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
