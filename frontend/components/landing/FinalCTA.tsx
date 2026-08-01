"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MagneticWrapper } from "../ui/MagneticWrapper";

export function FinalCTA() {
  return (
    <section className="relative pt-8 pb-32 overflow-hidden z-20">
      <div className="absolute inset-0 bg-slate-900 dark:bg-black">
        {/* Animated Mesh Background for CTA */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 dark:opacity-40"
               style={{ background: "radial-gradient(ellipse at center, rgba(15, 82, 186, 0.4) 0%, rgba(0, 0, 0, 0) 70%)" }} />
          <motion.div 
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-premium-purple/20 to-premium-blue/20 blur-[120px] rounded-full mix-blend-screen"
          />
        </div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
          className="flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-premium-emerald animate-pulse" />
            <span className="text-sm font-medium text-white">Join 1,000,000+ professionals</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
            Ready to get hired?
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto font-medium">
            Build your resume, optimize your LinkedIn, and land your dream job with the ultimate AI career platform.
          </p>

          <MagneticWrapper strength={30}>
            <Link
              href="/signup"
              className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-full font-bold text-lg overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_80px_rgba(255,255,255,0.5)] transition-all duration-500 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-premium-blue/10 to-premium-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10">Start Building for Free</span>
              <ArrowRight className="relative z-10 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </MagneticWrapper>
          
          <p className="mt-6 text-sm text-slate-400 font-medium">No credit card required. Free forever plan available.</p>
        </motion.div>
      </div>
    </section>
  );
}
