import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from './services/supabaseClient';
import { User } from '@supabase/supabase-js';
import AuthForm from './components/AuthForm';
import Navbar from './components/Navbar';
import OfferCard from './components/OfferCard';
import OfferModal from './components/OfferModal';
import AdminDashboard from './components/AdminDashboard';
import OfflineScreen from './components/OfflineScreen';
import InstallPrompt from './components/InstallPrompt';
import { fetchOffers, trackOfferClick, fetchUserTotalClicks } from './services/offerService';
import { fetchUserProfile } from './services/adminService';
import { Offer } from './types';
import { Trophy, CheckCircle, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'admin'>('dashboard');

  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [loadingOffers, setLoadingOffers] = useState(true);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  
  const clickCountRef = useRef(0);

  useEffect(() => {
    const isIosDevice = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    setIsIOS(isIosDevice);
    
    // Explicit typing for window.navigator
    const nav = window.navigator as any;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
    
    if (isStandalone) {
        setShowInstallPrompt(false);
    } else if (isIosDevice) {
        setShowInstallPrompt(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone) setShowInstallPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);

    return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('online', handleStatus);
        window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  useEffect(() => {
    const loadPublicOffers = async () => {
        try {
            const fetchedOffers = await fetchOffers();
            setOffers(fetchedOffers);
        } catch (error) {
            console.error("Failed to load offers", error);
        } finally {
            setLoadingOffers(false);
        }
    };
    loadPublicOffers();
  }, []);

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);

          if (session?.user) {
             loadUserData(session.user.id);
             checkUserRole(session.user.id);
          }
        }
      } catch (err) {
        console.error("Session init failed:", err);
        if (mounted) setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
            loadUserData(session.user.id);
            checkUserRole(session.user.id);
        } else {
            setLoading(false); 
            setIsAdmin(false);
            setClickCount(0);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserData = async (userId: string) => {
      if (!navigator.onLine) return;
      try {
          const count = await fetchUserTotalClicks(userId);
          setClickCount(count);
          clickCountRef.current = count;
      } catch (error) {
          console.error(error);
      }
  };

  const checkUserRole = async (userId: string) => {
      if (!navigator.onLine) return;
      try {
          const profile = await fetchUserProfile(userId);
          setIsAdmin(profile?.role === 'admin');
      } catch (err) { 
        console.error("Error checking user role:", err);
      }
  };

  const handleOfferClick = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsModalOpen(true);
  };

  const handleCompleteOffer = async (offerId: string) => {
    if (!user) return;
    
    const previousCount = clickCount;
    const newCount = previousCount + 1;
    setClickCount(newCount);
    clickCountRef.current = newCount;

    try {
      await trackOfferClick(offerId, user.id);
    } catch (error) {
      console.error("Failed to track click, reverting:", error);
      setClickCount(previousCount);
      clickCountRef.current = previousCount;
    }
  };

  if (!isOnline) return <OfflineScreen onRetry={() => window.location.reload()} />;
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="h-8 w-8 text-indigo-600 animate-spin" /></div>;
  if (!session) return <AuthForm />;

  return (
    <div className="min-h-screen bg-gray-50 pb-safe-area-bottom">
      <Navbar 
        userEmail={user?.email} 
        clickCount={clickCount} 
        isAdmin={isAdmin}
        currentPage={currentPage}
        onAdminClick={() => setCurrentPage('admin')}
        onDashboardClick={() => setCurrentPage('dashboard')}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
        {currentPage === 'admin' && isAdmin ? (
            <AdminDashboard />
        ) : (
          <div className="space-y-6">
              {/* Stats Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 shadow-xl shadow-indigo-600/10 text-white transform transition-transform will-change-transform">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Total Points</p>
                        <h2 className="text-4xl font-bold text-white tabular-nums transition-all duration-300 ease-out">{clickCount}</h2>
                    </div>
                    <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                        <Trophy className="h-6 w-6 text-yellow-300 fill-yellow-300" />
                    </div>
                </div>
                <div className="mt-4">
                     <div className="flex justify-between text-xs text-indigo-100 mb-1.5">
                        <span className="font-medium">Level {Math.floor(clickCount / 10) + 1}</span>
                        <span>{10 - (clickCount % 10)} points to next level</span>
                     </div>
                     <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full transition-all duration-500 ease-out shadow-sm"
                          style={{ width: `${(clickCount % 10) * 10}%` }}
                        ></div>
                     </div>
                </div>
              </div>

              {/* Tasks Header */}
              <div className="flex items-center justify-between">
                 <h2 className="text-lg font-bold text-gray-900">Available Tasks</h2>
                 <span className="text-xs font-medium text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
                    {offers.length} Tasks
                 </span>
              </div>

              {loadingOffers ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="bg-white border border-gray-200 rounded-xl p-4 h-24 flex items-center gap-4">
                           <div className="h-12 w-12 bg-gray-100 rounded-lg animate-pulse"></div>
                           <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                                <div className="h-2 bg-gray-100 rounded w-1/3 animate-pulse"></div>
                           </div>
                        </div>
                    ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {offers.length === 0 ? (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border border-gray-200">
                            <CheckCircle className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-gray-900 font-medium">No tasks available</h3>
                        <p className="text-sm text-gray-500 mt-1">Check back later for new offers.</p>
                    </div>
                    ) : (
                        offers.map((offer) => (
                        <OfferCard 
                            key={offer.id} 
                            offer={offer} 
                            onClick={handleOfferClick} 
                        />
                        ))
                    )}
                </div>
              )}
          </div>
        )}
      </main>

      <OfferModal 
          offer={selectedOffer}
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedOffer(null); }}
          onComplete={handleCompleteOffer}
      />
      
      {showInstallPrompt && <InstallPrompt onInstall={handleInstallApp} onDismiss={() => setShowInstallPrompt(false)} isIOS={isIOS} />}
    </div>
  );
};

export default App;