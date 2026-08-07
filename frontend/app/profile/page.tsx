"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, GraduationCap, Calendar, Briefcase, Wrench, Award, ExternalLink,
  Loader2, AlertCircle, FileText, ChevronDown, Pencil, Save, X,
  ShieldCheck, Activity, Target, Download, LayoutTemplate, 
  GitBranch, Globe, Plus, Trash2, Camera, CreditCard, Sparkles
} from "lucide-react";
import { authApi, type ProfileUpdatePayload, type UserProfile } from "@/lib/api/auth";

type ExperienceForm = {
  title: string;
  company: string;
  date_range: string;
  description: string;
};

type EducationForm = {
  info: string;
  date_range: string;
};

type ProfileForm = {
  college_name: string;
  linkedin_url: string;
  linkedin_id: string;
  headline: string;
  about: string;
  top_skills: string[];
  certifications: string;
  experience: ExperienceForm[];
  education: EducationForm[];
};

const textValue = (value: unknown) => (value === null || value === undefined ? "" : String(value));

const profileToForm = (profile: UserProfile): ProfileForm => ({
  college_name: profile.college_name ?? "",
  linkedin_url: profile.linkedin_url ?? "",
  linkedin_id: profile.linkedin_id ?? "",
  headline: profile.headline ?? "",
  about: profile.about ?? "",
  top_skills: profile.top_skills || [],
  certifications: profile.certifications ? profile.certifications.join(", ") : "",
  experience: (profile.experience || []).map((entry) => ({
    title: textValue(entry.title),
    company: textValue(entry.company),
    date_range: textValue(entry.date_range),
    description: textValue(entry.description),
  })),
  education: (profile.education || []).map((entry) => ({
    info: textValue(entry.info),
    date_range: textValue(entry.date_range),
  })),
});

