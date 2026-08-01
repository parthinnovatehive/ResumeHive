"use client";

import React, { useRef, useState, useLayoutEffect, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, Focus, MousePointer2 } from "lucide-react";
import type { ResumeFormData } from "@/lib/validations/resume.schema";
import type { TemplateName } from "@/types/resume";
import { TemplateRenderer } from "./templates";

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const PAGE_PADDING_PX = 48;

interface WysiwygPreviewProps {
  data: ResumeFormData;
  template: TemplateName;
  onSectionClick?: (section: string) => void;
  activeSection?: string | null;
  onInlineEdit?: (path: string, value: string) => void;
}

function getValueByPath(obj: any, path: string) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function findPathByValue(obj: any, targetStr: string, currentPath = "", exact = true): string | null {
  if (!obj || typeof obj !== "object") return null;
  for (const [key, val] of Object.entries(obj)) {
    const newPath = currentPath ? `${currentPath}.${key}` : key;
    if (typeof val === "string") {
       const cleanVal = val.trim();
       if (exact && cleanVal === targetStr) return newPath;
       if (!exact && cleanVal.includes(targetStr) && targetStr.length > 5) return newPath;
    }
    if (Array.isArray(val)) {
       for (let i = 0; i < val.length; i++) {
         const p = `${newPath}.${i}`;
         if (typeof val[i] === "string") {
            const cleanVal = val[i].trim();
            if (exact && cleanVal === targetStr) return p;
            if (!exact && cleanVal.includes(targetStr) && targetStr.length > 5) return p;
         } else if (typeof val[i] === "object" && val[i] !== null) {
            const found = findPathByValue(val[i], targetStr, p, exact);
            if (found) return found;
         }
       }
    } else if (typeof val === "object" && val !== null) {
      const found = findPathByValue(val, targetStr, newPath, exact);
      if (found) return found;
    }
  }
  return null;
}

