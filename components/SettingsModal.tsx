
import React, { useState } from 'react';
import { ProviderConfig, ProviderType } from '../types';
import { validateMistralKey } from '../services/aiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  configs: ProviderConfig;
  onUpdate: React.Dispatch<React.SetStateAction<ProviderConfig>>;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, configs, onUpdate }) => {
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({});
  const [verificationStatus, setVerificationStatus] = useState<Record<string, 'idle' | 'verified' | 'failed'>>({});

  if (!isOpen) return null;

  const handleKeyChange = (provider: ProviderType, key: string) => {
    onUpdate(prev => ({
      ...prev,
      [provider]: { ...prev[provider], apiKey: key }
    }));
    setVerificationStatus(prev => ({ ...prev, [provider]: 'idle' }));
  };

  const validateKey = async (provider: ProviderType) => {
    const key = configs[provider].apiKey;
    if (!key) return;

    setIsValidating(prev => ({ ...prev, [provider]: true }));
    
    let isValid = false;
    if (provider === 'mistral') {
      isValid = await validateMistralKey(key);
    } else {
      isValid = key.length > 20; 
    }

    setIsValidating(prev => ({ ...prev, [provider]: false }));
    setVerificationStatus(prev => ({ ...prev, [provider]: isValid ? 'verified' : 'failed' }));

    if (isValid) {
      onUpdate(prev => ({
        ...prev,
        [provider]: { ...prev[provider], status: 'active', isActive: true }
      }));
    } else {
      onUpdate(prev => ({
        ...prev,
        [provider]: { ...prev[provider], status: 'error' }
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">AI Configuration</h2>
            <p className="text-sm text-slate-500 font-medium">Frontier & Scout Vision Systems</p>
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
            <div className={`p-6 rounded-3xl border-2 transition-all ${
              verificationStatus.mistral === 'verified' ? 'bg-emerald-50/50 border-emerald-100' : 
              verificationStatus.mistral === 'failed' ? 'bg-red-50/50 border-red-100' :
              'bg-slate-50 border-slate-100'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-lg ${
                    verificationStatus.mistral === 'verified' ? 'bg-emerald-500' : 'bg-orange-600'
                  }`}>M</div>
                  <div>
                    <span className="font-bold text-slate-700 block">Mistral Large 3</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Multimodal Frontier</span>
                  </div>
                </div>
                {configs.mistral.apiKey && (
                  <button 
                    onClick={() => validateKey('mistral')}
                    disabled={isValidating.mistral}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      verificationStatus.mistral === 'verified' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                    }`}
                  >
                    {isValidating.mistral ? <i className="fas fa-spinner animate-spin"></i> : 
                     verificationStatus.mistral === 'verified' ? <><i className="fas fa-check mr-1"></i> Verified</> : 'Validate'}
                  </button>
                )}
              </div>
              <div className="relative">
                <input 
                  type="password"
                  placeholder="Mistral API Key"
                  value={configs.mistral.apiKey || ''}
                  onChange={(e) => handleKeyChange('mistral', e.target.value)}
                  className={`w-full bg-white border rounded-xl px-5 py-3 text-sm font-mono outline-none transition-all ${
                    verificationStatus.mistral === 'verified' ? 'border-emerald-200 focus:border-emerald-400' : 
                    verificationStatus.mistral === 'failed' ? 'border-red-200 focus:border-red-400' :
                    'border-slate-200 focus:border-indigo-400'
                  }`}
                />
              </div>
            </div>

            <div className={`p-6 rounded-3xl border-2 transition-all ${
              verificationStatus.groq === 'verified' ? 'bg-emerald-50/50 border-emerald-100' : 
              'bg-slate-50 border-slate-100'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-lg ${
                    verificationStatus.groq === 'verified' ? 'bg-emerald-500' : 'bg-slate-900'
                  }`}>S</div>
                  <div>
                    <span className="font-bold text-slate-700 block">Groq Scout</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Llama 3.2 90B Scout Model</span>
                  </div>
                </div>
                {configs.groq.apiKey && verificationStatus.groq !== 'verified' && (
                  <button 
                    onClick={() => validateKey('groq')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-95"
                  >
                    Validate
                  </button>
                )}
              </div>
              <input 
                type="password"
                placeholder="Groq API Key"
                value={configs.groq.apiKey || ''}
                onChange={(e) => handleKeyChange('groq', e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm font-mono outline-none focus:border-indigo-400 transition-all"
              />
              <p className="mt-3 text-[10px] text-slate-400 font-medium italic">
                * High-fidelity 90B Scout model handles complex visual discovery.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-[0.99]"
          >
            Apply & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
