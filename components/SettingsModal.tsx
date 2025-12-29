
import React, { useState, useEffect } from 'react';
import { KeyPool } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'mistral' | 'groq'>('groq');
  const [pools, setPools] = useState<KeyPool>({ gemini: [], mistral: [], groq: [] });
  const [newKey, setNewKey] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('POD_MASTER_KEY_POOL');
    if (saved) {
      try {
        setPools(JSON.parse(saved));
      } catch (e) {
        setPools({ gemini: [], mistral: [], groq: [] });
      }
    }
  }, [isOpen]);

  const savePools = (newPools: KeyPool) => {
    setPools(newPools);
    localStorage.setItem('POD_MASTER_KEY_POOL', JSON.stringify(newPools));
    window.dispatchEvent(new Event('pool-updated'));
  };

  const addKey = () => {
    if (!newKey.trim()) return;
    const currentList = pools[activeTab] || [];
    const updated = { ...pools, [activeTab]: [...currentList, newKey.trim()] };
    savePools(updated);
    setNewKey('');
  };

  const removeKey = (index: number) => {
    const updated = { 
      ...pools, 
      [activeTab]: (pools[activeTab] || []).filter((_, i) => i !== index) 
    };
    savePools(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">API Key Manager</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Multi-Provider Rotation Enabled</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden min-h-[400px]">
          {/* Tabs */}
          <div className="w-48 bg-slate-50 border-r border-slate-100 p-4 space-y-2">
            {[
              { id: 'groq', label: 'Groq', icon: 'fa-bolt', color: 'orange' },
              { id: 'mistral', label: 'Mistral', icon: 'fa-wind', color: 'purple' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all border-2 ${
                  activeTab === tab.id 
                    ? `bg-white border-${tab.color}-500 shadow-sm text-${tab.color}-600` 
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-100'
                }`}
              >
                <i className={`fas ${tab.icon} text-lg`}></i>
                <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 font-bold">
                  {pools[tab.id as keyof KeyPool]?.length || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-8 flex flex-col">
            <div className="mb-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                Add {activeTab} API Key
              </label>
              <div className="flex gap-2">
                <input 
                  type="password"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder={`Paste your ${activeTab} key...`}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all font-mono"
                  onKeyDown={(e) => e.key === 'Enter' && addKey()}
                />
                <button 
                  onClick={addKey}
                  className="bg-slate-900 text-white px-6 rounded-2xl font-bold text-sm hover:bg-black transition-all flex items-center gap-2"
                >
                  <i className="fas fa-plus"></i>
                  Add
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                Active {activeTab} Pool
              </label>
              {(!pools[activeTab] || pools[activeTab].length === 0) ? (
                <div className="h-32 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                  <i className="fas fa-key text-2xl mb-2"></i>
                  <span className="text-xs font-bold uppercase tracking-widest text-center px-4">No keys added. Gemini logic is permanently removed.</span>
                </div>
              ) : (
                pools[activeTab].map((key, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-slate-300 transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-100">
                        {idx + 1}
                      </div>
                      <span className="font-mono text-xs text-slate-500 truncate max-w-[220px]">
                        {key.substring(0, 10)}••••••••{key.substring(key.length - 4)}
                      </span>
                    </div>
                    <button 
                      onClick={() => removeKey(idx)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                ))
              )}
            </div>

            <p className="mt-6 text-[10px] text-slate-400 italic leading-relaxed text-center">
              The engine will cycle through {activeTab} keys automatically to avoid 429 quota limits.
            </p>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button 
            onClick={onClose} 
            className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-600 hover:bg-slate-100 transition-all"
          >
            Finished
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
