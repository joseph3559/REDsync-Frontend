"use client";
import Link from "next/link";
import {
  Database,
  TrendingUp,
  FileQuestion,
  ArrowUpRight
} from "lucide-react";
import {
  type COAStats,
  type ImportExportStatsLegacy as ImportExportStats,
  type QuestionnaireStats
} from "@/lib/api";

interface DashboardCardsProps {
  coaStats: COAStats | null;
  importExportStats: ImportExportStats | null;
  questionnaireStats: QuestionnaireStats | null;
}

export default function DashboardCards({ coaStats, importExportStats, questionnaireStats }: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* COA Database Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">COA Database</h3>
            <p className="text-sm text-gray-600">Chemical analysis & quality control</p>
          </div>
        </div>

        {coaStats ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">{coaStats.totalSamplesThisMonth}</div>
                <div className="text-sm text-gray-600">Samples This Month</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{coaStats.totalFiles}</div>
                <div className="text-sm text-gray-600">Total Files</div>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Avg Processing Time</span>
                <span className="font-medium text-gray-900">{coaStats.avgProcessingTime}</span>
              </div>
              {coaStats.lastUploadDate && (
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Last Upload</span>
                  <span className="font-medium text-gray-900">
                    {new Date(coaStats.lastUploadDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No COA records yet</p>
            <p className="text-gray-400 text-xs">Start by uploading analysis files</p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t">
          <Link 
            href="/dashboard/coa-database"
            className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Go to COA Database
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      {/* Import/Export Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-green-100 rounded-xl">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Import/Export</h3>
            <p className="text-sm text-gray-600">Trade records & market analysis</p>
          </div>
        </div>

        {importExportStats ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">{importExportStats.tradeRecordsThisMonth}</div>
                <div className="text-sm text-gray-600">Records This Month</div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="text-2xl font-bold text-gray-900">{importExportStats.priceTrend}</div>
                <div className={`text-sm ${importExportStats.priceTrend.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                  {importExportStats.priceTrend.startsWith('-') ? '↓' : '↑'}
                </div>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Imports</span>
                <span className="font-medium text-gray-900">{importExportStats.totalImports.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Total Exports</span>
                <span className="font-medium text-gray-900">{importExportStats.totalExports.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No trade records yet</p>
            <p className="text-gray-400 text-xs">Start by importing trade data</p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t">
          <Link 
            href="/dashboard/import-export"
            className="inline-flex items-center justify-center w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Go to Import/Export
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      {/* Questionnaires Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-xl">
            <FileQuestion className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Questionnaires</h3>
            <p className="text-sm text-gray-600">AI-powered auto-completion</p>
          </div>
        </div>

        {questionnaireStats ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">{questionnaireStats.totalProcessed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{questionnaireStats.avgAutoAnswered}</div>
                <div className="text-sm text-gray-600">Auto-Answered</div>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Questions</span>
                <span className="font-medium text-gray-900">{questionnaireStats.totalQuestions}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Draft Questionnaires</span>
                <span className="font-medium text-gray-900">{questionnaireStats.totalDrafts}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <FileQuestion className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No questionnaires yet</p>
            <p className="text-gray-400 text-xs">Start by uploading a questionnaire</p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t">
          <Link 
            href="/dashboard/questionnaires"
            className="inline-flex items-center justify-center w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Go to Questionnaires
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
