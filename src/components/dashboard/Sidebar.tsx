"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { isSuperAdmin } from "@/lib/auth";

const baseNavItems = [
  { href: "/dashboard", label: "Dashboard Overview", enabled: false },
  { href: "/dashboard/coa-database", label: "COA Database", enabled: true },
  { href: "/dashboard/questionnaires", label: "Questionnaires", enabled: false },
  { href: "/dashboard/import-export", label: "Import/Export", enabled: false },
  { href: "/dashboard/settings", label: "Settings", enabled: false },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [navItems, setNavItems] = useState(baseNavItems);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    // Check if user is super admin and add User Management link
    if (isSuperAdmin()) {
      setNavItems([...baseNavItems, { href: "/dashboard/user-management", label: "User Management", enabled: false }]);
    } else {
      setNavItems(baseNavItems);
    }
  }, []);

  useEffect(() => {
    if (showComingSoon) {
      const timer = setTimeout(() => setShowComingSoon(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showComingSoon]);

  const handleClick = (e: React.MouseEvent, item: typeof baseNavItems[0]) => {
    if (!item.enabled) {
      e.preventDefault();
      setShowComingSoon(true);
    }
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200">
          <span className="font-semibold text-slate-900">RedLecithin Portal</span>
          <button onClick={onClose} className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-slate-200">
            ✕
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const isDisabled = !item.enabled;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleClick(e, item)}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors relative ${
                  active && item.enabled
                    ? "bg-slate-900 text-white" 
                    : isDisabled
                    ? "text-slate-400 cursor-not-allowed opacity-60 hover:bg-slate-50"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{item.label}</span>
                  {isDisabled && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      Soon
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-4 animate-in zoom-in duration-200">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-4">
                <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Coming Soon!</h3>
              <p className="text-slate-600 mb-6">
                This feature is currently under development and will be available soon.
              </p>
              <button
                onClick={() => setShowComingSoon(false)}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors font-medium"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

