"use client";

import { motion, useInView, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";

function Counter({ from, to, duration, suffix = "" }: { from: number, to: number, duration: number, suffix?: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const node = nodeRef.current;
    if (node && isInView) {
      const controls = animate(from, to, {
        duration,
        ease: "easeOut",
        onUpdate(value) {
          node.textContent = Math.floor(value).toLocaleString() + suffix;
        }
      });
      return () => controls.stop();
    }
  }, [from, to, duration, isInView, suffix]);

  return <span ref={nodeRef}>{from}{suffix}</span>;
}

export function Statistics() {
  const stats = [
    { label: "Resumes Created", value: 1250000, suffix: "+", color: "text-premium-blue" },
    { label: "ATS Success Rate", value: 98, suffix: "%", color: "text-premium-emerald" },
    { label: "Job Applications", value: 500000, suffix: "+", color: "text-premium-purple" },
    { label: "Interview Success", value: 95, suffix: "%", color: "text-premium-amber" },
  ];

  return (
    <section className="py-24 relative z-10 border-y border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center space-y-2"
            >
              <div className={`text-4xl md:text-5xl font-extrabold tracking-tight ${stat.color}`}>
                <Counter from={0} to={stat.value} duration={2 + idx * 0.2} suffix={stat.suffix} />
              </div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
