"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Layout, ZoomIn, Palette, CheckCircle2, Grid, MousePointer2 } from "lucide-react";

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }} 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden font-sans"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            Editor Settings
          </h2>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all shadow-sm">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Editor Preferences */}
          <div className="space-y-6">
             <div>
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><MousePointer2 className="w-4 h-4"/> Editor</h3>
               <div className="space-y-2">
                 <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                   <span className="text-sm font-bold text-slate-700">Auto Save</span>
                   <div className="w-10 h-6 bg-indigo-500 rounded-full relative shadow-inner"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                 </label>
                 <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                   <span className="text-sm font-bold text-slate-700">Spell Check</span>
                   <div className="w-10 h-6 bg-indigo-500 rounded-full relative shadow-inner"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                 </label>
                 <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                   <span className="text-sm font-bold text-slate-700">Enable Motion</span>
                   <div className="w-10 h-6 bg-indigo-500 rounded-full relative shadow-inner"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                 </label>
               </div>
             </div>

             <div>
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><Palette className="w-4 h-4"/> Theme</h3>
               <div className="flex gap-2">
                 <button className="flex-1 py-2 rounded-lg text-sm font-bold bg-slate-900 text-white shadow-sm ring-2 ring-slate-900 ring-offset-2 transition-all">Light</button>
                 <button className="flex-1 py-2 rounded-lg text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">Dark</button>
                 <button className="flex-1 py-2 rounded-lg text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">System</button>
               </div>
             </div>
          </div>

          {/* Document Settings */}
          <div className="space-y-6">
             <div>
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><Layout className="w-4 h-4"/> Page Size</h3>
               <div className="grid grid-cols-2 gap-3">
                 <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-indigo-500 bg-indigo-50 text-indigo-700 font-bold transition-all">
                   <div className="w-8 h-11 bg-white shadow-sm border border-indigo-200 rounded-sm relative"><CheckCircle2 className="w-4 h-4 text-indigo-500 absolute -bottom-2 -right-2 bg-white rounded-full"/></div>
                   A4
                 </button>
                 <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-slate-200 bg-white text-slate-500 hover:border-slate-300 transition-all">
                   <div className="w-[34px] h-[44px] bg-white shadow-sm border border-slate-200 rounded-sm"></div>
                   US Letter
                 </button>
               </div>
             </div>

             <div>
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><Grid className="w-4 h-4"/> Preview Overlays</h3>
               <div className="space-y-2">
                 <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                   <span className="text-sm font-bold text-slate-700">Show Safe Margins</span>
                   <div className="w-10 h-6 bg-slate-200 rounded-full relative shadow-inner"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                 </label>
                 <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                   <span className="text-sm font-bold text-slate-700">Show Baseline Grid</span>
                   <div className="w-10 h-6 bg-slate-200 rounded-full relative shadow-inner"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                 </label>
               </div>
             </div>
          </div>
          
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-full shadow-md transition-all">
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
