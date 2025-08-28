"use client";
import { useState, useEffect, useRef } from "react";
import { Database, Upload, TrendingUp, FileText, AlertCircle, CheckCircle, Clock, Trash2 } from "lucide-react";
import COADatabaseTable from "@/components/coa-database/COADatabaseTable";
import FileUploadForm from "@/components/coa-database/FileUploadForm";
import ProcessingSummaryDialog from "@/components/coa-database/ProcessingSummaryDialog";
import DeleteDialog from "@/components/ui/DeleteDialog";
import BulkDeleteDialog from "@/components/ui/BulkDeleteDialog";
import { 
  fetchCoaColumns, 
  fetchCoaColumnsConfig,
  uploadCoaFiles, 
  exportCoaCsv,
  fetchCoaRecords,
  deleteCoaRecords,
  type CoaUploadResult,
  type ColumnConfig 
} from "@/lib/api";
import { getToken } from "@/lib/auth";

// Helper function to determine if a record needs attention
const needsAttention = (record: CoaUploadResult): boolean => {
  // Check if it has fewer than 3 fields
  const fieldCount = Object.keys(record).filter(key => 
    key !== 'file' && record[key] !== null && record[key] !== undefined
  ).length;
  
  if (fieldCount < 3) {
    return true;
  }
  
  // Check if any field contains 'review' value
  const hasReviewValue = Object.values(record).some(value => 
    typeof value === 'string' && value.toLowerCase() === 'review'
  );
  
  return hasReviewValue;
};

