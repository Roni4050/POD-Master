
import React, { useState, useEffect } from 'react';
import { KeyPool } from '../types';

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const [keyCounts, setKeyCounts] = useState<{mistral: number, groq: number}>({ mistral: 0, groq: 0 });

  useEffect(() => {
    const updateCounts = () => {
      const poolStr = localStorage.getItem('POD_MASTER_KEY_POOL');
      if (poolStr) {
        try {
          const pool: KeyPool = JSON.parse(poolStr);
          setKeyCounts({
            mistral: pool.mistral?.length || 0,
            groq: pool.groq?.length || 0
          });
        } catch (e) {
          console.error("Pool parse error");
        }
      }
    };

    updateCounts();
    window.addEventListener('storage', updateCounts);
    window.addEventListener('pool-updated', updateCounts);
    return () => {
      window.removeEventListener('storage', updateCounts);
      window.removeEventListener('pool-updated', updateCounts);
    };
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-slate-900 p-2 rounded-lg shadow-sm">
          <i className="fas fa-tags text-white text-xl"></i>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">POD Master</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">SEO Suite</p>
        </div>
      </div>
      
      <div className="hidden lg:flex items-center gap-3 mr-auto ml-10">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
          <div className={`w-2 h-2 rounded-full ${keyCounts.groq > 0 ? 'bg-orange-500' : 'bg-slate-300'}`}></div>
          <span className="text-[10px] font-black text-slate-500 uppercase">Groq: {keyCounts.groq}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
          <div className={`w-2 h-2 rounded-full ${keyCounts.mistral > 0 ? 'bg-purple-500' : 'bg-slate-300'}`}></div>
          <span className="text-[10px] font-black text-slate-500 uppercase">Mistral: {keyCounts.mistral}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 mr-4">
          <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 transition-colors">Groq Console</a>
          <a href="https://console.mistral.ai/api-keys/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600 transition-colors">Mistral Console</a>
        </nav>
        
        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
        
        <button 
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white border border-slate-900 rounded-xl text-sm font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200"
        >
          <i className="fas fa-key text-slate-300"></i>
          <span>Key Manager</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
