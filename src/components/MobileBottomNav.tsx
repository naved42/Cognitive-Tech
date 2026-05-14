import React from 'react';
import { Home, FolderOpen, History as HistoryIcon, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  active: string;
  onNavigate: (view: string) => void;
  onOpenMenu?: () => void;
}

export default function MobileBottomNav({ active, onNavigate, onOpenMenu }: Props) {
  return (
    <nav
      aria-label="Mobile navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 px-3"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-3xl mx-auto flex items-center justify-between h-14">
        <button
          aria-label="Home"
          onClick={() => onNavigate('home')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 w-1/4 h-12 rounded-md',
            active === 'home' ? 'text-indigo-600' : 'text-slate-500'
          )}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </button>

        <button
          aria-label="Files"
          onClick={() => onNavigate('files')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 w-1/4 h-12 rounded-md',
            active === 'files' ? 'text-indigo-600' : 'text-slate-500'
          )}
        >
          <FolderOpen className="w-5 h-5" />
          <span className="text-xs">Files</span>
        </button>

        <button
          aria-label="History"
          onClick={() => onNavigate('history')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 w-1/4 h-12 rounded-md',
            active === 'history' ? 'text-indigo-600' : 'text-slate-500'
          )}
        >
          <HistoryIcon className="w-5 h-5" />
          <span className="text-xs">History</span>
        </button>

        <button
          aria-label="Menu"
          onClick={() => onOpenMenu && onOpenMenu()}
          className={cn('flex flex-col items-center justify-center gap-1 w-1/4 h-12 rounded-md text-slate-500')}
        >
          <Settings className="w-5 h-5" />
          <span className="text-xs">Menu</span>
        </button>
      </div>
    </nav>
  );
}
