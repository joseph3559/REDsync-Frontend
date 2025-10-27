"use client";
import { useState } from "react";
import { Trash2, FileX, AlertTriangle } from "lucide-react";
import DeleteDialog from "./DeleteDialog";
import BulkDeleteDialog from "./BulkDeleteDialog";

export default function DeleteDialogDemo() {
  const [singleDialog, setSingleDialog] = useState(false);
  const [bulkDialog, setBulkDialog] = useState(false);
  const [clearDialog, setClearDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setSingleDialog(false);
    setBulkDialog(false);
    setClearDialog(false);
  };

  const mockItems = [
    "Lecithin_Sample_2024_001.pdf",
    "Organic_Lecithin_QC_Report.pdf", 
    "Batch_BA001256_Analysis.pdf",
    "Sample_M20241803_Results.pdf",
    "Quality_Control_Report_Feb2024.pdf"
  ];

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Delete Dialog Components</h1>
        <p className="text-gray-600 mb-8">
          Beautiful, professional delete confirmation dialogs with modern animations and proper accessibility.
        </p>

        {/* Demo Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Single Delete</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Confirmation dialog for deleting a single item with clear warnings.
            </p>
            <button
              onClick={() => setSingleDialog(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Delete Item
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileX className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Bulk Delete</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Smart dialog for deleting multiple items with preview list.
            </p>
            <button
              onClick={() => setBulkDialog(true)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Delete 5 Items
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Clear All</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Dangerous action dialog with strong warnings and data counts.
            </p>
            <button
              onClick={() => setClearDialog(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Clear All Data
            </button>
          </div>
        </div>

        {/* Features List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">✨ Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Beautiful modern design</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Smooth animations</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Loading states</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Proper focus management</span>
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Customizable warnings</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Item preview lists</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Responsive design</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">TypeScript support</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Delete Dialogs */}
      <DeleteDialog
        isOpen={singleDialog}
        onClose={() => setSingleDialog(false)}
        onConfirm={handleDelete}
        title="Delete COA record?"
        description="Are you sure you want to delete Lecithin_Sample_2024_001.pdf? This action cannot be undone."
        loading={loading}
      />

      <BulkDeleteDialog
        isOpen={bulkDialog}
        onClose={() => setBulkDialog(false)}
        onConfirm={handleDelete}
        itemCount={5}
        itemType="COA record"
        selectedItems={mockItems}
        loading={loading}
      />

      <DeleteDialog
        isOpen={clearDialog}
        onClose={() => setClearDialog(false)}
        onConfirm={handleDelete}
        title="Clear All COA Data?"
        description="Are you sure you want to clear all 47 COA records? This will permanently delete all uploaded and processed data from the database."
        confirmText="Clear All Data"
        loading={loading}
        isDangerous={true}
      />
    </div>
  );
}
