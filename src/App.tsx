import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { Toaster } from 'sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ReactLenis } from 'lenis/react';

// LAZY LOADING COMPONENTS: Prevents massive initial bundle
const Workspace = React.lazy(() => import('./components/Workspace').then(m => ({ default: m.Workspace })));
const LandingPage = React.lazy(() => import('./components/LandingPage').then(m => ({ default: m.LandingPage })));
const AuthModal = React.lazy(() => import('./components/auth/AuthModal').then(m => ({ default: m.AuthModal })));

const MemoizedWorkspace = React.memo(Workspace);
const MemoizedLandingPage = React.memo(LandingPage);
const MemoizedAuthModal = React.memo(AuthModal);

const LoadingFallback = () => (
  <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-[#050505]">
    <div className="space-y-4 text-center">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto" />
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Loading Module...</p>
    </div>
  </div>
);

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading, isAdmin, isEmailVerified, signOut, status } = useAuth();
  
  // Navigation & UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSearch, setShowSearch] = useState(false);
  
  // Data State
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [audit, setAudit] = useState<any | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [selectedCol, setSelectedCol] = useState<string | null>(null);
  
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);

  // Force light mode for landing page
  useEffect(() => {
    const root = window.document.documentElement;
    if (!user) {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [user]);

  // Role-based auto-navigation for administrators on login
  useEffect(() => {
    if (user && isAdmin && activeTab === 'dashboard') {
      setActiveTab('admin');
    }
  }, [isAdmin, !!user]);

  // Keyboard shortcut for search - optimized with useCallback
  // Move handleKeyDown outside useEffect and wrap with useCallback
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setShowSearch(prev => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Effect: When active dataset changes, update context
  useEffect(() => {
    if (activeDatasetId) {
      fetch('/api/datasets')
        .then(res => res.json())
        .then(datasets => {
          const ds = datasets.find((d: any) => d.id === activeDatasetId);
          if (ds) {
            setAudit(ds);
            setPreview(ds.preview);
            setFileName(ds.name);
            setSelectedCol(ds.schema[0]?.name || null);
          }
        });
    }
  }, [activeDatasetId]);

  const handleAuthOverlayClose = useCallback(() => {
    setShowAuthOverlay(false);
  }, []);

  const handleAuthOverlayOpen = useCallback(() => {
    setShowAuthOverlay(true);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-[#050505]">
        <div className="space-y-4 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto" />
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Syncing Intelligence...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="light">
        <ReactLenis root options={{ lerp: 0.075, wheelMultiplier: 1.2, touchMultiplier: 2 }}>
          <React.Suspense fallback={<LoadingFallback />}>
            <MemoizedLandingPage onAuth={handleAuthOverlayOpen} />
            <AnimatePresence mode="wait">
              {showAuthOverlay && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                  onClick={handleAuthOverlayClose}
                >
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md relative"
                  >
                    <div className="absolute -top-12 right-0">
                      <button 
                        onClick={handleAuthOverlayClose}
                        className="p-2 text-white/70 hover:text-white transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <MemoizedAuthModal />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </React.Suspense>
          <Toaster />
        </ReactLenis>
      </div>
    );
  }

  // Block unverified users
  if (!isEmailVerified) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-[#050505]">
        <div className="space-y-4 text-center max-w-md p-4">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl mx-auto flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Verify Your Email</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Check your email for a verification link. Once verified, you'll have full access.
          </p>
          <button
            onClick={() => signOut()}
            className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }


  return (
    <ReactLenis root options={{ lerp: 0.075, wheelMultiplier: 1.2, touchMultiplier: 2 }}>
      <TooltipProvider>
        <div className="flex h-screen w-full bg-brand-background overflow-hidden selection:bg-brand-primary/10 transition-colors">
          <Toaster position="top-right" richColors />
          <React.Suspense fallback={<LoadingFallback />}>
            <MemoizedWorkspace 
              user={user} 
              onLogout={signOut} 
            />
          </React.Suspense>
        </div>
      </TooltipProvider>
    </ReactLenis>
  );
}
