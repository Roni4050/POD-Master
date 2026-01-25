
import React, { useState, useRef, useEffect } from 'react';
import { Market, FileItem, ProviderConfig, ProviderType } from './types';
import { generateMetadata } from './services/aiService';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FileUploader from './components/FileUploader';
import MetadataGrid from './components/MetadataGrid';
import SettingsModal from './components/SettingsModal';

const App: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [market, setMarket] = useState<Market>(Market.SPREADSHIRT);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [providerConfigs, setProviderConfigs] = useState<ProviderConfig>(() => {
    const saved = localStorage.getItem('pod_master_configs_v4');
    if (saved) return JSON.parse(saved);
    return {
      mistral: { isActive: true, status: 'disabled', apiKey: '' },
      groq: { isActive: true, status: 'disabled', apiKey: '' }
    };
  });

  const providerConfigsRef = useRef(providerConfigs);
  useEffect(() => {
    providerConfigsRef.current = providerConfigs;
    localStorage.setItem('pod_master_configs_v4', JSON.stringify(providerConfigs));
  }, [providerConfigs]);

  const updateProviderStatus = (provider: ProviderType, status: 'active' | 'rate-limited' | 'error' | 'disabled') => {
    setProviderConfigs(prev => ({
      ...prev,
      [provider]: { ...prev[provider], status }
    }));
  };

  const handleToggleProvider = (provider: ProviderType) => {
    setProviderConfigs(prev => ({
      ...prev,
      [provider]: { ...prev[provider], isActive: !prev[provider].isActive }
    }));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newFiles: FileItem[] = Array.from(e.target.files).map((file: File) => ({
      id: Math.random().toString(36).substring(2, 11),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = () => reject(new Error("File parsing error"));
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (item: FileItem) => {
    setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'processing', error: undefined } : f));
    
    try {
      const base64 = await fileToBase64(item.file);
      const metadata = await generateMetadata(base64, item.file.type, market, providerConfigsRef.current, updateProviderStatus);
      
      setFiles(prev => prev.map(f => f.id === item.id ? { 
        ...f, 
        status: 'completed', 
        metadata: {
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags,
          mainTag: metadata.mainTag
        } 
      } : f));
    } catch (err: any) {
      setFiles(prev => prev.map(f => f.id === item.id ? { 
        ...f, 
        status: 'error', 
        error: err.message || "AI Analysis Failed"
      } : f));
    }
  };

  const generateAll = async () => {
    if (isProcessing) return;
    
    const currentConfigs = providerConfigsRef.current;
    const hasKeys = (currentConfigs.mistral.isActive && currentConfigs.mistral.apiKey) || 
                    (currentConfigs.groq.isActive && currentConfigs.groq.apiKey);
                    
    if (!hasKeys) {
      alert("Please configure and enable at least one API key (Mistral or Groq) in Settings.");
      setIsSettingsOpen(true);
      return;
    }

    setIsProcessing(true);
    const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'error');
    
    for (let i = 0; i < pendingFiles.length; i++) {
      const file = pendingFiles[i];
      await processFile(file);
      
      // Small delay between files to respect API tier concurrency limits
      if (i < pendingFiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
    
    setIsProcessing(false);
  };

  const clearAll = () => {
    files.forEach(f => URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) URL.revokeObjectURL(file.previewUrl);
      return prev.filter(f => f.id !== id);
    });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        configs={providerConfigs} 
        onToggleProvider={handleToggleProvider}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          market={market} 
          setMarket={setMarket} 
          generateAll={generateAll} 
          clearAll={clearAll} 
          isProcessing={isProcessing}
          pendingCount={files.filter(f => f.status === 'pending' || f.status === 'error').length}
        />
        
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-50">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center pt-8">
              <h2 className="text-4xl font-black text-slate-800 tracking-tight">Bulk Metadata Suite</h2>
              <p className="text-slate-500 mt-2 font-medium">Automatic SEO Generation for {market}.</p>
              <div className="mt-4 flex items-center justify-center gap-4">
                 <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                   <i className="fas fa-microchip mr-1"></i> Mistral Large 3 Frontier
                 </span>
                 <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                   <i className="fas fa-check-double mr-1"></i> SEO Compliant
                 </span>
              </div>
            </div>

            <FileUploader fileInputRef={fileInputRef} onUpload={handleFileUpload} />

            <MetadataGrid 
              files={files} 
              market={market} 
              onRegenerate={processFile}
              onRemove={removeFile}
            />
          </div>
        </main>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        configs={providerConfigs}
        onUpdate={setProviderConfigs}
      />
    </div>
  );
};

export default App;
