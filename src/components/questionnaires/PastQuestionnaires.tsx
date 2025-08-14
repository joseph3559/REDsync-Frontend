"use client";
import { useState, useEffect } from "react";
import { 
  Search, 
  Download, 
  Eye, 
  Trash2, 
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MoreVertical
} from "lucide-react";
import { getToken } from "@/lib/auth";
import { fetchQuestionnaires, deleteQuestionnaire, type Questionnaire } from "@/lib/api";

interface PastQuestionnairesProps {
  onViewQuestionnaire?: (questionnaire: Questionnaire) => void;
}

export default function PastQuestionnaires({ onViewQuestionnaire }: PastQuestionnairesProps) {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('processed');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [viewingQuestionnaire, setViewingQuestionnaire] = useState<Questionnaire | null>(null);

  useEffect(() => {
    loadQuestionnaires();
  }, [statusFilter]);

  const loadQuestionnaires = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetchQuestionnaires(statusFilter, 50, token);
      setQuestionnaires(response.questionnaires.filter(q => q.status !== 'draft'));
    } catch (error) {
      console.error('Failed to load questionnaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestionnaires = questionnaires.filter(q => {
    const matchesSearch = q.originalFile.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredQuestionnaires.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuestionnaires = filteredQuestionnaires.slice(startIndex, startIndex + itemsPerPage);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'processed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = (questionnaire: Questionnaire) => {
    if (questionnaire.processedFile) {
      const link = document.createElement('a');
      link.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/processed/questionnaires/${questionnaire.processedFile.split('/').pop()}`;
      link.download = `questionnaire-${questionnaire.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleView = (questionnaire: Questionnaire) => {
    if (onViewQuestionnaire) {
      onViewQuestionnaire(questionnaire);
    } else {
      setViewingQuestionnaire(questionnaire);
    }
  };

  const handleDelete = async (questionnaire: Questionnaire) => {
    const token = getToken();
    if (!token) return;

    if (confirm(`Are you sure you want to delete "${questionnaire.originalFile.split('/').pop()}"? This action cannot be undone.`)) {
      setDeleting(questionnaire.id);
      try {
        await deleteQuestionnaire(questionnaire.id, token);
        setQuestionnaires(prev => prev.filter(q => q.id !== questionnaire.id));
      } catch (error) {
        console.error('Failed to delete questionnaire:', error);
        alert('Failed to delete questionnaire. Please try again.');
      } finally {
        setDeleting(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading past questionnaires...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search questionnaires..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="processed">Completed</option>
              <option value="all">All Status</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
            <button
              onClick={loadQuestionnaires}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {paginatedQuestionnaires.length} of {filteredQuestionnaires.length} questionnaires
        </p>
        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Questionnaires Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {paginatedQuestionnaires.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Questions Answered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Uploaded
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedQuestionnaires.map((questionnaire) => (
                  <tr key={questionnaire.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {questionnaire.originalFile.split('/').pop()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {questionnaire.answers.length} questions • ID: {questionnaire.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(questionnaire.status)}`}>
                        {getStatusIcon(questionnaire.status)}
                        <span className="ml-1">{getStatusLabel(questionnaire.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <span className="font-medium">{questionnaire.answers.length}</span>
                        <div className="text-xs text-gray-500">
                          {questionnaire.answers.filter(a => a.answer && a.answer.trim() !== "").length} answered
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(questionnaire.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleView(questionnaire)}
                          className="inline-flex items-center px-2 py-1 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {questionnaire.processedFile && (
                          <button
                            onClick={() => handleDownload(questionnaire)}
                            className="inline-flex items-center px-2 py-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        {questionnaire.processedFile && (
                          <button
                            onClick={() => {
                              const pf = questionnaire.processedFile;
                              if (!pf) return;
                              const name = pf.split('/').pop() as string;
                              const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
                              window.open(`${base}/processed/questionnaires/${name}`, '_blank');
                            }}
                            className="inline-flex items-center px-2 py-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(questionnaire)}
                          disabled={deleting === questionnaire.id}
                          className="inline-flex items-center px-2 py-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === questionnaire.id ? (
                            <div className="w-4 h-4 border border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questionnaires found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Upload your first questionnaire to get started.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
