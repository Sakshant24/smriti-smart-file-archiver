import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { HardDrive, Activity, Archive, FileText } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

function StatCard({ title, value, subtitle, icon, colorClass }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl transition-all duration-500 group-hover:blur-3xl group-hover:opacity-20 ${colorClass}`}></div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-400 font-medium text-sm">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-1 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-20 text-white shadow-inner`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-slate-500 font-medium">{subtitle}</p>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalFiles: 0,
    archivedFiles: 0,
    dormantFiles: 0,
    spaceSaved: 0,
    totalSpaceMonitored: 0
  });

  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resp = await axios.get(`${API_BASE}/files`);
      const allFiles = resp.data;
      
      const archived = allFiles.filter(f => f.archived);
      const dormant = allFiles.filter(f => f.predicted_dormant && !f.archived);
      
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

  // Prepare chart data
  const statusData = [
    { name: 'Active', value: stats.totalFiles - stats.archivedFiles - stats.dormantFiles },
    { name: 'Dormant', value: stats.dormantFiles },
    { name: 'Archived', value: stats.archivedFiles }
  ];
  const COLORS = ['#3b82f6', '#fbbf24', '#10b981'];

  // Example recent activity (last 5 modified)
  const recentFiles = [...files]
    .sort((a, b) => new Date(b.last_access_time) - new Date(a.last_access_time))
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-white">System Overview</h1>
        <p className="text-slate-400 mt-2 text-lg">Real-time insights of your file system and AI predictions.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Monitored Storage" 
          value={`${stats.totalSpaceMonitored} MB`} 
          subtitle={`${stats.totalFiles} files tracked`} 
          icon={<HardDrive size={24} />} 
          colorClass="bg-blue-500" 
        />
        <StatCard 
          title="AI Dormancy Queue" 
          value={stats.dormantFiles} 
          subtitle="Awaiting archival action" 
          icon={<Activity size={24} />} 
          colorClass="bg-amber-500" 
        />
        <StatCard 
          title="Storage Recovered" 
          value={`${stats.spaceSaved} MB`} 
          subtitle="From compressed archives" 
          icon={<Archive size={24} />} 
          colorClass="bg-emerald-500" 
        />
        <StatCard 
          title="Archived Assets" 
          value={stats.archivedFiles} 
          subtitle="Safely stored off main disk" 
          icon={<FileText size={24} />} 
          colorClass="bg-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        
        {/* Charts */}
        <div className="col-span-1 lg:col-span-2 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">File Status Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-1 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Recent File Access</h2>
          <div className="space-y-4">
            {recentFiles.map(file => (
              <div key={file.id} className="flex items-center p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                  {file.file_name.split('.').pop().substring(0, 3).toUpperCase()}
                </div>
                <div className="ml-4 overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">{file.file_name}</p>
                  <p className="text-xs text-slate-400">Acc: {file.access_count} times</p>
                </div>
                <div className="ml-auto text-xs text-slate-500">
                  {new Date(file.last_access_time).toLocaleDateString()}
                </div>
              </div>
            ))}
            {recentFiles.length === 0 && (
               <p className="text-slate-400 text-sm italic">No recent file activity found.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
