import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import Recommendations from './pages/Recommendations';
import Archives from './pages/Archives';
import Settings from './pages/Settings';
import { HardDrive, Activity, ArchiveRestore, Settings as SettingsIcon } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans selection:bg-indigo-500/30">
        
        {/* Subtle Ethereal Background Effects */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex justify-center">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/10 blur-[120px]" />
        </div>

        {/* Sidebar */}
        <aside className="w-72 bg-zinc-950/50 backdrop-blur-xl border-r border-zinc-800/60 hidden md:flex flex-col z-10 sticky top-0 h-screen">
          <div className="p-8 border-b border-zinc-900/50 flex flex-col gap-4">
             <div className="flex items-center gap-4">
               <div className="relative h-12 w-12 rounded-2xl flex items-center justify-center bg-zinc-900 border border-zinc-800/80 shadow-2xl overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 <HardDrive size={24} className="text-zinc-300 relative z-10" />
               </div>
              <div>
                <h1 className="text-2xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-100 to-zinc-500 mt-1">
                  SMRITI
                </h1>
                <p className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase">Intelligence</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-8 space-y-2 relative">
            <NavItem to="/" icon={<Activity size={20} />} label="Overview" />
            <NavItem to="/recommendations" icon={<div className="relative"><HardDrive size={20} /><div className="absolute 1px -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" /></div>} label="Recommendations" />
            <NavItem to="/archives" icon={<ArchiveRestore size={20} />} label="Data Vault" />
            <NavItem to="/settings" icon={<SettingsIcon size={20} />} label="Automations" />
          </nav>

          <div className="p-6">
            <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800/50">
               <p className="text-xs text-zinc-500 font-medium leading-relaxed">System running smoothly. ML models are active and observing file trajectories.</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative z-10">
          <header className="md:hidden bg-zinc-950/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-zinc-900 sticky top-0 z-20">
            <h1 className="text-xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">SMRITI</h1>
          </header>
          
          <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
                <Route path="/recommendations" element={<PageWrapper><Recommendations /></PageWrapper>} />
                <Route path="/archives" element={<PageWrapper><Archives /></PageWrapper>} />
                <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
              </Routes>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </Router>
  );
}

// Staggered Page Wrapper
const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

function NavItem({ to, icon, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link to={to} className="block relative focus:outline-none group">
      {isActive && (
        <motion.div
          layoutId="activeNavBackground"
          className="absolute inset-0 bg-zinc-900/80 border border-zinc-800/80 rounded-xl"
          initial={false}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <div className={`relative flex items-center gap-4 px-4 py-3.5 z-10 rounded-xl transition-colors duration-200 ${
        isActive ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
      }`}>
        <span className={`transition-transform duration-300 ${isActive ? 'scale-110 text-indigo-400' : 'group-hover:scale-110'}`}>
          {icon}
        </span>
        <span className="font-medium text-sm tracking-wide">{label}</span>
      </div>
    </Link>
  );
}

export default App;
