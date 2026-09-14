import React from 'react';
import { Mic, MicOff, Loader2, Sparkles } from 'lucide-react';
import { VoiceState } from '../types';

interface VoiceMicButtonProps {
  voiceState: VoiceState;
  isListening: boolean;
  onToggleListen: () => void;
  statusText?: string;
  errorMessage?: string | null;
}

export const VoiceMicButton: React.FC<VoiceMicButtonProps> = ({
  voiceState,
  isListening,
  onToggleListen,
  statusText,
  errorMessage,
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-3 select-none space-y-4">
      {/* Status Capsule Indicator */}
      <div className="flex items-center">
        {isListening ? (
          <div className="flex items-center space-x-2.5 bg-zinc-900/80 border border-zinc-800 px-4 py-1.5 rounded-full shadow-inner">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-xs sm:text-sm font-medium text-zinc-300 tracking-wider uppercase">
              {statusText || "Listening..."}
            </span>
          </div>
        ) : voiceState === 'processing' ? (
          <div className="flex items-center space-x-2 bg-zinc-900/80 border border-zinc-800 px-4 py-1.5 rounded-full">
            <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            <span className="text-xs sm:text-sm font-medium text-indigo-300 tracking-wide uppercase">
              Calculating...
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 bg-zinc-900/40 border border-zinc-800/80 px-3.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span className="text-xs font-medium text-zinc-400 tracking-wider uppercase">
              Voice Ready
            </span>
          </div>
        )}
      </div>

      {/* Microphone Main Focus Container */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing Ripple Rings when Listening */}
        {isListening && (
          <>
            <div className="absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-indigo-600/20 animate-ping pointer-events-none" />
            <div className="absolute w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-indigo-500/10 animate-pulse delay-150 pointer-events-none" />
            <div className="absolute w-52 h-52 sm:w-56 sm:h-56 rounded-full border border-indigo-500/20 animate-spin opacity-40 pointer-events-none" />
          </>
        )}

        {/* The Microphone Button */}
        <button
          id="main-voice-mic-button"
          onClick={onToggleListen}
          className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 shadow-[0_0_50px_rgba(79,70,229,0.3)] border-4 border-indigo-500/30 hover:scale-105 ${
            isListening
              ? 'bg-indigo-600 text-white scale-105 border-indigo-400 ring-4 ring-indigo-500/40'
              : voiceState === 'processing'
              ? 'bg-indigo-700 text-white border-indigo-400'
              : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }`}
          aria-label={isListening ? "Stop listening" : "Tap the mic and speak your calculation"}
        >
          {isListening ? (
            <Mic className="w-12 h-12 sm:w-14 sm:h-14 animate-pulse" />
          ) : voiceState === 'processing' ? (
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin" />
          ) : (
            <Mic className="w-12 h-12 sm:w-14 sm:h-14" />
          )}
        </button>
      </div>

      {/* Primary Instruction / Subtext */}
      <div className="flex flex-col items-center text-center space-y-0.5">
        <p className="text-zinc-400 text-sm font-medium">
          Tap the mic and speak your calculation
        </p>
        <span className="text-[11px] text-zinc-600 font-normal">
          Supports English, मराठी, हिंदी & Hinglish
        </span>
      </div>
    </div>
  );
};
