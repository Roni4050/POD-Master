
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Market, FileItem } from './types';
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
      reader.onload = () => {
        const result = reader.result as string;
        const base64String = result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = () => reject(new Error("Problem parsing input file."));
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (item: FileItem) => {
    setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'processing', error: undefined } : f));
    
    try {
      const base64 = await fileToBase64(item.file);
      const metadata = await generateMetadata(base64, item.file.type, market);
      
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
      console.error("Processing Error:", err);
      let errorMessage = err.message || 'Failed to generate metadata';
      
      if (err.message?.includes('429')) {
        errorMessage = 'Rate limit reached on current provider keys. Rotate or add more keys.';
      }

      setFiles(prev => prev.map(f => f.id === item.id ? { 
        ...f, 
        status: 'error', 
        error: errorMessage
      } : f));
    }
  };

  const generateAll = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'error');
    for (const file of pendingFiles) {
      await processFile(file);
      await new Promise(r => setTimeout(r, 300)); // Safer spacing for external APIs
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
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      
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
            <div className="text-center pt-4">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Bulk Metadata Generator</h2>
              <p className="text-slate-500 mt-2 font-medium">Analyze your designs and generate professional SEO content for {market}.</p>
              <div className="mt-4 flex items-center justify-center gap-4">
                 <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100 shadow-sm">
                   <i className="fas fa-bolt"></i> Groq Powered
                 </span>
                 <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100 shadow-sm">
                   <i className="fas fa-eye"></i> Mistral Large Analysis
                 </span>
              </div>
            </div>

            <FileUploader 
              fileInputRef={fileInputRef} 
              onUpload={handleFileUpload} 
            />

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
      />
    </div>
  );
};

export default App;
