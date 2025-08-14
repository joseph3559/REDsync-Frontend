"use client";
import { useState, useRef, useCallback } from "react";
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

interface FileUploadItem {
  file: File;
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  error?: string;
}

interface FileUploadFormProps {
  onUpload: (files: File[]) => Promise<void>;
  onProcessingComplete?: (totalFiles: number, successCount: number, failedCount: number, processingTime: number) => void;
  compact?: boolean;
}

export default function FileUploadForm({ onUpload, onProcessingComplete, compact = false }: FileUploadFormProps) {
  const [uploadItems, setUploadItems] = useState<FileUploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addFiles = useCallback((files: File[]) => {
    const newItems: FileUploadItem[] = files
      .filter(file => file.type === "application/pdf")
      .map(file => ({
        file,
        id: generateId(),
        status: "pending" as const,
        progress: 0,
      }));

    setUploadItems(prev => [...prev, ...newItems]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, [addFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addFiles(files);
    }
  }, [addFiles]);

  const removeFile = useCallback((id: string) => {
    setUploadItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const processFiles = useCallback(async () => {
    const pendingFiles = uploadItems.filter(item => item.status === "pending");
    if (pendingFiles.length === 0) return;

    setIsProcessing(true);
    const startTime = Date.now();

    try {
      // Set all files to processing
      setUploadItems(prev => 
        prev.map(item => 
          item.status === "pending" 
            ? { ...item, status: "processing" as const, progress: 0 }
            : item
        )
      );

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadItems(prev => 
          prev.map(item => 
            item.status === "processing" 
              ? { ...item, progress: Math.min(item.progress + Math.random() * 30, 90) }
              : item
          )
        );
      }, 500);

      try {
        const filesToUpload = pendingFiles.map(item => item.file);
        await onUpload(filesToUpload);
        
        // Mark all as completed
        setUploadItems(prev => 
          prev.map(item => 
            item.status === "processing" 
              ? { ...item, status: "completed" as const, progress: 100 }
              : item
          )
        );

        const endTime = Date.now();
        const processingTime = endTime - startTime;
        
        if (onProcessingComplete) {
          onProcessingComplete(
            pendingFiles.length,
            pendingFiles.length, // All successful for now
            0, // No failures for now
            processingTime
          );
        }

      } catch (error) {
        // Mark all as failed
        setUploadItems(prev => 
          prev.map(item => 
            item.status === "processing" 
              ? { 
                  ...item, 
                  status: "failed" as const, 
                  progress: 0,
                  error: error instanceof Error ? error.message : "Upload failed"
                }
              : item
          )
        );

        const endTime = Date.now();
        const processingTime = endTime - startTime;
        
        if (onProcessingComplete) {
          onProcessingComplete(
            pendingFiles.length,
            0, // No successful
            pendingFiles.length, // All failed
            processingTime
          );
        }
      } finally {
        clearInterval(progressInterval);
      }

    } finally {
      setIsProcessing(false);
    }
  }, [uploadItems, onUpload, onProcessingComplete]);

  const clearCompleted = useCallback(() => {
    setUploadItems(prev => prev.filter(item => item.status !== "completed"));
  }, []);

  const retryFailed = useCallback(() => {
    setUploadItems(prev => 
      prev.map(item => 
        item.status === "failed" 
          ? { ...item, status: "pending" as const, progress: 0, error: undefined }
          : item
      )
    );
  }, []);

  const getStatusIcon = (status: FileUploadItem["status"]) => {
    switch (status) {
      case "pending":
        return <FileText className="w-4 h-4 text-gray-400" />;
      case "processing":
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const pendingCount = uploadItems.filter(item => item.status === "pending").length;
  const processingCount = uploadItems.filter(item => item.status === "processing").length;
  const completedCount = uploadItems.filter(item => item.status === "completed").length;
  const failedCount = uploadItems.filter(item => item.status === "failed").length;

  return (
    <div className={compact ? "" : "bg-white rounded-lg shadow-sm border border-gray-200"}>
      <div className={compact ? "" : "p-6"}>
        {!compact && <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload PDF Files</h3>}
        
        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-lg font-medium text-gray-900 mb-2">
            Drop PDF files here or click to browse
          </div>
          <div className="text-sm text-gray-500 mb-4">
            Upload multiple PDF files to extract COA data
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Browse Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* File List */}
        {uploadItems.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900">
                Files ({uploadItems.length})
              </h4>
              <div className="flex gap-2">
                {completedCount > 0 && (
                  <button
                    onClick={clearCompleted}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear Completed
                  </button>
                )}
                {failedCount > 0 && (
                  <button
                    onClick={retryFailed}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Retry Failed
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto">
              {uploadItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="flex-shrink-0 mr-3">
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {item.file.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(item.file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                      {item.status === "processing" && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}
                      {item.error && (
                        <div className="text-xs text-red-600 mt-1 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {item.error}
                        </div>
                      )}
                    </div>
                  </div>
                  {item.status === "pending" && (
                    <button
                      onClick={() => removeFile(item.id)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Process Button */}
            {pendingCount > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={processFiles}
                  disabled={isProcessing}
                  className="inline-flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Process {pendingCount} Files
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Status Summary */}
            {(processingCount > 0 || completedCount > 0 || failedCount > 0) && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-700">
                  Processing: {processingCount} • Completed: {completedCount} • Failed: {failedCount}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
