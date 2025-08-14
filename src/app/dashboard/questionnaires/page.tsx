"use client";
import { useState, useEffect } from "react";
import { 
  FileQuestion, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle,
  FileText,
  Trash2,
  Eye,
  Upload,
  Save
} from "lucide-react";
import FileUploadZone from "@/components/questionnaires/FileUploadZone";
import ProcessStatus from "@/components/questionnaires/ProcessStatus";
import DocumentPreview from "@/components/questionnaires/DocumentPreview";
import QuestionsTable from "@/components/questionnaires/QuestionsTable";
import PastQuestionnaires from "@/components/questionnaires/PastQuestionnaires";
import DashboardOverview from "@/components/questionnaires/DashboardOverview";
import DraftsTab from "@/components/questionnaires/DraftsTab";
import {
  uploadQuestionnaireFiles,
  processQuestionnaire,
  fetchQuestionnaire,
  saveDraft,
  type QuestionnaireUploadResponse,
  type Questionnaire
} from "@/lib/api";
import { getToken } from "@/lib/auth";

type UploadedFile = {
  id: string;
  file: File;
  status: 'uploading' | 'uploaded' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
};

type ProcessStats = {
  totalQuestions: number;
  dbAnswered: number;
  aiAnswered: number;
  skipped: number;
  processingTime: number;
};

