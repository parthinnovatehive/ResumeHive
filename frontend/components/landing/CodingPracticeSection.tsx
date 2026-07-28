"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Code2, CheckCircle2, Play, Terminal } from "lucide-react";

export function CodingPracticeSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-20%" });
  const [typingStep, setTypingStep] = useState(0);

  useEffect(() => {
    if (isInView) {
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setTypingStep(step);
        if (step >= 40) clearInterval(interval);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isInView]);

  const codeString = `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`;
  
  const typedCode = codeString.substring(0, typingStep);

  return (
    <section id="practice" className="py-32 relative overflow-hidden bg-slate-50 dark:bg-slate-900/30" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
          
          {/* Left Showcase */}
          <div className="flex-1 w-full max-w-2xl lg:max-w-none relative perspective-1000">
            <motion.div 
              initial={{ opacity: 0, rotateY: -20, scale: 0.9 }}
              whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, type: "spring", bounce: 0.2 }}
              className="relative w-full aspect-[4/3] rounded-2xl glass-card overflow-hidden shadow-2xl border border-white/50 dark:border-slate-700/50 bg-[#1e1e1e] flex flex-col"
            >
              
              {/* VS Code like header */}
              <div className="h-10 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center px-4 gap-4 select-none">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="text-xs text-[#858585] font-mono">TwoSum.js - ResumeHive Practice</div>
                </div>
              </div>

              {/* Editor Split */}
              <div className="flex-1 flex overflow-hidden">
                {/* Problem Description */}
                <div className="w-1/3 bg-[#1e1e1e] border-r border-[#3c3c3c] p-4 overflow-hidden hidden sm:block">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-bold text-[#4CAF50] bg-[#4CAF50]/10 px-2 py-0.5 rounded">Easy</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">1. Two Sum</h3>
                  <p className="text-xs text-[#cccccc] leading-relaxed mb-4">
                    Given an array of integers <code className="bg-[#2d2d2d] px-1 rounded text-[#d4d4d4]">nums</code> and an integer <code className="bg-[#2d2d2d] px-1 rounded text-[#d4d4d4]">target</code>, return indices of the two numbers such that they add up to <code className="bg-[#2d2d2d] px-1 rounded text-[#d4d4d4]">target</code>.
                  </p>
                  <div className="text-xs text-[#858585] mb-2">Example 1:</div>
                  <div className="bg-[#2d2d2d] p-2 rounded text-xs text-[#d4d4d4] font-mono mb-4">
                    Input: nums = [2,7,11,15], target = 9<br/>
                    Output: [0,1]
                  </div>
                </div>

                {/* Code Editor */}
                <div className="flex-1 bg-[#1e1e1e] flex flex-col">
                  {/* Tabs */}
                  <div className="flex">
                    <div className="px-4 py-2 bg-[#1e1e1e] border-t-2 border-premium-blue text-[#d4d4d4] text-xs font-mono cursor-pointer">
                      TwoSum.js
                    </div>
                  </div>
                  
                  {/* Coding Area */}
                  <div className="flex-1 p-4 font-mono text-sm relative">
                    <div className="flex">
                      {/* Line Numbers */}
                      <div className="w-8 text-[#858585] text-right pr-4 select-none flex flex-col opacity-50">
                        {[1,2,3,4,5,6,7,8,9,10,11].map(n => <span key={n}>{n}</span>)}
                      </div>
                      
                      {/* Code */}
                      <div className="flex-1 text-[#d4d4d4] whitespace-pre">
                        <span className="text-[#569cd6]">const</span> <span className="text-[#4fc1ff]">twoSum</span> = <span className="text-[#569cd6]">function</span>(nums, target) {'{\n'}
                        <span className="text-[#c586c0]">  const</span> map = <span className="text-[#569cd6]">new</span> <span className="text-[#4ec9b0]">Map</span>();{'\n'}
                        <span className="text-[#c586c0]">  for</span> (<span className="text-[#569cd6]">let</span> i = <span className="text-[#b5cea8]">0</span>; i &lt; nums.length; i++) {'{\n'}
                        <span className="text-[#c586c0]">    const</span> complement = target - nums[i];{'\n'}
                        <span className="text-[#c586c0]">    if</span> (map.has(complement)) {'{\n'}
                        <span className="text-[#c586c0]">      return</span> [map.get(complement), i];{'\n'}
                        {'    }\n'}
                        {'    map.set(nums[i], i);\n'}
                        {'  }\n'}
                        <span className="text-[#c586c0]">  return</span> [];{'\n'}
                        {'}'}
                        
                        {/* Fake Typing Cursor */}
                        {typingStep > 0 && typingStep < codeString.length && (
                          <motion.span 
                            animate={{ opacity: [1, 0, 1] }} 
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="inline-block w-2 h-4 bg-white -mb-1 ml-0.5"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Terminal / Run Button */}
                  <div className="h-12 bg-[#2d2d2d] border-t border-[#3c3c3c] flex items-center justify-between px-4">
                    <div className="flex items-center gap-2 text-xs text-[#858585]">
                      <Terminal className="w-4 h-4" /> Console
                    </div>
                    {typingStep >= 40 && (
                      <motion.button 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-3 py-1 bg-[#4CAF50] hover:bg-[#45a049] text-white text-xs font-bold rounded flex items-center gap-1 shadow-lg"
                      >
                        <Play className="w-3 h-3 fill-current" /> Run Code
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>

              {/* Success Overlay */}
              {typingStep >= 40 && (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute bottom-16 right-4 left-1/3 bg-[#1e1e1e] border border-[#4CAF50] rounded-lg p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-20"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#4CAF50] shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-[#4CAF50] mb-1">Accepted!</div>
                      <div className="text-xs text-[#cccccc]">Runtime: 64 ms (Beats 89.21%)<br/>Memory: 42.1 MB (Beats 76.54%)</div>
                    </div>
                  </div>
                </motion.div>
              )}

            </motion.div>
          </div>

          {/* Right Text */}
          <div className="flex-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 font-semibold text-sm"
            >
              <Code2 className="w-4 h-4" /> Coding Practice
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white"
            >
              Nail the technical screen.
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-600 dark:text-slate-400 max-w-xl"
            >
              Practice real questions asked by top tech companies. Our built-in code editor supports multiple languages and provides instant execution and feedback.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.3 }}
              className="space-y-4 pt-4"
            >
              {[
                "Curated question lists for FAANG interviews",
                "Built-in IDE with syntax highlighting and autocompletion",
                "AI hints and optimal solution breakdowns"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
