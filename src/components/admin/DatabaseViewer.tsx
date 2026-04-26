import React from 'react';
import { Database, Search, HardDrive, Cpu, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';

export const DatabaseViewer = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-700">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm">
           <div className="space-y-1">
             <h3 className="font-black text-xs uppercase tracking-widest text-zinc-900 dark:text-white">Cloud Segments</h3>
             <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-tight">Firestore instance monitoring</p>
           </div>
           <div className="space-y-2">
             {['users', 'admins', 'adminLogs', 'datasets', 'usage'].map((col) => (
               <button key={col} className="w-full text-left px-4 py-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 flex items-center justify-between group transition-all">
                 <span className="group-hover:text-indigo-500 transition-colors uppercase tracking-widest text-[9px]">{col}</span>
                 <Database className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
               </button>
             ))}
           </div>
        </div>

        <div className="bg-indigo-600 rounded-3xl p-6 text-white space-y-4 shadow-xl shadow-indigo-500/20">
           <HardDrive className="w-8 h-8 opacity-50" />
           <div className="space-y-1">
             <h4 className="text-xs font-black uppercase tracking-widest">Console Access</h4>
             <p className="text-[10px] font-medium text-indigo-100">Direct cloud management interface</p>
           </div>
           <Button className="w-full bg-white/20 hover:bg-white/30 border-none text-white text-[9px] font-black uppercase tracking-widest h-9 rounded-xl">
             Open Panel <ExternalLink className="w-3 h-3 ml-2" />
           </Button>
        </div>
      </div>

      <div className="lg:col-span-3">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-12 text-center space-y-6 min-h-[400px] flex flex-col items-center justify-center shadow-sm">
           <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto">
             <Search className="w-10 h-10" />
           </div>
           <div className="space-y-2">
             <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Visual Query Inspector</h2>
             <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium max-w-sm mx-auto">
               Select a cloud segment to begin recursive indexing and multi-dimensional analysis of stored entities.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};
