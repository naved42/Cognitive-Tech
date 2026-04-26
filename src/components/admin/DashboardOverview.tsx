import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, Shield, BarChart3, TrendingUp, Users, Activity, Cpu } from 'lucide-react';
import { pythonService } from '../../services/pythonService';

export const DashboardOverview = () => {
  const [pythonStatus, setPythonStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    pythonService.getHealth()
      .then(() => setPythonStatus('online'))
      .catch(() => setPythonStatus('offline'));
  }, []);

  const stats = [
    { label: 'Admin Logs', value: '24', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Cloud Status', value: 'Nominal', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Python Engine', value: pythonStatus === 'online' ? 'Active' : 'Offline', icon: Cpu, color: pythonStatus === 'online' ? 'text-indigo-500' : 'text-zinc-500', bg: 'bg-indigo-500/10' },
    { label: 'Total Nodes', value: '1,280', icon: BarChart3, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-sm hover:shadow-md transition-all"
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">{stat.label}</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1 uppercase tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-black text-xs uppercase tracking-widest text-zinc-900 dark:text-white">System Vitality</h3>
              <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-tight">Real-time resource allocation</p>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="h-48 flex items-end gap-2 px-2">
            {[40, 70, 45, 90, 65, 80, 55, 95, 75, 85].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-t-lg transition-all hover:bg-indigo-500/40 relative group"
                style={{ height: `${h}%` }}
              >
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                   Node {i + 1}: {h}%
                 </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-8 space-y-6">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
               <Users className="w-5 h-5 text-amber-500" />
             </div>
             <div>
               <h3 className="font-black text-xs uppercase tracking-widest text-zinc-900 dark:text-white">User Growth</h3>
               <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-tight">Across all neural segments</p>
             </div>
           </div>
           
           <div className="space-y-4">
             {[
               { label: 'Direct Entry', value: 85, color: 'bg-indigo-500' },
               { label: 'OAuth Referrals', value: 62, color: 'bg-rose-500' },
               { label: 'API Integrations', value: 48, color: 'bg-emerald-500' },
             ].map((item) => (
               <div key={item.label} className="space-y-2">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                   <span className="text-zinc-600 dark:text-zinc-400">{item.label}</span>
                   <span className="text-zinc-900 dark:text-white">{item.value}%</span>
                 </div>
                 <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                   <div 
                     className={`h-full ${item.color} rounded-full`} 
                     style={{ width: `${item.value}%` }}
                   />
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};
