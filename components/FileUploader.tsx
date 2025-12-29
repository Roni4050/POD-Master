
import React from 'react';

interface FileUploaderProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ fileInputRef, onUpload }) => {
  return (
    <div 
      className="relative group animate-in"
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        multiple 
        accept="image/png, image/jpeg, image/jpg" 
        className="hidden" 
        ref={fileInputRef}
        onChange={onUpload}
      />
      
      <div className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center transition-all group-hover:border-blue-400 group-hover:bg-blue-50/30 cursor-pointer bg-white">
        <div className="bg-slate-100 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-500 shadow-inner group-hover:shadow-blue-200 shadow-slate-200">
          <i className="fas fa-file-upload text-slate-400 text-3xl group-hover:text-white"></i>
        </div>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Import Artwork</h3>
        <p className="text-slate-400 mt-2 font-medium max-w-sm mx-auto">Drop PNG or JPEG files here. Bulk processing will automatically utilize advanced AI vision for SEO metadata.</p>
        
        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Transparency Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Multi-Select</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
