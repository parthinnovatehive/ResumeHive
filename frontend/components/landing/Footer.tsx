import Link from "next/link";
import { Globe, Share2, Mail, MessageSquare } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-white dark:bg-[#0A0A0B] border-t border-slate-200/50 dark:border-white/10 z-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 lg:gap-8">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Resume</span>
              <span className="text-2xl font-extrabold tracking-tight text-premium-blue">Hive</span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mb-8 leading-relaxed">
              The premium AI platform for ambitious professionals. Build resumes, optimize profiles, and land your dream job.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <MessageSquare className="w-4 h-4 fill-current" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Share2 className="w-4 h-4 fill-current" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Globe className="w-4 h-4 fill-current" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-6 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="#resume-builder" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Resume Builder</Link></li>
              <li><Link href="#ats-analyzer" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">ATS Analyzer</Link></li>
              <li><Link href="#linkedin" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">LinkedIn Opt</Link></li>
              <li><Link href="#interview" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Mock Interviews</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-6 uppercase tracking-wider">Company</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-6 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-200/50 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} ResumeHive. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-slate-500 dark:text-slate-400">
            <div>
              Developed by <span className="font-semibold text-slate-700 dark:text-slate-300 hover:text-premium-blue dark:hover:text-premium-blue transition-colors cursor-default">InnovateHive</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