export function WysiwygPreview({ data, template, onSectionClick, activeSection, onInlineEdit }: WysiwygPreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [isEditEnabled, setIsEditEnabled] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [inlineEditor, setInlineEditor] = useState<{
    active: boolean;
    path: string;
    value: string;
    rect: { top: number; left: number; width: number; height: number } | null;
    style: any;
  }>({ active: false, path: "", value: "", rect: null, style: null });

  useLayoutEffect(() => {
    if (!contentRef.current) return;
    
    const entries = Array.from(contentRef.current.querySelectorAll('.resume-entry, .resume-section')) as HTMLElement[];
    entries.forEach(el => {
      el.style.marginTop = '';
      el.style.marginBottom = '';
    });

    const topLevelElements = entries.filter(el => {
      return el.classList.contains('resume-entry') || (el.classList.contains('resume-section') && el.querySelectorAll('.resume-entry').length === 0);
    });

    const measureAndShift = () => {
      let currentShift = 0;
      let maxPage = 0;
      const elementsToShift: { el: HTMLElement, shift: number }[] = [];

      topLevelElements.forEach(el => {
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
          const nextPageTopBoundary = (pageIndex + 1) * A4_HEIGHT_PX + PAGE_PADDING_PX;
          const shiftNeeded = nextPageTopBoundary - virtualTop;
          
          currentShift += shiftNeeded;
          elementsToShift.push({ el, shift: shiftNeeded });
        }

        const newPageIndex = Math.floor((virtualBottom + currentShift) / A4_HEIGHT_PX);
        if (newPageIndex > maxPage) maxPage = newPageIndex;
      });

      elementsToShift.forEach(({ el, shift }) => {
        const currentMargin = parseFloat(window.getComputedStyle(el).marginTop) || 0;
        el.style.marginTop = `${currentMargin + shift}px`;
      });

      setTotalPages(maxPage + 1);
    };

    requestAnimationFrame(measureAndShift);
  }, [data, template]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const scaledHeight = A4_HEIGHT_PX * zoom;
    const current = Math.floor(scrollTop / scaledHeight) + 1;
    setCurrentPage(Math.min(current, totalPages));
  };

  const scrollToPage = (pageIndex: number) => {
    if (containerRef.current) {
      const scrollPos = pageIndex * (A4_HEIGHT_PX * zoom + 32);
      containerRef.current.scrollTo({ top: scrollPos, behavior: 'smooth' });
    }
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    if (inlineEditor.active) {
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return;
      setInlineEditor(prev => ({ ...prev, active: false }));
    }

    if (!isEditEnabled) {
      const sectionEl = target.closest('.resume-section');
      if (sectionEl) {
         const text = sectionEl.textContent?.toLowerCase() || '';
         if (text.includes('experience')) onSectionClick?.('experience');
         else if (text.includes('education')) onSectionClick?.('education');
         else if (text.includes('project')) onSectionClick?.('projects');
         else if (text.includes('skill')) onSectionClick?.('skills');
         else if (text.includes('summary') || text.includes('profile')) onSectionClick?.('summary');
         else if (text.includes('cert') || text.includes('award')) onSectionClick?.('certifications');
      }
      return;
    }
    
    const text = target.textContent?.trim();
    if (!text) return;

    let matchedPath = findPathByValue(data, text, "", true);
    if (!matchedPath) matchedPath = findPathByValue(data, text, "", false);

    if (matchedPath && contentRef.current) {
      e.stopPropagation();
      e.preventDefault();
      
      const contentRect = contentRef.current.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      
      const unscaledTop = (targetRect.top - contentRect.top) / zoom;
      const unscaledLeft = (targetRect.left - contentRect.left) / zoom;
      const unscaledWidth = targetRect.width / zoom;
      const unscaledHeight = targetRect.height / zoom;

      const style = window.getComputedStyle(target);
      
      setInlineEditor({
         active: true,
         path: matchedPath,
         value: getValueByPath(data, matchedPath) || "",
         rect: {
           top: unscaledTop,
           left: unscaledLeft,
           width: unscaledWidth,
           height: unscaledHeight
         },
         style: {
           fontFamily: style.fontFamily,
           fontSize: style.fontSize,
           fontWeight: style.fontWeight,
           lineHeight: style.lineHeight,
           letterSpacing: style.letterSpacing,
           color: style.color,
           textAlign: style.textAlign,
           textTransform: style.textTransform,
         }
      });
    }
  };

  const handleInlineChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setInlineEditor(prev => ({ ...prev, value: newVal }));
    if (onInlineEdit) {
      onInlineEdit(inlineEditor.path, newVal);
    }
  };

  const handleInlineKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setInlineEditor(prev => ({ ...prev, active: false }));
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] overflow-hidden font-sans relative">
      <div className="shrink-0 h-14 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-4 flex items-center justify-between z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded shadow-sm transition-all"><ZoomOut className="w-4 h-4"/></button>
            <span className="text-xs font-bold w-12 text-center text-slate-700">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.25))} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded shadow-sm transition-all"><ZoomIn className="w-4 h-4"/></button>
          </div>
          <button onClick={() => setZoom(1)} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-all flex items-center gap-1"><Focus className="w-3.5 h-3.5"/> 100%</button>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setIsEditEnabled(!isEditEnabled)} className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm ${isEditEnabled ? 'bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
             <MousePointer2 className="w-3.5 h-3.5"/> Click to edit
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex relative">
        <div className="shrink-0 w-24 bg-white/50 border-r border-slate-200/50 p-4 flex flex-col gap-4 overflow-y-auto hide-scrollbar">
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

        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#f0f2f5] pt-12 pb-24 flex justify-center" 
          style={{ perspective: '1000px' }}
        >
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
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] font-bold text-slate-400 tracking-wider">
                  PAGE {i + 1} OF {totalPages}
                </div>
              </div>
            ))}

            <div 
              ref={contentRef} 
              className={`absolute inset-0 z-10 ${isEditEnabled ? 'cursor-text' : ''}`}
              style={{ padding: `${PAGE_PADDING_PX}px` }}
              onClick={handlePreviewClick}
            >
              <TemplateRenderer data={data} template={template} />

              <AnimatePresence>
                {inlineEditor.active && inlineEditor.rect && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      top: inlineEditor.rect.top - 4,
                      left: inlineEditor.rect.left - 4,
                      width: inlineEditor.rect.width + 8,
                      height: Math.max(inlineEditor.rect.height + 8, 40),
                      zIndex: 50,
                    }}
                  >
                    <textarea
                      autoFocus
                      value={inlineEditor.value}
                      onChange={handleInlineChange}
                      onKeyDown={handleInlineKeyDown}
                      style={{
                        ...inlineEditor.style,
                        width: '100%',
                        height: '100%',
                        resize: 'none',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        overflow: 'hidden',
                        margin: 0,
                        padding: '4px',
                      }}
                      className="rounded-[6px] ring-2 ring-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)] bg-indigo-50/20 backdrop-blur-[2px] transition-all caret-indigo-500"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
