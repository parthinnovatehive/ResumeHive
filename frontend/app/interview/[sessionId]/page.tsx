'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { 
  Bot, 
  Send, 
  User, 
  Loader2, 
  LogOut, 
  Mic, 
  Square,
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  Volume2, 
  Sparkles,
  CheckCheck,
  Building,
  RefreshCw,
  Lock,
  ChevronDown
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import InterviewerAvatar from '@/components/interviews/InterviewerAvatar';
import ProctoringEngine from '@/components/interviews/ProctoringEngine';

const MAX_WARNINGS = 3;

export default function InterviewChatPage({ params }: { params: { sessionId: string } }) {
  const [session, setSession] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  
  // Chat Scroll & Jump to Bottom State
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Anti-Cheating & Integrity State
  const [warnings, setWarnings] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [warningReason, setWarningReason] = useState<string>('');
  const [isDisqualified, setIsDisqualified] = useState<boolean>(false);
  const [showEndConfirmModal, setShowEndConfirmModal] = useState(false);
  const isEndingRef = useRef(false);
  const lastViolationTimeRef = useRef<number>(0);
  
  // Audio & Speech Telemetry State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [speakingCharIndex, setSpeakingCharIndex] = useState<number>(-1);
  const [typewriterCharIndex, setTypewriterCharIndex] = useState<number>(0);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | number | null>(null);
  const [lastSpokenText, setLastSpokenText] = useState('');
  const [persona, setPersona] = useState('maya');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typewriterTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  // Smooth ChatGPT Typewriter timer effect synchronized with speech
  useEffect(() => {
    if (!isSpeaking || !lastSpokenText) {
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
      return;
    }

    setTypewriterCharIndex(0);
    const textLength = lastSpokenText.length;
    // Dynamic typing speed matching speech cadence (~25-30ms per char)
    const stepMs = Math.max(16, Math.min(45, Math.floor(18000 / Math.max(1, textLength))));

    typewriterTimerRef.current = setInterval(() => {
      setTypewriterCharIndex(prev => {
        if (prev >= textLength) {
          if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
          return textLength;
        }
        return prev + 1;
      });
    }, stepMs);

    return () => {
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
    };
  }, [isSpeaking, lastSpokenText]);

  // ChatGPT-style streaming typewriter speech renderer synchronized 100% with voice
  const renderHighlightedSpeech = (
    fullText: string,
    isCurrentlySpeaking: boolean,
    charIndex: number
  ) => {
    if (!fullText) return null;

    if (isCurrentlySpeaking) {
      // Synchronized streamed text length driven by live speech boundary
      let visibleLength = charIndex >= 0 ? charIndex : typewriterCharIndex;
      if (visibleLength <= 0) visibleLength = Math.min(fullText.length, 4);
      if (visibleLength > fullText.length) visibleLength = fullText.length;

      const typedText = fullText.slice(0, visibleLength);
      const isComplete = visibleLength >= fullText.length;

      return (
        <span className="leading-relaxed inline font-medium text-[#e9edef]">
          <span>{typedText}</span>
          {!isComplete && (
            <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-1 rounded-sm align-middle shadow-[0_0_10px_rgba(6,182,212,0.85)]" />
          )}
        </span>
      );
    }

    return (
      <span className="text-[#e9edef] font-medium transition-all duration-200">
        {fullText}
      </span>
    );
  };

  // Recording Timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      setRecordingTime(0);
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const speakText = useCallback((text: string, messageKey?: string | number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setLastSpokenText(text);
    setSpeakingMessageId(messageKey !== undefined ? messageKey : 'latest');
    setSpeakingCharIndex(-1);
    setCurrentWord('');

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose matching voice for persona if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      if (persona === 'maya' || persona === 'sophia' || persona === 'aria') {
        const femaleVoice = voices.find(v => 
          (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Zira') || v.name.includes('Jenny') || v.name.includes('Google US English')) && v.lang.startsWith('en')
        );
        if (femaleVoice) utterance.voice = femaleVoice;
      } else {
        const maleVoice = voices.find(v => 
          (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Alex') || v.name.includes('Guy') || v.name.includes('George')) && v.lang.startsWith('en')
        );
        if (maleVoice) utterance.voice = maleVoice;
      }
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word' || event.charIndex !== undefined) {
        let endIdx = event.charIndex + (event.charLength || 1);
        while (endIdx < text.length && !/\s|[.,!?;:'"()—–\n]/.test(text[endIdx])) {
          endIdx++;
        }
        setSpeakingCharIndex(endIdx);
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentWord('');
      setSpeakingCharIndex(-1);
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentWord('');
      setSpeakingCharIndex(-1);
      setSpeakingMessageId(null);
    };
    
    window.speechSynthesis.speak(utterance);
  }, [persona]);

  const handleReplayAudio = useCallback(() => {
    if (lastSpokenText) {
      speakText(lastSpokenText, speakingMessageId ?? 'latest');
    } else if (session?.transcript) {
      const lastAI = [...session.transcript].reverse().find((t: any) => t.role === 'interviewer');
      if (lastAI?.message) {
        speakText(lastAI.message, 'latest');
      }
    }
  }, [lastSpokenText, session?.transcript, speakText, speakingMessageId]);

  // Handle Disqualification due to Cheating
  const handleDisqualification = useCallback(async (reason: string) => {
    isEndingRef.current = true;
    setIsDisqualified(true);
    setEnding(true);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    toast("Interview Terminated: Multiple tab switch violations detected.", "error");
    try {
      await api.post(`/interview/sessions/${params.sessionId}/end`, {
        is_disqualified: true,
        disqualification_reason: `Disqualified after exceeding ${MAX_WARNINGS} tab switch / anti-cheating violations (${reason}).`
      });
      setTimeout(() => {
        router.push(`/interview/${params.sessionId}/report`);
      }, 2500);
    } catch {
      router.push(`/interview/${params.sessionId}/report`);
    }
  }, [params.sessionId, router, toast]);

  // Anti-Cheating Violation Trigger
  const triggerViolation = useCallback((reason: string) => {
    if (ending || isDisqualified || isEndingRef.current) return;
    const now = Date.now();
    if (now - lastViolationTimeRef.current < 4000) return;
    lastViolationTimeRef.current = now;

    setWarnings(prev => {
      if (isEndingRef.current) return prev;
      const nextCount = prev + 1;
      setWarningReason(reason);
      setShowWarningModal(true);

      if (nextCount >= MAX_WARNINGS) {
        handleDisqualification(reason);
      }
      return nextCount;
    });
  }, [ending, isDisqualified, handleDisqualification]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      router.replace(`/login?from=${encodeURIComponent(`/interview/${params.sessionId}`)}`);
      return;
    }

    api.get(`/interview/sessions/${params.sessionId}`)
      .then(res => {
        if (res.data.status === 'completed') {
          router.replace(`/interview/${params.sessionId}/report`);
        } else {
          setSession(res.data);
          
          if (res.data.flags) {
            const initialTabSwitches = res.data.flags.filter(
              (f: any) => f.flag_type === 'TAB_SWITCH' || f.flag_type === 'WINDOW_BLUR'
            ).length;
            if (initialTabSwitches > 0) {
              setWarnings(initialTabSwitches);
            }
          }
          
          if (res.data.transcript && res.data.transcript.length >= 2) {
             const openingMsg = res.data.transcript[res.data.transcript.length - 1]?.message || res.data.transcript[1]?.message;
             if (openingMsg) speakText(openingMsg, 'latest');
          }
        }
      })
      .catch((err: any) => {
        if (err?.response?.status === 401) {
          router.replace(`/login?from=${encodeURIComponent(`/interview/${params.sessionId}`)}`);
          return;
        }
        toast("Session not found", "error");
        router.push('/interview');
      });
      
      return () => {
         if (typeof window !== 'undefined' && window.speechSynthesis) {
             window.speechSynthesis.cancel();
         }
      };
  }, [params.sessionId, router, toast, speakText]);

  // Anti-cheating event listeners
  useEffect(() => {
    const handleVisibility = () => {
      if (isEndingRef.current || isDisqualified || ending) return;
      if (document.hidden) {
        triggerViolation("Tab switched or browser minimized");
      }
    };

    const handleBlur = () => {
      if (isEndingRef.current || isDisqualified || ending) return;
      triggerViolation("Window focus lost (switched window or application)");
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEndingRef.current || ending) return;
      e.preventDefault();
      e.returnValue = "Leaving this page will invalidate or end your interview session.";
      return e.returnValue;
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (isEndingRef.current || ending) return;
      e.preventDefault();
      toast("Right-click context menu is disabled to prevent cheating.", "info");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEndingRef.current || ending) return;
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'u', 'p', 's'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        toast("Clipboard actions and shortcuts are disabled during proctored interview.", "info");
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))) {
        e.preventDefault();
        triggerViolation("Developer Tools opened");
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [triggerViolation, toast, isDisqualified, ending]);

  const handleChatScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 100;
    setShowJumpToBottom(isFarFromBottom);
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!showJumpToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session?.transcript, sending, showJumpToBottom]);

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending || isDisqualified) return;

    const userMessage = message.trim();
    setMessage('');
    
    await processTurn(userMessage, null);
  };

  const processTurn = async (textMessage: string | null, audioBlob: Blob | null) => {
    setSending(true);

    const optimisticText = textMessage || "🎤 (Spoken voice answer)"; 
    const newTranscript = [...(session?.transcript || []), { role: 'candidate', message: optimisticText }];
    setSession({ ...session, transcript: newTranscript });

    try {
      let aiResponseText = "";
      
      if (audioBlob) {
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        
        const res = await api.post(`/interview/sessions/${params.sessionId}/respond-audio`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        aiResponseText = res.data.message;
        if (res.data.transcription) {
          newTranscript[newTranscript.length - 1].message = res.data.transcription;
        }
        setSession((prev: any) => ({ ...prev, transcript: [...newTranscript] }));
        
      } else {
        const res = await api.post(`/interview/sessions/${params.sessionId}/respond`, { message: textMessage });
        aiResponseText = res.data.message;
      }
      
      setSession((prev: any) => ({
        ...prev,
        transcript: [...prev.transcript, { role: 'interviewer', message: aiResponseText }]
      }));
      
      speakText(aiResponseText, 'latest');
      
    } catch (err: any) {
      toast(err?.response?.data?.detail || 'Failed to send message', "error");
      setSession((prev: any) => ({
        ...prev,
        transcript: prev.transcript.slice(0, -1)
      }));
    } finally {
      setSending(false);
    }
  };

  const startRecording = async () => {
    if (sending || ending || isDisqualified) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processTurn(null, audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch {
      toast("Microphone access denied or unavailable", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleOpenEndConfirm = () => {
    if (ending || isDisqualified || isEndingRef.current) return;
    setShowEndConfirmModal(true);
  };

  const handleConfirmEndInterview = async () => {
    isEndingRef.current = true;
    setShowEndConfirmModal(false);
    setEnding(true);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    try {
      await api.post(`/interview/sessions/${params.sessionId}/end`);
      router.push(`/interview/${params.sessionId}/report`);
    } catch {
      toast("Error generating report", "error");
      isEndingRef.current = false;
      setEnding(false);
    }
  };

  if (!session) {
    return (
      <div className="flex h-[calc(100vh-72px)] w-full items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
          <span className="text-sm font-semibold text-slate-300">Loading AI Interview Room...</span>
        </div>
      </div>
    );
  }

  const chatMessages = session.transcript.filter((t: any) => t.role !== 'system');
  const categoryName = session.category?.name || 'Technical Round';
  const currentInterviewerName = persona === 'leo' ? 'Leo Sterling' : 'Maya Vance';

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Header Bar */}
      <div className="shrink-0 flex items-center justify-between px-5 py-2.5 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Bot size={18} />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-extrabold text-white flex items-center gap-2 tracking-tight">
              {session.job_role} 
              <span className="text-[11px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                {session.experience_level}
              </span>
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Domain: <strong className="text-slate-300">{categoryName}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <ShieldCheck size={12} /> Active Proctored Session
              </span>
            </div>
          </div>
        </div>

        {/* Header Right: Anti-Cheating Badge & End Interview Button */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold border transition-all ${
            warnings === 0
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              : warnings === 1
              ? 'bg-amber-950/70 border-amber-500/50 text-amber-300 animate-pulse'
              : 'bg-rose-950/80 border-rose-500/60 text-rose-300 animate-bounce'
          }`}>
            {warnings === 0 ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
            <span>Tab Violations: {warnings}/{MAX_WARNINGS}</span>
          </div>

          <button
            onClick={handleOpenEndConfirm}
            disabled={ending || isDisqualified}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-rose-200 border border-rose-500/30 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
          >
            <LogOut size={14} />
            <span>End Interview</span>
          </button>
        </div>
      </div>

      {/* Main Split Stage: Left Video Chamber | Right WhatsApp Chat Console */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-3 md:p-3.5 gap-3.5 bg-slate-950">
        
        {/* LEFT COLUMN: Video Feeds (Interviewer Avatar Top + Candidate Camera Feed Bottom) */}
        <div className="w-full lg:w-[45%] xl:w-[42%] shrink-0 flex flex-col gap-2.5 overflow-hidden justify-between h-full">
          {/* AI Interviewer Avatar Card */}
          <InterviewerAvatar 
            state={
              isRecording ? 'LISTENING' : 
              sending ? 'THINKING' : 
              isSpeaking ? 'SPEAKING' : 'IDLE'
            }
            onReplayAudio={handleReplayAudio}
            selectedPersona={persona}
            onSelectPersona={(id) => setPersona(id)}
          />

          {/* Candidate Webcam Video Card (Inline Embed) */}
          <ProctoringEngine 
            sessionId={params.sessionId} 
            isActive={!ending && !isDisqualified} 
            inline={true}
            onViolation={(flag, count) => {
              if (count && count > warnings) {
                setWarnings(count);
              }
              if (flag === 'TAB_SWITCH' || flag === 'WINDOW_BLUR') {
                triggerViolation("Tab switched or application window changed");
              }
            }} 
          />
        </div>

        {/* RIGHT COLUMN: WhatsApp-Style Interactive Chat & Response Console */}
        <div className="flex-1 flex flex-col h-full bg-[#0b141a] rounded-3xl border border-[#222e35] shadow-2xl overflow-hidden min-h-0 relative">
          {/* WhatsApp Chat Header */}
          <div className="shrink-0 bg-[#202c33] px-4 py-2.5 border-b border-[#2a3942] flex items-center justify-between text-white z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-xs text-white shadow-md border border-white/10">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#e9edef] flex items-center gap-2">
                  {currentInterviewerName}
                  <span className="text-[10px] text-[#25d366] font-semibold bg-[#0a332c] px-2 py-0.5 rounded-full border border-[#00a884]/40">
                    Online
                  </span>
                </h3>
                <p className="text-[11px] text-[#8696a0]">
                  {isSpeaking ? 'Speaking question...' : isRecording ? 'Listening to your voice...' : sending ? 'Formulating evaluation...' : 'AI Technical Interviewer'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReplayAudio}
                className="p-1.5 rounded-xl bg-[#111b21] hover:bg-[#2a3942] text-[#8696a0] hover:text-[#53bdeb] border border-[#2a3942] transition-all text-xs font-semibold flex items-center gap-1.5"
                title="Replay last spoken audio question"
              >
                <Volume2 size={14} className={isSpeaking ? 'text-[#53bdeb] animate-bounce' : ''} />
                <span className="hidden sm:inline">Repeat Voice</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Chat Transcript Area */}
          <div 
            ref={chatContainerRef} 
            onScroll={handleChatScroll} 
            className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#0b141a] bg-[radial-gradient(#182229_1px,transparent_1px)] [background-size:16px_16px] scroll-smooth"
          >
            {/* WhatsApp Date/Security Pill */}
            <div className="flex justify-center my-1">
              <span className="bg-[#182229] border border-[#222e35] text-[#8696a0] text-[11px] font-semibold px-3 py-0.5 rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <Lock size={11} className="text-[#53bdeb]" /> End-to-End Proctored AI Session • Today
              </span>
            </div>

            {(() => {
              const lastAiIndex = chatMessages.map((m: any, i: number) => ({ m, i })).filter(x => x.m.role === 'interviewer').pop()?.i ?? -1;

              return chatMessages.map((msg: any, idx: number) => {
                const isAI = msg.role === 'interviewer';
                const isThisMessageSpeaking = isSpeaking && isAI && (
                  speakingMessageId === idx || (speakingMessageId === 'latest' && idx === lastAiIndex)
                );
                const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={idx} className={`flex items-end gap-2 ${isAI ? 'justify-start' : 'justify-end'}`}>
                    {/* WhatsApp Message Bubble */}
                    <div className={`relative max-w-[88%] md:max-w-[82%] px-4 py-3 shadow-lg transition-all duration-300 ${
                      isAI 
                        ? isThisMessageSpeaking
                          ? 'bg-[#182730] text-[#e9edef] rounded-2xl rounded-tl-none border-2 border-cyan-400/90 shadow-[0_0_30px_rgba(6,182,212,0.25)] ring-2 ring-cyan-500/20' 
                          : 'bg-[#202c33] text-[#e9edef] rounded-2xl rounded-tl-none border border-[#2a3942]' 
                        : 'bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tr-none border border-[#02735e]'
                    }`}>
                      {/* Header: Name + Live Speaking Badge + Speaker button */}
                      <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-extrabold ${isAI ? 'text-[#53bdeb]' : 'text-[#86efac]'}`}>
                            {isAI ? `${currentInterviewerName} (Interviewer)` : 'You (Candidate)'}
                          </span>
                          {isAI && isThisMessageSpeaking && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-400/60 text-cyan-300 text-[10px] font-black animate-pulse shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                              Speaking Now
                            </span>
                          )}
                        </div>
                        {isAI && (
                          <button
                            onClick={() => speakText(msg.message, idx)}
                            className={`transition-all p-1 rounded-lg flex items-center gap-1 text-[11px] font-bold ${
                              isThisMessageSpeaking
                                ? 'text-cyan-300 bg-cyan-950/80 border border-cyan-400/50 shadow-sm animate-pulse'
                                : 'text-[#8696a0] hover:text-[#53bdeb] hover:bg-[#111b21]'
                            }`}
                            title={isThisMessageSpeaking ? 'Speaking this question' : 'Listen to this question'}
                          >
                            <Volume2 size={13} className={isThisMessageSpeaking ? 'animate-bounce text-cyan-400' : ''} />
                            {isThisMessageSpeaking && <span className="text-[10px] hidden sm:inline text-cyan-300">Live Voice</span>}
                          </button>
                        )}
                      </div>

                      {/* Message Body with Real-Time Spoken Word Highlight */}
                      <div className="text-[13.5px] md:text-[14.5px] leading-relaxed whitespace-pre-wrap select-text">
                        {isAI ? (
                          renderHighlightedSpeech(
                            msg.message,
                            isThisMessageSpeaking,
                            speakingCharIndex
                          )
                        ) : (
                          <p>{msg.message}</p>
                        )}
                      </div>

                      {/* Footer: Timestamp + Double Blue Checkmarks */}
                      <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-[#8696a0] font-medium">
                        <span>{timeString}</span>
                        {!isAI && (
                          <CheckCheck size={14} className="text-[#53bdeb]" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              });
            })()}

            {/* AI Thinking Indicator in WhatsApp bubble */}
            {sending && (
              <div className="flex items-end gap-2 justify-start">
                <div className="bg-[#202c33] text-[#8696a0] rounded-2xl rounded-tl-none border border-[#2a3942] px-4 py-2.5 shadow-md flex items-center gap-2 text-xs font-semibold">
                  <Loader2 size={14} className="animate-spin text-[#53bdeb]" />
                  <span>Interviewer is evaluating your response & formulating question...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Floating Jump to Bottom Button */}
          {showJumpToBottom && (
            <button
              type="button"
              onClick={scrollToBottom}
              className="absolute bottom-24 right-6 z-30 p-2.5 rounded-full bg-[#00a884] hover:bg-[#06cf9c] text-white shadow-2xl border border-[#00a884]/40 transition-all duration-300 transform hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-4 flex items-center gap-1.5 px-3.5 shadow-[#00a884]/40"
              title="Jump to bottom"
            >
              <ChevronDown size={16} className="animate-bounce" />
              <span className="text-xs font-black tracking-wide">Jump to Bottom</span>
            </button>
          )}

          {/* WhatsApp Bottom Input Console */}
          <div className="shrink-0 bg-[#111b21] border-t border-[#222e35] p-3 space-y-2.5 z-20 shadow-xl">
            {/* BIG START / STOP SPEAKING BUTTON */}
            <button
              type="button"
              onClick={toggleRecording}
              disabled={sending || ending || isDisqualified}
              className={`w-full py-3 px-5 rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-2.5 transition-all duration-200 shadow-xl ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/30 animate-pulse shadow-rose-600/40'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white ring-4 ring-emerald-500/20 shadow-emerald-600/30 hover:scale-[1.01]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRecording ? (
                <>
                  <Square size={16} className="fill-white text-white" />
                  <span>Stop Speaking &amp; Send Answer ({formatTime(recordingTime)})</span>
                </>
              ) : (
                <>
                  <Mic size={18} className="text-white animate-bounce" />
                  <span>Click to Start Speaking</span>
                </>
              )}
            </button>

            {/* Optional Text Input Row */}
            <form onSubmit={handleSendText} className="relative flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sending || ending || isRecording || isDisqualified}
                placeholder={isRecording ? "🎤 Recording your voice answer now... click 'Stop Speaking' when finished" : "Or type your answer here and press Enter..."}
                className="w-full bg-[#202c33] border border-[#2a3942] rounded-xl pl-4 pr-12 py-2.5 text-[#e9edef] placeholder:text-[#8696a0] focus:outline-none focus:ring-2 focus:ring-[#00a884] focus:border-[#00a884] transition-all shadow-inner disabled:opacity-50 text-xs md:text-sm"
              />
              <button
                type="submit"
                disabled={!message.trim() || sending || ending || isRecording || isDisqualified}
                className="absolute right-1.5 p-2 bg-[#00a884] hover:bg-[#06cf9c] disabled:bg-[#202c33] disabled:text-[#8696a0] text-white rounded-lg transition-all shadow-md disabled:shadow-none"
                title="Send text answer"
              >
                <Send size={15} className={sending ? 'opacity-0' : 'opacity-100'} />
                {sending && <Loader2 size={15} className="absolute inset-0 m-auto animate-spin" />}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Anti-Cheating Violation Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`bg-slate-900 rounded-[28px] p-8 max-w-lg w-full shadow-2xl border ${
            isDisqualified ? 'border-rose-500 ring-8 ring-rose-500/20' : 'border-amber-500 ring-8 ring-amber-500/20'
          } relative animate-in zoom-in-95 duration-200 text-white`}>
            
            {isDisqualified ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-600 animate-pulse">
                  <XCircle size={36} />
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-rose-950 border border-rose-700 text-rose-300 text-xs font-extrabold uppercase tracking-wider mb-2">
                  Session Terminated
                </span>
                <h3 className="text-2xl font-black text-white mb-3">
                  Disqualified for Cheating
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  You have exceeded the maximum allowed tab switch violations (<strong>{MAX_WARNINGS}/{MAX_WARNINGS}</strong>). 
                  To maintain academic and professional integrity, this interview has been terminated and recorded with 0 integrity score.
                </p>

                <div className="flex items-center justify-center gap-2 text-sm font-bold text-rose-300 bg-rose-950/80 py-3 rounded-xl border border-rose-700/50">
                  <Loader2 size={16} className="animate-spin" />
                  Redirecting to Integrity Audit Report...
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-950 text-amber-400 flex items-center justify-center border border-amber-600 shrink-0">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest block">
                      Anti-Cheating Alert
                    </span>
                    <h3 className="text-xl font-extrabold text-white">
                      Tab Switch Detected!
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {warningReason || "You switched tabs or lost window focus during the active interview session."}
                </p>

                <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 mb-6">
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="text-slate-400">Violation Strike Count:</span>
                    <span className="text-amber-400 font-extrabold text-sm">{warnings} / {MAX_WARNINGS}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        warnings === 1 ? 'w-1/3 bg-amber-500' : 'w-2/3 bg-orange-500'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Warning: On your <strong>3rd strike</strong>, the interview will immediately terminate with permanent disqualification.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowWarningModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl font-extrabold text-sm transition-all shadow-lg shadow-amber-600/30"
                >
                  I Understand &amp; Return to Interview
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* End Interview Confirmation Modal */}
      {showEndConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-[28px] p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-800 text-white text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-950/80 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto mb-4">
              <LogOut size={26} />
            </div>
            <h3 className="text-xl font-black text-white mb-2">End Interview Session?</h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-6">
              Are you sure you want to finish now? Your current responses and proctoring telemetry will be submitted for immediate AI scoring.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowEndConfirmModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all border border-slate-700"
              >
                Continue Interview
              </button>
              <button
                type="button"
                onClick={handleConfirmEndInterview}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm transition-all shadow-lg shadow-rose-600/30"
              >
                Yes, End &amp; Score
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
