"use client";
import { Database, Brain, XCircle, CheckCircle, Clock } from "lucide-react";

interface ProcessStats {
  totalQuestions: number;
  dbAnswered: number;
  aiAnswered: number;
  skipped: number;
  processingTime: number;
}

interface ProcessStatusProps {
  stats: ProcessStats;
}

export default function ProcessStatus({ stats }: ProcessStatusProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Processing Insights</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Questions */}
        <div className="text-center">
          <div className="p-3 bg-gray-100 rounded-lg inline-flex mb-3">
            <CheckCircle className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
          <p className="text-sm text-gray-600">Total Questions</p>
        </div>

        {/* Database Answered */}
        <div className="text-center">
          <div className="p-3 bg-blue-100 rounded-lg inline-flex mb-3">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">{stats.dbAnswered}</p>
          <p className="text-sm text-blue-600">From Database</p>
          <div className="mt-1">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {stats.totalQuestions > 0 ? Math.round((stats.dbAnswered / stats.totalQuestions) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* AI Answered */}
        <div className="text-center">
          <div className="p-3 bg-purple-100 rounded-lg inline-flex mb-3">
            <Brain className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-900">{stats.aiAnswered}</p>
          <p className="text-sm text-purple-600">AI Generated</p>
          <div className="mt-1">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {stats.totalQuestions > 0 ? Math.round((stats.aiAnswered / stats.totalQuestions) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Skipped */}
        <div className="text-center">
          <div className="p-3 bg-yellow-100 rounded-lg inline-flex mb-3">
            <XCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-900">{stats.skipped}</p>
          <p className="text-sm text-yellow-600">Skipped</p>
          <div className="mt-1">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {stats.totalQuestions > 0 ? Math.round((stats.skipped / stats.totalQuestions) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Processing Time */}
        <div className="text-center">
          <div className="p-3 bg-green-100 rounded-lg inline-flex mb-3">
            <Clock className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">{stats.processingTime.toFixed(1)}s</p>
          <p className="text-sm text-green-600">Processing Time</p>
          <div className="mt-1">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {stats.totalQuestions > 0 ? (stats.processingTime / stats.totalQuestions).toFixed(1) : 0}s/q
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Answer Sources</span>
          <span>{stats.totalQuestions} questions total</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="flex h-3 rounded-full overflow-hidden">
            {stats.totalQuestions > 0 && (
              <>
                <div 
                  className="bg-blue-500"
                  style={{ width: `${(stats.dbAnswered / stats.totalQuestions) * 100}%` }}
                  title={`${stats.dbAnswered} from database`}
                />
                <div 
                  className="bg-purple-500"
                  style={{ width: `${(stats.aiAnswered / stats.totalQuestions) * 100}%` }}
                  title={`${stats.aiAnswered} AI generated`}
                />
                <div 
                  className="bg-yellow-500"
                  style={{ width: `${(stats.skipped / stats.totalQuestions) * 100}%` }}
                  title={`${stats.skipped} skipped`}
                />
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Database</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span>AI</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span>Skipped</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Summary:</strong> Successfully processed {stats.totalQuestions} questions in {stats.processingTime.toFixed(1)} seconds. 
          {stats.dbAnswered > 0 && ` ${stats.dbAnswered} answers retrieved from database,`}
          {stats.aiAnswered > 0 && ` ${stats.aiAnswered} answers generated by AI,`}
          {stats.skipped > 0 && ` ${stats.skipped} questions skipped based on certification logic.`}
        </p>
      </div>
    </div>
  );
}
