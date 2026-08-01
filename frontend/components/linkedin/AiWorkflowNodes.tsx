"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileSearch, BrainCircuit, Target, KeyRound, UserCheck, CheckCircle2 } from "lucide-react";

interface AiWorkflowNodesProps {
  active: boolean; // Triggers the workflow animation
  onComplete?: () => void;
}

const NODES = [
  { id: "upload", label: "Upload PDF", icon: UploadCloud, delay: 0 },
  { id: "extract", label: "Extract Info", icon: FileSearch, delay: 1500 },
  { id: "analyze", label: "Analyze Profile", icon: BrainCircuit, delay: 3000 },
  { id: "ats", label: "ATS Optimization", icon: Target, delay: 4500 },
  { id: "keywords", label: "Keyword Match", icon: KeyRound, delay: 6000 },
  { id: "score", label: "Recruiter Score", icon: UserCheck, delay: 7500 },
  { id: "complete", label: "Completed", icon: CheckCircle2, delay: 9000 },
];

export function AiWorkflowNodes({ active, onComplete }: AiWorkflowNodesProps) {
  const [currentNodeIndex, setCurrentNodeIndex] = useState(-1);

  useEffect(() => {
    if (!active) {
      setCurrentNodeIndex(-1);
      return;
    }

    let timeouts: NodeJS.Timeout[] = [];
    NODES.forEach((node, index) => {
      const t = setTimeout(() => {
        setCurrentNodeIndex(index);
        if (index === NODES.length - 1 && onComplete) {
          setTimeout(onComplete, 1000);
        }
      }, node.delay);
      timeouts.push(t);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <h3 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
            <BrainCircuit className="text-blue-500 w-6 h-6" />
          </motion.div>
          Analyzing Profile...
        </h3>
        <p className="text-slate-500 mt-2">ResumeHive AI is scanning and optimizing your LinkedIn export.</p>
      </div>

      <div className="relative flex items-center justify-between">
        {/* Connecting Line Background */}
        <div className="absolute left-0 right-0 h-1 bg-slate-200 rounded-full top-1/2 -translate-y-1/2 z-0" />
        
        {/* Animated Progress Line */}
        <motion.div 
          className="absolute left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full top-1/2 -translate-y-1/2 z-0"
          initial={{ width: "0%" }}
          animate={{ width: currentNodeIndex >= 0 ? `${(currentNodeIndex / (NODES.length - 1)) * 100}%` : "0%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {NODES.map((node, index) => {
          const isPassed = index <= currentNodeIndex;
          const isCurrent = index === currentNodeIndex;
          
          return (
            <div key={node.id} className="relative z-10 flex flex-col items-center gap-3">
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ 
                  scale: isCurrent ? 1.2 : 1, 
                  opacity: isPassed ? 1 : 0.4,
                  borderColor: isPassed ? "#3b82f6" : "#e2e8f0",
                  backgroundColor: isCurrent ? "#ffffff" : isPassed ? "#eff6ff" : "#ffffff"
                }}
                transition={{ duration: 0.4 }}
                className={`w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-lg transition-colors ${isCurrent ? 'ring-4 ring-blue-500/20 shadow-blue-500/30' : ''}`}
              >
                <node.icon className={`w-6 h-6 ${isPassed ? 'text-blue-600' : 'text-slate-400'} ${isCurrent && index !== NODES.length -1 ? 'animate-pulse' : ''}`} />
              </motion.div>
              
              <div className="absolute top-16 w-32 text-center">
                <motion.span 
                  animate={{ color: isPassed ? "#1e293b" : "#94a3b8", fontWeight: isCurrent ? 700 : 500 }}
                  className="text-xs transition-colors"
                >
                  {node.label}
                </motion.span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
