
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

  const TITLE_LIMIT = 50;
  const DESC_LIMIT = 200;

  return (
    <div className={`bg-white rounded-[2rem] border card-hover animate-in overflow-hidden ${
      isProcessing ? 'border-blue-400 ring-4 ring-blue-50 shadow-none' : 'border-slate-200'
    }`}>
      <div className="flex flex-col md:flex-row h-full min-h-[320px]">
        {/* Design Canvas */}
        <div className="w-full md:w-72 bg-slate-50 relative group border-r border-slate-100 flex items-center justify-center shrink-0">
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
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-circle text-2xl"></i>
              </div>
              <h4 className="text-red-600 font-bold mb-2">Analysis Failed</h4>
              <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">{item.error || 'Unknown error occurred.'}</p>
              <button 
                onClick={onRegenerate}
                className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
              >
                Retry Generation
              </button>
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
                      {market === Market.SPREADSHIRT && (
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
                      {market === Market.SPREADSHIRT && (
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
                    rows={2}
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
