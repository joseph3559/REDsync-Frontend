"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, CheckCircle, XCircle, Clock } from "lucide-react";

export interface UploadFile {
  id: string;
  file: File;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  error?: string;
}

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void;
  isProcessing: boolean;
  uploadedFiles: UploadFile[];
}

export default function FileUpload({ onFilesUploaded, isProcessing, uploadedFiles }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter only .xlsx files
    const xlsxFiles = acceptedFiles.filter(file => 
      file.name.toLowerCase().endsWith('.xlsx') || 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    
    if (xlsxFiles.length > 0) {
      onFilesUploaded(xlsxFiles);
    }
  }, [onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: true,
    disabled: isProcessing
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-slate-400" />;
      case 'processing':
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
    }
  };

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : isProcessing 
              ? 'border-slate-300 bg-slate-50 cursor-not-allowed'
              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className={`p-3 rounded-full ${isDragActive ? 'bg-blue-100' : 'bg-slate-100'}`}>
            <Upload className={`h-8 w-8 ${isDragActive ? 'text-blue-600' : 'text-slate-600'}`} />
          </div>
          
          {isDragActive ? (
            <div>
              <p className="text-lg font-medium text-blue-600">Drop the files here</p>
              <p className="text-sm text-blue-500">Upload .xlsx files to process import/export data</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-slate-900">
                {isProcessing ? 'Processing files...' : 'Drag & drop .xlsx files here'}
              </p>
              <p className="text-sm text-slate-500">
                {isProcessing 
                  ? 'Please wait for current upload to complete'
                  : 'or click to select files. Multiple files supported.'
                }
              </p>
            </div>
          )}

          {!isProcessing && (
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              Select Files
            </button>
          )}
        </div>
      </div>

      {/* File list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-slate-900">Upload Progress</h3>
          <div className="space-y-2">
            {uploadedFiles.map((uploadFile) => (
              <div key={uploadFile.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <File className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(uploadFile.file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {uploadFile.status === 'processing' && (
                    <div className="w-20">
                      <div className="bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadFile.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(uploadFile.status)}
                    <span className="text-sm text-slate-600">
                      {getStatusText(uploadFile.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
