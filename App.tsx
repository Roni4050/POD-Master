
import React, { useState, useCallback, useRef } from 'react';
import { Market, FileItem } from './types';
import { generateMetadata } from './services/geminiService';
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
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
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
      console.error(err);
      let errorMessage = 'Failed to generate metadata';
      
      // Basic check for API key related errors to prompt user
      if (err.message?.includes('Requested entity was not found')) {
        errorMessage = 'Invalid API key. Please reconfigure in Settings.';
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
      
      <div className="flex flex-1 overflow-hidden">
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
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Bulk Metadata Generator</h2>
              <p className="text-slate-500 mt-2 font-medium">Analyze your designs and generate professional SEO content for {market}.</p>
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
