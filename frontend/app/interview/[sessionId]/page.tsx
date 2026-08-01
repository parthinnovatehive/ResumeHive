'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { Bot, Send, User, Loader2, LogOut, Mic } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import InterviewerAvatar, { AvatarState } from '@/components/interviews/InterviewerAvatar';
import ProctoringEngine from '@/components/interviews/ProctoringEngine';

export default function InterviewChatPage({ params }: { params: { sessionId: string } }) {
  const [session, setSession] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  
  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  const speakText = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    // You can customize pitch/rate here if desired
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    api.get(`/interview/sessions/${params.sessionId}`)
      .then(res => {
        if (res.data.status === 'completed') {
          router.replace(`/interview/${params.sessionId}/report`);
        } else {
          setSession(res.data);
          
          // Speak the opening message if it's the very first load and there's only 2 messages (system + opening)
          // Note: Browsers usually block autoplay audio without user interaction, so this might fail until the user clicks something.
          // We'll attempt it anyway.
          if (res.data.transcript && res.data.transcript.length === 2) {
             const openingMsg = res.data.transcript[1].message;
             speakText(openingMsg);
          }
        }
      })
      .catch(() => {
        toast("Session not found", "error");
        router.push('/interview');
      });
      
      return () => {
         if (typeof window !== 'undefined' && window.speechSynthesis) {
             window.speechSynthesis.cancel();
         }
      };
  }, [params.sessionId, router, toast, speakText]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.transcript, sending]);

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    const userMessage = message.trim();
    setMessage('');
    
    await processTurn(userMessage, null);
  };

  const processTurn = async (textMessage: string | null, audioBlob: Blob | null) => {
    setSending(true);

    // Optimistic update for text
    const optimisticText = textMessage || "..."; 
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
        
        // Update the optimistic transcript with the actual transcribed text
        newTranscript[newTranscript.length - 1].message = res.data.transcription;
        setSession((prev: any) => ({ ...prev, transcript: [...newTranscript] }));
        
      } else {
        const res = await api.post(`/interview/sessions/${params.sessionId}/respond`, { message: textMessage });
        aiResponseText = res.data.message;
      }
      
      // Update with AI response
      setSession((prev: any) => ({
        ...prev,
        transcript: [...prev.transcript, { role: 'interviewer', message: aiResponseText }]
      }));
      
      speakText(aiResponseText);
      
    } catch (err: any) {
      toast(err?.response?.data?.detail || 'Failed to send message', "error");
      // Rollback optimistic update
      setSession((prev: any) => ({
        ...prev,
        transcript: prev.transcript.slice(0, -1)
      }));
    } finally {
      setSending(false);
    }
  };

  const startRecording = async () => {
    if (sending || ending) return;
    
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
      if (window.speechSynthesis) window.speechSynthesis.cancel(); // Stop AI talking if user interrupts
    } catch (err) {
      toast("Microphone access denied or unavailable", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleEndInterview = async () => {
    if (!confirm("Are you sure you want to end the interview? This will generate your final report.")) return;
    
    setEnding(true);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    
    try {
      await api.post(`/interview/sessions/${params.sessionId}/end`);
      router.push(`/interview/${params.sessionId}/report`);
    } catch (err) {
      toast("Error generating report", "error");
      setEnding(false);
    }
  };

  if (!session) {
    return (
      <div className="flex h-[calc(100vh-72px)] w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  const chatMessages = session.transcript.filter((t: any) => t.role !== 'system');

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] bg-slate-50 relative selection:bg-indigo-500/30 font-sans">
      {/* Header */}
      <header className="shrink-0 bg-white/70 backdrop-blur-3xl border-b border-slate-200/50 flex items-center justify-between px-6 py-4 z-40 relative shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100">
            <Bot className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 tracking-tight">AI Interviewer</h1>
            <p className="text-xs font-medium text-emerald-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> In Progress
            </p>
          </div>
        </div>
        <button 
          onClick={handleEndInterview}
          disabled={ending}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full text-sm font-bold transition-all border border-rose-200 shadow-sm disabled:opacity-50"
        >
          {ending ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
          End Interview
        </button>
      </header>

      {/* Proctoring Engine */}
      <ProctoringEngine sessionId={params.sessionId} />

      {/* Avatar Section */}
      <div className="shrink-0 bg-slate-50 pt-6 pb-2 border-b border-slate-200/50">
        <InterviewerAvatar state={
          isRecording ? 'LISTENING' : 
          sending ? 'THINKING' : 
          isSpeaking ? 'SPEAKING' : 'IDLE'
        } />
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {chatMessages.map((msg: any, idx: number) => {
            const isAI = msg.role === 'interviewer';
            return (
              <div key={idx} className={`flex gap-4 ${isAI ? '' : 'flex-row-reverse'}`}>
                {/* Avatar */}
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border shadow-sm ${
                  isAI ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  {isAI ? <Bot size={20} /> : <User size={20} />}
                </div>
                
                {/* Bubble */}
                <div className={`max-w-[80%] rounded-2xl p-5 shadow-sm text-[15px] leading-relaxed ${
                  isAI 
                    ? 'bg-white border border-slate-100 text-slate-700 rounded-tl-none' 
                    : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-none border border-indigo-500/20'
                }`}>
                  {msg.message}
                </div>
              </div>
            );
          })}
          
          {sending && (
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center border shadow-sm bg-indigo-50 border-indigo-100 text-indigo-600">
                <Bot size={20} />
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-5 shadow-sm flex gap-1 items-center text-slate-400 text-sm italic">
                 Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 bg-white/70 backdrop-blur-xl border-t border-slate-200/50 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
            <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                disabled={sending || ending}
                className={`relative shrink-0 w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md ${
                    isRecording 
                        ? 'bg-rose-500 text-white scale-110' 
                        : 'bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 disabled:opacity-50'
                }`}
                title="Hold to speak"
            >
                {isRecording && <span className="absolute w-full h-full rounded-full bg-rose-500 opacity-50 animate-ping"></span>}
                <Mic size={24} className={isRecording ? 'animate-pulse' : ''} />
            </button>
            
            <form onSubmit={handleSendText} className="relative flex-1 flex items-center">
                <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={sending || ending || isRecording}
                    placeholder={isRecording ? "Listening..." : "Type your response or hold mic to speak..."}
                    className="w-full bg-slate-50 border border-slate-200 rounded-full pl-6 pr-14 py-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm disabled:opacity-50"
                    autoFocus
                />
                <button 
                    type="submit"
                    disabled={!message.trim() || sending || ending || isRecording}
                    className="absolute right-2 p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-full transition-colors shadow-md disabled:shadow-none"
                >
                    <Send size={18} className={sending ? 'opacity-0' : 'opacity-100'} />
                    {sending && <Loader2 size={18} className="absolute inset-0 m-auto animate-spin" />}
                </button>
            </form>
        </div>
        <div className="text-center mt-3 text-xs font-medium text-slate-400">
          Hold the microphone button to speak, or press Enter to send text.
        </div>
      </div>
    </div>
  );
}
