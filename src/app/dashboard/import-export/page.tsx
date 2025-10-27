"use client";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, BarChart3, Database, TrendingUp, Upload, Plus, Globe, Target, DollarSign, FileSpreadsheet, Eye, Filter, Download } from "lucide-react";
import FileUpload, { UploadFile } from "@/components/import-export/FileUpload";
import ProcessingDialog, { ProcessingStats } from "@/components/import-export/ProcessingDialog";
import DataTable from "@/components/import-export/DataTable";
import ViewModeToggle from "@/components/import-export/ViewModeToggle";
import InsightsDashboard from "@/components/import-export/InsightsDashboard";
import ExportControls from "@/components/import-export/ExportControls";
import { processImportExportFiles, ImportExportRow, fetchImportExportStats, fetchImportExportRecords, fetchImportExportCompanies, fetchImportExportMonthly } from "@/lib/api";
import { getToken } from "@/lib/auth";
import TestLogin from "@/components/TestLogin";

type ViewMode = 'pricing' | 'competition';
type ActiveTab = 'overview' | 'upload' | 'files' | 'data' | 'insights';

interface ImportExportStatsLocal {
  totalRecords: number;
  totalFiles: number;
  avgProcessingTime: number;
  lastUploadDate: string | null;
  monthlyUploads: Array<{ month: string; count: number; }>;
}

function ImportExportPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = (searchParams.get('tab') as ActiveTab) || 'overview';
  const [activeTab, setActiveTab] = useState<ActiveTab>(tabFromUrl);
  const [viewMode, setViewMode] = useState<ViewMode>('pricing');
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<ImportExportRow[]>([]);
  const [overviewStats, setOverviewStats] = useState<ImportExportStatsLocal | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [processingStats, setProcessingStats] = useState<ProcessingStats>({
    totalFiles: 0,
    processedFiles: 0,
    totalRows: 0,
    competitorMatches: 0,
    hsCodeMatches: 0,
    startTime: new Date(),
    isComplete: false
  });
  const [showProcessingDialog, setShowProcessingDialog] = useState(false);
  
  // Company selection and analytics state
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [companies, setCompanies] = useState<string[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Function to update URL when tab changes
  const handleTabChange = (newTab: ActiveTab) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    router.push(`/dashboard/import-export?${params.toString()}`);
  };

  const handleFilesUploaded = async (files: File[]) => {
    // Get authentication token
    const token = getToken();
    if (!token) {
      alert("Please log in to upload files");
      return;
    }

    // Create upload file entries
    const newUploadFiles: UploadFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0
    }));

    setUploadedFiles(newUploadFiles);
    setIsProcessing(true);
    setShowProcessingDialog(true);

    // Initialize processing stats
    const startTime = new Date();
    setProcessingStats({
      totalFiles: files.length,
      processedFiles: 0,
      totalRows: 0,
      competitorMatches: 0,
      hsCodeMatches: 0,
      startTime,
      isComplete: false
    });

    try {
      // Update files to processing state
      setUploadedFiles(prev => prev.map(file => ({ 
        ...file, 
        status: 'processing',
        progress: 50 
      })));

      // Process files
      const result = await processImportExportFiles(files, token);

      // Simulate progressive updates for better UX
      setTimeout(() => {
        setProcessingStats(prev => ({
          ...prev,
          totalRows: result.totalRows,
          competitorMatches: Math.floor(result.totalRows * 0.15), // Estimated
          hsCodeMatches: Math.floor(result.totalRows * 0.8), // Estimated
        }));
      }, 500);

      setTimeout(() => {
        setProcessingStats(prev => ({
          ...prev,
          processedFiles: files.length,
          isComplete: true
        }));

        // Update files to completed state
        setUploadedFiles(prev => prev.map(file => ({ 
          ...file, 
          status: 'completed',
          progress: 100 
        })));

        // Set processed data (append to existing data)
        setProcessedData(prev => [...prev, ...result.rows]);
      }, 1000);

    } catch (error) {
      console.error('Processing failed:', error);
      
      // Update files to error state
      setUploadedFiles(prev => prev.map(file => ({ 
        ...file, 
        status: 'error',
        error: error instanceof Error ? error.message : 'Processing failed'
      })));

      setProcessingStats(prev => ({
        ...prev,
        isComplete: true
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessingDialogClose = () => {
    setShowProcessingDialog(false);
    setShowUploadForm(false);
    if (processedData.length > 0) {
      handleTabChange('data');
    }
    loadStats(); // Reload stats after processing
    loadExistingRecords(); // Reload all records to get the latest data
  };

  // Load overview statistics
  const loadStats = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.log('No auth token found - user needs to log in');
        // Set default values when not logged in
        setOverviewStats({
          totalRecords: 0,
          totalFiles: 0,
          avgProcessingTime: 0,
          lastUploadDate: null,
          monthlyUploads: []
        });
        setLoadingStats(false);
        return;
      }

      setLoadingStats(true);
      const stats = await fetchImportExportStats(token);
      console.log('Loaded stats:', stats);
      // Convert API stats to local stats format
      const localStats: ImportExportStatsLocal = {
        totalRecords: stats.totalRecords || 0,
        totalFiles: stats.totalFiles || uploadedFiles.length,
        avgProcessingTime: stats.avgProcessingTime || 2.5,
        lastUploadDate: stats.lastUploadDate || new Date().toISOString(),
        monthlyUploads: stats.monthlyUploads || []
      };
      setOverviewStats(localStats);
    } catch (error) {
      console.error('Failed to load import/export stats:', error);
      // Set default values on error
      setOverviewStats({
        totalRecords: 0,
        totalFiles: 0,
        avgProcessingTime: 0,
        lastUploadDate: null,
        monthlyUploads: []
      });
    } finally {
      setLoadingStats(false);
    }
  };

  // Load existing records from database
  const loadExistingRecords = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetchImportExportRecords(token);
      if (response.records && response.records.length > 0) {
        setProcessedData(response.records);
        console.log(`Loaded ${response.records.length} existing records from database`);
      }
    } catch (error) {
      console.error('Failed to load existing records:', error);
    }
  };

  // Load companies for selection dropdown
  const loadCompanies = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetchImportExportCompanies(token);
      if (response.companies) {
        setCompanies(response.companies);
        console.log(`Loaded ${response.companies.length} companies`);
      }
    } catch (error) {
      console.error('Failed to load companies:', error);
    }
  };

  // Load analytics data based on selected company
  const loadAnalytics = async () => {
    try {
      const token = getToken();
      if (!token) return;

      setLoadingAnalytics(true);
      const company = selectedCompany === 'ALL' ? undefined : selectedCompany;
      const response = await fetchImportExportMonthly({ company, token });
      setAnalyticsData(response);
      console.log('Loaded analytics data:', response);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadExistingRecords();
    loadCompanies();
  }, []);

  // Load analytics when company selection changes
  useEffect(() => {
    if (companies.length > 0) {
      loadAnalytics();
    }
  }, [selectedCompany, companies]);

  // Statistics for the header cards
  const stats = useMemo(() => {
    return {
      totalRecords: processedData.length,
      totalValue: processedData.reduce((sum, row) => sum + ((row.Price || 0) * (row.Quantity || 0)), 0),
      uniqueCompetitors: new Set(processedData.map(row => row["Importer/Exporter"]).filter(Boolean)).size,
      avgPrice: processedData.filter(row => row.Price).length > 0 
        ? processedData.filter(row => row.Price).reduce((sum, row) => sum + (row.Price || 0), 0) / processedData.filter(row => row.Price).length
        : 0
    };
  }, [processedData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const tabs = [
    { id: 'overview' as ActiveTab, label: 'Overview', icon: Eye },
    { id: 'upload' as ActiveTab, label: 'Upload Files', icon: FileText },
    { id: 'files' as ActiveTab, label: 'Uploaded Files', icon: FileSpreadsheet },
    { id: 'data' as ActiveTab, label: 'Data Analysis', icon: Database },
    { id: 'insights' as ActiveTab, label: 'Insights', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Beautiful Page Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Import/Export Analysis</h1>
                <p className="text-emerald-100 text-lg leading-relaxed">
                  Process and analyze trade data from multiple countries and sources
                </p>
                <p className="text-emerald-200 text-sm mt-1">
                  Advanced analytics and competitive intelligence for global trade
                </p>
              </div>
            </div>

            <div className="mt-6 lg:mt-0 flex items-center gap-4">
              {(['files', 'data', 'insights'] as ActiveTab[]).includes(activeTab) && processedData.length > 0 && (
                <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              )}
              
              {activeTab === 'overview' && (
                <button
                  onClick={() => {
                    setActiveTab('upload');
                    setShowUploadForm(true);
                  }}
                  className="inline-flex items-center px-6 py-3 bg-white text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors shadow-lg font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Upload Files
                </button>
              )}

              {/* Stats Preview */}
              <div className="hidden lg:flex items-center space-x-6 bg-white/10 rounded-xl px-6 py-3 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</div>
                  <div className="text-xs text-emerald-200">Records</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
                  <div className="text-xs text-emerald-200">Total Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.uniqueCompetitors}</div>
                  <div className="text-xs text-emerald-200">Competitors</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Quick Stats */}
      {processedData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Records</p>
                <p className="text-xl font-bold text-slate-900">{formatNumber(stats.totalRecords)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total Value</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(stats.totalValue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Competitors</p>
                <p className="text-xl font-bold text-slate-900">{formatNumber(stats.uniqueCompetitors)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Price</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(stats.avgPrice)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isDisabled = (tab.id === 'files' || tab.id === 'data' || tab.id === 'insights') && processedData.length === 0;
            
            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && handleTabChange(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${isActive
                    ? 'border-slate-900 text-slate-900'
                    : isDisabled
                      ? 'border-transparent text-slate-400 cursor-not-allowed'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }
                `}
                disabled={isDisabled}
              >
                <Icon className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${isActive 
                    ? 'text-slate-900' 
                    : isDisabled 
                      ? 'text-slate-400' 
                      : 'text-slate-400 group-hover:text-slate-500'
                  }
                `} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Upload New Data</h3>
                    <p className="text-sm text-blue-700">Import trade data files for analysis</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('upload');
                    setShowUploadForm(true);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Upload
                </button>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-600 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900">View Insights</h3>
                    <p className="text-sm text-purple-700">Analyze market trends and patterns</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('insights')}
                  disabled={processedData.length === 0}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processedData.length > 0 ? 'View Insights' : 'No Data Available'}
                </button>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-600 rounded-lg">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">Browse Data</h3>
                    <p className="text-sm text-green-700">Explore processed trade records</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('data')}
                  disabled={processedData.length === 0}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processedData.length > 0 ? 'Browse Data' : 'No Data Available'}
                </button>
              </div>
            </div>

            {/* Statistics Overview */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900">System Overview</h2>
                <p className="text-sm text-slate-600 mt-1">Current statistics and recent activity</p>
              </div>
              
              {loadingStats ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center gap-2 text-slate-600">
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    Loading statistics...
                  </div>
                </div>
              ) : overviewStats ? (
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
                        <Database className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900">{formatNumber(overviewStats.totalRecords || 0)}</div>
                      <div className="text-sm text-slate-600">Total Records</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3">
                        <FileSpreadsheet className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900">{formatNumber(overviewStats.totalFiles || 0)}</div>
                      <div className="text-sm text-slate-600">Files Processed</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900">{overviewStats.avgProcessingTime || 0}s</div>
                      <div className="text-sm text-slate-600">Avg Processing</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-3">
                        <Globe className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900">
                        {overviewStats.lastUploadDate 
                          ? new Date(overviewStats.lastUploadDate).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                      <div className="text-sm text-slate-600">Last Upload</div>
                    </div>
                  </div>
                  
                  {!getToken() && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700 text-center">
                        <strong>Note:</strong> Please log in to see your personal upload statistics and access upload features.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <Database className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>No data available. Upload files to get started.</p>
                </div>
              )}
            </div>

            {/* Current Session Data */}
            {processedData.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-semibold text-slate-900">Current Session</h2>
                  <p className="text-sm text-slate-600 mt-1">Data from your recent uploads</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-900">{formatNumber(stats.totalRecords)}</div>
                      <div className="text-sm text-blue-700">Records</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalValue)}</div>
                      <div className="text-sm text-green-700">Total Value</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-900">{formatNumber(stats.uniqueCompetitors)}</div>
                      <div className="text-sm text-purple-700">Competitors</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-900">{formatCurrency(stats.avgPrice)}</div>
                      <div className="text-sm text-orange-700">Avg Price</div>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => setActiveTab('data')}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      View Data
                    </button>
                    <button
                      onClick={() => setActiveTab('insights')}
                      className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Insights
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Test Login Component (for development) */}
            {typeof window !== 'undefined' && !getToken() && (
              <TestLogin />
            )}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-6">
            {!showUploadForm ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Upload Trade Data Files</h2>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  Upload Excel files containing import/export data to analyze trade patterns, 
                  competitor information, and market insights.
                </p>
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Select Files to Upload
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Upload Files</h2>
                    <p className="text-sm text-slate-600">Select Excel files containing trade data</p>
                  </div>
                  <button
                    onClick={() => setShowUploadForm(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                
                <FileUpload
                  onFilesUploaded={handleFilesUploaded}
                  isProcessing={isProcessing}
                  uploadedFiles={uploadedFiles}
                />
              </>
            )}
            
            {processedData.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Processing Complete!</h3>
                <p className="text-green-700 mb-4">
                  Successfully processed {formatNumber(processedData.length)} records. 
                  Switch to the Data Analysis or Insights tab to explore your data.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveTab('data')}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    View Data
                  </button>
                  <button
                    onClick={() => setActiveTab('insights')}
                    className="inline-flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium transition-colors"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Insights
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-8">
            {/* Uploaded Files Overview */}
            {processedData.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Uploaded Files</h3>
                      <p className="text-sm text-slate-600">Manage your uploaded trade data files</p>
                    </div>
                    <ExportControls data={processedData} viewMode={viewMode} />
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          File Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Records
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Countries
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Date Range
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {uploadedFiles.map((file, index) => {
                        const fileName = file.file.name;
                        const fileSize = file.file.size;
                        // For now, show basic info since we don't have the source mapping
                        const fileRecords = processedData.length;
                        const uniqueCountries = [...new Set(processedData.map(record => record["Importer/Exporter"]))];
                        
                        return (
                          <tr key={index} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <FileSpreadsheet className="h-5 w-5 text-green-500 mr-3" />
                                <div>
                                  <div className="text-sm font-medium text-slate-900">{fileName}</div>
                                  <div className="text-sm text-slate-500">{(fileSize / 1024).toFixed(1)} KB</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {formatNumber(fileRecords)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {uniqueCountries.length} companies
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              Recent
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => {
                                  setActiveTab('data');
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Data
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Files Uploaded</h3>
                <p className="text-slate-600 mb-6">
                  Upload some Excel files containing trade data to see your uploaded files here.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('upload');
                    setShowUploadForm(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Upload Files
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Total Records</p>
                    <p className="text-3xl font-bold text-blue-900">{formatNumber(processedData.length)}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Database className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">Data Sources</p>
                    <p className="text-3xl font-bold text-green-900">
                      {uploadedFiles.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FileSpreadsheet className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 mb-1">Companies</p>
                    <p className="text-3xl font-bold text-purple-900">
                      {new Set(processedData.map(row => row["Importer/Exporter"]).filter(Boolean)).size}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Globe className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>



            {/* Data Analysis Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Detailed Data Analysis</h3>
                    <p className="text-sm text-slate-600">
                      {viewMode === 'pricing' ? 'Focus on pricing information and trade values' : 'Focus on competition analysis and market intelligence'}
                    </p>
                  </div>
                  {(['files', 'data', 'insights'] as ActiveTab[]).includes(activeTab) && processedData.length > 0 && (
                    <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <DataTable data={processedData} viewMode={viewMode} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Market Insights</h2>
              <p className="text-sm text-slate-600">
                Comprehensive analysis of your import/export data
              </p>
            </div>

            {/* Company Selection and Analytics */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-900">Analytics Report</h3>
                  <p className="text-sm text-slate-600">View data for a specific company or all companies</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <label htmlFor="company-select" className="text-sm font-medium text-slate-700">
                    Company:
                  </label>
                  <select
                    id="company-select"
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ALL">All Companies</option>
                    {companies.map((company) => (
                      <option key={company} value={company}>
                        {company}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Analytics Display */}
              {loadingAnalytics ? (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-slate-600 mt-2">Loading analytics...</p>
                </div>
              ) : analyticsData ? (
                <div className="space-y-6">
                  {/* Date Range Display */}
                  {analyticsData.dateRange && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BarChart3 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-blue-900">Report Period</h4>
                          <p className="text-sm text-blue-700">{analyticsData.dateRange.formatted}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Monthly Data Table */}
                  <div>
                    <h4 className="text-base font-medium text-slate-900 mb-4">Monthly Import/Export Data</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Period</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Import (KG)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Import (USD)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Export (KG)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Export (USD)</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {Object.entries(analyticsData.monthly).map(([period, data]: [string, any]) => (
                            <tr key={period} className="hover:bg-slate-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{period}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatNumber(data.import.kg)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(data.import.usd)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatNumber(data.export.kg)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(data.export.usd)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-600">No analytics data available</p>
                </div>
              )}
            </div>

            <InsightsDashboard data={processedData} />
          </div>
        )}
      </div>

      {/* Processing Dialog */}
      <ProcessingDialog
        isOpen={showProcessingDialog}
        onClose={handleProcessingDialogClose}
        stats={processingStats}
      />
      </div>
    </div>
  );
}

export default function ImportExportPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    }>
      <ImportExportPageContent />
    </Suspense>
  );
}