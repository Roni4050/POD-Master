
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [geminiKeys, setGeminiKeys] = useState<string[]>(JSON.parse(localStorage.getItem('GEMINI_API_POOL') || '[]'));
  const [mistralKeys, setMistralKeys] = useState<string[]>(JSON.parse(localStorage.getItem('MISTRAL_API_POOL') || '[]'));
  const [groqKeys, setGroqKeys] = useState<string[]>(JSON.parse(localStorage.getItem('GROQ_API_POOL') || '[]'));
  
  const [newKey, setNewKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState<'gemini' | 'mistral' | 'groq'>('gemini');

  const validateAndAddKey = async () => {
    if (!newKey.trim()) return;
    setIsValidating(true);
    
    try {
      if (activeTab === 'gemini') {
        // Simple validation call to check if key works
        const ai = new GoogleGenAI({ apiKey: newKey.trim() });
        await ai.models.generateContent({
          model: "gemini-3-flash-lite-latest",
          contents: "ping",
        });
        
        if (!geminiKeys.includes(newKey.trim())) {
          setGeminiKeys([...geminiKeys, newKey.trim()]);
        }
      } else {
        // For Mistral/Groq we add directly as we aren't using their SDKs here yet
        // In a real app, you'd perform a fetch test to their validation endpoints
        if (activeTab === 'mistral') {
          setMistralKeys([...mistralKeys, newKey.trim()]);
        } else {
          setGroqKeys([...groqKeys, newKey.trim()]);
        }
      }
      setNewKey('');
    } catch (error) {
      alert("Invalid API Key: The key failed validation check.");
    } finally {
      setIsValidating(false);
    }
  };

  const removeKey = (pool: string[], setPool: React.Dispatch<React.SetStateAction<string[]>>, key: string) => {
    setPool(pool.filter(k => k !== key));
  };

  const handleSave = () => {
    localStorage.setItem('GEMINI_API_POOL', JSON.stringify(geminiKeys));
    localStorage.setItem('MISTRAL_API_POOL', JSON.stringify(mistralKeys));
    localStorage.setItem('GROQ_API_POOL', JSON.stringify(groqKeys));
    // Fallback for single key usage in legacy parts
    if (geminiKeys.length > 0) localStorage.setItem('GEMINI_API_KEY', geminiKeys[0]);
    window.location.reload();
  };

  if (!isOpen) return null;

  const currentPool = activeTab === 'gemini' ? geminiKeys : activeTab === 'mistral' ? mistralKeys : groqKeys;
  const setPool = activeTab === 'gemini' ? setGeminiKeys : activeTab === 'mistral' ? setMistralKeys : setGroqKeys;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">API Key Pool</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Multi-Key Auto-Rotation Enabled</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Tabs */}
          <div className="w-48 bg-slate-50 border-r border-slate-100 p-4 space-y-2">
            {[
              { id: 'gemini', name: 'Gemini', icon: 'fa-brain', color: 'blue', count: geminiKeys.length },
              { id: 'mistral', name: 'Mistral', icon: 'fa-wind', color: 'purple', count: mistralKeys.length },
              { id: 'groq', name: 'Groq', icon: 'fa-bolt', color: 'amber', count: groqKeys.length }
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
                <span className="text-[10px] font-black uppercase tracking-widest">{tab.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === tab.id ? `bg-${tab.color}-100` : 'bg-slate-200'} font-bold`}>
                  {tab.count} Keys
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-8 flex flex-col">
            <div className="mb-6 space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Add New Key</label>
              <div className="flex gap-2">
                <input 
                  type="password"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder={`Paste your ${activeTab} key here...`}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all font-mono"
                />
                <button 
                  onClick={validateAndAddKey}
                  disabled={isValidating || !newKey}
                  className="bg-blue-600 text-white px-6 rounded-2xl font-bold text-sm hover:bg-blue-700 disabled:bg-slate-300 transition-all flex items-center gap-2"
                >
                  {isValidating ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-plus"></i>}
                  Validate
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Active Pool</label>
              {currentPool.length === 0 ? (
                <div className="h-32 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                  <i className="fas fa-key text-2xl mb-2"></i>
                  <span className="text-xs font-bold uppercase tracking-widest">No keys added</span>
                </div>
              ) : (
                currentPool.map((key, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-100">
                        {idx + 1}
                      </div>
                      <span className="font-mono text-xs text-slate-500 truncate max-w-[200px]">
                        {key.substring(0, 10)}••••••••{key.substring(key.length - 4)}
                      </span>
                    </div>
                    <button 
                      onClick={() => removeKey(currentPool, setPool as any, key)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <p className="mt-6 text-[10px] text-slate-400 leading-relaxed italic text-center">
              The engine will automatically switch to the next key if one fails or is rate-limited.
            </p>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-xs font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-xl hover:bg-black transition-all transform active:scale-95">
            Apply Pool Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
