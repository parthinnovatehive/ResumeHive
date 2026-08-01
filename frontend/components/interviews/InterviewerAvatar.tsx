import React from 'react';

export type AvatarState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING';

interface InterviewerAvatarProps {
  state: AvatarState;
}

export default function InterviewerAvatar({ state }: InterviewerAvatarProps) {
  // Determine CSS classes based on state
  const isListening = state === 'LISTENING';
  const isThinking = state === 'THINKING';
  const isSpeaking = state === 'SPEAKING';

  return (
    <div className="relative flex flex-col items-center justify-center w-48 h-48 mx-auto">
      {/* Background glow when listening */}
      <div 
        className={`absolute inset-0 rounded-full transition-all duration-700 ${
          isListening ? 'bg-indigo-500/20 scale-125 blur-xl animate-pulse' : 'bg-transparent scale-100 blur-none'
        }`}
      />
      
      {/* Thinking Indicator */}
      <div className={`absolute -top-4 right-2 transition-all duration-300 ${isThinking ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-white px-3 py-2 rounded-2xl rounded-bl-none shadow-sm border border-slate-200 flex gap-1 items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      {/* Main Avatar Container */}
      <div 
        className={`relative z-10 w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-4 shadow-md transition-all duration-500 flex items-end justify-center
          ${isListening ? 'border-indigo-400 rotate-6' : 'border-white rotate-0'}
          ${state === 'IDLE' ? 'avatar-breathe' : ''}
        `}
      >
        {/* Simple geometric bust/shirt */}
        <div className="w-24 h-12 bg-indigo-600 rounded-t-full mt-auto" />
        
        {/* Head */}
        <div className="absolute top-4 w-20 h-20 bg-slate-200 rounded-full flex flex-col items-center justify-center shadow-inner">
          
          {/* Eyes Container */}
          <div className="flex gap-4 mb-2">
            {/* Left Eye */}
            <div className={`w-3 h-3 bg-slate-700 rounded-full transition-transform duration-300 ${
              isThinking ? 'translate-x-1 -translate-y-2' : ''
            } ${state === 'IDLE' ? 'avatar-blink' : ''}`} />
            
            {/* Right Eye */}
            <div className={`w-3 h-3 bg-slate-700 rounded-full transition-transform duration-300 ${
              isThinking ? 'translate-x-1 -translate-y-2' : ''
            } ${state === 'IDLE' ? 'avatar-blink' : ''}`} />
          </div>

          {/* Mouth */}
          <div className="mt-1 flex justify-center h-4 w-8">
            <div className={`w-6 bg-slate-600 transition-all duration-150 ${
              isSpeaking 
                ? 'avatar-speak rounded-full' // rapid animation
                : isListening
                  ? 'h-1 rounded-full w-4' // slightly pursed
                  : isThinking
                    ? 'h-1.5 rounded-full w-3 translate-x-1' // thoughtful smirk
                    : 'h-1.5 rounded-full' // default idle smile/neutral
            }`} />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes breathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .avatar-breathe {
          animation: breathe 4s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 96%, 98%, 100% { transform: scaleY(1); }
          97% { transform: scaleY(0.1); }
        }
        .avatar-blink {
          animation: blink 4s linear infinite;
        }

        @keyframes speak {
          0%, 100% { height: 2px; }
          25% { height: 12px; }
          50% { height: 4px; }
          75% { height: 14px; }
        }
        .avatar-speak {
          animation: speak 0.6s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
