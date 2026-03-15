import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Archive, AlertCircle, RefreshCw } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function Recommendations() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${API_BASE}/recommendations`);
      setFiles(resp.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id) => {
    setActioning(id);
    try {
      await axios.post(`${API_BASE}/archive/${id}`);
      // Remove from list
      setFiles(files.filter(f => f.id !== id));
    } catch (error) {
      alert("Failed to archive file. See console for details.");
      console.error(error);
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            AI Recommendations
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full border border-emerald-500/30">ML Powered</span>
          </h1>
          <p className="text-slate-400 mt-2 text-lg">The Machine Learning model suggests archiving these dormant files.</p>
        </div>
        <button 
          onClick={fetchRecommendations}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors shadow-sm"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700/80 text-slate-300 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold w-1/3">File Name</th>
                <th className="p-4 font-semibold">Size (MB)</th>
                <th className="p-4 font-semibold">Last Accessed</th>
                <th className="p-4 font-semibold">Access Count</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading && files.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-3">
                      <RefreshCw className="animate-spin text-emerald-500" />
                      Analyzing file metadata...
                    </div>
                  </td>
                </tr>
              ) : files.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="flex flex-col items-center text-slate-500">
                      <AlertCircle size={48} className="mb-4 opacity-50" />
                      <p className="text-lg text-slate-400 font-medium">No files currently flagged as dormant.</p>
                      <p className="text-sm">Your file system is running optimally.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                files.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-700/20 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-700/50 flex items-center justify-center text-xs font-mono text-slate-400 border border-slate-600/50">
                          {file.file_type || 'UNK'}
                        </div>
                        <span className="text-slate-200 font-medium truncate max-w-xs">{file.file_name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 font-mono">
                      {file.file_size ? file.file_size.toFixed(2) : '0.00'}
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(file.last_access_time).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-slate-400">
                      <span className="px-2 py-1 bg-slate-800 rounded-md border border-slate-700 font-mono text-xs">
                        {file.access_count}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleArchive(file.id)}
                        disabled={actioning === file.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-500/20 font-medium transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actioning === file.id ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <Archive size={16} />
                        )}
                        Archive Now
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
