
import React, { useState } from 'react';
import { FileItem, Market } from '../types';

interface MetadataCardProps {
  item: FileItem;
  market: Market;
  onRegenerate: () => void;
  onRemove: () => void;
}

const MetadataCard: React.FC<MetadataCardProps> = ({ item, market, onRegenerate, onRemove }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isCompleted = item.status === 'completed';
  const isProcessing = item.status === 'processing';
  const isError = item.status === 'error';

  const TITLE_LIMIT = market === Market.ZAZZLE ? 100 : 50;
  const DESC_LIMIT = market === Market.ZAZZLE ? 500 : 200;

  // Determine error style
  const isRateLimit = item.error?.toLowerCase().includes('rate limit');
  const isKeyError = item.error?.toLowerCase().includes('key');

  return (
    <div className={`bg-white rounded-[2rem] border card-hover animate-in overflow-hidden transition-all duration-300 ${
      isProcessing ? 'border-blue-400 ring-4 ring-blue-50 shadow-none scale-[1.01]' : 
      isError ? 'border-red-200 bg-red-50/10' : 'border-slate-200'
    }`}>
      <div className="flex flex-col md:flex-row h-full min-h-[320px]">
        {/* Design Canvas */}
        <div className={`w-full md:w-72 relative group border-r border-slate-100 flex items-center justify-center shrink-0 ${
          isError ? 'bg-red-50/20' : 'bg-slate-50'
        }`}>
          <img 
            src={item.previewUrl} 
            alt="POD Design" 
            className="w-full h-64 md:h-full object-contain p-8 drop-shadow-2xl"
          />
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
             <button 
              onClick={onRegenerate}
              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-90"
              title="Regenerate Metadata"
            >
              <i className="fas fa-sync-alt"></i>
            </button>
            <button 
              onClick={onRemove}
              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-90"
              title="Delete Entry"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
          
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 bg-white/80 backdrop-blur rounded-xl text-[10px] font-black text-slate-800 shadow-sm border border-white/50">
              {item.file.name.split('.').pop()?.toUpperCase() || 'FILE'}
            </span>
          </div>
        </div>

        {/* Metadata Editor */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          {!isCompleted && !isProcessing && !isError && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-hourglass-start text-slate-300 text-2xl"></i>
              </div>
              <h4 className="text-slate-700 font-bold mb-1">Pending Discovery</h4>
              <p className="text-slate-400 text-sm">Waiting for AI analysis...</p>
            </div>
          )}

          {isProcessing && (
            <div className="text-center py-12">
              <div className="relative w-20 h-20 mx-auto mb-6">
                 <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fas fa-eye text-blue-600 text-xl animate-pulse"></i>
                 </div>
              </div>
              <h4 className="text-blue-600 font-black text-lg tracking-tight">AI Visual Analysis</h4>
              <p className="text-slate-400 text-sm font-medium">Extracting niche and artistic styles...</p>
            </div>
          )}

          {isError && (
            <div className="text-center py-8">
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 ${
                isRateLimit ? 'bg-orange-50 text-orange-500' : 'bg-red-50 text-red-500'
              }`}>
                <i className={`fas ${isRateLimit ? 'fa-clock' : isKeyError ? 'fa-key' : 'fa-exclamation-triangle'} text-2xl`}></i>
              </div>
              <h4 className={`font-black text-lg tracking-tight mb-2 ${
                isRateLimit ? 'text-orange-600' : 'text-red-600'
              }`}>
                {isRateLimit ? 'Rate Limit Reached' : isKeyError ? 'Authentication Error' : 'Analysis Failed'}
              </h4>
              <div className="bg-white/50 border border-slate-100 rounded-2xl p-4 max-w-md mx-auto mb-6">
                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                  {item.error || 'An unexpected error occurred during processing.'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button 
                  onClick={onRegenerate}
                  className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                >
                  <i className="fas fa-redo-alt mr-2"></i> Try Again
                </button>
                <button 
                  onClick={onRemove}
                  className="bg-white text-slate-400 px-6 py-3 rounded-2xl text-sm font-bold border border-slate-100 hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {isCompleted && item.metadata && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-5">
                {/* Title Field */}
                <div className="group relative">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      SEO Optimized Title
                      {(market === Market.SPREADSHIRT || market === Market.ZAZZLE) && (
                        <span className={`ml-2 ${(item.metadata.title?.length || 0) > TITLE_LIMIT ? 'text-red-500' : 'text-blue-500'}`}>
                          ({item.metadata.title?.length || 0}/{TITLE_LIMIT})
                        </span>
                      )}
                    </label>
                    <button 
                      onClick={() => copyToClipboard(item.metadata?.title || '', 'title')}
                      className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-all"
                    >
                      {copiedField === 'title' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <input 
                    readOnly
                    value={item.metadata.title || ''}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 transition-all"
                  />
                </div>

                {/* TeePublic Main Tag */}
                {market === Market.TEEPUBLIC && item.metadata.mainTag && (
                  <div className="group relative">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                        <span>Primary SEO Anchor</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[8px]">Core Search Volume</span>
                      </label>
                      <button 
                        onClick={() => copyToClipboard(item.metadata.mainTag || '', 'mainTag')}
                        className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-all"
                      >
                        {copiedField === 'mainTag' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="w-full bg-slate-900 text-blue-400 border border-slate-800 rounded-2xl px-5 py-3 text-sm font-black tracking-wide flex items-center justify-between shadow-lg shadow-blue-900/10">
                      {item.metadata.mainTag}
                      <i className="fas fa-anchor text-[10px] opacity-50"></i>
                    </div>
                  </div>
                )}

                {/* Description Field */}
                <div className="group relative">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Meta Description
                      {(market === Market.SPREADSHIRT || market === Market.ZAZZLE) && (
                        <span className={`ml-2 ${(item.metadata.description?.length || 0) > DESC_LIMIT ? 'text-red-500' : 'text-blue-500'}`}>
                          ({item.metadata.description?.length || 0}/{DESC_LIMIT})
                        </span>
                      )}
                    </label>
                    <button 
                      onClick={() => copyToClipboard(item.metadata?.description || '', 'description')}
                      className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-all"
                    >
                      {copiedField === 'description' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <textarea 
                    readOnly
                    value={item.metadata.description || ''}
                    rows={market === Market.ZAZZLE ? 4 : 2}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-medium text-slate-600 outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Tags Field */}
                <div className="group relative">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Secondary Tags ({Array.isArray(item.metadata.tags) ? item.metadata.tags.length : 0})
                    </label>
                    <button 
                      onClick={() => copyToClipboard((item.metadata.tags || []).join(', '), 'tags')}
                      className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-all"
                    >
                      {copiedField === 'tags' ? 'Copied All!' : 'Bulk Copy'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-4 bg-slate-50 border border-slate-100 rounded-2xl custom-scrollbar shadow-inner">
                    {Array.isArray(item.metadata.tags) && item.metadata.tags.map((tag, idx) => (
                      <span key={idx} className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-500 shadow-sm hover:border-blue-200 transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetadataCard;
