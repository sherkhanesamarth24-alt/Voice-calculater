import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Volume2, 
  Mic, 
  AlertCircle, 
  Sparkles,
  Delete,
  CornerDownLeft
} from 'lucide-react';
import { VoiceState, CalculationCategory } from '../types';
import { formatResultNumber } from '../utils/mathParser';

interface DisplayScreenProps {
  expression: string;
  result: number | string | null;
  spokenQuery: string;
  voiceState: VoiceState;
  errorMessage: string | null;
  explanation: string | null;
  category?: CalculationCategory;
  onReplayAudio: () => void;
  onClear: () => void;
  onDeleteChar: () => void;
}

export const DisplayScreen: React.FC<DisplayScreenProps> = ({
  expression,
  result,
  spokenQuery,
  voiceState,
  errorMessage,
  explanation,
  category,
  onReplayAudio,
  onClear,
  onDeleteChar,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (result !== null && result !== undefined) {
      navigator.clipboard.writeText(result.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getCategoryBadge = () => {
    if (!category || category === 'standard') return null;
    const labels: Record<string, { label: string; bg: string }> = {
      voice: { label: 'Voice Math', bg: 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/80' },
      percentage: { label: 'Percentage', bg: 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/80' },
      discount: { label: 'Discount', bg: 'bg-purple-950/80 text-purple-300 border border-purple-800/80' },
      gst: { label: 'GST Tax', bg: 'bg-amber-950/80 text-amber-300 border border-amber-800/80' },
      profit_loss: { label: 'Profit & Loss', bg: 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80' },
      power_root: { label: 'Power & Root', bg: 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/80' },
    };
    const config = labels[category] || { label: category, bg: 'bg-zinc-900 text-zinc-300 border border-zinc-800' };
    return (
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.bg}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="w-full bg-[#0d0d0d] rounded-3xl p-4 sm:p-6 shadow-2xl border border-zinc-800/90 flex flex-col justify-between min-h-[160px] sm:min-h-[180px] transition-all">
      {/* Top row: spoken query or category badge */}
      <div className="flex items-center justify-between gap-2 min-h-[28px]">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {spokenQuery ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-medium truncate max-w-full">
              <Mic className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate italic text-zinc-300">"{spokenQuery}"</span>
            </div>
          ) : getCategoryBadge()}
        </div>

        {/* Action icons (Clear & Delete when typing manually) */}
        {(expression || result !== null) && (
          <div className="flex items-center gap-1 shrink-0">
            {result !== null && (
              <>
                <button
                  id="replay-speech-btn"
                  onClick={onReplayAudio}
                  title="Speak Answer Again"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 transition"
                  aria-label="Replay audio answer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  id="copy-result-btn"
                  onClick={handleCopy}
                  title={copied ? "Copied!" : "Copy Result"}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 transition"
                  aria-label="Copy result"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Center: Expression / Formula line */}
      <div className="my-1 text-right overflow-x-auto scrollbar-none py-1">
        <div className="font-mono text-zinc-400 text-base sm:text-xl font-light tracking-wide flex items-center justify-end gap-1 min-h-[28px]">
          {expression ? (
            <span>{expression}</span>
          ) : (
            <span className="text-zinc-600 select-none">0</span>
          )}
        </div>
      </div>

      {/* Main Result Display */}
      <div className="text-right overflow-x-auto scrollbar-none">
        {errorMessage ? (
          <div className="flex items-center justify-end gap-2 text-rose-400 py-1">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{errorMessage}</span>
          </div>
        ) : (
          <div 
            id="calculation-result-display" 
            className="font-mono font-bold tracking-tighter text-indigo-400 transition-all select-all flex items-baseline justify-end gap-1.5"
          >
            {result !== null ? (
              <>
                <span className="text-indigo-400 text-xl font-normal select-none mr-1">=</span>
                <span className="text-4xl sm:text-6xl lg:text-7xl">
                  {formatResultNumber(result)}
                </span>
              </>
            ) : (
              <span className="text-4xl sm:text-6xl lg:text-7xl text-zinc-700">
                0
              </span>
            )}
          </div>
        )}
      </div>

      {/* Explanation or Smart breakdown */}
      {explanation && !errorMessage && (
        <div className="mt-2 pt-2 border-t border-zinc-800/80 text-xs text-zinc-400 flex items-center justify-between">
          <span className="truncate">{explanation}</span>
          <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider shrink-0 ml-2">
            Verified
          </span>
        </div>
      )}
    </div>
  );
};
