import React from 'react';
import { 
  Settings, 
  Shield, 
  Zap, 
  Key,
  Smartphone,
  Globe,
  ChevronRight,
  RefreshCw,
  Lock,
  Eye,
  Server
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export const AdminSettings = () => {
  const sections = [
    { 
      title: 'Governance', 
      icon: Shield, 
      color: 'text-indigo-500', 
      bg: 'bg-indigo-500/10',
      items: ['Role Definitions', 'Authority Levels', 'API Restrictions'] 
    },
    { 
      title: 'Performance', 
      icon: Zap, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10',
      items: ['Cache TTL', 'Response Compression', 'Edge Routing'] 
    },
    { 
      title: 'Security', 
      icon: Key, 
      color: 'text-rose-500', 
      bg: 'bg-rose-500/10',
      items: ['MFA Policy', 'IP Whitelisting', 'Token Expiry'] 
    },
    { 
      title: 'System', 
      icon: Globe, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      items: ['Node Region', 'Maintenance Mode', 'Global Search'] 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <div key={section.title} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-8 space-y-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${section.bg} flex items-center justify-center ${section.color}`}>
                <section.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">{section.title}</h3>
            </div>
            
            <div className="space-y-2">
              {section.items.map((item) => (
                <button key={item} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group">
                  <span className="text-[10px] font-black text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors uppercase tracking-widest leading-none">{item}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-indigo-500 transition-all transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-6 bg-zinc-900 rounded-3xl text-white space-y-4">
            <Server className="w-6 h-6 text-indigo-400" />
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Environment</p>
              <p className="text-xs font-bold uppercase tracking-widest">Production-GCA-Core</p>
            </div>
         </div>
         <div className="p-6 bg-indigo-600 rounded-3xl text-white space-y-4">
            <Lock className="w-6 h-6 text-indigo-200" />
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-indigo-300 tracking-widest">Encryption</p>
              <p className="text-xs font-bold uppercase tracking-widest">AES-256-GCM Armed</p>
            </div>
         </div>
         <div className="p-6 bg-emerald-600 rounded-3xl text-white space-y-4">
            <Eye className="w-6 h-6 text-emerald-200" />
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-emerald-300 tracking-widest">Auditing</p>
              <p className="text-xs font-bold uppercase tracking-widest">Full Trace Enabled</p>
            </div>
         </div>
      </div>

      <div className="bg-rose-500/5 border border-rose-500/20 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm shadow-rose-500/5">
        <div className="space-y-2 text-center md:text-left">
          <h4 className="text-lg font-black text-rose-500 uppercase tracking-tight">Neural Core Reset</h4>
          <p className="text-[11px] font-medium text-rose-500/60 uppercase tracking-tight max-w-md">
            Warning: This will purge all local cache layers and force a cold-synchronization across all global edge nodes.
          </p>
        </div>
        <Button className="bg-rose-500 hover:bg-rose-600 text-white rounded-2xl px-10 h-14 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-rose-500/20">
          <RefreshCw className="w-4 h-4 mr-2" /> Synchronize Core
        </Button>
      </div>
    </div>
  );
};
