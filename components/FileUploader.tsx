import React from 'react';
import { FileText, UploadCloud, X } from 'lucide-react';

interface FileUploaderProps {
  label: string;
  accept: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
  description: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  label,
  accept,
  multiple = false,
  onFilesSelected,
  selectedFiles,
  onRemoveFile,
  description
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div className="w-full group">
      <label className="block text-xs font-bold text-slate-700 mb-2 tracking-wide flex items-center">
         {label}
      </label>
      
      {selectedFiles.length === 0 ? (
        <div className="relative bg-slate-50 border border-dashed border-slate-300 rounded p-6 transition-all duration-300 ease-in-out hover:bg-white hover:border-blue-500 hover:shadow-md hover:shadow-blue-900/5">
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center pointer-events-none">
            <div className="w-10 h-10 bg-white border border-slate-200 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors group-hover:text-blue-600 group-hover:border-blue-100">
               <UploadCloud size={18} strokeWidth={2} />
            </div>
            <p className="mt-2 text-xs text-slate-600 font-bold">CSVファイルをドロップ</p>
            <p className="mt-1 text-[10px] text-slate-400">{description}</p>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {selectedFiles.map((file, index) => (
            <li key={index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded shadow-sm">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="h-8 w-8 bg-blue-50 rounded flex items-center justify-center text-blue-600">
                  <FileText size={16} strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-slate-700 font-bold truncate max-w-[150px]">{file.name}</span>
                    <span className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(0)} KB</span>
                </div>
              </div>
              <button
                onClick={() => onRemoveFile(index)}
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded hover:bg-slate-100"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};