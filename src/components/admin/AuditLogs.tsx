import React from 'react';
import { Clock, Shield, Search, Filter, Info } from 'lucide-react';

export const AuditLogs = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <Clock className="w-5 h-5 text-indigo-500" />
             <h3 className="font-black text-xs uppercase tracking-widest text-zinc-900 dark:text-white">Audit Protocol</h3>
           </div>
        </div>
        
        <div className="p-16 text-center space-y-6 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-2xl mx-auto flex items-center justify-center text-zinc-400">
            <Shield className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h4 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">External Logging Enabled</h4>
            <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-tight">
              Audit trails and administrative actions are now recorded via Clerk's event logging system. Firestore-based local logging has been deactivated to ensure centralized security compliance.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-indigo-500 uppercase tracking-[0.1em]">
            <Info className="w-3.5 h-3.5" />
            Check Clerk Dashboard for real-time telemetry
          </div>
        </div>
      </div>
    </div>
  );
};
