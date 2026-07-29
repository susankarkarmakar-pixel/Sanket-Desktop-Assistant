import React from 'react';
import { motion } from 'framer-motion';
import { Globe, MessageCircle, Plus, LayoutGrid } from 'lucide-react';
import { Card } from '../components/ui';

export default function LauncherApp() {
  const openBrowser = () => {
    if (window.api && window.api.openBrowser) {
      window.api.openBrowser();
    }
  };

  const openWhatsApp = () => {
    if (window.api && window.api.openWhatsApp) {
      window.api.openWhatsApp();
    }
  };

  const apps = [
    { id: 'browser', label: 'Browser', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-500/10', action: openBrowser },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-500/10', action: openWhatsApp },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="h-full">
      <div className="flex items-center gap-2 mb-6 text-text/70">
        <LayoutGrid className="w-5 h-5" />
        <h2 className="text-xl font-semibold text-text">Speed Dial</h2>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
      >
        {apps.map((app) => (
          <motion.div key={app.id} variants={item}>
            <button
              onClick={app.action}
              className="w-full aspect-square bg-surface border border-border rounded-2xl flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 hover:shadow-lg hover:border-primary/30 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${app.bg} transition-transform group-hover:scale-110 shadow-sm`}>
                <app.icon className={`w-8 h-8 ${app.color}`} />
              </div>
              <span className="font-medium text-sm text-text/90 group-hover:text-text transition-colors">
                {app.label}
              </span>
            </button>
          </motion.div>
        ))}

        <motion.div variants={item}>
          <button className="w-full aspect-square bg-surface/50 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors hover:bg-surface hover:border-primary/50 group text-text/50 hover:text-primary">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-medium text-sm">Add App</span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