export default function COADatabasePage() {
  const [columns, setColumns] = useState<string[]>([]);
  const [columnsConfig, setColumnsConfig] = useState<ColumnConfig[]>([]);
  const [currentPhase, setCurrentPhase] = useState<number>(1);
  const [data, setData] = useState<CoaUploadResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRowIds, setNewRowIds] = useState<Set<string>>(new Set());
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // Delete dialog states
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    type: 'single' as 'single' | 'bulk' | 'clear',
    itemName: '',
    itemCount: 0,
    selectedRows: [] as CoaUploadResult[],
    loading: false
  });
  
  // Upload statistics
  const [uploadStats, setUploadStats] = useState({
    totalFilesUploaded: 0,
    successfulFiles: 0,
    failedFiles: 0,
    filesNeedingAttention: 0,
  });

  // Load data from database on component mount
  useEffect(() => {
    const loadDatabaseData = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError("Authentication required");
          setLoading(false);
          return;
        }
        
        const response = await fetchCoaRecords(token);
        setData(response.records);
        
        // Calculate stats from loaded data
        setUploadStats({
          totalFilesUploaded: response.records.length,
          successfulFiles: response.records.length,
          failedFiles: 0,
          filesNeedingAttention: response.records.filter(needsAttention).length,
        });
      } catch (err) {
        console.warn('Failed to load COA data from database:', err);
        // Try fallback to localStorage for backwards compatibility
        try {
          const storedData = localStorage.getItem('coa-database-data');
          const storedStats = localStorage.getItem('coa-database-stats');
          
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (Array.isArray(parsedData)) {
              setData(parsedData);
            }
          }
          
          if (storedStats) {
            const parsedStats = JSON.parse(storedStats);
            setUploadStats(parsedStats);
          }
        } catch (localErr) {
          console.warn('Failed to load stored COA data:', localErr);
        }
      }
    };

    loadDatabaseData();
  }, []);
  
  // Summary dialog state
  const [summaryDialog, setSummaryDialog] = useState({
    isOpen: false,
    totalFiles: 0,
    successCount: 0,
    failedCount: 0,
    processingTime: 0,
    totalFieldsExtracted: 0,
  });

  const tableRef = useRef<HTMLDivElement>(null);

  // Load initial columns and configuration
  useEffect(() => {
    const loadColumnsAndConfig = async () => {
      try {
        setLoading(true);
        const [columnsResponse, configResponse] = await Promise.all([
          fetchCoaColumns("1"), // Default to Phase 1
          fetchCoaColumnsConfig("phase1-config")
        ]);
        setColumns(columnsResponse.columns);
        setColumnsConfig(configResponse.columnsConfig);
        setCurrentPhase(columnsResponse.phase || 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load columns");
      } finally {
        setLoading(false);
      }
    };

    loadColumnsAndConfig();
  }, []);

  const generateRowId = (row: CoaUploadResult, index?: number) => {
    // Create a more unique key by including additional properties and index
    const baseKey = `${row.file}-${row.sample_id || ''}-${row.batch_id || ''}`;
    
    // If we have an index, include it to ensure uniqueness
    if (index !== undefined) {
      return `${baseKey}-idx-${index}`;
    }
    
    // For cases without index, try to create uniqueness using other properties
    const additionalProps = Object.keys(row)
      .filter(key => !['file', 'sample_id', 'batch_id'].includes(key))
      .sort()
      .slice(0, 3) // Take first 3 additional properties
      .map(key => `${key}:${String(row[key] || '').slice(0, 10)}`) // Limit length
      .join('-');
    
    return additionalProps ? `${baseKey}-${additionalProps}` : `${baseKey}-${Date.now()}-${Math.random()}`;
  };

  const handleUpload = async (files: File[]) => {
    try {
      const token = getToken();
      if (!token) {
        setError("Authentication required");
        return;
      }
      
      const response = await uploadCoaFiles(files, token);
      
      // Track new row IDs for highlighting
      const newIds = new Set<string>();
      let totalFieldsExtracted = 0;
      
      response.results.forEach((result, index) => {
        const rowId = generateRowId(result, index);
        newIds.add(rowId);
        
        // Count non-null fields (excluding 'file')
        const fieldCount = Object.keys(result).filter(key => 
          key !== 'file' && result[key] !== null && result[key] !== undefined
        ).length;
        totalFieldsExtracted += fieldCount;
      });

      // Reload data from database to get the persisted records with IDs
      const updatedResponse = await fetchCoaRecords(token);
      setData(updatedResponse.records);
      setNewRowIds(newIds);

      // Update statistics
      setUploadStats(prev => ({
        totalFilesUploaded: prev.totalFilesUploaded + files.length,
        successfulFiles: prev.successfulFiles + response.results.length,
        failedFiles: prev.failedFiles + (files.length - response.results.length),
        filesNeedingAttention: prev.filesNeedingAttention + response.results.filter(needsAttention).length,
      }));

      console.log(`Uploaded ${files.length} files, ${(response as any).savedToDatabase || 0} saved to database`);

      // Show summary dialog
      setSummaryDialog({
        isOpen: true,
        totalFiles: files.length,
        successCount: response.results.length,
        failedCount: files.length - response.results.length,
        processingTime: 0, // Will be set by FileUploadForm
        totalFieldsExtracted,
      });

      // Clear highlighting after 3 seconds
      setTimeout(() => {
        setNewRowIds(new Set());
      }, 3000);

      // Hide upload form after successful upload
      setShowUploadForm(false);

    } catch (err) {
      // Update failed files count
      setUploadStats(prev => ({
        ...prev,
        totalFilesUploaded: prev.totalFilesUploaded + files.length,
        failedFiles: prev.failedFiles + files.length,
      }));
      throw err; // Re-throw to be handled by FileUploadForm
    }
  };

  const handleProcessingComplete = (
    totalFiles: number,
    successCount: number,
    failedCount: number,
    processingTime: number
  ) => {
    setSummaryDialog(prev => ({
      ...prev,
      totalFiles,
      successCount,
      failedCount,
      processingTime,
    }));
  };

  const scrollToTable = () => {
    tableRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const clearAllData = () => {
    setDeleteDialog({
      isOpen: true,
      type: 'clear',
      itemName: '',
      itemCount: data.length,
      selectedRows: data,
      loading: false
    });
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    
    try {
      const token = getToken();
      if (!token) {
        setError("Authentication required");
        setDeleteDialog(prev => ({ ...prev, loading: false }));
        return;
      }
      
      const recordIds = deleteDialog.selectedRows.map(record => record.id).filter((id): id is string => Boolean(id));
      
      console.log(`Attempting to delete ${recordIds.length} records with IDs:`, recordIds);
      
      if (recordIds.length > 0) {
        const result = await deleteCoaRecords(recordIds, token);
        console.log(`Successfully deleted ${result.deletedCount} records from database`);
      } else {
        console.warn('No record IDs found for deletion - records may not be saved to database yet');
      }
      
      if (deleteDialog.type === 'clear') {
        // Clear all data
        setData([]);
        setUploadStats({
          totalFilesUploaded: 0,
          successfulFiles: 0,
          failedFiles: 0,
          filesNeedingAttention: 0,
        });
        localStorage.removeItem('coa-database-data');
        localStorage.removeItem('coa-database-stats');
      } else {
        // Remove selected rows from local state
        // Filter by IDs if available, otherwise by file names
        const selectedIds = new Set(deleteDialog.selectedRows.map(row => row.id).filter((id): id is string => Boolean(id)));
        const selectedFiles = new Set(deleteDialog.selectedRows.map(row => row.file));
        
        const newData = data.filter(row => {
          // If record has ID and it was selected for deletion, remove it
          if (row.id && selectedIds.has(row.id)) {
            return false;
          }
          // Otherwise filter by file name (for records without IDs)
          return !selectedFiles.has(row.file);
        });
        
        setData(newData);
        console.log(`Removed ${data.length - newData.length} records from local state`);
        
        // Update stats
        setUploadStats(prev => ({
          ...prev,
          totalFilesUploaded: newData.length,
          successfulFiles: newData.length,
          filesNeedingAttention: newData.filter(needsAttention).length,
        }));
        
        if (newData.length === 0) {
          localStorage.removeItem('coa-database-data');
          localStorage.removeItem('coa-database-stats');
        } else {
          localStorage.setItem('coa-database-data', JSON.stringify(newData));
        }
      }
      
      // Reload data from database to ensure UI is synchronized
      if (recordIds.length > 0) {
        try {
          const response = await fetchCoaRecords(token);
          if (response.records) {
            setData(response.records);
            console.log(`Reloaded ${response.records.length} records from database`);
          }
        } catch (reloadErr) {
          console.error('Failed to reload data after deletion:', reloadErr);
          // Continue with local state update if reload fails
        }
      }
      
      // Close dialog
      setDeleteDialog({
        isOpen: false,
        type: 'single',
        itemName: '',
        itemCount: 0,
        selectedRows: [],
        loading: false
      });
      
    } catch (err) {
      console.error('Failed to delete records:', err);
      setError('Failed to delete records. Please try again.');
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const generateCSV = () => {
    if (data.length === 0) return '';
    
    // Get all unique keys from all records
    const allKeys = new Set<string>();
    data.forEach(row => {
      Object.keys(row).forEach(key => allKeys.add(key));
    });
    
    const headers = Array.from(allKeys);
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading COA database...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <div className="text-red-600 text-lg font-medium mb-2">Error</div>
          <div className="text-red-500">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Database className="w-8 h-8 mr-3" />
              COA Database
            </h1>
                                   <p className="text-blue-100 text-lg">
                         Upload, process, and view lab test results
                       </p>
                       <p className="text-blue-200 text-sm mt-1">
                         Currently showing: <span className="font-semibold">Phase {currentPhase}</span> parameters
                         {currentPhase === 1 && (
                           <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                             Focus: AI, AV, POV + Core Tests
                           </span>
                         )}
                       </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 backdrop-blur-sm"
            >
              <Upload className="w-5 h-5" />
              <span>{showUploadForm ? 'Hide Upload' : 'Upload PDFs'}</span>
            </button>
            {data.length > 0 && (
              <button
                onClick={clearAllData}
                className="bg-red-500/20 hover:bg-red-500/30 text-white px-4 py-3 rounded-lg transition-colors flex items-center space-x-2 backdrop-blur-sm"
                title="Clear all data"
              >
                <Trash2 className="w-5 h-5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Records */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
                           <div>
                 <p className="text-sm font-medium text-gray-600">Total Records</p>
                 <p className="text-3xl font-bold text-gray-900">{data.length}</p>
                 <p className="text-sm text-gray-500 mt-1">
                   Phase {currentPhase} data points
                   {columnsConfig.length > 0 && (
                     <span className="block mt-1 text-xs text-blue-600">
                       {columnsConfig.filter(c => c.type === 'Chemical').length} Chemical, {' '}
                       {columnsConfig.filter(c => c.type === 'PL').length} PL, {' '}
                       {columnsConfig.filter(c => c.type === 'Microbiology').length} Microbiology
                     </span>
                   )}
                 </p>
               </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Files Uploaded */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Files Uploaded</p>
              <p className="text-3xl font-bold text-gray-900">{uploadStats.totalFilesUploaded}</p>
              <p className="text-sm text-green-600 mt-1">
                {uploadStats.successfulFiles} successful
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Failed Files */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Files</p>
              <p className="text-3xl font-bold text-gray-900">{uploadStats.failedFiles}</p>
              <p className="text-sm text-red-600 mt-1">
                {uploadStats.failedFiles > 0 ? 'Need retry' : 'No failures'}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Files Needing Attention */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Need Attention</p>
              <p className="text-3xl font-bold text-gray-900">{uploadStats.filesNeedingAttention}</p>
              <p className="text-sm text-yellow-600 mt-1">
                {uploadStats.filesNeedingAttention > 0 ? 'Incomplete data' : 'All complete'}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      

      {/* Upload Form - Conditional */}
      {showUploadForm && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-yellow-800">Upload PDF Files</h3>
            <button
              onClick={() => setShowUploadForm(false)}
              className="text-yellow-600 hover:text-yellow-800 transition-colors"
            >
              ✕
            </button>
          </div>
          <FileUploadForm 
            onUpload={handleUpload}
            onProcessingComplete={handleProcessingComplete}
            compact={true}
          />
        </div>
      )}

      {/* Data Table */}
      <div ref={tableRef}>
        <COADatabaseTable 
          columns={columns}
          data={data}
          newRowIds={newRowIds}
          columnsConfig={columnsConfig}
          onExport={async (selectedRows) => {
            if (selectedRows.length === 0) return;
            const { blob, filename } = await exportCoaCsv(selectedRows);
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }}
          onDelete={(selectedRows) => {
            setDeleteDialog({
              isOpen: true,
              type: 'bulk',
              itemName: '',
              itemCount: selectedRows.length,
              selectedRows: selectedRows,
              loading: false
            });
          }}
        />
      </div>

      {/* Processing Summary Dialog */}
      <ProcessingSummaryDialog
        isOpen={summaryDialog.isOpen}
        onClose={() => setSummaryDialog(prev => ({ ...prev, isOpen: false }))}
        totalFiles={summaryDialog.totalFiles}
        successCount={summaryDialog.successCount}
        failedCount={summaryDialog.failedCount}
        processingTime={summaryDialog.processingTime}
        totalFieldsExtracted={summaryDialog.totalFieldsExtracted}
        onViewDetails={scrollToTable}
      />

      {/* Delete Dialogs */}
      {deleteDialog.type === 'clear' && (
        <DeleteDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={handleDeleteConfirm}
          title="Clear All COA Data?"
          description={`Are you sure you want to clear all ${data.length} COA records? This will permanently delete all uploaded and processed data from the database.`}
          confirmText="Clear All Data"
          loading={deleteDialog.loading}
          isDangerous={true}
        />
      )}

      {deleteDialog.type === 'bulk' && (
        <BulkDeleteDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={handleDeleteConfirm}
          itemCount={deleteDialog.itemCount}
          itemType="COA record"
          selectedItems={deleteDialog.selectedRows.map(row => row.file || `Record ${row.sample_id || 'Unknown'}`)}
          loading={deleteDialog.loading}
          isDangerous={true}
        />
      )}
    </div>
  );
}