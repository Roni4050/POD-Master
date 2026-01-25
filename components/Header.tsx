
import React from 'react';
import { ProviderConfig, ProviderType } from '../types';

interface HeaderProps {
  onOpenSettings: () => void;
  configs: ProviderConfig;
  onToggleProvider: (provider: ProviderType) => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings, configs, onToggleProvider }) => {
  const providers: { type: ProviderType; label: string; icon: string; color: string }[] = [
    { type: 'mistral', label: 'Preview', icon: 'M', color: 'orange' },
    { type: 'groq', label: 'Groq', icon: 'G', color: 'slate' },
  ];

  const getStatusColor = (provider: ProviderType) => {
    const config = configs[provider];
    if (!config.isActive) return 'bg-slate-300';
    switch (config.status) {
      case 'active': return 'bg-emerald-500';
      case 'rate-limited': return 'bg-amber-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-slate-300';
    }
  };

  const getStatusText = (provider: ProviderType) => {
    const config = configs[provider];
    if (!config.isActive) return 'Disabled';
    if (!config.apiKey) return 'No Key';
    return config.status.charAt(0).toUpperCase() + config.status.slice(1);
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100 cursor-pointer hover:bg-indigo-700 transition-colors" onClick={onOpenSettings}>
          <i className="fas fa-brain text-white text-lg"></i>
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">POD Master</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mistral Large Preview Edition</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          {providers.map((p) => {
            const config = configs[p.type];
            const isActive = config.isActive;
            const statusColor = getStatusColor(p.type);
            
            return (
              <div 
                key={p.type} 
                className={`flex items-center gap-3 px-3 py-1.5 rounded-2xl border transition-all duration-300 ${
                  isActive ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-transparent opacity-60'
                }`}
              >
                <div 
                  onClick={() => onToggleProvider(p.type)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black cursor-pointer transition-all ${
                    isActive 
                      ? p.type === 'mistral' ? 'bg-orange-500 text-white' : 'bg-slate-900 text-white'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {p.icon}
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${statusColor} ${isActive && config.status === 'active' ? 'animate-pulse' : ''}`}></div>
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{p.label}</span>
                  </div>
                  <span className="text-[9px] font-medium text-slate-400 leading-none">{getStatusText(p.type)}</span>
                </div>

                <button 
                  onClick={() => onToggleProvider(p.type)}
                  className={`ml-1 w-8 h-4 rounded-full relative transition-colors duration-200 focus:outline-none ${
                    isActive ? 'bg-indigo-500' : 'bg-slate-300'
                  }`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-200 ${
                    isActive ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}></div>
                </button>
              </div>
            );
          })}
        </div>

        <div className="h-8 w-px bg-slate-100"></div>
        
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
