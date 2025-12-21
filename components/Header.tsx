
import React from 'react';

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
          <i className="fas fa-tags text-white text-xl"></i>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">POD Master</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Metadata Engine</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 mr-4">
          <a href="#" className="hover:text-blue-600 transition-colors">Dashboard</a>
          <a href="#" className="hover:text-blue-600 transition-colors">History</a>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Billing Docs</a>
        </nav>
        
        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
        
        <button 
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all active:scale-95"
        >
          <i className="fas fa-cog text-slate-400"></i>
          <span>Settings</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
