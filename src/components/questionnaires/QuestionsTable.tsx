"use client";
import { useState, useRef, useEffect } from "react";
import { 
  Edit3, 
  Save, 
  X, 
  RefreshCw, 
  Database, 
  Brain, 
  XCircle, 
  CheckCircle,
  AlertTriangle 
} from "lucide-react";
import { Questionnaire, QuestionnaireAnswer } from "@/lib/api";

interface QuestionsTableProps {
  questionnaire: Questionnaire;
  onUpdateAnswer: (answerId: string, newAnswer: string) => void;
}

export default function QuestionsTable({ questionnaire, onUpdateAnswer }: QuestionsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingId && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editingId]);

  const startEditing = (answer: QuestionnaireAnswer) => {
    setEditingId(answer.id);
    setEditValue(answer.answer || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveAnswer = async (answerId: string) => {
    setSaving(answerId);
    try {
      // Here you would call the API to update the answer
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      onUpdateAnswer(answerId, editValue);
      setEditingId(null);
      setEditValue('');
    } catch (error) {
      console.error('Failed to save answer:', error);
      alert('Failed to save answer. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const regenerateAnswer = async (answerId: string) => {
    setSaving(answerId);
    try {
      // Here you would call the API to regenerate the answer
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      const newAnswer = "AI-regenerated answer (simulated)";
      onUpdateAnswer(answerId, newAnswer);
    } catch (error) {
      console.error('Failed to regenerate answer:', error);
      alert('Failed to regenerate answer. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'company_info':
        return <Database className="w-4 h-4 text-blue-600" />;
      case 'ai':
        return <Brain className="w-4 h-4 text-purple-600" />;
      case 'skip':
        return <XCircle className="w-4 h-4 text-yellow-600" />;
      case 'certification':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'company_info':
        return 'Database';
      case 'ai':
        return 'AI Generated';
      case 'skip':
        return 'Skipped';
      case 'certification':
        return 'Certification';
      default:
        return 'Unknown';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'company_info':
        return 'bg-blue-100 text-blue-800';
      case 'ai':
        return 'bg-purple-100 text-purple-800';
      case 'skip':
        return 'bg-yellow-100 text-yellow-800';
      case 'certification':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-96 overflow-y-auto">
      <div className="divide-y divide-gray-200">
        {questionnaire.answers.map((answer) => (
          <div key={answer.id} className="p-4 hover:bg-gray-50">
            {/* Question */}
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900 leading-5">
                {answer.question}
              </p>
            </div>

            {/* Answer */}
            <div className="mb-3">
              {editingId === answer.id ? (
                <div className="space-y-2">
                  <textarea
                    ref={textareaRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter answer..."
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => saveAnswer(answer.id)}
                      disabled={saving === answer.id}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      {saving === answer.id ? (
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
                      ) : (
                        <Save className="w-3 h-3 mr-1" />
                      )}
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      disabled={saving === answer.id}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {answer.answer ? (
                      <p className="text-sm text-gray-700 leading-5 break-words">
                        {answer.answer}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No answer provided</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 ml-3 flex-shrink-0">
                    <button
                      onClick={() => startEditing(answer)}
                      disabled={saving === answer.id}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                      title="Edit answer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {answer.source === 'ai' && (
                      <button
                        onClick={() => regenerateAnswer(answer.id)}
                        disabled={saving === answer.id}
                        className="p-1.5 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:opacity-50"
                        title="Regenerate AI answer"
                      >
                        {saving === answer.id ? (
                          <div className="w-3.5 h-3.5 border border-purple-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Source & Metadata */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(answer.source)}`}>
                  {getSourceIcon(answer.source)}
                  <span className="ml-1">{getSourceLabel(answer.source)}</span>
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {new Date(answer.updatedAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {questionnaire.answers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">No questions found in this questionnaire.</p>
          </div>
        )}
      </div>
    </div>
  );
}
