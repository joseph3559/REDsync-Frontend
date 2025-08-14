"use client";
import { useState, useEffect } from "react";
import { 
  Save, 
  Edit3, 
  Trash2, 
  Calendar,
  FileText,
  CheckCircle,
  AlertTriangle,
  Eye,
  Upload
} from "lucide-react";
import { fetchQuestionnaires, deleteQuestionnaire, type Questionnaire } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface DraftsTabProps {
  onEditDraft?: (questionnaire: Questionnaire) => void;
}

export default function DraftsTab({ onEditDraft }: DraftsTabProps) {
  const [drafts, setDrafts] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetchQuestionnaires("draft", 50, token);
      setDrafts(response.questionnaires);
    } catch (error) {
      console.error("Failed to load drafts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (draftId: string) => {
    const token = getToken();
    if (!token) return;

    if (confirm("Are you sure you want to delete this draft? This action cannot be undone.")) {
      setDeleting(draftId);
      try {
        await deleteQuestionnaire(draftId, token);
        setDrafts(prev => prev.filter(d => d.id !== draftId));
      } catch (error) {
        console.error("Failed to delete draft:", error);
        alert("Failed to delete draft. Please try again.");
      } finally {
        setDeleting(null);
      }
    }
  };

  const getCompletionPercentage = (questionnaire: Questionnaire): number => {
    if (questionnaire.answers.length === 0) return 0;
    const answeredCount = questionnaire.answers.filter(a => a.answer && a.answer.trim() !== "").length;
    return Math.round((answeredCount / questionnaire.answers.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading drafts...</div>
        </div>
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <Save className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Drafts Found</h3>
          <p className="text-gray-600 mb-6">
            Start working on a questionnaire and save it as a draft to see it here.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>💡 Drafts allow you to:</p>
            <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
              <li>Save your progress while working on questionnaires</li>
              <li>Continue editing answers later</li>
              <li>Review and refine responses before final processing</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Drafts Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Save className="w-5 h-5 mr-2" />
            Draft Questionnaires ({drafts.length})
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-yellow-900">{drafts.length}</p>
                <p className="text-sm text-yellow-700">Total Drafts</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-blue-900">
                  {Math.round(drafts.reduce((sum, d) => sum + getCompletionPercentage(d), 0) / drafts.length) || 0}%
                </p>
                <p className="text-sm text-blue-700">Avg. Completion</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Upload className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {drafts.filter(d => getCompletionPercentage(d) >= 80).length}
                </p>
                <p className="text-sm text-green-700">Ready to Process</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drafts List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-md font-medium text-gray-900">Your Drafts</h4>
        </div>
        
        <div className="divide-y divide-gray-200">
          {drafts.map((draft) => {
            const completionPercentage = getCompletionPercentage(draft);
            const isNearlyComplete = completionPercentage >= 80;
            
            return (
              <div key={draft.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <h4 className="text-lg font-medium text-gray-900 truncate">
                        {draft.originalFile.replace(/^.*[\\\/]/, '')}
                      </h4>
                      {isNearlyComplete && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ready to Process
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(draft.createdAt).toLocaleDateString()}
                      </div>
                      <span>•</span>
                      <span>{draft.answers.length} questions</span>
                      <span>•</span>
                      <span>{draft.answers.filter(a => a.answer && a.answer.trim() !== "").length} answered</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Completion Progress</span>
                        <span>{completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            completionPercentage >= 80 ? 'bg-green-500' :
                            completionPercentage >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Answer Sources Breakdown */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>DB: {draft.answers.filter(a => a.source === 'company_info').length}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <span>AI: {draft.answers.filter(a => a.source === 'ai').length}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span>Skipped: {draft.answers.filter(a => a.source === 'skip').length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => onEditDraft?.(draft)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      title="Continue editing"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleDelete(draft.id)}
                      disabled={deleting === draft.id}
                      className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      title="Delete draft"
                    >
                      {deleting === draft.id ? (
                        <div className="w-4 h-4 border border-red-500 border-t-transparent rounded-full animate-spin mr-1" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-1" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
