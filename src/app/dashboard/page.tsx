"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import {
  Database,
  TrendingUp,
  FileQuestion,
  Activity,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  FileText
} from "lucide-react";
import {
  fetchCOAStats,
  fetchImportExportStats,
  fetchQuestionnaireStats,
  fetchRecentActivity,
  type COAStats,
  type ImportExportStats,
  type QuestionnaireStats,
  type RecentActivity
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import TestLogin from "@/components/TestLogin";

export default function DashboardHome() {
  const [coaStats, setCOAStats] = useState<COAStats | null>(null);
  const [importExportStats, setImportExportStats] = useState<ImportExportStats | null>(null);
  const [questionnaireStats, setQuestionnaireStats] = useState<QuestionnaireStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      const token = getToken();
      if (!token) {
        console.log('No auth token found - user needs to log in');
        setLoading(false);
        return;
      }

      try {
        console.log('Loading dashboard data with token...');
        const [coa, importExport, questionnaire, activity] = await Promise.all([
          fetchCOAStats(token).catch((err) => {
            console.error('COA stats failed:', err);
            return { 
              totalSamplesThisMonth: 0, 
              totalFiles: 0, 
              avgProcessingTime: '0', 
              lastUploadDate: null, 
              monthlyUploads: [] 
            };
          }),
          fetchImportExportStats(token).catch((err) => {
            console.error('Import/Export stats failed:', err);
            return { totalRecords: 0, totalFiles: 0, avgProcessingTime: 0, lastUploadDate: null, monthlyUploads: [] };
          }),
          fetchQuestionnaireStats(token).catch((err) => {
            console.error('Questionnaire stats failed:', err);
            return { 
              totalProcessed: 0, 
              avgAutoAnswered: '0', 
              lastProcessedDate: null, 
              totalDrafts: 0, 
              totalQuestions: 0, 
              databaseAnswers: 0, 
              aiAnswers: 0 
            };
          }),
          fetchRecentActivity(token, 8).catch((err) => {
            console.error('Recent activity failed:', err);
            return { activities: [], total: 0 };
          })
        ]);

        setCOAStats(coa);
        setImportExportStats(importExport);
        setQuestionnaireStats(questionnaire);
        setRecentActivity(activity.activities);
        console.log('Dashboard data loaded:', { coa, importExport, questionnaire });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'draft': return <FileText className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'coa-database': return <Database className="w-4 h-4 text-blue-500" />;
      case 'import-export': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'questionnaires': return <FileQuestion className="w-4 h-4 text-purple-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-2/3"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Activity className="w-8 h-8 mr-3" />
              Dashboard
            </h1>
            <p className="text-slate-300 text-lg">
              Central overview of COA, Import/Export, and Questionnaires
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Real-time insights and analytics for your business operations
            </p>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {(coaStats?.totalFiles || 0) + (importExportStats?.totalRecords || 0) + (questionnaireStats?.totalProcessed || 0)}
              </div>
              <div className="text-sm text-slate-400">Total Records</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COA Statistics */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">COA Database</h3>
              <p className="text-sm text-gray-600">Certificate of Analysis</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Files</span>
              <span className="font-semibold text-lg">{coaStats?.totalFiles || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Samples This Month</span>
              <span className="font-semibold text-lg">{coaStats?.totalSamplesThisMonth || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Processing</span>
              <span className="font-semibold text-lg text-green-600">{coaStats?.avgProcessingTime || '0'}s</span>
            </div>
          </div>
          <Link
            href="/dashboard/coa-database"
            className="mt-4 w-full bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Link>
        </div>

        {/* Import/Export Statistics */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Import/Export</h3>
              <p className="text-sm text-gray-600">Trade Analysis</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Records</span>
              <span className="font-semibold text-lg">{importExportStats?.totalRecords || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Files Processed</span>
              <span className="font-semibold text-lg">{importExportStats?.totalFiles || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Processing</span>
              <span className="font-semibold text-lg text-blue-600">{importExportStats?.avgProcessingTime || 0}s</span>
            </div>
          </div>
          <Link
            href="/dashboard/import-export"
            className="mt-4 w-full bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Analytics
          </Link>
        </div>

        {/* Questionnaires Statistics */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileQuestion className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Questionnaires</h3>
              <p className="text-sm text-gray-600">AI Auto-Fill</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Processed</span>
              <span className="font-semibold text-lg">{questionnaireStats?.totalProcessed || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Drafts</span>
              <span className="font-semibold text-lg">{questionnaireStats?.totalDrafts || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Auto-Answered</span>
              <span className="font-semibold text-lg text-purple-600">{questionnaireStats?.avgAutoAnswered || '0'}%</span>
            </div>
          </div>
          <Link
            href="/dashboard/questionnaires"
            className="mt-4 w-full bg-purple-50 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            Manage Forms
          </Link>
        </div>
      </div>

      {/* Authentication Required */}
      {!getToken() ? (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-8 h-8 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-900">Authentication Required</h3>
                <p className="text-amber-700 mt-1">Please log in to view real-time dashboard statistics and recent activity.</p>
              </div>
            </div>
          </div>
          <TestLogin />
        </div>
      ) : recentActivity.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-600" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {getModuleIcon(activity.module)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                  <p className="text-xs text-gray-600">{activity.name}</p>
                </div>
                <div className="text-right">
                  {getStatusIcon(activity.status)}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
