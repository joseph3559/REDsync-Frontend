"use client";
import { useState, useMemo } from "react";
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  Download,
  MoreHorizontal
} from "lucide-react";
import type { CoaUploadResult } from "@/lib/api";

interface ColumnConfig {
  name: string;
  laboratory: string;
  type: string;
  phase: number;
  ignore: boolean;
  definition?: string;
  unit?: string;
  fullName?: string;
}

interface COADatabaseTableProps {
  columns: string[];
  data: CoaUploadResult[];
  newRowIds?: Set<string>;
  columnsConfig?: ColumnConfig[];
  onExport?: (selectedRows: CoaUploadResult[]) => void;
  onDelete?: (selectedRows: CoaUploadResult[]) => void;
}

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
} | null;

type CellFormat = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  numberFormat?: 'default' | 'number' | 'percentage' | 'currency';
};



export default function COADatabaseTable({ 
  columns, 
  data, 
  newRowIds = new Set(),
  columnsConfig = [],
  onExport,
  onDelete 
}: COADatabaseTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(() => {
    // By default, hide columns with blank headers (displayed as "Column N"), keep key columns
    const blankCols = new Set<string>();
    columns.forEach((col, index) => {
      if (index === 0 || col === 'Batch') return; // keep first and Batch visible
      const isBlankHeader = !col || String(col).trim() === '';
      if (isBlankHeader) blankCols.add(`col-${index}`);
    });
    return blankCols;
  });

  // Recompute default hidden blank-header columns when the column list changes
  // Does not run on user toggles; only when `columns` prop updates
  useMemo(() => {
    const next = new Set<string>();
    columns.forEach((col, index) => {
      if (index === 0 || col === 'Batch') return;
      const isBlankHeader = !col || String(col).trim() === '';
      if (isBlankHeader) next.add(`col-${index}`);
    });
    setHiddenColumns(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]);
  const [cellFormats, setCellFormats] = useState<Record<string, CellFormat>>({});
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

  // Use the exact columns from the backend, including blank ones
  const displayColumns = useMemo(() => {
    // Filter out only the hidden columns, but preserve blank columns and order
    return columns.filter((col, index) => !hiddenColumns.has(`col-${index}`));
  }, [columns, hiddenColumns]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return data.filter((row) => {
      // Search in sample_id, batch_id, and all column values
      const searchableValues = [
        row.sample_id?.toString() || "",
        row.batch_id?.toString() || "",
        ...displayColumns.map(col => row[col]?.toString() || "")
      ];
      
      return searchableValues.some(value => 
        value.toLowerCase().includes(lowercaseSearch)
      );
    });
  }, [data, searchTerm, displayColumns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]?.toString() || "";
      const bValue = b[sortConfig.key]?.toString() || "";
      
      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (columnKey: string) => {
    setSortConfig(current => {
      if (current?.key === columnKey) {
        if (current.direction === "asc") {
          return { key: columnKey, direction: "desc" };
        } else {
          return null; // Reset sort
        }
      } else {
        return { key: columnKey, direction: "asc" };
      }
    });
  };

  const getSortIcon = (columnKey: string) => {
    if (sortConfig?.key !== columnKey) {
      return <div className="w-4 h-4" />; // Placeholder for alignment
    }
    
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const getRowId = (row: CoaUploadResult, index?: number) => {
    // Create a more unique key by including additional properties and a hash
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

  const getCellId = (rowId: string, columnKey: string) => {
    return `${rowId}-${columnKey}`;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allRowIds = sortedData.map((row, index) => getRowId(row, index));
      setSelectedRows(new Set(allRowIds));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    setSelectedRows(newSelected);
  };

  const handleCellFormat = (formatType: Exclude<keyof CellFormat, 'numberFormat'>) => {
    if (selectedCells.size === 0) return;
    
    setCellFormats(prev => {
      const newFormats = { ...prev };
      selectedCells.forEach(cellId => {
        if (!newFormats[cellId]) newFormats[cellId] = {};
        newFormats[cellId][formatType] = !newFormats[cellId][formatType];
      });
      return newFormats;
    });
  };

  const toggleColumnVisibility = (columnIndex: number) => {
    const columnKey = `col-${columnIndex}`;
    const newHidden = new Set(hiddenColumns);
    if (newHidden.has(columnKey)) {
      newHidden.delete(columnKey);
    } else {
      newHidden.add(columnKey);
    }
    setHiddenColumns(newHidden);
  };

  const handleExportSelected = () => {
    const selectedData = sortedData.filter((row, index) => selectedRows.has(getRowId(row, index)));
    onExport?.(selectedData);
  };

  const handleDeleteSelected = () => {
    const selectedData = sortedData.filter((row, index) => selectedRows.has(getRowId(row, index)));
    onDelete?.(selectedData);
  };

  const formatCellValue = (value: unknown, cellId: string) => {
    const format = cellFormats[cellId];
    let displayValue = value?.toString() || "";
    
    if (format?.numberFormat === 'percentage' && !isNaN(Number(displayValue))) {
      displayValue = (Number(displayValue) * 100).toFixed(2) + '%';
    } else if (format?.numberFormat === 'currency' && !isNaN(Number(displayValue))) {
      displayValue = '$' + Number(displayValue).toFixed(2);
    } else if (format?.numberFormat === 'number' && !isNaN(Number(displayValue))) {
      displayValue = Number(displayValue).toLocaleString();
    }
    
    return displayValue;
  };

  const getCellClassName = (cellId: string) => {
    const format = cellFormats[cellId];
    let className = "px-4 py-4 text-sm text-gray-900 min-w-[140px] border-r border-gray-200 h-[60px] align-middle";
    
    if (format?.bold) className += " font-bold";
    if (format?.italic) className += " italic";
    if (format?.underline) className += " underline";
    if (format?.strikethrough) className += " line-through";
    if (selectedCells.has(cellId)) className += " bg-blue-100 border-blue-300";
    
    return className;
  };

  const isAllSelected = selectedRows.size > 0 && selectedRows.size === sortedData.length;
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < sortedData.length;

  const getColumnInfo = (columnName: string): ColumnConfig | null => {
    return columnsConfig.find(config => config.name === columnName) || null;
  };

  const getColumnTooltip = (columnName: string): string => {
    const config = getColumnInfo(columnName);
    if (!config) return columnName;
    
    // For key parameters, show enhanced tooltip
    if (config.fullName && config.definition) {
      let tooltip = `${columnName} - ${config.fullName} - ${config.definition}`;
      if (config.unit) tooltip += ` (${config.unit})`;
      return tooltip;
    }
    
    // For other parameters, show basic info
    return columnName;
  };

  const getColumnTypeColor = (columnName: string): string => {
    const config = getColumnInfo(columnName);
    if (!config) return '';
    
    switch (config.type) {
      case 'Chemical': return 'border-l-4 border-blue-400';
      case 'PL': return 'border-l-4 border-green-400';
      case 'Microbiology': return 'border-l-4 border-red-400';
      case 'GMO': return 'border-l-4 border-purple-400';
      case 'Contaminant': return 'border-l-4 border-orange-400';
      default: return '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <style jsx>{`
        .bg-gray-25 {
          background-color: #fafafa;
        }
      `}</style>
      {/* Header with Search and Controls */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">COA Data</h3>
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by Sample ID, Batch ID, or nutrient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80"
              />
            </div>
            
            {/* Column Info */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>{columns.length} total columns (including blanks)</span>
            </div>
          </div>
        </div>

        {/* Excel-like Toolbar */}
        <div className="flex items-center space-x-1 p-2 bg-gray-50 rounded-lg border">
          {/* Insert Section */}
          <div className="flex items-center space-x-1 pr-3 border-r border-gray-300">
            <span className="text-xs font-medium text-gray-600 mr-2">Insert:</span>
            <button className="p-1 hover:bg-gray-200 rounded" title="Insert Row">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Format Section */}
          <div className="flex items-center space-x-1 pr-3 border-r border-gray-300">
            <span className="text-xs font-medium text-gray-600 mr-2">Format:</span>
            <button 
              onClick={() => handleCellFormat('bold')}
              className="p-1 hover:bg-gray-200 rounded" 
              title="Bold"
              disabled={selectedCells.size === 0}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleCellFormat('italic')}
              className="p-1 hover:bg-gray-200 rounded" 
              title="Italic"
              disabled={selectedCells.size === 0}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleCellFormat('underline')}
              className="p-1 hover:bg-gray-200 rounded" 
              title="Underline"
              disabled={selectedCells.size === 0}
            >
              <Underline className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleCellFormat('strikethrough')}
              className="p-1 hover:bg-gray-200 rounded" 
              title="Strikethrough"
              disabled={selectedCells.size === 0}
            >
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>

          {/* Actions for Selected Rows */}
          {selectedRows.size > 0 && (
            <div className="flex items-center space-x-1 pl-3 border-l border-gray-300">
              <span className="text-xs font-medium text-gray-600 mr-2">
                {selectedRows.size} selected:
              </span>
              <button 
                onClick={handleExportSelected}
                className="p-1 hover:bg-gray-200 rounded" 
                title="Export Selected"
              >
                <Download className="w-4 h-4" />
              </button>
              <button 
                onClick={handleDeleteSelected}
                className="p-1 hover:bg-red-200 rounded text-red-600" 
                title="Delete Selected"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        {sortedData.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-500 text-lg mb-2">No data yet</div>
            <div className="text-gray-400 text-sm">
              Upload PDF files to extract and display COA data
            </div>
          </div>
        ) : (
          <div className="flex">
            {/* Fixed columns (Sample #, Batch) */}
            <div className="flex-shrink-0 border-r-2 border-gray-300">
              <table className="border-separate border-spacing-0">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 shadow-sm">
                  <tr>
                    {/* Row Number Header */}
                    <th className="px-3 py-4 text-left border-b-2 border-gray-300 w-16 bg-gray-100 h-[60px] align-middle">
                      <span className="text-xs font-semibold text-gray-600">#</span>
                    </th>
                    {/* Select All Checkbox */}
                    <th className="px-4 py-4 text-left border-b-2 border-gray-300 w-12 bg-gray-50 h-[60px] align-middle">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isIndeterminate;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    {/* Fixed columns headers - Sample # and Batch */}
                    {displayColumns.map((column, index) => {
                      const originalIndex = columns.indexOf(column);
                      // Only show Sample # (index 0) and Batch column in fixed area
                      if (originalIndex !== 0 && column !== 'Batch') return null;
                      
                      return (
                        <th
                          key={`fixed-${index}-${originalIndex}`}
                          className={`px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors min-w-[140px] border-b-2 border-gray-300 bg-gray-50 h-[60px] align-middle ${getColumnTypeColor(column)}`}
                          onClick={() => handleSort(column)}
                          title={getColumnTooltip(column)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate font-semibold">{column || `Column ${originalIndex + 1}`}</span>
                            {getSortIcon(column)}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {sortedData.map((row, rowIndex) => {
                    const rowId = getRowId(row, rowIndex);
                    const isNewRow = newRowIds.has(rowId);
                    const isSelected = selectedRows.has(rowId);
                    const isEvenRow = rowIndex % 2 === 0;
                    
                    return (
                      <tr
                        key={rowId}
                        className={`hover:bg-blue-50 hover:shadow-sm transition-all duration-200 border-b border-gray-200 relative ${
                          isNewRow ? 'animate-pulse bg-green-50 shadow-md border-green-300' : 
                          isSelected ? 'bg-blue-100 shadow-sm' : 
                          isEvenRow ? 'bg-gray-25' : 'bg-white'
                        }`}
                      >
                        {/* Row Number */}
                        <td className="px-3 py-4 w-16 bg-gray-50 border-r border-gray-200 sticky left-0 z-10 h-[60px] align-middle">
                          <span className="text-sm font-medium text-gray-600 select-none">
                            {rowIndex + 1}
                          </span>
                        </td>
                        {/* Row checkbox */}
                        <td className="px-4 py-4 w-12 h-[60px] align-middle">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(rowId, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        {/* Fixed columns data - Sample # and Batch */}
                        {displayColumns.map((column, colIndex) => {
                          const originalIndex = columns.indexOf(column);
                          // Only show Sample # (index 0) and Batch column in fixed area
                          if (originalIndex !== 0 && column !== 'Batch') return null;
                          
                          const cellId = getCellId(rowId, column);
                          return (
                            <td
                              key={`fixed-${colIndex}-${originalIndex}-${rowIndex}`}
                              className={`${getCellClassName(cellId)} bg-gray-25`}
                              onClick={() => {
                                const newSelected = new Set(selectedCells);
                                if (newSelected.has(cellId)) {
                                  newSelected.delete(cellId);
                                } else {
                                  newSelected.add(cellId);
                                }
                                setSelectedCells(newSelected);
                              }}
                            >
                              <div className="truncate font-medium" title={row[column]?.toString() || ""}>
                                {formatCellValue(row[column], cellId) || "-"}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Scrollable columns */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full border-separate border-spacing-0">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 shadow-sm">
                  <tr>
                    {displayColumns.map((column, index) => {
                      const originalIndex = columns.indexOf(column);
                      // Skip Sample # (index 0) and Batch column for scrollable area
                      if (originalIndex === 0 || column === 'Batch') return null;
                      
                      return (
                        <th
                          key={`scrollable-${index}-${originalIndex}`}
                          className={`px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors min-w-[140px] border-b-2 border-r border-gray-300 relative group bg-gray-50 h-[60px] align-middle ${getColumnTypeColor(column)}`}
                          onClick={() => handleSort(column)}
                          title={getColumnTooltip(column)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate font-semibold">{column || `Column ${originalIndex + 1}`}</span>
                            <div className="flex items-center space-x-1">
                              {getSortIcon(column)}
                              {/* Column visibility toggle */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleColumnVisibility(originalIndex);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
                                title="Hide Column"
                              >
                                <EyeOff className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {sortedData.map((row, rowIndex) => {
                    const rowId = getRowId(row, rowIndex);
                    const isNewRow = newRowIds.has(rowId);
                    const isSelected = selectedRows.has(rowId);
                    const isEvenRow = rowIndex % 2 === 0;
                    
                    return (
                      <tr
                        key={rowId}
                        className={`hover:bg-blue-50 hover:shadow-sm transition-all duration-200 border-b border-gray-200 relative ${
                          isNewRow ? 'animate-pulse bg-green-50 shadow-md border-green-300' : 
                          isSelected ? 'bg-blue-100 shadow-sm' : 
                          isEvenRow ? 'bg-gray-25' : 'bg-white'
                        }`}
                      >
                        {displayColumns.map((column, colIndex) => {
                          const originalIndex = columns.indexOf(column);
                          // Skip Sample # (index 0) and Batch column for scrollable area
                          if (originalIndex === 0 || column === 'Batch') return null;
                          
                          const cellId = getCellId(rowId, column);
                          return (
                            <td
                              key={`scrollable-${colIndex}-${originalIndex}-${rowIndex}`}
                              className={getCellClassName(cellId)}
                              onClick={() => {
                                const newSelected = new Set(selectedCells);
                                if (newSelected.has(cellId)) {
                                  newSelected.delete(cellId);
                                } else {
                                  newSelected.add(cellId);
                                }
                                setSelectedCells(newSelected);
                              }}
                            >
                              <div className="truncate font-medium" title={row[column]?.toString() || ""}>
                                {formatCellValue(row[column], cellId) || "-"}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      {sortedData.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500 flex items-center justify-between">
          <div>
            Showing {sortedData.length} of {data.length} records
            {searchTerm && ` (filtered by "${searchTerm}")`}
          </div>
          <div className="flex items-center space-x-4">
            {hiddenColumns.size > 0 && (
              <div className="flex items-center space-x-2">
                <span>{hiddenColumns.size} columns hidden</span>
                <button
                  onClick={() => setHiddenColumns(new Set())}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Show All
                </button>
              </div>
            )}
            <div>
              {displayColumns.length} of {columns.length} columns displayed
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
