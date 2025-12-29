
import React from 'react';
import { ProviderConfig, ProviderType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  configs: ProviderConfig;
  onUpdate: React.Dispatch<React.SetStateAction<ProviderConfig>>;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, configs, onUpdate }) => {
  if (!isOpen) return null;

  const handleKeyChange = (provider: ProviderType, key: string) => {
    onUpdate(prev => ({
      ...prev,
      [provider]: { ...prev[provider], apiKey: key }
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">AI Engine Settings</h2>
            <p className="text-sm text-slate-500 font-medium">Configure your Mistral and Groq API keys.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xs">M</div>
                  <span className="font-bold text-slate-700">Mistral AI (Pixtral)</span>
                </div>
              </div>
              <input 
                type="password"
                placeholder="Mistral API Key"
                value={configs.mistral.apiKey || ''}
                onChange={(e) => handleKeyChange('mistral', e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-orange-400 transition-all"
              />
              <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-widest">High Quality Vision Analysis</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-xs">G</div>
                  <span className="font-bold text-slate-700">Groq (LPU Inference)</span>
                </div>
              </div>
              <input 
                type="password"
                placeholder="Groq API Key"
                value={configs.groq.apiKey || ''}
                onChange={(e) => handleKeyChange('groq', e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-slate-400 transition-all"
              />
              <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-widest">Ultra Fast Text Generation</p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
