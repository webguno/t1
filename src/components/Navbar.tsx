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
    <nav className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2">
              {currentPage === 'admin' ? (
                <button 
                  onClick={onDashboardClick}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              ) : (
                <div className="h-7 w-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <Zap className="h-4 w-4 text-white fill-white" />
                </div>
              )}
              <span className="text-base font-bold text-gray-900 tracking-tight">
                {currentPage === 'admin' ? 'Admin' : 'TaskEarn'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop User Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 py-1.5 px-3 rounded-full border border-gray-200">
              <div className="h-5 w-5 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-3 w-3 text-gray-500" />
              </div>
              <span className="text-xs font-medium text-gray-700 truncate max-w-[150px]">{userEmail}</span>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-14 left-0 w-full bg-white border-b border-gray-200 shadow-xl animate-fade-in z-50">
          <div className="px-4 py-4 space-y-3">
            
            {/* Mobile User Info */}
            <div className="sm:hidden flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">{userEmail}</p>
                    <p className="text-xs text-gray-500">Member</p>
                </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
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
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors active:bg-gray-100"
              >
                <ShieldCheck className="h-4 w-4" /> Admin Dashboard
              </button>
            )}
            
            <button
              onClick={() => { handleLogout(); setIsMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors active:bg-red-50"
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