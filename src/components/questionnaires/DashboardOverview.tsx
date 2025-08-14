"use client";
import { useState, useEffect } from "react";
import { 
  FileText, 
  Database, 
  Brain, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Upload,
  Save,
  XCircle
} from "lucide-react";
import { fetchQuestionnaires, type QuestionnairesResponse } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function DashboardOverview() {
  const [stats, setStats] = useState<QuestionnairesResponse['stats'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentQuestionnaires, setRecentQuestionnaires] = useState<any[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetchQuestionnaires("all", 5, token);
        setStats(response.stats);
        setRecentQuestionnaires(response.questionnaires);
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-sm p-8 text-white">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-white/90" />
            <h2 className="text-2xl font-bold mb-3">Welcome to Questionnaire Auto-Filler</h2>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Upload PDF, DOCX, or XLSX questionnaires and let our AI system automatically complete them 
              using your company's stored information and intelligent answer generation.
            </p>
            <button
              onClick={() => {
                // This will be handled by parent component
                window.dispatchEvent(new CustomEvent('switchToUploadTab'));
              }}
              className="bg-white text-purple-700 hover:bg-purple-50 px-8 py-4 rounded-lg font-semibold transition-colors flex items-center space-x-3 mx-auto text-lg"
            >
              <Upload className="w-6 h-6" />
              <span>Upload Your First Questionnaire</span>
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="p-3 bg-blue-100 rounded-lg inline-flex mb-4">
              <Database className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Database Lookup</h3>
            <p className="text-gray-600 text-sm">
              Automatically answers questions using your pre-configured company information and certification data.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="p-3 bg-purple-100 rounded-lg inline-flex mb-4">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Completion</h3>
            <p className="text-gray-600 text-sm">
              Uses advanced AI to generate contextually appropriate answers for questions not in your database.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="p-3 bg-green-100 rounded-lg inline-flex mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready-to-Send PDFs</h3>
            <p className="text-gray-600 text-sm">
              Generates professionally signed PDF documents ready for submission to your clients.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const total = stats.processed + stats.draft + stats.processing + stats.failed;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Overview Statistics
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Questionnaires */}
          <div className="text-center">
            <div className="p-3 bg-blue-100 rounded-lg inline-flex mb-3">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
            <p className="text-sm text-gray-600">Total Questionnaires</p>
          </div>

          {/* Completed */}
          <div className="text-center">
            <div className="p-3 bg-green-100 rounded-lg inline-flex mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-900">{stats.processed}</p>
            <p className="text-sm text-green-600">Completed</p>
            <div className="mt-1">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {total > 0 ? Math.round((stats.processed / total) * 100) : 0}%
              </span>
            </div>
          </div>

          {/* Drafts */}
          <div className="text-center">
            <div className="p-3 bg-yellow-100 rounded-lg inline-flex mb-3">
              <Save className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-900">{stats.draft}</p>
            <p className="text-sm text-yellow-600">Drafts</p>
            <div className="mt-1">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {total > 0 ? Math.round((stats.draft / total) * 100) : 0}%
              </span>
            </div>
          </div>

          {/* Processing/Failed */}
          <div className="text-center">
            <div className="p-3 bg-gray-100 rounded-lg inline-flex mb-3">
              {stats.processing > 0 ? (
                <Clock className="w-8 h-8 text-gray-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.processing + stats.failed}</p>
            <p className="text-sm text-gray-600">Processing/Failed</p>
            <div className="mt-1 space-x-1">
              {stats.processing > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {stats.processing} processing
                </span>
              )}
              {stats.failed > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {stats.failed} failed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Answer Sources Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Answer Sources Breakdown</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Total Answers */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-2">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAnswers}</p>
                <p className="text-sm text-gray-600">Total Answers Generated</p>
              </div>
            </div>
          </div>

          {/* Database Answers */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-2">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{stats.totalFromDatabase}</p>
                <p className="text-sm text-blue-600">From Database</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                  {stats.totalAnswers > 0 ? Math.round((stats.totalFromDatabase / stats.totalAnswers) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* AI Generated */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-2">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-900">{stats.totalFromAI}</p>
                <p className="text-sm text-purple-600">AI Generated</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                  {stats.totalAnswers > 0 ? Math.round((stats.totalFromAI / stats.totalAnswers) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {stats.totalAnswers > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Answer Sources Distribution</span>
              <span>{stats.totalAnswers} total answers</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="flex h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500"
                  style={{ width: `${(stats.totalFromDatabase / stats.totalAnswers) * 100}%` }}
                  title={`${stats.totalFromDatabase} from database`}
                />
                <div 
                  className="bg-purple-500"
                  style={{ width: `${(stats.totalFromAI / stats.totalAnswers) * 100}%` }}
                  title={`${stats.totalFromAI} AI generated`}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>Database ({stats.totalFromDatabase})</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span>AI Generated ({stats.totalFromAI})</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {recentQuestionnaires.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('switchToUploadTab'));
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New</span>
            </button>
          </div>
          <div className="space-y-3">
            {recentQuestionnaires.slice(0, 3).map((q) => (
              <div key={q.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {q.originalFile.replace(/^.*[\\\/]/, '')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(q.createdAt).toLocaleDateString()} • {q.answers.length} questions
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  q.status === 'processed' ? 'bg-green-100 text-green-800' :
                  q.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  q.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {q.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions for experienced users */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Ready to Process More?</h3>
            <p className="text-purple-700 text-sm">
              Upload another questionnaire to continue building your automation library.
            </p>
          </div>
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('switchToUploadTab'));
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 font-medium"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Questionnaire</span>
          </button>
        </div>
      </div>
    </div>
  );
}
