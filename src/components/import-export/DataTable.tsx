"use client";
import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Search, Filter, ChevronLeft, ChevronRight, BarChart3, TrendingUp, DollarSign, Package } from "lucide-react";
import { ImportExportRow } from "@/lib/api";

type SortDirection = 'asc' | 'desc' | null;
type ViewMode = 'pricing' | 'competition';

interface DataTableProps {
  data: ImportExportRow[];
  viewMode: ViewMode;
}

interface Filters {
  search: string;
  hsCode: string;
  incoterm: string;
  currency: string;
  company: string;  // Added company filter
  priceMin: string;
  priceMax: string;
}

export default function DataTable({ data, viewMode }: DataTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof ImportExportRow | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    hsCode: '',
    incoterm: '',
    currency: '',
    company: '',  // Added company filter
    priceMin: '',
    priceMax: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Get visible columns based on view mode
  const visibleColumns = useMemo(() => {
    const allColumns = [
      { key: 'Product Name' as keyof ImportExportRow, label: 'Product Name', width: 'w-64' },
      { key: 'Importer/Exporter' as keyof ImportExportRow, label: 'Importer/Exporter', width: 'w-48' },
      { key: 'Company' as keyof ImportExportRow, label: 'Company', width: 'w-48' },  // Added Company column
      { key: 'Quantity' as keyof ImportExportRow, label: 'Quantity', width: 'w-32' },
      { key: 'Price' as keyof ImportExportRow, label: 'Price', width: 'w-32' },
      { key: 'Incoterm' as keyof ImportExportRow, label: 'Incoterm', width: 'w-24' },
      { key: 'Currency' as keyof ImportExportRow, label: 'Currency', width: 'w-24' }
    ];

    if (viewMode === 'pricing') {
      return allColumns.filter(col => 
        ['Product Name', 'Quantity', 'Price', 'Incoterm', 'Currency'].includes(col.label)
      );
    }
    // Competition mode shows all columns including Company
    return allColumns;
  }, [viewMode]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(row => 
        Object.values(row).some(value => 
          String(value || '').toLowerCase().includes(searchLower)
        )
      );
    }

    if (filters.incoterm) {
      result = result.filter(row => 
        (row.Incoterm || '').toLowerCase().includes(filters.incoterm.toLowerCase())
      );
    }

    if (filters.currency) {
      result = result.filter(row => 
        (row.Currency || '').toLowerCase().includes(filters.currency.toLowerCase())
      );
    }

    if (filters.company) {
      result = result.filter(row => 
        (row.Company || '').toLowerCase().includes(filters.company.toLowerCase())
      );
    }

    if (filters.priceMin) {
      const minPrice = parseFloat(filters.priceMin);
      result = result.filter(row => (row.Price || 0) >= minPrice);
    }

    if (filters.priceMax) {
      const maxPrice = parseFloat(filters.priceMax);
      result = result.filter(row => (row.Price || 0) <= maxPrice);
    }

    // Apply sorting
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        // Handle null/undefined values
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return sortDirection === 'asc' ? -1 : 1;
        if (bVal == null) return sortDirection === 'asc' ? 1 : -1;
        
        // Handle numeric values
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        // Handle string values
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        return sortDirection === 'asc' 
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    return result;
  }, [data, filters, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

  const handleSort = (column: keyof ImportExportRow) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: keyof ImportExportRow) => {
    if (sortColumn !== column) return null;
    if (sortDirection === 'asc') return <ChevronUp className="h-4 w-4" />;
    if (sortDirection === 'desc') return <ChevronDown className="h-4 w-4" />;
    return null;
  };

  const formatValue = (value: unknown, column: string) => {
    if (value == null) return '-';
    
    if (column === 'Price' && typeof value === 'number') {
      return value.toLocaleString('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 2 
      });
    }
    
    if (column === 'Quantity' && typeof value === 'number') {
      return value.toLocaleString();
    }
    
    return String(value);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      hsCode: '',
      incoterm: '',
      currency: '',
      priceMin: '',
      priceMax: ''
    });
    setCurrentPage(1);
  };

  // Calculate data analysis indicators
  const analysisStats = useMemo(() => {
    const totalRecords = filteredAndSortedData.length;
    const totalValue = filteredAndSortedData.reduce((sum, row) => {
      const price = typeof row.Price === 'number' ? row.Price : parseFloat(String(row.Price)) || 0;
      return sum + price;
    }, 0);
    
    const avgPrice = totalRecords > 0 ? totalValue / totalRecords : 0;
    const uniqueCompanies = new Set(filteredAndSortedData.map(row => row.Company).filter(Boolean)).size;  // Changed from uniqueCountries
    const uniqueProducts = new Set(filteredAndSortedData.map(row => row["Product Name"]).filter(Boolean)).size;
    const uniqueCompetitors = new Set(filteredAndSortedData.map(row => row.Competitor).filter(Boolean)).size;
    
    return {
      totalRecords,
      totalValue,
      avgPrice,
      uniqueCompanies,  // Changed from uniqueCountries
      uniqueProducts,
      uniqueCompetitors
    };
  }, [filteredAndSortedData]);

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

  return (
    <div className="space-y-6">
      {/* Data Analysis Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Total Records</p>
              <p className="text-2xl font-bold text-blue-900">{formatNumber(analysisStats.totalRecords)}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Total Value</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(analysisStats.totalValue)}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Avg Price</p>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(analysisStats.avgPrice)}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 mb-1">Products</p>
              <p className="text-2xl font-bold text-orange-900">{formatNumber(analysisStats.uniqueProducts)}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search all columns..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Incoterm</label>
              <input
                type="text"
                placeholder="FOB, CIF, etc."
                value={filters.incoterm}
                onChange={(e) => setFilters(prev => ({ ...prev, incoterm: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
              <input
                type="text"
                placeholder="USD, EUR, etc."
                value={filters.currency}
                onChange={(e) => setFilters(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
              <input
                type="text"
                placeholder="Company name..."
                value={filters.company}
                onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Min Price</label>
              <input
                type="number"
                placeholder="0"
                value={filters.priceMin}
                onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Price</label>
              <input
                type="number"
                placeholder="1000000"
                value={filters.priceMax}
                onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Results Info */}
      <div className="flex justify-between items-center text-sm text-slate-600">
        <div>
          Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedData.length)} of {filteredAndSortedData.length} entries
          {filteredAndSortedData.length !== data.length && (
            <span className="ml-1">(filtered from {data.length} total)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label>Show:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-slate-300 rounded px-2 py-1 text-sm"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 select-none ${column.width}`}
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {currentData.map((row, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  {visibleColumns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {formatValue(row[column.key], column.label)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Items per page */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-slate-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
              <span className="text-sm text-slate-600">per page</span>
            </div>

            {/* Pagination info */}
            <div className="text-sm text-slate-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, analysisStats.totalRecords)} of {formatNumber(analysisStats.totalRecords)} records
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredAndSortedData.length === 0 && (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-lg">
          <p className="text-slate-500">No data matches your current filters.</p>
          <button
            onClick={resetFilters}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Clear filters to see all data
          </button>
        </div>
      )}
    </div>
  );
}
