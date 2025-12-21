
import React from 'react';
import { Market } from '../types';

interface SidebarProps {
  market: Market;
  setMarket: (m: Market) => void;
  generateAll: () => void;
  clearAll: () => void;
  isProcessing: boolean;
  pendingCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  market, 
  setMarket, 
  generateAll, 
  clearAll, 
  isProcessing,
  pendingCount 
}) => {
  return (
    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col p-6 space-y-8 hidden lg:flex">
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-5 block">Select Marketplace</label>
        <div className="space-y-3">
          <button 
            onClick={() => setMarket(Market.SPREADSHIRT)}
            className={`w-full p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${
              market === Market.SPREADSHIRT 
                ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 relative z-10">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${market === Market.SPREADSHIRT ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                <i className="fas fa-tshirt"></i>
              </div>
              <div>
                <span className={`font-bold block ${market === Market.SPREADSHIRT ? 'text-blue-900' : 'text-slate-700'}`}>Spreadshirt</span>
                <span className="text-[10px] opacity-70 font-medium">50 chars title / 200 chars desc</span>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => setMarket(Market.TEEPUBLIC)}
            className={`w-full p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${
              market === Market.TEEPUBLIC 
                ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 relative z-10">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${market === Market.TEEPUBLIC ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                <i className="fas fa-store"></i>
              </div>
              <div>
                <span className={`font-bold block ${market === Market.TEEPUBLIC ? 'text-blue-900' : 'text-slate-700'}`}>TeePublic</span>
                <span className="text-[10px] opacity-70 font-medium">Main tag + optimized keywords</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Platform Rules</label>
        <div className="bg-slate-900 rounded-2xl p-5 text-xs text-slate-300 border border-slate-800 shadow-inner">
          {market === Market.SPREADSHIRT ? (
            <div className="space-y-3">
              <div className="flex gap-3">
                <i className="fas fa-check-circle text-blue-400 mt-0.5"></i>
                <p>Strict <span className="text-white font-bold">50 Character</span> Title limit for search indexing.</p>
              </div>
              <div className="flex gap-3">
                <i className="fas fa-check-circle text-blue-400 mt-0.5"></i>
                <p>Exactly <span className="text-white font-bold">25 Tags</span> recommended for internal ranking.</p>
              </div>
              <div className="flex gap-3">
                <i className="fas fa-check-circle text-blue-400 mt-0.5"></i>
                <p><span className="text-white font-bold">200 Character</span> Description for mobile clarity.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-3">
                <i className="fas fa-check-circle text-blue-400 mt-0.5"></i>
                <p><span className="text-white font-bold">Main Tag</span> determines your category relevance.</p>
              </div>
              <div className="flex gap-3">
                <i className="fas fa-check-circle text-blue-400 mt-0.5"></i>
                <p>Support for <span className="text-white font-bold">Long-tail</span> keywords in secondary tags.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-100 space-y-3">
        <button 
          onClick={generateAll}
          disabled={isProcessing || pendingCount === 0}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
            isProcessing || pendingCount === 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transform active:scale-[0.98]'
          }`}
        >
          {isProcessing ? (
            <i className="fas fa-spinner animate-spin"></i>
          ) : (
            <i className="fas fa-bolt"></i>
          )}
          {isProcessing ? 'AI Processing...' : `Analyze ${pendingCount} Designs`}
        </button>

        <button 
          onClick={clearAll}
          className="w-full py-3 text-slate-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest transition-colors"
        >
          Clear Queue
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
