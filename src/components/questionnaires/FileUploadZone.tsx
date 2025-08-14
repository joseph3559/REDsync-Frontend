"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle } from "lucide-react";

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  loading?: boolean;
}

export default function FileUploadZone({ onFilesSelected, loading }: FileUploadZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      alert(`Some files were rejected. Please only upload PDF, DOCX, or XLSX files.`);
    }
    if (acceptedFiles.length > 0) {
      onFilesSelected(acceptedFiles);
    }
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: true,
    disabled: loading,
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Questionnaires</h3>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragActive && !isDragReject
            ? 'border-purple-500 bg-purple-50'
            : isDragReject
            ? 'border-red-500 bg-red-50'
            : loading
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {loading ? (
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          ) : isDragReject ? (
            <AlertCircle className="w-12 h-12 text-red-500" />
          ) : (
            <Upload className="w-12 h-12 text-gray-400" />
          )}
          
          <div>
            {loading ? (
              <p className="text-lg font-medium text-gray-600">Processing files...</p>
            ) : isDragActive ? (
              isDragReject ? (
                <p className="text-lg font-medium text-red-600">
                  Invalid file types. Please drop PDF, DOCX, or XLSX files.
                </p>
              ) : (
                <p className="text-lg font-medium text-purple-600">Drop files here...</p>
              )
            ) : (
              <>
                <p className="text-lg font-medium text-gray-900">
                  Drop questionnaire files here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports PDF, DOCX, and XLSX files (up to 10 files, 25MB each)
                </p>
              </>
            )}
          </div>
          
          {!loading && !isDragActive && (
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>PDF</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>DOCX</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>XLSX</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p><strong>How it works:</strong></p>
        <ol className="list-decimal list-inside space-y-1 mt-2">
          <li>Upload your questionnaire files (PDF, DOCX, or XLSX)</li>
          <li>AI extracts questions and matches answers from our database</li>
          <li>Review and edit answers as needed</li>
          <li>Download the completed, signed PDF</li>
        </ol>
      </div>
    </div>
  );
}
