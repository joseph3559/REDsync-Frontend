"use client";
import { DollarSign, Users } from "lucide-react";

type ViewMode = 'pricing' | 'competition';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
      <button
        onClick={() => onViewModeChange('pricing')}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
          ${viewMode === 'pricing' 
            ? 'bg-white text-slate-900 shadow-sm' 
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }
        `}
      >
        <DollarSign className="h-4 w-4" />
        Pricing Focus
      </button>
      <button
        onClick={() => onViewModeChange('competition')}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
          ${viewMode === 'competition' 
            ? 'bg-white text-slate-900 shadow-sm' 
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }
        `}
      >
        <Users className="h-4 w-4" />
        Competition Focus
      </button>
    </div>
  );
}
