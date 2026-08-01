import Link from "next/link";
import { Globe, Share2, Mail, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="relative border-t border-slate-200/10 dark:border-white/10 z-20 overflow-hidden bg-black text-white">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-40 mix-blend-screen"
        >
          <source src="/videos/hero_background.mp4" type="video/mp4" />
        </video>
        {/* Gradient Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 lg:gap-8">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-block mb-6 group">
              <span className="text-3xl font-extrabold tracking-tight text-white group-hover:text-slate-200 transition-colors">Resume</span>
              <span className="text-3xl font-extrabold tracking-tight text-premium-blue group-hover:text-premium-purple transition-colors">Hive</span>
            </Link>
            <p className="text-slate-300/90 text-[15px] max-w-xs mb-8 leading-relaxed font-medium tracking-wide">
              The premium AI platform for ambitious professionals. Build resumes, optimize profiles, and land your dream job with unparalleled precision.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:bg-premium-blue hover:scale-110 transition-all duration-300 shadow-lg border border-white/10">
                <MessageSquare className="w-5 h-5 fill-current" />
              </Link>
              <Link href="#" className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:bg-premium-purple hover:scale-110 transition-all duration-300 shadow-lg border border-white/10">
                <Share2 className="w-5 h-5 fill-current" />
              </Link>
              <Link href="#" className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:bg-pink-500 hover:scale-110 transition-all duration-300 shadow-lg border border-white/10">
                <Globe className="w-5 h-5 fill-current" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-widest opacity-80">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="#resume-builder" className="text-[15px] tracking-wide text-slate-300 hover:text-white hover:translate-x-1 inline-block transition-transform duration-300">Resume Builder</Link></li>
              <li><Link href="#ats-analyzer" className="text-[15px] tracking-wide text-slate-300 hover:text-white hover:translate-x-1 inline-block transition-transform duration-300">ATS Analyzer</Link></li>
              <li><Link href="#linkedin" className="text-[15px] tracking-wide text-slate-300 hover:text-white hover:translate-x-1 inline-block transition-transform duration-300">LinkedIn Opt</Link></li>
              <li><Link href="#interview" className="text-[15px] tracking-wide text-slate-300 hover:text-white hover:translate-x-1 inline-block transition-transform duration-300">Mock Interviews</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-widest opacity-80">Company</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-[15px] tracking-wide text-slate-300 hover:text-white hover:translate-x-1 inline-block transition-transform duration-300">About Us</Link></li>
              <li><Link href="#" className="text-[15px] tracking-wide text-slate-300 hover:text-white hover:translate-x-1 inline-block transition-transform duration-300">Careers</Link></li>
              <li><Link href="#" className="text-[15px] tracking-wide text-slate-300 hover:text-white hover:translate-x-1 inline-block transition-transform duration-300">Blog</Link></li>
              <li><Link href="#" className="text-[15px] tracking-wide text-slate-300 hover:text-white hover:translate-x-1 inline-block transition-transform duration-300">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-widest opacity-80">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-[15px] tracking-wide text-slate-300 hover:text-white hover:translate-x-1 inline-block transition-transform duration-300">Privacy Policy</Link></li>
              <li><Link href="#" className="text-[15px] tracking-wide text-slate-300 hover:text-white hover:translate-x-1 inline-block transition-transform duration-300">Terms of Service</Link></li>
              <li><Link href="#" className="text-[15px] tracking-wide text-slate-300 hover:text-white hover:translate-x-1 inline-block transition-transform duration-300">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 relative">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-premium-emerald animate-pulse"></div>
            <p className="text-[15px] text-slate-300 font-medium tracking-wide">
              © {new Date().getFullYear()} ResumeHive. All rights reserved.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-[15px] text-slate-300">
            <div className="group bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 hover:border-premium-blue/50 hover:shadow-[0_0_30px_rgba(15,82,186,0.2)] transition-all duration-500 cursor-default flex items-center gap-2">
              <span className="opacity-80">Developed by</span>
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-premium-blue via-premium-purple to-pink-500 group-hover:opacity-80 transition-opacity">
                InnovateHive
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
