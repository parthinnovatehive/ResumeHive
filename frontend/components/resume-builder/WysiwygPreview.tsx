"use client";

import React, { useRef, useState, useLayoutEffect, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, Focus, CheckCircle2, AlertTriangle, MousePointer2, Grid } from "lucide-react";
import type { ResumeFormData } from "@/lib/validations/resume.schema";
import type { TemplateName } from "@/types/resume";
import { TemplateRenderer } from "./templates";

const A4_WIDTH_PX = 794; // 210mm at 96 PPI
const A4_HEIGHT_PX = 1123; // 297mm at 96 PPI
const PAGE_PADDING_PX = 48; // Safe margin

interface WysiwygPreviewProps {
  data: ResumeFormData;
  template: TemplateName;
  onSectionClick?: (section: string) => void;
  activeSection?: string | null;
}

export function WysiwygPreview({ data, template, onSectionClick, activeSection }: WysiwygPreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [showGuides, setShowGuides] = useState(false);
  const [isEditEnabled, setIsEditEnabled] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Smart Pagination Engine - Runs after TemplateRenderer paints
  useLayoutEffect(() => {
    if (!contentRef.current) return;
    
    // 1. Reset all margins first to calculate natural layout
    const entries = Array.from(contentRef.current.querySelectorAll('.resume-entry, .resume-section')) as HTMLElement[];
    entries.forEach(el => {
      el.style.marginTop = '';
      el.style.marginBottom = '';
    });

    // 2. Read phase (no writes to prevent thrashing)
    // We only want top-level items to avoid double-shifting nested items
    const topLevelElements = entries.filter(el => {
      // If a resume-entry is inside a resume-section, we still want to paginate the entry!
      // But we must be careful not to shift the section AND its children.
      // Usually, sections have titles. If a section is split, we shift its children.
      return el.classList.contains('resume-entry') || (el.classList.contains('resume-section') && el.querySelectorAll('.resume-entry').length === 0);
    });

    // Let the browser paint the reset state before we measure
    const measureAndShift = () => {
      let currentShift = 0;
      let maxPage = 0;

      const elementsToShift: { el: HTMLElement, shift: number }[] = [];

      topLevelElements.forEach(el => {
        // Find position relative to the main content container
        let offsetTop = el.offsetTop;
        let parent = el.offsetParent as HTMLElement;
        while (parent && parent !== contentRef.current) {
          offsetTop += parent.offsetTop;
          parent = parent.offsetParent as HTMLElement;
        }

        const virtualTop = offsetTop + currentShift;
        const height = el.offsetHeight;
        const virtualBottom = virtualTop + height;

        const pageIndex = Math.floor(virtualTop / A4_HEIGHT_PX);
        const pageBottomBoundary = (pageIndex + 1) * A4_HEIGHT_PX - PAGE_PADDING_PX;

        if (virtualBottom > pageBottomBoundary && height < (A4_HEIGHT_PX - PAGE_PADDING_PX * 2)) {
          // It crosses the boundary, and it can fit on a single page
          const nextPageTopBoundary = (pageIndex + 1) * A4_HEIGHT_PX + PAGE_PADDING_PX;
          const shiftNeeded = nextPageTopBoundary - virtualTop;
          
          currentShift += shiftNeeded;
          elementsToShift.push({ el, shift: shiftNeeded });
        }

        const newPageIndex = Math.floor((virtualBottom + currentShift) / A4_HEIGHT_PX);
        if (newPageIndex > maxPage) maxPage = newPageIndex;
      });

      // Write phase
      elementsToShift.forEach(({ el, shift }) => {
        const currentMargin = parseFloat(window.getComputedStyle(el).marginTop) || 0;
        el.style.marginTop = `${currentMargin + shift}px`;
      });

      setTotalPages(maxPage + 1);
      setIsOverflowing(maxPage + 1 > 3);
    };

    // Use requestAnimationFrame to ensure CSS has applied the reset margins before measurement
    requestAnimationFrame(measureAndShift);
    
  }, [data, template]);

  // Track scrolling to update current page thumbnail
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    // Account for zoom and padding
    const scaledHeight = A4_HEIGHT_PX * zoom;
    const current = Math.floor(scrollTop / scaledHeight) + 1;
    setCurrentPage(Math.min(current, totalPages));
  };

  const scrollToPage = (pageIndex: number) => {
    if (containerRef.current) {
      const scrollPos = pageIndex * (A4_HEIGHT_PX * zoom + 32); // 32 is the gap between pages visually
      containerRef.current.scrollTo({ top: scrollPos, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] overflow-hidden font-sans relative">
      
      {/* ZOOM & TOOLS HEADER */}
      <div className="shrink-0 h-14 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-4 flex items-center justify-between z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded shadow-sm transition-all"><ZoomOut className="w-4 h-4"/></button>
            <span className="text-xs font-bold w-12 text-center text-slate-700">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.25))} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded shadow-sm transition-all"><ZoomIn className="w-4 h-4"/></button>
          </div>
          <button onClick={() => setZoom(1)} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all flex items-center gap-1"><Focus className="w-3.5 h-3.5"/> 100%</button>
          <button onClick={() => setShowGuides(!showGuides)} className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1 ${showGuides ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}><Grid className="w-3.5 h-3.5"/> Guides</button>
        </div>

        <div className="flex items-center gap-4">
          <button id="btn-print-ready" onClick={() => {
            const ev = new CustomEvent("toast", { detail: { msg: isOverflowing ? "Formatting Warnings: Content overflows printable area." : "✓ Print Ready", type: isOverflowing ? "error" : "success" }});
            window.dispatchEvent(ev);
          }} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            {isOverflowing ? <AlertTriangle className="w-4 h-4 text-amber-500"/> : <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform"/>}
            <span className={`text-xs font-bold ${isOverflowing ? 'text-amber-700' : 'text-emerald-700'}`}>{isOverflowing ? 'Overflow Warning' : 'Print Ready'}</span>
          </button>
          <button onClick={() => setIsEditEnabled(!isEditEnabled)} className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm ${isEditEnabled ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
             <MousePointer2 className="w-3.5 h-3.5"/> Click to edit
          </button>
        </div>
      </div>

      {/* MAIN PREVIEW AREA */}
      <div className="flex-1 overflow-hidden flex relative">
        
        {/* Thumbnails Sidebar */}
        <div className="shrink-0 w-24 bg-white/50 border-r border-slate-200/50 p-4 flex flex-col gap-4 overflow-y-auto">
           {Array.from({ length: totalPages }).map((_, i) => (
             <button 
               key={i} 
               onClick={() => scrollToPage(i)}
               className={`relative aspect-[1/1.4] w-full bg-white rounded shadow-sm border-2 transition-all overflow-hidden ${currentPage === i + 1 ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}`}
             >
               <span className="absolute inset-0 flex items-center justify-center text-slate-300 font-bold text-2xl z-10">{i + 1}</span>
             </button>
           ))}
        </div>

        {/* Scrolling Canvas */}
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#f0f2f5] pt-12 pb-24 flex justify-center" 
          style={{ perspective: '1000px' }}
        >
          {/* Zoom Wrapper */}
          <div 
            style={{ 
              transform: `scale(${zoom})`, 
              transformOrigin: 'top center',
              width: `${A4_WIDTH_PX}px`,
              height: `${A4_HEIGHT_PX * totalPages}px`,
              transition: 'transform 0.2s ease-out'
            }}
            className="relative"
          >
            {/* Render Visual Page Backgrounds */}
            {Array.from({ length: totalPages }).map((_, i) => (
              <div 
                key={i}
                className="absolute left-0 w-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05),0_10px_40px_rgba(0,0,0,0.04)] ring-1 ring-black/5"
                style={{ 
                  top: i * A4_HEIGHT_PX, 
                  height: A4_HEIGHT_PX,
                  borderBottom: i < totalPages - 1 ? '2px border-dashed border-slate-300' : 'none' 
                }}
              >
                {/* Printable Margins Guide Overlay */}
                {showGuides && (
                  <div className="absolute inset-[48px] border border-blue-200/50 border-dashed pointer-events-none z-40 bg-blue-50/5 flex items-center justify-center">
                    <span className="text-blue-200 font-bold uppercase tracking-widest text-4xl transform -rotate-45 select-none">Safe Margin</span>
                  </div>
                )}
                {/* Page Number Indicator */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] font-bold text-slate-400 tracking-wider">
                  PAGE {i + 1} OF {totalPages}
                </div>
              </div>
            ))}

            {/* Render Actual Content Stream */}
            <div 
              ref={contentRef} 
              className="absolute inset-0 z-10"
              style={{ padding: `${PAGE_PADDING_PX}px` }}
              onClick={(e) => {
                 // Simple event delegation to find clicked section
                 const target = e.target as HTMLElement;
                 const sectionEl = target.closest('.resume-section');
                 if (sectionEl) {
                    // Extract section name from class or content (simplified)
                    // You could add data-section attribute to sections in TemplateRenderer for robustness
                    const text = sectionEl.textContent?.toLowerCase() || '';
                    if (text.includes('experience')) onSectionClick?.('experience');
                    else if (text.includes('education')) onSectionClick?.('education');
                    else if (text.includes('project')) onSectionClick?.('projects');
                    else if (text.includes('skill')) onSectionClick?.('skills');
                    else if (text.includes('summary') || text.includes('profile')) onSectionClick?.('summary');
                    else if (text.includes('cert') || text.includes('award')) onSectionClick?.('certifications');
                 }
              }}
            >
              <TemplateRenderer data={data} template={template} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
