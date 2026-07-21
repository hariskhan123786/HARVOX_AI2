import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { profileAPI, authAPI } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import NeonButton from '../../components/ui/NeonButton';
import PerformanceMonitor from '../../components/performance/PerformanceMonitor';
import { 
  Award, Shield, Terminal, Zap, Cpu, BarChart2, 
  Activity, Star, User, History, CheckCircle, Flame, Target, Lock, Crown, Info
} from 'lucide-react';

function RadarChart({ level }) {
  // Center (100, 100), radius 60
  // Categories: Logic, Speed, Debugging, Security, Subagents
  const stats = [
    { name: 'LOGIC', val: 0.90 },
    { name: 'SPEED', val: 0.85 },
    { name: 'DEBUG', val: 0.75 },
    { name: 'SECURE', val: 0.70 },
    { name: 'AGENT', val: 0.60 }
  ];

  const cx = 100;
  const cy = 100;
  const r = 58;

  // Helper to get coordinates
  const getCoords = (index, val = 1) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    return {
      x: cx + r * val * Math.cos(angle),
      y: cy + r * val * Math.sin(angle)
    };
  };

  // Outer grid ring coordinates
  const gridCoords = [0.25, 0.5, 0.75, 1].map((scale) => {
    return Array.from({ length: 5 }).map((_, i) => getCoords(i, scale));
  });

  // Skill polygon points
  const points = stats.map((s, i) => {
    const { x, y } = getCoords(i, s.val);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-[#050811]/60 rounded-xl border border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-10 pointer-events-none" />
      <svg viewBox="0 0 200 200" className="w-full max-w-[155px] drop-shadow-[0_0_8px_rgba(0,240,255,0.15)] overflow-visible">
        {/* Draw background grid lines */}
        {gridCoords.map((ring, idx) => (
          <polygon
            key={idx}
            points={ring.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.75"
          />
        ))}
        
        {/* Draw axis lines from center */}
        {Array.from({ length: 5 }).map((_, i) => {
          const outer = getCoords(i, 1);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="0.75"
            />
          );
        })}

        {/* Skill Area Polygon */}
        <polygon
          points={points}
          fill="rgba(0, 240, 255, 0.12)"
          stroke="url(#radarGrad)"
          strokeWidth="1.5"
          className="animate-[pulse_3s_ease-in-out_infinite]"
        />

        {/* Categories Labels */}
        {stats.map((s, i) => {
          const labelCoords = getCoords(i, 1.22);
          // Adjust position offsets based on angle
          let textAnchor = 'middle';
          let dy = '0.35em';
          if (i === 1 || i === 2) textAnchor = 'start';
          if (i === 3 || i === 4) textAnchor = 'end';
          if (i === 0) dy = '-0.3em';
          if (i === 2 || i === 3) dy = '0.9em';

          return (
            <text
              key={i}
              x={labelCoords.x}
              y={labelCoords.y}
              textAnchor={textAnchor}
              dy={dy}
              fill="rgba(184, 192, 204, 0.65)"
              fontSize="8"
              fontWeight="bold"
              className="font-orbitron tracking-wider text-[8px]"
            >
              {s.name}
            </text>
          );
        })}

        <defs>
          <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8A2BE2" />
            <stop offset="100%" stopColor="#00F0FF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuthStore();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const { loadUser } = useAuthStore();

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Avatar = reader.result;
        await authAPI.updateProfile({ avatar: base64Avatar });
        await loadUser(); // Re-fetch user to get the new avatar in global state
      } catch (err) {
        console.error('Failed to update avatar', err);
        alert('Failed to update avatar');
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await profileAPI.getData();
        setProfileData(data);
      } catch (err) {
        console.error('Failed to load profile intelligence data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Compute values dynamically from database
  const userXP = profileData?.achievements?.xp !== undefined ? profileData.achievements.xp : 86400;
  const userLevel = profileData?.achievements?.level !== undefined ? profileData.achievements.level : 42;
  
  // Calculate level based on XP
  const xpInCurrentLevel = userXP % 1000;
  const xpNeededForNextLevel = 1000 - xpInCurrentLevel;
  const progressionPercent = (xpInCurrentLevel / 1000) * 100;

  const totalChats = profileData?.analytics?.totalChats !== undefined ? profileData.analytics.totalChats : 12492;
  const generatedCodeCount = profileData?.analytics?.generatedCodeCount !== undefined ? profileData.analytics.generatedCodeCount : 452;
  const debuggingSessions = profileData?.analytics?.debuggingSessions !== undefined ? profileData.analytics.debuggingSessions : 9;
  
  const codeLinesFormatted = generatedCodeCount > 999 ? `${(generatedCodeCount / 1000).toFixed(1)}M` : `${generatedCodeCount}K`;
  const timeSavedHours = debuggingSessions * 15 > 0 ? `${debuggingSessions * 15}h` : '142h';

  const userRolePill = user?.role === 'admin' ? 'ELITE ADMIN' : user?.subscription === 'pro' ? 'PRO ARCHITECT' : 'ELITE ARCHITECT';

  const dbBadges = profileData?.achievements?.badges || [];
  
  const achievements = [
    { title: 'Debug Master', desc: 'Resolved 20+ runtime crashes', progress: '20/20', icon: Shield, color: 'text-neon-pink', border: 'border-neon-pink/30', unlocked: true },
    { title: 'AI Explorer', desc: 'Used all models in AI Chat', progress: '5/5', icon: Zap, color: 'text-neon-blue', border: 'border-neon-blue/30', unlocked: true },
    { title: 'Coding Pro', desc: 'Generated 1000+ lines of React', progress: '1k/1k', icon: Terminal, color: 'text-neon-purple', border: 'border-neon-purple/30', unlocked: true },
    { title: 'Productivity King', desc: 'Active for 7 consecutive days', progress: '7/7', icon: Award, color: 'text-amber-400', border: 'border-amber-400/30', unlocked: true },
    // Locked badges
    { title: 'Agent Overlord', desc: 'Deploy 5 autonomous subagents', progress: '2/5', icon: Cpu, color: 'text-muted/40', border: 'border-white/5', unlocked: false },
    { title: 'Voice Commander', desc: 'Speak for 2 hours with Aura link', progress: '0.4/2h', icon: Lock, color: 'text-muted/40', border: 'border-white/5', unlocked: false },
    { title: 'Project Master', desc: 'Download 10 custom MERN setups', progress: '3/10', icon: Lock, color: 'text-muted/40', border: 'border-white/5', unlocked: false },
    { title: 'Elite Contributor', desc: 'Unlock all 60 cognitive honors', progress: '24/60', icon: Lock, color: 'text-muted/40', border: 'border-white/5', unlocked: false },
  ];

  dbBadges.forEach((dbBadge, index) => {
    if (index < 4) {
      achievements[index].title = dbBadge.name || achievements[index].title;
      achievements[index].desc = dbBadge.description || achievements[index].desc;
    }
  });

  const dbActivityLog = profileData?.analytics?.activityLog || [];
  const activities = dbActivityLog.length > 0 
    ? dbActivityLog.map(log => {
        const timeDiff = Math.abs(new Date() - new Date(log.date));
        const mins = Math.floor(timeDiff / (1000 * 60));
        const hours = Math.floor(mins / 60);
        let timeStr = 'Just now';
        if (hours > 24) timeStr = `${Math.floor(hours / 24)}d ago`;
        else if (hours > 0) timeStr = `${hours}h ago`;
        else if (mins > 0) timeStr = `${mins}m ago`;
        
        let tags = ['AI'];
        if (log.actionType === 'code_gen') tags = ['REACT', 'CODE'];
        else if (log.actionType === 'debug') tags = ['DEBUG', 'ERROR'];
        else if (log.actionType === 'upload') tags = ['FILE', 'SCAN'];
        else if (log.actionType === 'project') tags = ['MERN', 'FYP'];
        
        return {
          time: timeStr,
          type: log.actionType?.toUpperCase() || 'AI ACTION',
          action: log.details,
          target: tags[0],
          tags
        };
      })
    : [
        { time: '2h ago', type: 'COGNITIVE REFAC', action: 'Generated 2.4k lines of optimized Rust code for high-throughput data pipelines.', target: 'RUST', tags: ['RUST', 'NEBULA-V2'] },
        { time: '6h ago', type: 'HONOR ACQUIRED', action: 'Achieved master proficiency in 10+ programming languages through AI-assisted development.', target: 'AI', tags: ['POLYGLOT'] },
        { time: 'Yesterday', type: 'VOICE MATRIX', action: 'Successfully fine-tuned the Nebula Forge Voice Assistant for semantic precision.', target: 'VOICE', tags: ['AURA-MODEL'] },
      ];

  const handleClaimTrophy = () => {
    alert('Matrix synchronized! Digital Asset (Cyber Trophy) claimed and binded to your neural address.');
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-orbitron text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-neon">
          OPERATOR PROFILE
        </h1>
        <p className="text-xs text-muted">Core diagnostics, level progression indices, and credential metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2-Span on Desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Holographic User identity header card */}
          <GlassCard hover={false} className="border-neon-purple/20 bg-secondary/40 p-6 relative overflow-hidden">
            {/* Corner cybernetic accents */}
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-neon-blue/20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-neon-purple/20 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              
              {/* Glowing Avatar with Laser Scanning Effect */}
              <div className="relative group shrink-0">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-neon blur opacity-40 group-hover:opacity-60 transition duration-500"></div>
                <div className="relative w-24 h-24 rounded-2xl border border-neon-blue/30 bg-[#070b14]/90 p-1 flex items-center justify-center overflow-hidden">
                  
                  {/* Cyber Laser Scanner */}
                  <div className="absolute left-0 w-full h-[2px] bg-neon-blue/80 shadow-[0_0_8px_rgba(0,240,255,0.8)] animate-scanLine pointer-events-none z-10" />

                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Operator Avatar" 
                      className={`h-full w-full object-cover rounded-xl ${uploadingAvatar ? 'opacity-50' : ''}`}
                      onError={(e) => { e.target.src = "https://api.dicebear.com/7.x/bottts/svg?seed=Kaelen"; }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 flex flex-col items-center justify-center">
                      <User className={`w-10 h-10 text-neon-blue ${uploadingAvatar ? 'opacity-50' : ''}`} />
                    </div>
                  )}
                  {/* Cyber Dot circle */}
                  <div className="absolute inset-0 border border-white/5 border-dashed rounded-xl animate-[spin_40s_linear_infinite]" />
                  
                  {/* Hover Overlay for Upload */}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl z-20">
                    <span className="text-[9px] font-orbitron font-bold text-white uppercase tracking-widest text-center whitespace-pre-line">
                      {uploadingAvatar ? 'UPLOADING...' : 'CHANGE\nAVATAR'}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploadingAvatar} />
                  </label>
                </div>
              </div>

              {/* User Identity Parameters */}
              <div className="space-y-3 text-center md:text-left flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <h2 className="font-orbitron text-xl font-bold tracking-widest text-white">
                    {user?.name || 'Kaelen_Forge'}
                  </h2>
                  <span className="inline-block px-3 py-0.5 rounded text-[9px] font-orbitron font-bold tracking-widest bg-amber-400/10 border border-amber-400/30 text-amber-400 uppercase w-fit mx-auto md:mx-0">
                    {userRolePill}
                  </span>
                </div>
                
                <p className="text-xs text-muted font-poppins leading-relaxed max-w-xl">
                  {user?.bio || 'Mastering the nebula of code and logic since v1.2. Currently ranked in the top 0.4% of global developers.'}
                </p>

                {/* Neural Address & Badges */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
                  <div className="font-mono text-[9px] text-muted/50 bg-black/40 border border-white/5 rounded-lg px-2.5 py-1 select-none">
                    NEURAL ADDR: <span className="text-neon-blue">HN-{userXP.toString(16).substring(0, 6).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-neon-purple/30 bg-neon-purple/10 text-neon-purple font-orbitron text-[10px] font-bold">
                    <Zap size={11} className="text-neon-pink" />
                    LVL {userLevel}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-orbitron text-[10px] font-bold">
                    <Star size={11} />
                    {userXP.toLocaleString()} XP
                  </div>
                </div>

                {/* Compact account summary keeps core profile information scannable. */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-left">
                  <div className="rounded-lg border border-white/5 bg-black/15 px-3 py-2">
                    <p className="text-[8px] font-mono tracking-widest text-gray-600">ACCOUNT EMAIL</p>
                    <p className="mt-1 truncate text-[10px] font-medium text-gray-300">{user?.email || 'Not connected'}</p>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-black/15 px-3 py-2">
                    <p className="text-[8px] font-mono tracking-widest text-gray-600">WORKSPACE</p>
                    <p className="mt-1 flex items-center gap-1.5 text-[10px] font-medium text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online</p>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-black/15 px-3 py-2">
                    <p className="text-[8px] font-mono tracking-widest text-gray-600">MEMBERSHIP</p>
                    <p className="mt-1 text-[10px] font-medium text-neon-blue capitalize">{user?.subscription || 'Free'} plan</p>
                  </div>
                </div>
              </div>

            </div>
          </GlassCard>

          {/* Performance Stats Cards with Vector Sparklines */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Stat 1 */}
            <GlassCard hover={true} className="border-white/5 py-4 px-5 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-orbitron tracking-widest text-muted uppercase">AI Interactions</p>
                <div className="w-7 h-7 rounded-lg bg-neon-blue/10 flex items-center justify-center border border-neon-blue/30 text-neon-blue">
                  <Terminal size={14} />
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="font-orbitron text-2xl font-bold tracking-wider text-white">
                    {totalChats.toLocaleString()}
                  </p>
                  <span className="text-[9px] font-mono font-bold text-emerald-400 flex items-center gap-1 mt-1">
                    <Flame size={10} />
                    +12% vs last week
                  </span>
                </div>
                {/* SVG Sparkline */}
                <svg className="w-16 h-8 text-neon-blue opacity-50 pr-1 shrink-0" viewBox="0 0 60 20">
                  <path d="M0,15 Q10,5 20,12 T40,6 T60,10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </GlassCard>

            {/* Stat 2 */}
            <GlassCard hover={true} className="border-white/5 py-4 px-5 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-orbitron tracking-widest text-muted uppercase">Code Lines Generated</p>
                <div className="w-7 h-7 rounded-lg bg-neon-purple/10 flex items-center justify-center border border-neon-purple/30 text-neon-purple">
                  <Cpu size={14} />
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="font-orbitron text-2xl font-bold tracking-wider text-white">
                    {codeLinesFormatted}
                  </p>
                  <span className="text-[9px] font-mono font-bold text-emerald-400 flex items-center gap-1 mt-1">
                    <CheckCircle size={10} />
                    Top 1% Global
                  </span>
                </div>
                {/* SVG Sparkline */}
                <svg className="w-16 h-8 text-neon-purple opacity-50 pr-1 shrink-0" viewBox="0 0 60 20">
                  <path d="M0,18 Q15,8 30,14 T60,2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </GlassCard>

            {/* Stat 3 */}
            <GlassCard hover={true} className="border-white/5 py-4 px-5 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-orbitron tracking-widest text-muted uppercase">Processing Time Saved</p>
                <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center border border-amber-400/30 text-amber-400">
                  <BarChart2 size={14} />
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="font-orbitron text-2xl font-bold tracking-wider text-white">
                    {timeSavedHours}
                  </p>
                  <span className="text-[9px] font-mono font-bold text-amber-400 flex items-center gap-1 mt-1">
                    <Activity size={10} />
                    98.4 Efficiency
                  </span>
                </div>
                {/* SVG Sparkline */}
                <svg className="w-16 h-8 text-amber-400 opacity-50 pr-1 shrink-0" viewBox="0 0 60 20">
                  <path d="M0,16 Q10,12 25,6 T45,14 T60,8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </GlassCard>

          </div>

          {/* Recent Pulse Timeline */}
          <GlassCard hover={false} className="border-white/5 p-6">
            <div className="flex justify-between items-center mb-5 pb-2 border-b border-white/5">
              <h3 className="font-orbitron text-sm font-semibold tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-neon-blue animate-pulse" /> Recent Pulse
              </h3>
              <button className="text-[10px] font-orbitron font-semibold tracking-widest text-neon-blue hover:text-neon-pink transition-all uppercase cursor-pointer">
                View All
              </button>
            </div>

            <div className="space-y-5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
              {activities.map((act, i) => (
                <div key={i} className="flex gap-4 items-start text-xs relative pl-8">
                  {/* Glowing timeline dot */}
                  <div className="absolute left-[9px] top-1.5 w-1.5 h-1.5 rounded-full bg-neon-blue border border-[#070B14] shadow-[0_0_8px_#00F0FF]" />
                  
                  <span className="font-mono text-muted text-[10px] w-20 shrink-0 pt-0.5">{act.time}</span>
                  
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] font-orbitron font-bold text-neon-purple tracking-widest">{act.type}</span>
                      
                      <div className="flex gap-1">
                        {act.tags?.map(tag => (
                          <span key={tag} className="text-[8px] font-mono bg-secondary/80 text-muted border border-white/5 px-1 py-0.25 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-white font-poppins text-xs font-medium leading-relaxed">
                      {act.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

        {/* Right Column Section */}
        <div className="lg:col-span-1 space-y-6">
          <PerformanceMonitor />
          
          {/* Combined Progression & Skill Radar Matrix */}
          <GlassCard hover={false} className="border-white/5 p-6 space-y-5">
            <div>
              <h3 className="font-orbitron text-xs font-semibold tracking-widest text-muted uppercase">
                Operator Progression
              </h3>
            </div>
            
            <div className="space-y-3.5">
              <div className="flex justify-between items-end">
                <span className="font-orbitron text-xs font-bold text-white">Level {userLevel}</span>
                <span className="text-[9px] font-mono text-muted">{xpNeededForNextLevel.toLocaleString()} XP to Lvl {userLevel + 1}</span>
              </div>
              
              {/* Cyber Progress Bar */}
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-white/5 p-[1px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressionPercent}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full"
                />
              </div>
            </div>

            {/* SVG Skills Radar Chart */}
            <div className="pt-2">
              <p className="text-[9px] font-orbitron tracking-widest text-muted/40 uppercase mb-3 text-center">Neural Skill Matrix</p>
              <RadarChart level={userLevel} />
            </div>

            {/* Progression details */}
            <div className="pt-3 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-neon-purple/10 flex items-center justify-center border border-neon-purple/20 text-neon-purple shrink-0">
                    <Target size={13} />
                  </div>
                  <div>
                    <p className="font-orbitron text-[9px] font-bold text-white leading-normal">Weekly Goal</p>
                    <p className="text-[8px] text-muted leading-none">50 AI Chats</p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-neon-blue">42/50</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center border border-amber-400/20 text-amber-400 shrink-0">
                    <Flame size={13} />
                  </div>
                  <div>
                    <p className="font-orbitron text-[9px] font-bold text-white leading-normal">Streak</p>
                    <p className="text-[8px] text-muted leading-none">Daily login index</p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-amber-400">14 Days</span>
              </div>
            </div>
          </GlassCard>

          {/* Achievements Grid with Interactive Progress */}
          <GlassCard hover={false} className="border-white/5 p-6">
            <div className="flex justify-between items-end mb-4">
              <h3 className="font-orbitron text-xs font-semibold tracking-widest text-muted uppercase">
                Achievements
              </h3>
              <span className="text-[10px] font-mono text-white">24/60</span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {achievements.map((ach, idx) => (
                <div 
                  key={idx}
                  className={`aspect-square rounded-xl border flex items-center justify-center relative group ${
                    ach.unlocked 
                      ? `${ach.border} bg-[#0c101a] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]`
                      : 'border-white/5 bg-secondary/35 text-white/10'
                  }`}
                >
                  <ach.icon size={18} className={ach.unlocked ? ach.color : 'text-muted/20'} />
                  
                  {/* Glowing core indicator for unlocked items */}
                  {ach.unlocked && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#34d399]" />
                  )}
                  
                  {/* Cybernetic Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-[#050811]/95 border border-white/15 rounded-xl p-2.5 text-[9px] text-center hidden group-hover:block z-20 shadow-2xl pointer-events-none">
                    <p className="font-orbitron font-bold text-white leading-tight uppercase tracking-wider">{ach.title}</p>
                    <p className="text-muted/80 leading-normal mt-1 font-poppins">{ach.desc}</p>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5 font-mono text-[8px]">
                      <span className="text-muted/40 uppercase">Index</span>
                      <span className={ach.unlocked ? 'text-emerald-400' : 'text-neon-pink'}>{ach.progress}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5">
              <button className="w-full text-center py-2.5 rounded-xl border border-white/10 bg-secondary/20 font-orbitron text-[10px] font-bold tracking-widest text-muted hover:text-white hover:border-white/20 transition-all uppercase cursor-pointer">
                Show All Rewards
              </button>
            </div>
          </GlassCard>

          {/* Cyber Asset Card with Animated Hologram Core */}
          <GlassCard hover={true} className="border-neon-blue/20 bg-gradient-to-b from-[#0e1424] to-[#0c0f17] p-6 text-center relative overflow-hidden">
            
            {/* Animated glowing core */}
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center mb-4">
              {/* Outer holographic ring */}
              <div className="absolute inset-0 rounded-full border border-neon-blue/30 border-dashed animate-[spin_30s_linear_infinite]" />
              <div className="absolute inset-2 rounded-full border border-neon-purple/20 border-dotted animate-[spin_15s_linear_infinite_reverse]" />
              
              {/* Inner glowing cyber sphere */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-neon-purple to-neon-blue p-[2px] shadow-[0_0_20px_rgba(0,240,255,0.4)] animate-[pulse_2s_ease-in-out_infinite] flex items-center justify-center">
                <div className="w-full h-full bg-[#070b14] rounded-full flex items-center justify-center">
                  <Crown size={18} className="text-neon-blue" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 relative z-10">
              <h4 className="font-orbitron text-xs font-bold text-white tracking-widest uppercase">
                Architect of the Void
              </h4>
              <p className="text-[10px] text-muted font-poppins leading-normal px-2">
                You&apos;ve unlocked the highest tier of generative logic. This rare trophy is shared by only 100 users.
              </p>
              
              <div className="pt-2">
                <button 
                  onClick={handleClaimTrophy}
                  className="font-orbitron text-[10px] font-bold tracking-widest text-neon-blue hover:text-neon-pink hover:underline transition-all uppercase cursor-pointer"
                >
                  CLAIM DIGITAL ASSET
                </button>
              </div>
            </div>
          </GlassCard>

        </div>

      </div>
    </div>
  );
}
