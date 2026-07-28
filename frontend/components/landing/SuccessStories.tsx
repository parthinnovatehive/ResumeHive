"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

interface CounterProps {
  from: number;
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

function AnimatedCounter({ from, to, duration = 2, suffix = "", prefix = "" }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (inView) {
      let startTimestamp: number | null = null;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
        
        // Easing out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(easeProgress * (to - from) + from));
        
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [inView, from, to, duration]);

  return (
    <span ref={ref} className="font-bold tabular-nums">
      {prefix}{count}{suffix}
    </span>
  );
}

const METRICS = [
  { label: "Resume Score", from: 45, to: 98, suffix: "%", delay: 0 },
  { label: "Interview Calls", from: 0, to: 12, suffix: "x", prefix: "+", delay: 0.1 },
  { label: "Profile Views", from: 10, to: 350, suffix: "%", prefix: "+", delay: 0.2 },
  { label: "Job Offers", from: 0, to: 4, suffix: "", delay: 0.3 }
];

export function SuccessStories() {
  return (
    <section className="py-32 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                Real results.<br/>
                <span className="text-gradient">Fast acceleration.</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                Our AI doesn't just format text. It understands what recruiters and ATS algorithms are looking for, dramatically increasing your chances of getting hired.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {METRICS.map((metric, idx) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: metric.delay, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-premium-blue/0 to-premium-blue/0 group-hover:from-premium-blue/5 group-hover:to-premium-purple/5 transition-colors duration-500" />
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 relative z-10">
                  {metric.label}
                </h3>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="text-2xl font-medium text-slate-400 dark:text-slate-500 line-through decoration-slate-300 dark:decoration-slate-600 decoration-2">
                    {metric.prefix}{metric.from}{metric.suffix}
                  </div>
                  <ArrowRight className="w-5 h-5 text-premium-blue" />
                  <div className="text-4xl font-extrabold text-slate-900 dark:text-white bg-clip-text">
                    <AnimatedCounter 
                      from={metric.from} 
                      to={metric.to} 
                      prefix={metric.prefix}
                      suffix={metric.suffix} 
                      duration={2.5} 
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
