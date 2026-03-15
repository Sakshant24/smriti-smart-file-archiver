import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Recommendations from './pages/Recommendations';
import Archives from './pages/Archives';
import Settings from './pages/Settings';
import { HardDrive, FileClock, ArchiveRestore, Settings as SettingsIcon } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col shadow-2xl z-10">
          <div className="p-8 border-b border-slate-800 flex items-center gap-3">
             <div className="h-10 w-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
               <HardDrive size={24} className="text-white" />
             </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
                SMRITI
              </h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mt-1">Archiver AI</p>
            </div>
          </div>
          <nav className="flex-1 p-4 mt-4 space-y-2">
            <NavItem to="/" icon={<HardDrive size={20} />} label="Dashboard" />
            <NavItem to="/recommendations" icon={<FileClock size={20} />} label="Recommendations" />
            <NavItem to="/archives" icon={<ArchiveRestore size={20} />} label="Archives" />
            <NavItem to="/settings" icon={<SettingsIcon size={20} />} label="Settings" />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950">
          <header className="md:hidden bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center shadow-md">
            <h1 className="text-xl font-bold text-white">SMRITI</h1>
          </header>
          
          <div className="p-8 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/archives" element={<Archives />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

function NavItem({ to, icon, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium ${
        isActive 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
      }`}
    >
      <span className={`${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`}>
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

export default App;
