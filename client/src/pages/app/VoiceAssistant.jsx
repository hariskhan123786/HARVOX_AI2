import { useState, useEffect, useRef } from 'react';
import { aiAPI, settingsAPI } from '../../services/api';
import VoiceOrb from '../../components/voice/VoiceOrb';
import GlassCard from '../../components/ui/GlassCard';
import NeonButton from '../../components/ui/NeonButton';
import ChatMessage from '../../components/chat/ChatMessage';
import { useAuthStore } from '../../store/authStore';
import PremiumLockOverlay from '../../components/ui/PremiumLockOverlay';

export default function VoiceAssistant() {
  const { user } = useAuthStore();
  const isPro = user?.subscription === 'pro' || user?.role === 'admin';
  
  if (!isPro) {
    return (
      <PremiumLockOverlay
        featureName="Voice Assistant System"
        description="Initiate voice reactive holograms, text-to-speech feedback, and wake-word telemetry links."
      />
    );
  }
  
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0].transcript).join('');
      setTranscript(text);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
  }, []);

  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('female');
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);

  useEffect(() => {
    const loadVoicesList = () => {
      if ('speechSynthesis' in window) {
        setVoices(window.speechSynthesis.getVoices());
      }
    };
    loadVoicesList();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoicesList;
    }
  }, []);

  useEffect(() => {
    settingsAPI.get().then(({ data }) => {
      if (data?.settings?.voice) {
        setSelectedVoice(data.settings.voice.voiceSelection || 'female');
        setVoiceSpeed(data.settings.voice.speed || 1.0);
      }
    }).catch(() => {});
  }, []);

  const handleVoiceChange = (e) => {
    const v = e.target.value;
    setSelectedVoice(v);
    settingsAPI.update({ voice: { voiceSelection: v, speed: voiceSpeed } }).catch(()=>{});
  };

  const startListening = () => {
    if (!recognitionRef.current) return;
    setTranscript('');
    setListening(true);
    recognitionRef.current.start();
  };

  const stopListening = async () => {
    recognitionRef.current?.stop();
    setListening(false);
    
    if ('speechSynthesis' in window) {
      // Warm up speech synthesis on user interaction to bypass browser restrictions
      speechSynthesis.speak(new SpeechSynthesisUtterance(''));
    }

    if (transcript.trim()) await askAI(transcript);
  };

  const askAI = async (text) => {
    try {
      const { data } = await aiAPI.chat({ message: text });
      setResponse(data.reply);
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(data.reply.replace(/[#*`]/g, '').slice(0, 500));
        utter.rate = voiceSpeed;
        const matched = voices.find(v => v.name === selectedVoice);
        if (matched) utter.voice = matched;
        speechSynthesis.speak(utter);
      }
    } catch (err) {
      setResponse(err.response?.data?.message || 'Could not get response.');
    }
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center space-y-8 py-8">
      <h1 className="font-orbitron text-2xl font-bold">Voice Assistant</h1>
      {!supported && (
        <p className="text-center text-sm text-yellow-400">
          Speech recognition not supported in this browser. Use Chrome or Edge.
        </p>
      )}
      <VoiceOrb listening={listening} />
      <p className="text-center text-muted">
        {listening ? 'Listening... You can ask me anything.' : 'Click to start voice input'}
      </p>
      {transcript && <p className="text-sm text-neon-blue">&quot;{transcript}&quot;</p>}
      
      <div className="w-full max-w-xs space-y-2 pb-4">
        <label className="text-[10px] font-semibold font-orbitron tracking-wider text-muted uppercase">Selected Voice Matrix</label>
        <select 
          value={selectedVoice} 
          onChange={handleVoiceChange}
          className="input-neon text-xs font-mono w-full"
        >
          <option value="female">Default — Aura (Female)</option>
          <option value="male">Default — Echo (Male)</option>
          {voices.map((v) => (
            <option key={v.name} value={v.name}>{v.name} [{v.lang}]</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        {!listening ? (
          <NeonButton onClick={startListening} disabled={!supported}>Start Listening</NeonButton>
        ) : (
          <NeonButton variant="secondary" onClick={stopListening}>Stop Listening</NeonButton>
        )}
      </div>
      {response && (
        <GlassCard hover={false} className="w-full">
          <ChatMessage role="assistant" content={response} />
        </GlassCard>
      )}
    </div>
  );
}
