import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import NeonButton from '../../components/ui/NeonButton';
import { Settings, Save } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    jazzCashNumber: '',
    jazzCashName: '',
    easyPaisaNumber: '',
    easyPaisaName: '',
    announcement: '',
    groqKey: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await adminAPI.getSettings();
        if (data.settings) setSettings(data.settings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await adminAPI.updateSettings(settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center mb-8">
        <Settings className="w-8 h-8 mr-3 text-neon-pink" />
        <h1 className="text-3xl font-bold">System Settings</h1>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${message.includes('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-green-500/10 text-green-400 border border-green-500/30'}`}>
          {message}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-neon-blue mb-4">Payment Methods</h2>
          
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted">JazzCash</h3>
            <div>
              <label className="text-xs text-muted block mb-1">Account Number</label>
              <input type="text" name="jazzCashNumber" value={settings.jazzCashNumber} onChange={handleChange} className="input-neon" />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Account Name</label>
              <input type="text" name="jazzCashName" value={settings.jazzCashName} onChange={handleChange} className="input-neon" />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/10 mt-4">
            <h3 className="font-medium text-sm text-muted">EasyPaisa</h3>
            <div>
              <label className="text-xs text-muted block mb-1">Account Number</label>
              <input type="text" name="easyPaisaNumber" value={settings.easyPaisaNumber} onChange={handleChange} className="input-neon" />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Account Name</label>
              <input type="text" name="easyPaisaName" value={settings.easyPaisaName} onChange={handleChange} className="input-neon" />
            </div>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-neon-purple mb-4">Global Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted block mb-1">Global Groq API Key (Fallback)</label>
                <input 
                  type="password" 
                  name="groqKey" 
                  value={settings.groqKey} 
                  onChange={handleChange} 
                  className="input-neon" 
                  placeholder="gsk_..."
                />
                <p className="text-xs text-muted mt-1">Used if user doesn't have their own key set.</p>
              </div>

              <div>
                <label className="text-xs text-muted block mb-1">Dashboard Announcement</label>
                <textarea 
                  name="announcement" 
                  value={settings.announcement} 
                  onChange={handleChange} 
                  className="input-neon h-24 resize-none"
                  placeholder="Broadcast message to all users..."
                />
              </div>
            </div>
          </GlassCard>

          <NeonButton variant="primary" className="w-full justify-center" onClick={handleSave} disabled={saving}>
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Saving...' : 'Save All Settings'}
          </NeonButton>
        </div>
      </div>
    </div>
  );
}
