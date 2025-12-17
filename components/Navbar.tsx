import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Menu, User, LogOut, ShieldCheck, ChevronLeft, Zap, X } from 'lucide-react';

interface NavbarProps {
  userEmail: string | undefined;
  clickCount: number;
  isAdmin: boolean;
  onAdminClick: () => void;
  onDashboardClick: () => void;
  currentPage: 'dashboard' | 'admin';
}

const Navbar: React.FC<NavbarProps> = ({ 
  userEmail, 
  clickCount,
  isAdmin, 
  onAdminClick, 
  onDashboardClick,
  currentPage
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14"> {/* Reduced height slightly for compactness */}
          
          <div className="flex items-center gap-3">
             {/* Brand */}
             <div className="flex items-center gap-2">
              {currentPage === 'admin' ? (
                <button 
                  onClick={onDashboardClick}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              ) : (
                <div className="h-6 w-6 bg-indigo-600 rounded flex items-center justify-center shadow-md shadow-indigo-600/20">
                  <Zap className="h-3.5 w-3.5 text-white fill-white" />
                </div>
              )}
              <span className="text-base font-bold text-gray-900 tracking-tight hidden xs:block">
                {currentPage === 'admin' ? 'Admin' : 'TaskEarn'}
              </span>
            </div>
          </div>

          {/* User / Menu */}
          <div className="flex items-center gap-2">
            {/* User Info - Compact light theme style */}
            <div className="flex items-center gap-2 bg-gray-100 py-1 px-2.5 rounded-full border border-gray-200 max-w-[140px] sm:max-w-xs">
              <div className="h-4 w-4 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-2.5 w-2.5 text-gray-500" />
              </div>
              <span className="text-xs font-medium text-gray-700 truncate">{userEmail}</span>
            </div>

            {/* Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-14 left-0 w-full bg-white border-b border-gray-200 shadow-xl animate-fade-in z-50">
          <div className="px-4 py-4 space-y-2">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 mb-2">
               <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Current Level</p>
                  <p className="text-indigo-600 font-bold text-sm">Level {Math.floor(clickCount / 10) + 1}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Points</p>
                  <p className="text-gray-900 font-bold text-sm">{clickCount}</p>
               </div>
            </div>

            {isAdmin && currentPage === 'dashboard' && (
              <button
                onClick={() => { onAdminClick(); setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <ShieldCheck className="h-4 w-4" /> Admin Dashboard
              </button>
            )}
            
            <button
              onClick={() => { handleLogout(); setIsMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;