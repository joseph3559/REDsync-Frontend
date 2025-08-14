"use client";
import { useState } from "react";
import { FileText, Download, ExternalLink } from "lucide-react";
import { Questionnaire } from "@/lib/api";

interface DocumentPreviewProps {
  questionnaire: Questionnaire;
}

export default function DocumentPreview({ questionnaire }: DocumentPreviewProps) {
  const [previewError, setPreviewError] = useState<string | null>(null);

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const originalFileExt = getFileExtension(questionnaire.originalFile);
  const processedFileUrl = questionnaire.processedFile 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/processed/questionnaires/${questionnaire.processedFile.split('/').pop()}`
    : null;

  const handleDownloadOriginal = () => {
    const link = document.createElement('a');
    link.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/uploads/${questionnaire.originalFile.split('/').pop()}`;
    link.download = `original-${questionnaire.id}.${originalFileExt}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewProcessed = () => {
    if (processedFileUrl) {
      window.open(processedFileUrl, '_blank');
    }
  };

  return (
    <div className="h-96 flex flex-col">
      {/* Preview Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <FileText className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {questionnaire.originalFile.split('/').pop()}
            </p>
            <p className="text-xs text-gray-500">
              {originalFileExt.toUpperCase()} • {questionnaire.status}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadOriginal}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Download original file"
          >
            <Download className="w-4 h-4" />
          </button>
          {processedFileUrl && (
            <button
              onClick={handleViewProcessed}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="View processed PDF"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-4">
        {questionnaire.processedFile ? (
          <div className="h-full">
            {/* PDF Preview */}
            <div className="h-full border border-gray-200 rounded bg-gray-50 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Processed PDF Preview</h4>
                  <button
                    onClick={handleViewProcessed}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                  >
                    <span>Open in new tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex-1 p-4">
                <iframe
                  src={`${processedFileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-full border-0 rounded"
                  title="PDF Preview"
                  onError={() => setPreviewError('Failed to load PDF preview')}
                />
                {previewError && (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">{previewError}</p>
                      <button
                        onClick={handleViewProcessed}
                        className="mt-2 text-purple-600 hover:text-purple-700 text-sm underline"
                      >
                        Open in new tab instead
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Document Preview</h4>
              <p className="text-sm text-gray-600 mb-4">
                The processed document will appear here once processing is complete
              </p>
              <div className="space-y-2 text-xs text-gray-500">
                <p>Original file: {questionnaire.originalFile.split('/').pop()}</p>
                <p>Status: {questionnaire.status}</p>
                <p>Questions found: {questionnaire.answers.length}</p>
              </div>
              {questionnaire.status === 'processing' && (
                <div className="mt-4">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Processing Status */}
      {questionnaire.status === 'processing' && (
        <div className="p-4 border-t border-gray-200 bg-blue-50">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="text-sm font-medium text-blue-900">Processing document...</p>
              <p className="text-xs text-blue-700">
                Extracting questions and generating answers. This may take a few moments.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