export default function QuestionnairesPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentQuestionnaire, setCurrentQuestionnaire] = useState<Questionnaire | null>(null);
  const [processStats, setProcessStats] = useState<ProcessStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'upload' | 'past' | 'drafts'>('overview');
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string>('');

  // Get token from localStorage on mount
  useEffect(() => {
    const storedToken = getToken();
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Listen for custom events from components to switch tabs
  useEffect(() => {
    const handleSwitchToUpload = () => {
      setActiveTab('upload');
      setShowUploadZone(true);
    };

    window.addEventListener('switchToUploadTab', handleSwitchToUpload);
    
    return () => {
      window.removeEventListener('switchToUploadTab', handleSwitchToUpload);
    };
  }, []);

  const handleFilesSelected = async (files: File[]) => {
    if (!token) {
      alert('Please log in to upload files');
      return;
    }

    // Add files to uploaded files list with uploading status
    const newFiles: UploadedFile[] = files.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      status: 'uploading',
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setLoading(true);

    try {
      // Simulate upload progress
      for (const uploadFile of newFiles) {
        setUploadedFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, progress: 50 } : f
        ));
      }

      // Upload files
      const response = await uploadQuestionnaireFiles(files, token);

      // Update files to uploaded status
      setUploadedFiles(prev => prev.map(f => {
        const matchingFile = newFiles.find(nf => nf.id === f.id);
        return matchingFile ? { ...f, status: 'uploaded', progress: 100 } : f;
      }));

      // Auto-start processing
      await handleProcessQuestionnaire(response);

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadedFiles(prev => prev.map(f => {
        const matchingFile = newFiles.find(nf => nf.id === f.id);
        return matchingFile ? { 
          ...f, 
          status: 'failed', 
          progress: 0,
          error: error instanceof Error ? error.message : 'Upload failed'
        } : f;
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleProcessQuestionnaire = async (response: QuestionnaireUploadResponse) => {
    if (!token) return;

    setLoading(true);
    const startTime = Date.now();

    // Update files to processing status
    setUploadedFiles(prev => prev.map(f => ({ ...f, status: 'processing' })));

    try {
      await processQuestionnaire(
        response.questionnaireId,
        response.parsedQuestions,
        token
      );

      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000;

      // Fetch complete questionnaire data
      const questionnaire = await fetchQuestionnaire(response.questionnaireId, token);
      setCurrentQuestionnaire(questionnaire);

      // Calculate stats
      const stats: ProcessStats = {
        totalQuestions: questionnaire.answers.length,
        dbAnswered: questionnaire.answers.filter(a => a.source === 'company_info').length,
        aiAnswered: questionnaire.answers.filter(a => a.source === 'ai').length,
        skipped: questionnaire.answers.filter(a => a.source === 'skip' || !a.answer).length,
        processingTime,
      };
      setProcessStats(stats);

      // Update files to completed status
      setUploadedFiles(prev => prev.map(f => ({ ...f, status: 'completed' })));

    } catch (error) {
      console.error('Processing failed:', error);
      setUploadedFiles(prev => prev.map(f => ({ 
        ...f, 
        status: 'failed',
        error: error instanceof Error ? error.message : 'Processing failed'
      })));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (currentQuestionnaire?.processedFile) {
      // Create download link
      const link = document.createElement('a');
      link.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/processed/questionnaires/${currentQuestionnaire.processedFile.split('/').pop()}`;
      link.download = `questionnaire-${currentQuestionnaire.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSaveDraft = async () => {
    if (!currentQuestionnaire || !token) return;

    setSavingDraft(true);
    try {
      const answers = currentQuestionnaire.answers.map(a => ({
        questionId: a.id,
        answer: a.answer || ""
      }));

      await saveDraft(currentQuestionnaire.id, answers, token);
      alert("Draft saved successfully!");
    } catch (error) {
      console.error("Failed to save draft:", error);
      alert("Failed to save draft. Please try again.");
    } finally {
      setSavingDraft(false);
    }
  };

  const handleViewQuestionnaire = (questionnaire: Questionnaire) => {
    setCurrentQuestionnaire(questionnaire);
    setActiveTab('upload');
  };

  const handleEditDraft = (questionnaire: Questionnaire) => {
    setCurrentQuestionnaire(questionnaire);
    setActiveTab('upload');
  };

  const clearCurrentSession = () => {
    setUploadedFiles([]);
    setCurrentQuestionnaire(null);
    setProcessStats(null);
    setShowUploadZone(false);
  };

  if (loading && uploadedFiles.length === 0) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading questionnaires...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Beautiful Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white rounded-2xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <FileQuestion className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Questionnaire Auto-Filler</h1>
                <p className="text-purple-100 text-lg leading-relaxed">
                  Upload questionnaires and let AI auto-complete them using your stored answers
                </p>
                <p className="text-purple-200 text-sm mt-1">
                  Supports PDF, DOCX, and XLSX formats • Advanced AI processing • Smart skip logic
                </p>
              </div>
            </div>

            <div className="mt-6 lg:mt-0 flex items-center gap-4">
              {!currentQuestionnaire && (
                <button
                  onClick={() => {
                    setActiveTab('upload');
                    setShowUploadZone(true);
                  }}
                  className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-colors shadow-lg font-medium"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload New Questionnaire
                </button>
              )}
              {currentQuestionnaire && (
                <button
                  onClick={clearCurrentSession}
                  className="inline-flex items-center px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors backdrop-blur-sm"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Clear Session</span>
                </button>
              )}

              {/* Process Stats Preview */}
              {processStats && (
                <div className="hidden lg:flex items-center space-x-4 bg-white/10 rounded-xl px-6 py-3 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{processStats.totalQuestions}</div>
                    <div className="text-xs text-purple-200">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-300">{processStats.aiAnswered}</div>
                    <div className="text-xs text-purple-200">AI Answered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{Math.round(processStats.processingTime)}s</div>
                    <div className="text-xs text-purple-200">Process Time</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200">
            <div className="flex flex-wrap">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-purple-500 text-purple-600 bg-purple-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <FileQuestion className="w-5 h-5 mr-2" />
                Dashboard Overview
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'upload'
                    ? 'border-purple-500 text-purple-600 bg-purple-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload & Process
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'past'
                    ? 'border-purple-500 text-purple-600 bg-purple-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <FileText className="w-5 h-5 mr-2" />
                Past Questionnaires
              </button>
              <button
                onClick={() => setActiveTab('drafts')}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'drafts'
                    ? 'border-purple-500 text-purple-600 bg-purple-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Save className="w-5 h-5 mr-2" />
                Saved Drafts
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">

      {activeTab === 'overview' && (
        <DashboardOverview />
      )}

      {activeTab === 'upload' && (
        <div className="space-y-8">
          {/* Upload Section */}
          {!currentQuestionnaire && !showUploadZone && uploadedFiles.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Questionnaires</h3>
                <p className="text-gray-600 mb-6">
                  Upload PDF, DOCX, or XLSX questionnaires to get them auto-completed by AI
                </p>
                <button
                  onClick={() => setShowUploadZone(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Upload className="w-5 h-5" />
                  <span>Choose Files to Upload</span>
                </button>
              </div>
            </div>
          )}

          {(showUploadZone && !currentQuestionnaire) && (
            <FileUploadZone 
              onFilesSelected={handleFilesSelected}
              loading={loading}
            />
          )}

          {/* File Status List */}
          {uploadedFiles.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">File Processing Status</h3>
              <div className="space-y-3">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {file.status === 'uploading' && (
                          <Clock className="w-5 h-5 text-yellow-500" />
                        )}
                        {file.status === 'uploaded' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {file.status === 'processing' && (
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        )}
                        {file.status === 'completed' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {file.status === 'failed' && (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB • {file.file.type || 'Unknown type'}
                        </p>
                        {file.error && (
                          <p className="text-xs text-red-600 mt-1">{file.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600 capitalize">{file.status}</span>
                      {file.status === 'uploading' && (
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Process Status & Insights */}
          {processStats && (
            <ProcessStatus stats={processStats} />
          )}

          {/* Document Review Section */}
          {currentQuestionnaire && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Document Preview */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Document Preview
                  </h3>
                </div>
                <DocumentPreview questionnaire={currentQuestionnaire} />
              </div>

              {/* Questions & Answers Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Questions & Answers</h3>
                </div>
                <QuestionsTable 
                  questionnaire={currentQuestionnaire}
                  onUpdateAnswer={(answerId, newAnswer) => {
                    // Update local state optimistically
                    setCurrentQuestionnaire(prev => prev ? {
                      ...prev,
                      answers: prev.answers.map(a => 
                        a.id === answerId ? { ...a, answer: newAnswer } : a
                      )
                    } : null);
                  }}
                />
              </div>
            </div>
          )}

          {/* Actions Section */}
          {currentQuestionnaire?.processedFile && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleDownloadPDF}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Signed PDF</span>
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={savingDraft}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {savingDraft ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>{savingDraft ? "Saving..." : "Save Draft"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'past' && (
        <PastQuestionnaires onViewQuestionnaire={handleViewQuestionnaire} />
      )}

            {activeTab === 'drafts' && (
              <DraftsTab onEditDraft={handleEditDraft} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


