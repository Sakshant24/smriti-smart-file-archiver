import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { HardDrive, Activity, Archive, FileText, ChevronRight } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

function StatCard({ title, value, subtitle, icon, colorClass }) {
  return (
    <motion.div variants={itemVariants} className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-3xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-colors">
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-0 blur-3xl transition-all duration-700 group-hover:opacity-20 ${colorClass}`}></div>
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-4 rounded-2xl bg-zinc-950 shadow-inner border border-zinc-800/80 text-zinc-300`}>
          {icon}
        </div>
      </div>
      <div className="relative z-10">
        <h3 className="text-4xl font-display font-bold text-zinc-100 tracking-tight">{value}</h3>
        <p className="text-zinc-500 font-medium text-sm mt-2 flex items-center gap-2">
          <span className="text-zinc-300">{title}</span> 
          <ChevronRight size={14} className="opacity-50" />
        </p>
        <p className="text-xs text-zinc-600 font-medium mt-1">{subtitle}</p>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalFiles: 0, archivedFiles: 0, dormantFiles: 0, spaceSaved: 0, totalSpaceMonitored: 0
  });
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resp = await axios.get(`${API_BASE}/files`);
      const allFiles = resp.data;
      
      const archived = allFiles.filter(f => f.lifecycle_state === "ARCHIVED");
      const dormant = allFiles.filter(f => f.lifecycle_state === "DORMANT");
      
      const spaceSaved = archived.reduce((acc, f) => acc + (f.file_size || 0), 0);
      const totalSpace = allFiles.reduce((acc, f) => acc + (f.file_size || 0), 0);
      
      setStats({
        totalFiles: allFiles.length,
        archivedFiles: archived.length,
        dormantFiles: dormant.length,
        spaceSaved: spaceSaved.toFixed(2),
        totalSpaceMonitored: totalSpace.toFixed(2)
      });
      setFiles(allFiles);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const statusData = [
    { name: 'Active', value: stats.totalFiles - stats.archivedFiles - stats.dormantFiles },
    { name: 'Dormant', value: stats.dormantFiles },
    { name: 'Archived', value: stats.archivedFiles }
  ];
  const COLORS = ['#6366f1', '#f59e0b', '#10b981']; // Indigo, Amber, Emerald

  const recentFiles = [...files]
    .sort((a, b) => new Date(b.last_access_time) - new Date(a.last_access_time))
    .slice(0, 5);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-10">
      <motion.header variants={itemVariants}>
        <h1 className="text-4xl md:text-5xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500 tracking-tight">System Telemetry</h1>
        <p className="text-zinc-500 mt-3 text-lg font-medium max-w-xl">Real-time intelligence on your file system topology. Powered by Decision Tree classification.</p>
      </motion.header>

      {/* Stats Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Storage Imprint" value={`${stats.totalSpaceMonitored}M`} subtitle={`${stats.totalFiles} nodes tracked`} icon={<HardDrive size={22} />} colorClass="bg-indigo-500" />
        <StatCard title="Dormancy Queue" value={stats.dormantFiles} subtitle="Predictions awaiting review" icon={<Activity size={22} />} colorClass="bg-amber-500" />
        <StatCard title="Space Recovered" value={`${stats.spaceSaved}M`} subtitle="Via zip compression" icon={<Archive size={22} />} colorClass="bg-emerald-500" />
        <StatCard title="Archived Assets" value={stats.archivedFiles} subtitle="Secured in data vault" icon={<FileText size={22} />} colorClass="bg-purple-500" />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Charts */}
        <motion.div variants={itemVariants} className="xl:col-span-2 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
          <h2 className="text-lg font-bold font-display text-zinc-100 mb-8 flex items-center gap-3">
            <div className="w-2 h-6 bg-indigo-500 rounded-full" />
            File Trajectory Distribution
          </h2>
          <div className="h-72 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#52525b" tick={{fill: '#71717a'}} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={80} stroke="#52525b" tick={{fill: '#a1a1aa', fontWeight: 500}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#27272a', opacity: 0.4}}
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#f4f4f5', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#e4e4e7', fontWeight: 600 }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={24}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="xl:col-span-1 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-3xl p-8 shadow-2xl hover:border-zinc-700 transition-colors flex flex-col">
          <h2 className="text-lg font-bold font-display text-zinc-100 mb-6 flex items-center gap-3">
            <div className="w-2 h-6 bg-emerald-500 rounded-full" />
            Recent OS Activity
          </h2>
          <div className="space-y-4 flex-1">
            {recentFiles.map(file => (
              <div key={file.id} className="group/item flex items-center p-3 rounded-2xl hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 font-display font-bold text-xs shrink-0 group-hover/item:text-emerald-400 group-hover/item:border-emerald-500/30 transition-colors">
                  {file.file_name.split('.').pop().substring(0, 3).toUpperCase()}
                </div>
                <div className="ml-4 overflow-hidden flex-1">
                  <p className="text-sm font-bold text-zinc-200 truncate">{file.file_name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 tracking-wide">Acc: {file.access_count} times</p>
                </div>
                <div className="ml-2 text-[10px] text-zinc-600 font-medium whitespace-nowrap bg-zinc-950 px-2 py-1 rounded-md border border-zinc-900">
                  {new Date(file.last_access_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
            {recentFiles.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
                 <Activity size={32} className="mb-3" />
                 <p className="text-sm font-medium">No recent signals detected.</p>
               </div>
            )}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
