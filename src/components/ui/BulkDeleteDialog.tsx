"use client";

import { AlertTriangle, Trash2, Loader2, X } from "lucide-react";

interface BulkDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemCount: number;
  itemType: string;
  selectedItems: string[];
  loading?: boolean;
  isDangerous?: boolean;
}

export default function BulkDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  itemCount,
  itemType,
  selectedItems,
  loading = false,
  isDangerous = false
}: BulkDeleteDialogProps) {
  if (!isOpen) return null;

  const title = `Delete ${itemCount} ${itemType}${itemCount > 1 ? 's' : ''}?`;
  const description = `This will permanently delete the following ${itemCount} ${itemType}${itemCount > 1 ? 's' : ''}. This action cannot be undone.`;

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-auto max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              isDangerous ? 'bg-red-100' : 'bg-orange-100'
            }`}>
              <AlertTriangle className={`h-5 w-5 ${
                isDangerous ? 'text-red-600' : 'text-orange-600'
              }`} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-6 pb-4">
            <p className="text-sm text-slate-600 mb-4">{description}</p>
            
            <div className="text-sm font-medium text-slate-700 mb-2">
              Items to be deleted:
            </div>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <div className="border rounded-md p-3 bg-slate-50 space-y-1 max-h-32 overflow-y-auto">
              {selectedItems.map((item, index) => (
                <div
                  key={index}
                  className="text-sm text-slate-600 py-1 px-2 rounded bg-white shadow-sm border"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 pt-4 border-t border-slate-200">
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`w-full sm:w-auto px-4 py-2 rounded-md text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 ${
                  isDangerous 
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete {itemCount} {itemType}{itemCount > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}