export default function ProfileDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [savingCard, setSavingCard] = useState<string | null>(null);
  
  // Card Editing State - only one can edit at a time
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  
  // Carousel State
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  
  // Avatar Modal State
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Subscription Plan State
  const [subData, setSubData] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    loadProfile();
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const res = await authApi().getSubscriptionPlan();
      setSubData(res);
    } catch {
      // Fallback
    }
  };

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi().getProfile();
      setProfile(data);
      setForm(profileToForm(data));
    } catch {
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCard = async (cardId: string) => {
    if (!form) return;
    setSavingCard(cardId);
    try {
      const splitItems = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
      const payload: ProfileUpdatePayload = {
        college_name: form.college_name.trim(),
        linkedin_url: form.linkedin_url.trim(),
        linkedin_id: form.linkedin_id.trim(),
        headline: form.headline.trim(),
        about: form.about.trim(),
        top_skills: form.top_skills,
        certifications: splitItems(form.certifications),
        experience: form.experience,
        education: form.education,
      };
      
      const updated = await authApi().updateProfile(payload);
      setProfile(updated);
      setForm(profileToForm(updated));
      setEditingCardId(null);
    } catch (err) {
      alert("Failed to save changes.");
    } finally {
      setSavingCard(null);
    }
  };

  const handleCancelEdit = () => {
    if (profile) setForm(profileToForm(profile));
    setEditingCardId(null);
  };

  // ── AUTO SLIDING LOGIC ──────────────────────────────────────────
  
  // Listen to scroll to update progress and active card
  const handleScroll = useCallback(() => {
    setIsInteracting(true);
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const progress = scrollLeft / (scrollWidth - clientWidth);
      setScrollProgress(progress || 0);
      
      // Determine active card by scroll position
      const cardElements = Array.from(scrollContainerRef.current.children) as HTMLElement[];
      let closestIdx = 0;
      let minDiff = Infinity;
      const containerCenter = scrollLeft + clientWidth / 2;
      
      cardElements.forEach((child, idx) => {
        if (!child.classList.contains("snap-center")) return;
        const childCenter = child.offsetLeft + child.offsetWidth / 2;
        const diff = Math.abs(containerCenter - childCenter);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      setActiveCardIndex(closestIdx);
    }
    
    // Clear interaction after a bit
    const timeout = setTimeout(() => setIsInteracting(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (editingCardId || isHovering || isInteracting || !scrollContainerRef.current) return;
    
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const cardElements = Array.from(scrollContainerRef.current.children) as HTMLElement[];
        const snapCards = cardElements.filter(c => c.classList.contains("snap-center"));
        
        let nextIdx = (activeCardIndex + 1) % snapCards.length;
        // Scroll to next card smoothly
        const nextCard = snapCards[nextIdx];
        if (nextCard) {
          scrollContainerRef.current.scrollTo({
            left: nextCard.offsetLeft - (clientWidth / 2) + (nextCard.offsetWidth / 2),
            behavior: "smooth"
          });
        }
      }
    }, 3500); // 3.5 seconds idle
    
    return () => clearInterval(interval);
  }, [editingCardId, isHovering, isInteracting, activeCardIndex]);

  
  const calculateCompletion = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.headline) score += 15;
    if (profile.about) score += 15;
    if (profile.college_name) score += 10;
    if (profile.experience?.length) score += 30;
    if (profile.education?.length) score += 20;
    if (profile.top_skills?.length) score += 10;
    return score;
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !profile || !form) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 flex-col gap-4">
        <AlertCircle className="w-10 h-10 text-red-500"/>
        <p className="text-slate-600">{error || "Failed to load."}</p>
        <button onClick={loadProfile} className="px-6 py-2 bg-indigo-600 text-white rounded-full font-bold">Retry</button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden font-sans selection:bg-indigo-500/30 flex flex-col pt-16">
      
      {/* Premium Animated Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#fafafa]">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-[120px] mix-blend-multiply animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-r from-sky-400/10 to-blue-500/10 blur-[120px] mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-r from-pink-500/10 to-rose-400/10 blur-[120px] mix-blend-multiply animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 flex flex-col flex-1 h-full">
        
        {/* ── FLAGSHIP HERO SECTION ───────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="shrink-0 px-8 py-8 md:px-16 md:py-12 flex flex-col md:flex-row items-center gap-8 md:gap-12 w-full max-w-[1800px] mx-auto">
          
          {/* Avatar & Ring */}
          <div className="relative group shrink-0">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-70 blur-md group-hover:opacity-100 transition-opacity duration-500 animate-spin-slow"></div>
            <div onClick={() => setShowAvatarModal(true)} className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-white border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center cursor-pointer group-hover:scale-[1.02] transition-transform duration-300">
               <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600">
                 {profile.email.charAt(0).toUpperCase()}
               </span>
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                 <Camera className="w-8 h-8 text-white"/>
               </div>
            </div>
            {/* Online Indicator */}
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full shadow-lg"></div>
          </div>

          {/* Hero Content */}
          <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start">
             <div className="flex items-center gap-3 mb-2">
               <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                 Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{profile.email.split('@')[0]}</span>
               </h1>
               <div className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md flex items-center gap-1 shadow-sm text-xs font-bold uppercase tracking-wider">
                 <ShieldCheck className="w-3.5 h-3.5"/> Verified
               </div>
             </div>
             
             <p className="text-lg md:text-xl font-medium text-slate-500 mb-6 max-w-2xl leading-relaxed">
               {profile.headline || "Add a professional headline to stand out to recruiters."}
             </p>
             
             {/* Dynamic Stats Row */}
             <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8">
               <StatBadge icon={<Target/>} label="Completion" value={`${calculateCompletion()}%`} color="emerald" />
               <StatBadge icon={<FileText/>} label="Resumes" value="4" color="blue" />
               <StatBadge icon={<Activity/>} label="Avg ATS Score" value="94" color="indigo" />
               <StatBadge icon={<Calendar/>} label="Joined" value={new Date(profile.created_at).getFullYear().toString()} color="slate" />
             </div>
          </div>
        </motion.div>

        {/* ── HORIZONTAL CAROUSEL WORKSPACE ───────────────────── */}
        <div 
          className="flex-1 relative w-full mb-32 group/carousel"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onTouchStart={() => setIsInteracting(true)}
          onKeyDown={() => setIsInteracting(true)}
        >
          {/* Fading Edges */}
          <div className="absolute top-0 bottom-0 left-0 w-8 md:w-32 bg-gradient-to-r from-[#fafafa] to-transparent z-20 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-8 md:w-32 bg-gradient-to-l from-[#fafafa] to-transparent z-20 pointer-events-none" />
          
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="w-full h-full overflow-x-auto overflow-y-hidden flex items-start gap-6 px-8 md:px-32 pb-16 pt-8 hide-scrollbar snap-x snap-mandatory"
            style={{ scrollBehavior: 'smooth' }}
          >
             
             {/* 1. Identity & Contact */}
             <CarouselCard 
                id="identity"
                title="Identity & Profile" 
                icon={<User/>} 
                isActive={activeCardIndex === 0}
                isEditing={editingCardId === "identity"}
                onEdit={() => setEditingCardId("identity")}
                onSave={() => handleSaveCard("identity")}
                onCancel={handleCancelEdit}
                saving={savingCard === "identity"}
             >
                <InputField label="Headline" value={form.headline} onChange={(v: string) => setForm({...form, headline: v})} editing={editingCardId === "identity"} placeholder="e.g. Senior Software Engineer" />
                <InputField label="Email Address" value={profile.email} onChange={() => {}} editing={false} placeholder="Email" locked />
                <div className="h-px bg-slate-100 my-4" />
                <TextAreaField label="About Me" value={form.about} onChange={(v: string) => setForm({...form, about: v})} editing={editingCardId === "identity"} placeholder="Write a short bio..." />
             </CarouselCard>

             {/* 2. Professional Experience */}
             <CarouselCard 
                id="experience"
                title="Experience" 
                icon={<Briefcase/>} 
                isActive={activeCardIndex === 1}
                isEditing={editingCardId === "experience"}
                onEdit={() => setEditingCardId("experience")}
                onSave={() => handleSaveCard("experience")}
                onCancel={handleCancelEdit}
                saving={savingCard === "experience"}
                wide
             >
               {form.experience.length === 0 && editingCardId !== "experience" ? (
                 <EmptyState message="No experience added yet." />
               ) : (
                 <div className="space-y-6">
                   {form.experience.map((exp, i) => (
                     <div key={i} className="relative group/exp rounded-2xl bg-slate-50/50 p-5 border border-slate-100 hover:bg-slate-50 hover:shadow-sm transition-all">
                       {editingCardId === "experience" && (
                         <button onClick={() => {
                           const newExp = [...form.experience];
                           newExp.splice(i, 1);
                           setForm({...form, experience: newExp});
                         }} className="absolute -top-3 -right-3 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover/exp:opacity-100 transition-opacity shadow-sm hover:scale-110 z-10">
                           <Trash2 className="w-4 h-4"/>
                         </button>
                       )}
                       <div className="grid grid-cols-2 gap-4 mb-4">
                         <InputField label="Job Title" value={exp.title} onChange={(v: string) => {
                           const newExp = [...form.experience]; newExp[i].title = v; setForm({...form, experience: newExp});
                         }} editing={editingCardId === "experience"} placeholder="Software Engineer" />
                         <InputField label="Company" value={exp.company} onChange={(v: string) => {
                           const newExp = [...form.experience]; newExp[i].company = v; setForm({...form, experience: newExp});
                         }} editing={editingCardId === "experience"} placeholder="Google" />
                       </div>
                       <InputField label="Date Range" value={exp.date_range} onChange={(v: string) => {
                         const newExp = [...form.experience]; newExp[i].date_range = v; setForm({...form, experience: newExp});
                       }} editing={editingCardId === "experience"} placeholder="Jan 2020 - Present" />
                       <div className="mt-4">
                         <TextAreaField label="Description" value={exp.description} onChange={(v: string) => {
                           const newExp = [...form.experience]; newExp[i].description = v; setForm({...form, experience: newExp});
                         }} editing={editingCardId === "experience"} placeholder="Led a team of 5 engineers..." />
                       </div>
                     </div>
                   ))}
                   {editingCardId === "experience" && (
                     <button onClick={() => setForm({...form, experience: [...form.experience, { title: "", company: "", date_range: "", description: "" }]})} className="w-full py-4 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 font-bold hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                       <Plus className="w-5 h-5"/> Add Experience
                     </button>
                   )}
                 </div>
               )}
             </CarouselCard>

             {/* 3. Education & Certifications */}
             <CarouselCard 
                id="education"
                title="Education & Certifications" 
                icon={<GraduationCap/>} 
                isActive={activeCardIndex === 2}
                isEditing={editingCardId === "education"}
                onEdit={() => setEditingCardId("education")}
                onSave={() => handleSaveCard("education")}
                onCancel={handleCancelEdit}
                saving={savingCard === "education"}
             >
               <InputField label="Primary College / University" value={form.college_name} onChange={(v: string) => setForm({...form, college_name: v})} editing={editingCardId === "education"} placeholder="Stanford University" />
               <div className="h-px bg-slate-100 my-6" />
               <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2"><Award className="w-4 h-4"/> Certifications</h4>
               <TextAreaField label="Certifications (comma separated)" value={form.certifications} onChange={(v: string) => setForm({...form, certifications: v})} editing={editingCardId === "education"} placeholder="AWS Certified Architect, React Native Specialist" />
               
               {editingCardId === "education" && (
                 <div className="mt-6 pt-6 border-t border-slate-100">
                    <button onClick={() => setForm({...form, education: [...form.education, { info: "", date_range: "" }]})} className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 font-bold hover:bg-slate-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-2">
                       <Plus className="w-4 h-4"/> Add Custom Education Entry
                    </button>
                 </div>
               )}
             </CarouselCard>

             {/* 4. Skills Matrix */}
             <CarouselCard 
                id="skills"
                title="Skills Matrix" 
                icon={<Wrench/>} 
                isActive={activeCardIndex === 3}
                isEditing={editingCardId === "skills"}
                onEdit={() => setEditingCardId("skills")}
                onSave={() => handleSaveCard("skills")}
                onCancel={handleCancelEdit}
                saving={savingCard === "skills"}
             >
               {editingCardId !== "skills" ? (
                 <div className="flex flex-wrap gap-2">
                   {form.top_skills.length > 0 ? form.top_skills.map((skill, i) => (
                     <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100 shadow-sm">{skill}</span>
                   )) : <EmptyState message="No skills added." />}
                 </div>
               ) : (
                 <div className="space-y-4">
                   <p className="text-sm font-medium text-slate-500">Edit your top skills as a comma-separated list.</p>
                   <textarea 
                     value={form.top_skills.join(", ")}
                     onChange={(e) => setForm({...form, top_skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})}
                     className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium shadow-inner"
                     rows={4}
                     placeholder="Python, React, System Design"
                   />
                 </div>
               )}
             </CarouselCard>

             {/* 5. Social Presence */}
             <CarouselCard 
                id="socials"
                title="Social Links" 
                icon={<Globe/>} 
                isActive={activeCardIndex === 4}
                isEditing={editingCardId === "socials"}
                onEdit={() => setEditingCardId("socials")}
                onSave={() => handleSaveCard("socials")}
                onCancel={handleCancelEdit}
                saving={savingCard === "socials"}
             >
               <div className="space-y-6">
                 <div>
                   <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                     <div className="p-1.5 bg-[#0A66C2]/10 text-[#0A66C2] rounded-md"><ExternalLink className="w-4 h-4"/></div> LinkedIn URL
                   </label>
                   {editingCardId === "socials" ? (
                     <input type="text" value={form.linkedin_url} onChange={(e) => setForm({...form, linkedin_url: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium shadow-inner" placeholder="https://linkedin.com/in/username" />
                   ) : (
                     form.linkedin_url ? <a href={form.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-600 hover:underline break-all">{form.linkedin_url}</a> : <span className="text-sm text-slate-400">Not provided</span>
                   )}
                 </div>
                 
                 <div>
                   <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                     <div className="p-1.5 bg-slate-100 text-slate-700 rounded-md"><GitBranch className="w-4 h-4"/></div> GitHub URL
                   </label>
                   <input type="text" disabled className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-400 cursor-not-allowed" placeholder="Coming soon..." />
                 </div>
               </div>
             </CarouselCard>

              {/* 6. Subscription & License */}
              <CarouselCard 
                 id="subscription"
                 title="Subscription & Plan" 
                 icon={<CreditCard/>} 
                 isActive={activeCardIndex === 5}
                 isEditing={false}
              >
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider block">Active Plan</span>
                      <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                        {subData?.plan?.name || "Free Basic Plan"}
                      </h3>
                      {subData?.college_name && (
                        <span className="text-xs text-teal-600 font-bold block mt-0.5">
                          🏛️ Licensed by {subData.college_name}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="px-3.5 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-indigo-700 transition-all flex items-center gap-1"
                    >
                      <Sparkles size={14} /> Upgrade
                    </button>
                  </div>

                  <div className="space-y-3 pt-2 text-xs">
                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span className="text-slate-600">Resumes Created</span>
                        <span className="text-slate-900">{subData?.usage?.resumes_used || 0} / {subData?.plan?.max_resumes === -1 ? "Unlimited" : (subData?.plan?.max_resumes || 1)}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${Math.min(100, ((subData?.usage?.resumes_used || 0) / (subData?.plan?.max_resumes || 1)) * 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span className="text-slate-600">Monthly AI Mock Interviews</span>
                        <span className="text-purple-600">{subData?.usage?.interviews_used || 0} / {subData?.plan?.max_mock_interviews_per_month === -1 ? "Unlimited" : (subData?.plan?.max_mock_interviews_per_month || 2)}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full" style={{ width: `${Math.min(100, ((subData?.usage?.interviews_used || 0) / (subData?.plan?.max_mock_interviews_per_month || 2)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselCard>

             {/* 7. Settings & Security */}
             <CarouselCard 
                id="security"
                title="Security & Status" 
                icon={<ShieldCheck/>} 
                isActive={activeCardIndex === 6}
                isEditing={false}
             >
               <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-sm transition-all">
                   <div>
                     <p className="text-sm font-bold text-slate-900">Account Status</p>
                     <p className="text-xs text-slate-500 mt-0.5">Your account is fully verified.</p>
                   </div>
                   <div className="w-10 h-6 bg-emerald-500 rounded-full relative shadow-inner"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                 </div>
                 
                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-sm transition-all">
                   <div>
                     <p className="text-sm font-bold text-slate-900">Two-Factor Auth</p>
                     <p className="text-xs text-slate-500 mt-0.5">Not enabled</p>
                   </div>
                   <div className="w-10 h-6 bg-slate-200 rounded-full relative shadow-inner"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                 </div>
               </div>
             </CarouselCard>

             {/* Spacer for ending */}
             <div className="shrink-0 w-8 md:w-32 h-full snap-start" />
          </div>
          
          {/* Scroll Progress Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-64 h-1.5 bg-slate-200 rounded-full overflow-hidden z-30 transition-opacity duration-300 opacity-50 group-hover/carousel:opacity-100">
            <motion.div className="h-full bg-indigo-500 rounded-full" style={{ width: `${scrollProgress * 100}%` }} />
          </div>
        </div>

        {/* ── FLOATING ACTION DOCK (macOS Style) ─────────────── */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 p-2 bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-3xl">
             <DockButton icon={<LayoutTemplate className="w-5 h-5"/>} label="Templates" onClick={() => window.location.href='/resume-builder'} color="indigo" />
             <DockButton icon={<Download className="w-5 h-5"/>} label="Export" onClick={() => window.location.href='/resume-builder'} color="slate" />
          </div>
        </div>

      </div>
      
      {/* ── AVATAR MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {showAvatarModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center">
               <h2 className="text-xl font-bold text-slate-900 mb-6">Profile Photo</h2>
               <div className="w-48 h-48 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-7xl font-extrabold text-white shadow-inner mb-8">
                 {profile.email.charAt(0).toUpperCase()}
               </div>
               <div className="w-full space-y-3">
                 <button className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all flex items-center justify-center gap-2">
                   <Camera className="w-5 h-5"/> Update Photo
                 </button>
                 <button onClick={() => setShowAvatarModal(false)} className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl shadow-sm hover:bg-slate-200 transition-all">
                   Cancel
                 </button>
               </div>
               <p className="text-xs text-slate-400 mt-6 text-center">Images are automatically cropped to 1:1 ratio. Max size 2MB.</p>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── UPGRADE PLAN MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-[32px] p-8 max-w-xl w-full shadow-2xl flex flex-col">
               <div className="flex justify-between items-center mb-6">
                 <div>
                   <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                     <Sparkles className="text-indigo-600" size={24} /> Upgrade Subscription Tier
                   </h2>
                   <p className="text-xs text-slate-500">Unlock unlimited ATS resumes, AI mock interviews, and advanced campus analytics.</p>
                 </div>
                 <button onClick={() => setShowUpgradeModal(false)} className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-900">
                   <X size={18} />
                 </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                 <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
                   <div>
                     <span className="text-[10px] font-extrabold text-indigo-600 uppercase">Individual Pro</span>
                     <h3 className="text-lg font-black text-slate-900">Pro Student</h3>
                     <p className="text-2xl font-black text-slate-900 my-2">₹499 <span className="text-xs font-normal text-slate-500">/ mo</span></p>
                     <ul className="space-y-1.5 text-slate-600 font-medium">
                       <li>✓ Up to 5 Tailored ATS Resumes</li>
                       <li>✓ 15 AI Mock Interviews / mo</li>
                       <li>✓ 20 Deep ATS Score Audits</li>
                       <li>✓ Full Question Bank Access</li>
                     </ul>
                   </div>
                   <button onClick={() => alert("Redirecting to Razorpay Payment Gateway...")} className="mt-4 w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md">
                     Upgrade to Pro
                   </button>
                 </div>

                 <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-5 rounded-2xl text-white flex flex-col justify-between">
                   <div>
                     <span className="text-[10px] font-extrabold text-teal-400 uppercase">B2B Campus Tier</span>
                     <h3 className="text-lg font-black text-white">College Enterprise</h3>
                     <p className="text-2xl font-black text-white my-2">Custom <span className="text-xs font-normal text-slate-400">/ Campus</span></p>
                     <ul className="space-y-1.5 text-slate-300 font-medium">
                       <li>✓ Unlimited Campus Students</li>
                       <li>✓ Unlimited AI Mock Interviews</li>
                       <li>✓ HOD &amp; Teacher Analytics Portal</li>
                       <li>✓ Domain Auto-Verification</li>
                     </ul>
                   </div>
                   <button onClick={() => alert("Contacting Enterprise Sales & HOD Licensing...")} className="mt-4 w-full py-2.5 bg-teal-500 text-slate-950 font-bold rounded-xl hover:bg-teal-400 transition-all shadow-md">
                     Contact Campus Sales
                   </button>
                 </div>
               </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 10s infinite alternate; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
      `}} />
    </div>
  );
}

/* ── SUBCOMPONENTS ─────────────────────────────────────────── */

function StatBadge({ icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    slate: "bg-slate-100 text-slate-700 border-slate-200"
  };
  
  return (
    <div className={`flex flex-col items-center md:items-start px-4 py-3 rounded-2xl border ${colorClasses[color as keyof typeof colorClasses]} shadow-sm hover:shadow-md hover:-translate-y-1 transition-all`}>
      <div className="flex items-center gap-2 mb-1 opacity-80">
        {React.cloneElement(icon, { className: "w-4 h-4" })}
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-2xl font-extrabold">{value}</span>
    </div>
  );
}

function CarouselCard({ 
  id, title, icon, children, 
  isEditing = false, onEdit, onSave, onCancel, saving = false,
  isActive = false, wide = false 
}: any) {
  
  return (
    <motion.div 
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`shrink-0 snap-center bg-white/70 backdrop-blur-3xl border rounded-[32px] p-6 md:p-8 flex flex-col relative group transition-all duration-500 overflow-hidden ${
        isActive ? 'border-indigo-300 shadow-[0_24px_48px_rgba(79,70,229,0.15)] scale-[1.02] z-10' : 'border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)] hover:-translate-y-1'
      } ${wide ? 'w-[80vw] md:w-[600px]' : 'w-[80vw] md:w-[450px]'} ${isEditing ? 'h-auto min-h-[450px]' : 'h-[450px]'}`}
    >
      {/* Active Indicator Glow */}
      {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-b-full shadow-[0_0_20px_rgba(79,70,229,0.5)]" />}

      {/* Glass Reflection Sweep */}
      <div className="absolute inset-0 z-[-1] bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000 -translate-x-full skew-x-12" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl shadow-sm border transition-colors duration-500 ${isActive ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-gradient-to-br from-slate-100 to-slate-50 text-slate-700 border-slate-200/50'}`}>
            {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
        </div>
        
        {/* Actions */}
        {onEdit && (
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button onClick={onEdit} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                <Pencil className="w-5 h-5"/>
              </button>
            ) : (
              <>
                <button onClick={onSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} Save
                </button>
                <button onClick={onCancel} disabled={saving} className="p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors" title="Cancel">
                  <X className="w-5 h-5"/>
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Content Area - Scrollable but clamped */}
      <div className={`flex-1 overflow-y-auto hide-scrollbar relative z-10 transition-all duration-500`}>
        <AnimatePresence mode="wait">
          <motion.div 
            key={isEditing ? 'edit' : 'preview'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-2 pb-8"
          >
            {children}
          </motion.div>
        </AnimatePresence>
        
        {/* View More indicator if content exceeds preview mode */}
        {!isEditing && (
           <div className="sticky bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none flex items-end justify-center pb-1">
             <ChevronDown className="w-5 h-5 text-slate-300 animate-bounce"/>
           </div>
        )}
      </div>
    </motion.div>
  );
}

function InputField({ label, value, onChange, editing, placeholder, locked = false }: any) {
  if (!editing) {
    return (
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
        <p className="text-sm font-semibold text-slate-800 break-words">{value || <span className="text-slate-300 font-normal italic">Not provided</span>}</p>
      </div>
    );
  }
  return (
    <div className="mb-4">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 transition-all">{label} {locked && <ShieldCheck className="inline w-3 h-3 text-slate-400"/>}</label>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        disabled={locked}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
        placeholder={placeholder}
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, editing, placeholder }: any) {
  if (!editing) {
    return (
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
        <p className="text-sm font-medium text-slate-700 whitespace-pre-line leading-relaxed line-clamp-4">{value || <span className="text-slate-300 font-normal italic">Not provided</span>}</p>
      </div>
    );
  }
  return (
    <div className="mb-4">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 transition-all">{label}</label>
      <textarea 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        rows={4}
        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm font-medium transition-all resize-none shadow-inner"
        placeholder={placeholder}
      />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 h-full">
      <AlertCircle className="w-8 h-8 text-slate-300 mb-3"/>
      <p className="text-sm font-bold text-slate-500">{message}</p>
    </div>
  );
}

function DockButton({ icon, label, onClick, color, disabled }: any) {
  const colors = {
    indigo: "text-indigo-600 hover:bg-indigo-50",
    emerald: "text-emerald-600 hover:bg-emerald-50 bg-emerald-50/50",
    rose: "text-rose-600 hover:bg-rose-50",
    slate: "text-slate-600 hover:bg-slate-50"
  };
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`group relative p-4 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 ${colors[color as keyof typeof colors]}`}
    >
      {icon}
      {/* Tooltip */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all pointer-events-none whitespace-nowrap shadow-xl">
        {label}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
      </div>
    </button>
  );
}
