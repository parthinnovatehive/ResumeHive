"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { Star, MessageSquareQuote } from "lucide-react";

const TESTIMONIALS = [
  { name: "Sarah Chen", role: "Frontend Engineer at Vercel", text: "ResumeHive got me 3x more interviews in a week. The AI perfectly highlighted my impact metrics.", avatar: "bg-purple-500" },
  { name: "Michael Rodriguez", role: "Product Manager at Linear", text: "The LinkedIn optimizer is magic. Recruiters started reaching out to me instead of the other way around.", avatar: "bg-blue-500" },
  { name: "Emily Watson", role: "Data Scientist at OpenAI", text: "Practicing the mock interviews gave me the exact confidence I needed. The AI's feedback was spot on.", avatar: "bg-emerald-500" },
  { name: "David Kim", role: "Full Stack Dev at Stripe", text: "I've tried every resume builder out there. ResumeHive is the only one that actually understands tech resumes.", avatar: "bg-amber-500" },
  { name: "Lisa Patel", role: "UX Designer at Apple", text: "The templates are gorgeous and the ATS keyword matcher saved me hours of manual tweaking.", avatar: "bg-rose-500" },
];

export function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Duplicate for infinite scrolling
  const scrollItems = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section id="testimonials" className="py-32 relative overflow-hidden bg-slate-900" ref={containerRef}>
      
      {/* Background Decorators */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-premium-blue/10 via-slate-900 to-slate-900" />
      </div>

      <div className="max-w-7xl mx-auto px-6 mb-16 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white font-semibold text-sm mb-6"
        >
          <MessageSquareQuote className="w-4 h-4" /> Success Stories
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight text-white"
        >
          Don't just take our word for it.
        </motion.h2>
      </div>

      <div className="relative z-10 flex group overflow-hidden w-full max-w-[100vw] py-10 cursor-grab active:cursor-grabbing">
        <div className="flex animate-marquee group-hover:[animation-play-state:paused] gap-6 px-3">
          {scrollItems.map((testimonial, idx) => (
            <div 
              key={idx} 
              className="w-[350px] md:w-[450px] shrink-0 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors shadow-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              <div className="flex items-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-premium-amber text-premium-amber" />
                ))}
              </div>
              <p className="text-slate-300 text-lg font-medium leading-relaxed mb-8">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${testimonial.avatar} flex items-center justify-center text-white font-bold text-lg shadow-inner`}>
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Fade Masks */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-900 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-900 to-transparent z-20 pointer-events-none" />
    </section>
  );
}
