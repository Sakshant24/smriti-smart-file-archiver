import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Shield, Bell } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: "spring" } } };

export default function Settings() {
  const [settings, setSettings] = useState({
    auto_archive_enabled: false, size_threshold: 100, inactivity_days: 180
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const resp = await axios.get(`${API_BASE}/settings`);
      setSettings(resp.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
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
      alert("Failed to sync parameters.");
    } finally { setSaving(false); }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : Number(e.target.value);
    setSettings({ ...settings, [e.target.name]: value });
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="w-12 h-12 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-10">
      <motion.header variants={itemVariants}>
        <h1 className="text-4xl md:text-5xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500 tracking-tight flex items-center gap-4">
          Automations
        </h1>
        <p className="text-zinc-500 mt-3 text-lg font-medium max-w-xl">Configure the behavior of the Machine Learning pipeline and Watchdog threads.</p>
      </motion.header>

      <motion.form variants={itemVariants} onSubmit={handleSave} className="space-y-8">
        
        {/* Core Settings Group */}
        <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/60 rounded-3xl p-8 md:p-10 shadow-xl transition-colors hover:border-zinc-700">
          <div className="flex items-center gap-5 mb-8 border-b border-zinc-800/80 pb-6">
            <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
              <Shield className="text-indigo-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-zinc-100 tracking-tight">AI Drone Logic</h2>
              <p className="text-zinc-500 mt-1 font-medium">Control autonomous system operations.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-zinc-950/50 rounded-2xl border border-zinc-900 gap-6">
            <div>
              <h3 className="text-lg font-bold text-zinc-200">Autonomous Archiving</h3>
              <p className="text-zinc-500 mt-1.5 font-medium max-w-lg leading-relaxed">
                When active, the background drone will automatically compress and move files predicted as dormant. If disabled, they will only queue in <span className="text-zinc-300">Recommendations</span>.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                name="auto_archive_enabled" 
                className="sr-only peer" 
                checked={settings.auto_archive_enabled}
                onChange={handleChange}
              />
              <div className="w-16 h-8 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-zinc-300 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-500 border border-zinc-700 peer-checked:border-indigo-400"></div>
            </label>
          </div>
        </div>

        {/* Thresholds Group */}
        <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/60 rounded-3xl p-8 md:p-10 shadow-xl transition-colors hover:border-zinc-700">
          <div className="flex items-center gap-5 mb-8 border-b border-zinc-800/80 pb-6">
            <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
              <Bell className="text-amber-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-zinc-100 tracking-tight">Parametric Bounds</h2>
              <p className="text-zinc-500 mt-1 font-medium">Calibrate the heuristic baseline triggering ML analysis.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-zinc-300 tracking-wide uppercase">
                Volume Floor <span className="text-indigo-400 font-mono">(MB)</span>
              </label>
              <p className="text-sm text-zinc-500 font-medium">Examine payloads exceeding this mass.</p>
              <input 
                type="number" 
                name="size_threshold"
                required min="0" step="0.1"
                value={settings.size_threshold}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 font-bold font-mono text-xl rounded-2xl focus:ring-0 focus:border-indigo-500 block p-4 shadow-inner transition-colors"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-zinc-300 tracking-wide uppercase">
                Temporal Decay <span className="text-indigo-400 font-mono">(DAYS)</span>
              </label>
              <p className="text-sm text-zinc-500 font-medium">Idle grace period before ML evaluation.</p>
              <input 
                type="number" 
                name="inactivity_days"
                required min="1"
                value={settings.inactivity_days}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 font-bold font-mono text-xl rounded-2xl focus:ring-0 focus:border-indigo-500 block p-4 shadow-inner transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-6 pt-6">
          <AnimatePresence>
            {saved && (
              <motion.span 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-emerald-400 flex items-center gap-2 font-bold"
              >
                <span className="mr-2">✓</span> Configuration Applied
              </motion.span>
            )}
          </AnimatePresence>
          <button 
            type="submit" 
            disabled={saving}
            className="group relative flex items-center gap-2 px-8 py-4 bg-zinc-100 overflow-hidden rounded-2xl text-zinc-950 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
          >
            <div className="absolute inset-0 w-0 bg-indigo-500 transition-all duration-[350ms] ease-out group-hover:w-full" />
            {saving ? <div className="relative animate-spin rounded-full h-5 w-5 border-t-2 border-zinc-900 group-hover:border-white"></div> : <Save size={20} className="relative group-hover:text-white transition-colors" />}
            <span className="relative group-hover:text-white transition-colors tracking-wide text-lg">Commit Params</span>
          </button>
        </div>

      </motion.form>
    </motion.div>
  );
}
