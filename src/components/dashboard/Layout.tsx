"use client";
import { ReactNode, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Settings } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { clearAllAuth, getUserFromToken, getToken } from "@/lib/auth";
import { fetchMe } from "@/lib/api";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Force light mode for dashboard
  useEffect(() => {
    // Override dark mode by setting light background on body
    document.documentElement.style.colorScheme = 'light';
    document.body.style.backgroundColor = '#f9fafb'; // gray-50
    
    return () => {
      // Cleanup on unmount
      document.documentElement.style.colorScheme = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      setIsClient(true);
      const tokenInfo = getUserFromToken();
      setUserInfo(tokenInfo);
      
      if (tokenInfo) {
        try {
          const token = getToken();
          if (token) {
            const response = await fetchMe(token);
            setUserData(response.user); // Backend returns { user: userData }
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          // Fallback to token info if API fails
        }
      }
      setIsLoading(false);
    };

    loadUserData();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showUserMenu]);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setShowUserMenu(false); // Close the menu immediately
    
    try {
      // Clear all authentication data (localStorage + cookies)
      clearAllAuth();
      
      // Force navigation to login page (middleware will redirect if auth is cleared)
      window.location.href = '/login';
      
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: force page refresh to login
      window.location.href = '/login';
    }
  };

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    router.push('/dashboard/settings');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="md:pl-72 bg-gray-50">
        <header className="sticky top-0 z-30 h-16 bg-white/70 backdrop-blur border-b border-slate-200 flex items-center">
          <div className="flex-1 px-4 sm:px-6 flex items-center gap-3">
            <button
              onClick={() => setOpen((v) => !v)}
              className="inline-flex md:hidden items-center justify-center h-9 w-9 rounded-md border border-slate-200"
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-700">
                    {isLoading ? 'Loading...' : 
                     (userData?.name || 
                      (isClient && userInfo?.email ? userInfo.email.split('@')[0] : 'User'))
                    }
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div 
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900">
                        {userData?.name || 
                         (isClient && userInfo?.email ? userInfo.email.split('@')[0] : 'User')}
                      </p>
                      <p className="text-xs text-slate-500">
                        {userData?.email || (isClient && userInfo?.email ? userInfo.email : 'user@redlecithin.com')}
                      </p>
                    </div>
                    
                    <button
                      onClick={handleSettingsClick}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      type="button"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}


