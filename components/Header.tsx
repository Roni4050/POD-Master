
import React from 'react';
import { ProviderConfig } from '../types';

interface HeaderProps {
  onOpenSettings: () => void;
  configs: ProviderConfig;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings, configs }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100 cursor-pointer" onClick={onOpenSettings}>
          <i className="fas fa-brain text-white text-lg"></i>
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">POD Master</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mistral & Groq Vision Suite</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full shadow-sm">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Advanced Vision Active</span>
        </div>
        <div className="h-8 w-px bg-slate-100 mx-2"></div>
        <button 
          onClick={onOpenSettings}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <i className="fas fa-cog text-xs"></i>
          <span className="text-[10px] font-bold uppercase tracking-wider">Settings</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
