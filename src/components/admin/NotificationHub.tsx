import React from 'react';
import { Bell, Shield, Zap, Send } from 'lucide-react';
import { Button } from '../ui/button';

export const NotificationHub = () => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-12 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mx-auto">
        <Bell className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Broadcast System</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium max-w-sm mx-auto">
          Global notification infrastructure for real-time alerts and system announcements.
        </p>
      </div>
      <div className="pt-6">
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-8 h-12 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20">
          <Send className="w-4 h-4 mr-2" /> Initialize Broadcast
        </Button>
      </div>
    </div>
  );
};
