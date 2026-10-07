import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LogOut, 
  Search,
  Building2,
  CheckCircle2
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export const ApexLogo = ({ className = 'w-10 h-10' }) => (
  <div className={`${className} rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-sm shrink-0 border border-black/10 dark:border-white/20 transition-colors`}>
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4v18" />
      <path d="M19 21V11l-6-4" />
      <path d="M9 9h1" />
      <path d="M9 13h1" />
      <path d="M9 17h1" />
    </svg>
  </div>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [navSearch, setNavSearch] = useState('');

  // Global keyboard shortcut '/' to focus search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (user && e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/75 dark:bg-black/75 backdrop-blur-xl border-b border-black/[0.08] dark:border-white/[0.10] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Platform brand icon + ApexHeights title & subtitle */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none shrink-0" 
            onClick={() => navigate('/')}
          >
            <ApexLogo className="w-10 h-10" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg text-black dark:text-white tracking-tight">
                  ApexHeights CMS
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-black/5 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 rounded-full border border-black/10 dark:border-white/15">
                  Residency OS
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium hidden sm:block">
                Facility & Incident Operations Console
              </p>
            </div>
          </div>

          {/* Center: Quick Search with '/' shortcut (Visible only when logged in) */}
          {user ? (
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-2.5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  placeholder="Search tickets, flats, tokens..."
                  className="w-full pl-9 pr-12 py-2 text-xs bg-neutral-100/90 dark:bg-neutral-900/90 border border-neutral-200/90 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-colors"
                />
                <div className="absolute right-2.5 top-2 flex items-center gap-1 pointer-events-none">
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-neutral-500 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded shadow-xs">
                    /
                  </kbd>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:block flex-1" />
          )}

          {/* Right: Operations status or User Identity Pill + Theme Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            {!user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 font-semibold backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Facility Services Online</span>
              </div>
            )}

            <ThemeToggle />

            {user && (
              <div className="flex items-center gap-2.5 pl-2 border-l border-neutral-200 dark:border-neutral-800">
                {/* User Identity Pill */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-neutral-100/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-[10px] tracking-wider uppercase shrink-0">
                    {getInitials(user.name)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-black dark:text-white leading-tight truncate max-w-[120px]">
                      {user.name}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-white dark:bg-black text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 capitalize">
                    {user.flat_no ? `Unit ${user.flat_no}` : user.role}
                  </span>
                </div>

                <button
                  id="logout-btn"
                  data-testid="logout-btn"
                  onClick={logout}
                  title="Sign out of session"
                  className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
