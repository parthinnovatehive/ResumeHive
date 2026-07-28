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
    <section id="faq" className="py-32 relative bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm mb-6"
          >
            <MessageCircleQuestion className="w-4 h-4" /> Frequently Asked Questions
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
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${isOpen ? 'border-premium-blue/30 bg-premium-blue/5 dark:bg-premium-blue/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-left px-6 py-6 flex items-center justify-between gap-4 focus:outline-none"
                >
                  <h3 className={`text-lg font-semibold transition-colors duration-300 ${isOpen ? 'text-premium-blue' : 'text-slate-900 dark:text-white'}`}>
                    {faq.question}
                  </h3>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${isOpen ? 'bg-premium-blue text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
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
