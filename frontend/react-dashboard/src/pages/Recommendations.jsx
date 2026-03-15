import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, AlertTriangle, RefreshCw, Zap } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: "spring" } } };

export default function Recommendations() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);

  useEffect(() => { fetchRecommendations(); }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${API_BASE}/recommendations`);
      setFiles(resp.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally { setLoading(false); }
  };

  const handleArchive = async (id) => {
    setActioning(id);
    try {
      await axios.post(`${API_BASE}/archive/${id}`);
      setFiles(files.filter(f => f.id !== id));
    } catch (error) {
      alert("Archive execution failed.");
    } finally { setActioning(null); }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-10">
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500 tracking-tight flex items-center gap-4">
            AI Predictions
            <span className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-indigo-500/20">
              <Zap size={14} /> ML Engine
            </span>
          </h1>
          <p className="text-zinc-500 mt-3 text-lg font-medium max-w-xl">Supervised learning has identified these files as dormant. Reclaim storage safely.</p>
        </div>
        <button 
          onClick={fetchRecommendations}
          className="group relative flex items-center gap-2 px-6 py-3 bg-zinc-900 overflow-hidden rounded-2xl text-zinc-300 font-bold transition-all border border-zinc-800 hover:border-zinc-600 hover:text-white"
        >
          <div className="absolute inset-0 w-0 bg-zinc-800 transition-all duration-[250ms] ease-out group-hover:w-full" />
          <RefreshCw size={18} className={`relative ${loading ? "animate-spin text-indigo-400" : ""}`} />
          <span className="relative">Resync Data</span>
        </button>
      </motion.header>

      <motion.div variants={itemVariants} className="bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/60 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800/80 text-zinc-500 text-xs uppercase tracking-widest font-bold">
                <th className="p-6 w-1/3">Target Asset</th>
                <th className="p-6">Size Profile</th>
                <th className="p-6">Last Ping</th>
                <th className="p-6">Frequency</th>
                <th className="p-6 text-right">Executor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              <AnimatePresence>
                {loading && files.length === 0 ? (
                  <motion.tr initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    <td colSpan="5" className="p-16 text-center text-zinc-500 font-medium">
                      <div className="flex justify-center items-center gap-4">
                        <RefreshCw className="animate-spin text-indigo-500" size={24} />
                        Parsing Machine Learning topology...
                      </div>
                    </td>
                  </motion.tr>
                ) : files.length === 0 ? (
                  <motion.tr initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    <td colSpan="5" className="p-24 text-center">
                      <div className="flex flex-col items-center text-zinc-600">
                        <AlertTriangle size={56} className="mb-6 opacity-30 text-emerald-500" />
                        <p className="text-xl text-zinc-300 font-display font-bold">Zero Dormant Assets Detected</p>
                        <p className="text-sm mt-2 font-medium">Your ecosystem is operating at peak efficiency.</p>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  files.map((file) => (
                    <motion.tr 
                      key={file.id} 
                      initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, scale:0.95}}
                      transition={{type:"spring"}}
                      className="hover:bg-zinc-800/30 transition-colors group"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800/80 shadow-inner flex items-center justify-center text-xs font-display font-bold text-zinc-500 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-colors">
                            {file.file_type || 'RAW'}
                          </div>
                          <span className="text-zinc-200 font-bold truncate max-w-xs">{file.file_name}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="text-zinc-300 font-medium bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800/80">
                          {file.file_size ? file.file_size.toFixed(2) : '0.00'} <span className="text-zinc-600 ml-1">MB</span>
                        </span>
                      </td>
                      <td className="p-6 text-zinc-400 font-medium">
                        {new Date(file.last_access_time).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="p-6 text-zinc-400">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                          {file.access_count}
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <button
                          onClick={() => handleArchive(file.id)}
                          disabled={actioning === file.id}
                          className="relative inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn overflow-hidden"
                        >
                          {actioning === file.id ? (
                            <RefreshCw size={18} className="animate-spin" />
                          ) : (
                            <Archive size={18} className="transition-transform group-hover/btn:-translate-y-0.5" />
                          )}
                          Execute Archive
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
