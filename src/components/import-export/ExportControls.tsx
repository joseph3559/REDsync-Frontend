"use client";
import { useState } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { ImportExportRow } from "@/lib/api";
import { saveAs } from 'file-saver';

interface ExportControlsProps {
  data: ImportExportRow[];
  filteredData?: ImportExportRow[];
  viewMode: 'pricing' | 'competition';
}

export default function ExportControls({ data, filteredData, viewMode }: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const getVisibleColumns = (mode: 'pricing' | 'competition') => {
    const allColumns = [
      'Product Name',
      'Importer/Exporter',
      'Quantity',
      'Price',
      'Incoterm',
      'Currency'
    ];

    if (mode === 'pricing') {
      return ['Product Name', 'Quantity', 'Price', 'Incoterm', 'Currency'];
    }
    return allColumns;
  };

  const formatValue = (value: unknown): string => {
    if (value == null) return '';
    if (typeof value === 'number') {
      return value.toString();
    }
    return String(value);
  };

  const exportToCsv = async (exportData: ImportExportRow[], filename: string) => {
    setIsExporting(true);
    try {
      const visibleColumns = getVisibleColumns(viewMode);
      
      // Create CSV content
      const headers = visibleColumns.join(',');
      const rows = exportData.map(row => 
        visibleColumns.map(col => {
          const value = formatValue(row[col as keyof ImportExportRow]);
          // Escape values that contain commas or quotes
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      );
      
      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async (exportData: ImportExportRow[], filename: string) => {
    setIsExporting(true);
    try {
      // For Excel export, we'll use a simple CSV format with .xlsx extension
      // In a real application, you might want to use a library like xlsx or exceljs
      const visibleColumns = getVisibleColumns(viewMode);
      
      const headers = visibleColumns.join('\t'); // Tab-separated for better Excel import
      const rows = exportData.map(row => 
        visibleColumns.map(col => formatValue(row[col as keyof ImportExportRow])).join('\t')
      );
      
      const content = [headers, ...rows].join('\n');
      const blob = new Blob([content], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      saveAs(blob, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel', scope: 'all' | 'filtered') => {
    const exportData = scope === 'filtered' ? (filteredData || data) : data;
    const timestamp = new Date().toISOString().split('T')[0];
    const scopeLabel = scope === 'filtered' ? 'filtered' : 'all';
    const viewLabel = viewMode === 'pricing' ? 'pricing' : 'competition';
    
    const filename = `import-export-${viewLabel}-${scopeLabel}-${timestamp}.${format === 'excel' ? 'xlsx' : 'csv'}`;

    if (format === 'csv') {
      await exportToCsv(exportData, filename);
    } else {
      await exportToExcel(exportData, filename);
    }
  };

  const hasFilteredData = filteredData && filteredData.length !== data.length;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <Download className="h-4 w-4 text-slate-600" />
        <span className="text-sm font-medium text-slate-700">Export:</span>
      </div>

      {/* Export All Data */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleExport('csv', 'all')}
          disabled={isExporting || data.length === 0}
          className="inline-flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="h-4 w-4" />
          CSV (All)
        </button>
        <button
          onClick={() => handleExport('excel', 'all')}
          disabled={isExporting || data.length === 0}
          className="inline-flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Excel (All)
        </button>
      </div>

      {/* Export Filtered Data */}
      {hasFilteredData && (
        <>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('csv', 'filtered')}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="h-4 w-4" />
              CSV (Filtered)
            </button>
            <button
              onClick={() => handleExport('excel', 'filtered')}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel (Filtered)
            </button>
          </div>
        </>
      )}

      {/* Export Status */}
      {isExporting && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Exporting...
        </div>
      )}

      {/* Data Info */}
      <div className="text-sm text-slate-500 ml-auto">
        {data.length} total records
        {hasFilteredData && (
          <span className="ml-2 text-blue-600">
            ({filteredData?.length} filtered)
          </span>
        )}
      </div>
    </div>
  );
}
