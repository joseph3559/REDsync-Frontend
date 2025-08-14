"use client";
import { X, FileText, Target, BarChart3, Clock } from "lucide-react";

export interface ProcessingStats {
  totalFiles: number;
  processedFiles: number;
  totalRows: number;
  competitorMatches: number;
  hsCodeMatches: number;
  startTime: Date;
  isComplete: boolean;
}

interface ProcessingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stats: ProcessingStats;
}

export default function ProcessingDialog({ isOpen, onClose, stats }: ProcessingDialogProps) {
  if (!isOpen) return null;

  const elapsedTime = Math.floor((Date.now() - stats.startTime.getTime()) / 1000);
  const progress = stats.totalFiles > 0 ? (stats.processedFiles / stats.totalFiles) * 100 : 0;

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            {stats.isComplete ? 'Processing Complete' : 'Processing Files'}
          </h3>
          {stats.isComplete && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Overall Progress</span>
              <span className="text-slate-900 font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  stats.isComplete ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              {stats.processedFiles} of {stats.totalFiles} files processed
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-600">Total Rows</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalRows.toLocaleString()}</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">Competitor Matches</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">{stats.competitorMatches}</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">HS Code Matches</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{stats.hsCodeMatches}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Elapsed Time</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{formatTime(elapsedTime)}</p>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center">
            {stats.isComplete ? (
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  Processing Complete
                </div>
                <p className="text-sm text-slate-600">
                  All files have been processed successfully. You can now view and analyze the data.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                  Processing...
                </div>
                <p className="text-sm text-slate-600">
                  Extracting and analyzing trade data from your files. This may take a few moments.
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          {stats.isComplete && (
            <button
              onClick={onClose}
              className="w-full bg-slate-900 text-white py-2 px-4 rounded-md hover:bg-slate-800 transition-colors font-medium"
            >
              View Results
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
