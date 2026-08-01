"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus, Minus, MessageCircleQuestion } from "lucide-react";

const FAQS = [
  {
    question: "How does the ATS Analyzer actually work?",
    answer: "Our ATS Analyzer uses the same parsing technology (Apache Tika and custom NLP models) that enterprise ATS systems like Workday, Greenhouse, and Lever use. It scores your resume based on keyword density, section headers, and formatting to ensure it passes automated screens."
  },
  {
    question: "Do I need to pay to use ResumeHive?",
    answer: "No. ResumeHive offers a generous Free Forever tier that includes the basic resume builder, 1 ATS scan per month, and 5 job matches. Our Premium tier unlocks unlimited scans, the AI rewrite engine, Mock Interviews, and LinkedIn optimization."
  },
  {
    question: "Can I import my existing resume or LinkedIn profile?",
    answer: "Yes! You can upload an existing PDF/DOCX or connect your LinkedIn account. Our AI will automatically extract, structure, and optimize your experience into our system in seconds."
  },
  {
    question: "How accurate is the Mock Interview AI?",
    answer: "Extremely accurate. The Mock Interview AI is powered by fine-tuned GPT-4o models instructed by real technical recruiters. It analyzes not just what you say, but how you say it—giving you a breakdown of clarity, confidence, and filler word usage."
  },
  {
    question: "Will my data be sold to third parties or recruiters?",
    answer: "Absolutely not. Your career data is 100% yours. We never sell your personal information, resumes, or contact details to third parties, data brokers, or recruiting agencies without your explicit consent."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="pt-8 pb-16 relative overflow-hidden bg-white dark:bg-[#0a0a0a]">
      
      {/* Premium Animated Background Theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-gradient-to-tr from-premium-blue/10 via-premium-purple/10 to-transparent rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen" 
        />
        <motion.div 
          animate={{ rotate: [360, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 -right-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-pink-500/10 to-premium-blue/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-700 dark:text-white font-semibold text-sm mb-6 shadow-sm"
          >
            <MessageCircleQuestion className="w-4 h-4 text-premium-blue" /> Frequently Asked Questions
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Got questions? We've got answers.
          </motion.h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.5, type: "spring", bounce: 0.3 }}
                whileHover={!isOpen ? { scale: 1.01, transition: { duration: 0.2 } } : {}}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-500 border backdrop-blur-sm ${
                  isOpen 
                    ? 'border-premium-blue/40 bg-white dark:bg-slate-900/80 shadow-[0_10px_40px_rgba(15,82,186,0.1)]' 
                    : 'border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 hover:border-premium-purple/40 hover:shadow-lg'
                }`}
              >
                
                {/* Hover Glow Effect */}
                {!isOpen && (
                  <div className="absolute inset-0 bg-gradient-to-r from-premium-blue/0 via-premium-purple/0 to-pink-500/0 group-hover:from-premium-blue/5 group-hover:via-premium-purple/5 group-hover:to-pink-500/5 transition-all duration-500" />
                )}

                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-left px-6 py-6 flex items-center justify-between gap-4 focus:outline-none relative z-10"
                >
                  <h3 className={`text-lg font-semibold transition-colors duration-300 ${isOpen ? 'text-premium-blue dark:text-premium-blue' : 'text-slate-900 dark:text-slate-200 group-hover:text-premium-purple'}`}>
                    {faq.question}
                  </h3>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 shadow-sm ${
                    isOpen 
                      ? 'bg-premium-blue text-white rotate-180 scale-110' 
                      : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 group-hover:bg-premium-purple group-hover:text-white'
                  }`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-6 pb-6 pt-2 text-slate-600 dark:text-slate-400 leading-relaxed font-medium relative z-10 border-t border-slate-100 dark:border-white/5 mt-2">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
