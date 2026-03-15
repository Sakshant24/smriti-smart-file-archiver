import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Settings2, Bell, Shield, CheckCircle2 } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function Settings() {
  const [settings, setSettings] = useState({
    auto_archive_enabled: false,
    size_threshold: 100,
    inactivity_days: 180
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const resp = await axios.get(`${API_BASE}/settings`);
      setSettings(resp.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await axios.post(`${API_BASE}/settings`, settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert("Failed to save settings.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : Number(e.target.value);
    setSettings({
      ...settings,
      [e.target.name]: value
    });
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 mt-4">
      <header>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings2 className="text-emerald-500" />
          Automated Archiver Logic
        </h1>
        <p className="text-slate-400 mt-2 text-lg">Configure how SMRITI AI behaves and manages your OS file system.</p>
      </header>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Core Settings Group */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-6 border-b border-slate-700/50 pb-4">
            <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-500/30">
              <Shield className="text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Automation</h2>
              <p className="text-sm text-slate-400">Control automatic background processing.</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <div>
              <h3 className="font-semibold text-white">Enable Auto-Archiving</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-md">
                When enabled, the background scheduler will automatically move files predicted as dormant to the archive without asking.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="auto_archive_enabled" 
                className="sr-only peer" 
                checked={settings.auto_archive_enabled}
                onChange={handleChange}
              />
              <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
            </label>
          </div>
        </div>

        {/* Thresholds Group */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-6 border-b border-slate-700/50 pb-4">
            <div className="bg-amber-500/20 p-3 rounded-xl border border-amber-500/30">
              <Bell className="text-amber-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Triggers & Thresholds</h2>
              <p className="text-sm text-slate-400">Set the rules for recommendations.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-300">
                Minimum File Size <span className="text-emerald-400">(MB)</span>
              </label>
              <p className="text-xs text-slate-500 mb-2">Only monitor and archive files larger than this.</p>
              <input 
                type="number" 
                name="size_threshold"
                required
                min="0"
                step="0.1"
                value={settings.size_threshold}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 text-white text-lg rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-3 shadow-inner"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-300">
                Inactivity Threshold <span className="text-emerald-400">(Days)</span>
              </label>
              <p className="text-xs text-slate-500 mb-2">Files untouched for longer than this are flagged.</p>
              <input 
                type="number" 
                name="inactivity_days"
                required
                min="1"
                value={settings.inactivity_days}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 text-white text-lg rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-3 shadow-inner"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-6 pt-4">
          {saved && (
            <span className="text-emerald-400 flex items-center gap-2 animate-in slide-in-from-right-8">
              <CheckCircle2 size={18} />
              Settings saved successfully!
            </span>
          )}
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 font-bold transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-lg tracking-wide"
          >
            {saving ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div> : <Save size={20} />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

      </form>
    </div>
  );
}
