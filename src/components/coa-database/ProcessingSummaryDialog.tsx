"use client";
import { CheckCircle, XCircle, Clock, FileText, X, ArrowDown } from "lucide-react";

interface ProcessingSummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  totalFiles: number;
  successCount: number;
  failedCount: number;
  processingTime: number;
  totalFieldsExtracted: number;
  onViewDetails: () => void;
}

export default function ProcessingSummaryDialog({
  isOpen,
  onClose,
  totalFiles,
  successCount,
  failedCount,
  processingTime,
  totalFieldsExtracted,
  onViewDetails,
}: ProcessingSummaryDialogProps) {
  if (!isOpen) return null;

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = (ms / 1000).toFixed(1);
    return `${seconds}s`;
  };

  const successRate = totalFiles > 0 ? Math.round((successCount / totalFiles) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Processing Complete</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success/Failure Icon */}
          <div className="flex justify-center mb-6">
            {failedCount === 0 ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            ) : successCount === 0 ? (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-yellow-600" />
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {successCount}/{totalFiles}
              </div>
              <div className="text-lg text-gray-600">
                Files processed successfully
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {successRate}% success rate
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-semibold text-gray-900 mb-1">
                  {totalFieldsExtracted}
                </div>
                <div className="text-sm text-gray-600">
                  Fields Extracted
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-semibold text-gray-900 mb-1 flex items-center justify-center">
                  <Clock className="w-5 h-5 mr-1" />
                  {formatTime(processingTime)}
                </div>
                <div className="text-sm text-gray-600">
                  Processing Time
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="space-y-2">
              {successCount > 0 && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-700 font-medium">Successful</span>
                  </div>
                  <span className="text-green-700 font-semibold">{successCount}</span>
                </div>
              )}
              
              {failedCount > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-700 font-medium">Failed</span>
                  </div>
                  <span className="text-red-700 font-semibold">{failedCount}</span>
                </div>
              )}
            </div>

            {/* Success Message */}
            {failedCount === 0 && (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-green-700 font-medium">
                  🎉 All files processed successfully!
                </div>
                <div className="text-green-600 text-sm mt-1">
                  Your COA data has been extracted and added to the database.
                </div>
              </div>
            )}

            {/* Partial Success Message */}
            {failedCount > 0 && successCount > 0 && (
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-yellow-700 font-medium">
                  ⚠️ Partial success
                </div>
                <div className="text-yellow-600 text-sm mt-1">
                  Some files couldn't be processed. Check the upload form for details.
                </div>
              </div>
            )}

            {/* Total Failure Message */}
            {failedCount > 0 && successCount === 0 && (
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-red-700 font-medium">
                  ❌ Processing failed
                </div>
                <div className="text-red-600 text-sm mt-1">
                  No files could be processed. Please check your files and try again.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          {successCount > 0 && (
            <button
              onClick={() => {
                onViewDetails();
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <ArrowDown className="w-4 h-4 mr-2" />
              View Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
