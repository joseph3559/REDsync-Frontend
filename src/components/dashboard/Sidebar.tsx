"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard Overview" },
  { href: "/dashboard/coa-database", label: "COA Database" },
  { href: "/dashboard/questionnaires", label: "Questionnaires" },
  { href: "/dashboard/import-export", label: "Import/Export" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard/user-management", label: "User Management" },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  return (
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
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}


