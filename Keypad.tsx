import React, { useState } from 'react';
import { 
  Delete as BackspaceIcon, 
  RotateCcw, 
  Percent, 
  Divide, 
  X, 
  Minus, 
  Plus, 
  Equal,
  ChevronDown,
  ChevronUp,
  Radical,
  Superscript,
  PlusCircle,
  Tag
} from 'lucide-react';

interface KeypadProps {
  onDigit: (digit: string) => void;
  onOperator: (op: string) => void;
  onEquals: () => void;
  onClear: () => void;
  onBackspace: () => void;
  onDecimal: () => void;
  onToggleSign: () => void;
  onSquareRoot: () => void;
  onSquare: () => void;
  onPercent: () => void;
  onQuickGST: (rate: number) => void;
  onQuickDiscount: (rate: number) => void;
}

export const Keypad: React.FC<KeypadProps> = ({
  onDigit,
  onOperator,
  onEquals,
  onClear,
  onBackspace,
  onDecimal,
  onToggleSign,
  onSquareRoot,
  onSquare,
  onPercent,
  onQuickGST,
  onQuickDiscount,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="w-full select-none mt-1">
      {/* Optional Advanced Smart Math Bar Toggle */}
      <div className="flex items-center justify-between mb-2 px-1">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-indigo-400 transition"
        >
          <span>{showAdvanced ? 'Hide Smart Tools' : 'Show Smart Tools (GST, √, x²)'}</span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
          Keypad
        </span>
      </div>

      {/* Advanced Quick Smart Row */}
      {showAdvanced && (
        <div className="grid grid-cols-4 gap-2 mb-2 animate-fadeIn">
          <button
            type="button"
            id="btn-sqrt"
            onClick={onSquareRoot}
            className="py-2.5 px-1 rounded-xl bg-zinc-900 text-indigo-300 text-xs font-semibold hover:bg-zinc-800 active:scale-95 transition border border-zinc-800 flex items-center justify-center gap-1"
          >
            <span>√x</span>
          </button>
          <button
            type="button"
            id="btn-square"
            onClick={onSquare}
            className="py-2.5 px-1 rounded-xl bg-zinc-900 text-indigo-300 text-xs font-semibold hover:bg-zinc-800 active:scale-95 transition border border-zinc-800 flex items-center justify-center gap-1"
          >
            <span>x²</span>
          </button>
          <button
            type="button"
            id="btn-gst18"
            onClick={() => onQuickGST(18)}
            className="py-2.5 px-1 rounded-xl bg-amber-950/40 text-amber-300 text-xs font-semibold hover:bg-amber-900/60 active:scale-95 transition border border-amber-800/60 flex items-center justify-center gap-1"
          >
            <span>+18% GST</span>
          </button>
          <button
            type="button"
            id="btn-disc15"
            onClick={() => onQuickDiscount(15)}
            className="py-2.5 px-1 rounded-xl bg-purple-950/40 text-purple-300 text-xs font-semibold hover:bg-purple-900/60 active:scale-95 transition border border-purple-800/60 flex items-center justify-center gap-1"
          >
            <span>-15% Off</span>
          </button>
        </div>
      )}

      {/* Main 4x5 Calculator Keypad Grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
        {/* ROW 1: C, Backspace, %, ÷ */}
        <button
          type="button"
          id="btn-clear"
          onClick={onClear}
          className="h-13 sm:h-15 rounded-2xl bg-zinc-900 text-indigo-400 font-semibold text-lg sm:text-xl hover:bg-zinc-800 active:scale-95 transition-colors border border-zinc-800/80 flex items-center justify-center"
        >
          C
        </button>

        <button
          type="button"
          id="btn-backspace"
          onClick={onBackspace}
          className="h-13 sm:h-15 rounded-2xl bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700 active:scale-95 transition-colors border border-zinc-700/80 flex items-center justify-center"
          aria-label="Backspace"
        >
          <BackspaceIcon className="w-5 h-5" />
        </button>

        <button
          type="button"
          id="btn-percent"
          onClick={onPercent}
          className="h-13 sm:h-15 rounded-2xl bg-zinc-900 text-indigo-400 font-semibold text-lg sm:text-xl hover:bg-zinc-800 active:scale-95 transition-colors border border-zinc-800/80 flex items-center justify-center"
        >
          %
        </button>

        <button
          type="button"
          id="btn-divide"
          onClick={() => onOperator('÷')}
          className="h-13 sm:h-15 rounded-2xl bg-zinc-900 text-indigo-400 font-semibold text-xl hover:bg-zinc-800 active:scale-95 transition-colors border border-zinc-800/80 flex items-center justify-center"
        >
          ÷
        </button>

        {/* ROW 2: 7, 8, 9, × */}
        <button
          type="button"
          id="btn-7"
          onClick={() => onDigit('7')}
          className="h-13 sm:h-15 rounded-2xl bg-zinc-900 text-zinc-100 font-medium text-xl sm:text-2xl hover:bg-zinc-800 active:scale-95 transition-colors border border-zinc-800/80 flex items-center justify-center font-mono"
        >
          7
        </button>

        <button
          type="button"
          id="btn-8"
          onClick={() => onDigit('8')}
          className="h-13 sm:h-15 rounded-2xl bg-zinc-900 text-zinc-100 font-medium text-xl sm:text-2xl hover:bg-zinc-800 active:scale-95 transition-colors border border-zinc-800/80 flex items-center justify-center font-mono"
        >
          8
        </button>

        <button
          type="button"
          id="btn-9"
          onClick={() => onDigit('9')}
          className="h-13 sm:h-15 rounded-2xl bg-zinc-900 text-zinc-100 font-medium text-xl sm:text-2xl hover:bg-zinc-800 active:scale-95 transition-colors border border-zinc-800/80 flex items-center justify-center font-mono"
        >
          9
        </button>

        <button
          type="button"
          id="btn-multiply"
          onClick={() => onOperator('×')}
          className="h-13 sm:h-15 rounded-2xl bg-zinc-900 text-indigo-400 font-semibold text-xl hover:bg-zinc-800 active:scale-95 transition-colors border border-zinc-800/80 flex items-center justify-center font-mono"
        >
          ×
        </button>

        {/* ROW 3: 4, 5, 6, − */}
        <button
          type="button"
          id="btn-4"
          onClick={() => onDigit('4')}
          className="h-13 sm:h-15 rounded-2xl bg-zinc-900 text-zinc-100 font-medium text-xl sm:text-2xl hover:bg-zinc-800 active:scale-95 transition-colors border border-zinc-800/80 flex items-center justify-center font-mono"
        >
          4
        </button>

        <button
          type="button"
          id="btn-5"
          onClick={() => onDigit('5')}
          className="h-13 sm:h-15 rounded-2xl bg-zinc-900 text-zinc-100 font-medium text-xl sm:text-2xl hover:bg-zinc-800 active:scale-95 transition-colors border border-zinc-800/80 flex items-center justify-center font-mono"
        >
          5
        </button>

        <button
          type="button"
          id="btn-6"
          onClick={() => onDigit('6')}
          className="h-13 sm:h-15 rounded-2xl bg-zinc-900 text-zinc-100 font-medium text-xl sm:text-2xl hover:bg-zinc-800 active:scale-95 transition-colors border border-zinc-800/80 flex items-center justify-center font-mono"
        >
          6
        </button>

        <button
          type="button"
          id="btn-minus"
          onClick={() => onOperator('−')}
          className="h-13 sm:h-15 rounded-2xl bg-zinc-900 text-indigo-400 font-semibold text-xl hover:bg-zinc-800 active:scale-95 transition-colors border border-zinc-800/80 flex items-center justify-center font-mono"
        >
          −
        </button>

        {/* ROW 4: 1, 2, 3, + */}
        <button
          type="button"
          id="btn-1"
          onClick={() => onDigit('1')}
          className="h-13 sm:h-15 rounded-2xl bg-zinc-900 text-zinc-100 font-medium text-xl sm:text-2xl hover:bg-zinc-800 active:scale-95 transition-colors border border-zinc-800/80 flex items-center justify-center font-mono"
        >
          1
        </button>

        <button
          type="button"
          id="btn-2"
          onClick={() => onDigit('2')}
          className="h-13 sm:h-15 rounded-2xl bg-zinc-900 text-zinc-100 font-medium text-xl sm:text-2xl hover:bg-zinc-800 active:scale-95 transition-colors border border-zinc-800/80 flex items-center justify-center font-mono"
        >
          2
        </button>

        <button
          type="button"
          id="btn-3"
          onClick={() => onDigit('3')}
          className="h-13 sm:h-15 rounded-2xl bg-zinc-900 text-zinc-100 font-medium text-xl sm:text-2xl hover:bg-zinc-800 active:scale-95 transition-colors border border-zinc-800/80 flex items-center justify-center font-mono"
        >
          3
        </button>

        <button
          type="button"
          id="btn-plus"
          onClick={() => onOperator('+')}
          className="h-13 sm:h-15 rounded-2xl bg-zinc-900 text-indigo-400 font-semibold text-xl hover:bg-zinc-800 active:scale-95 transition-colors border border-zinc-800/80 flex items-center justify-center font-mono"
        >
          +
        </button>

        {/* ROW 5: ±, 0, ., = */}
        <button
          type="button"
          id="btn-sign"
          onClick={onToggleSign}
          className="h-13 sm:h-15 rounded-2xl bg-zinc-900 text-zinc-300 font-medium text-lg sm:text-xl hover:bg-zinc-800 active:scale-95 transition-colors border border-zinc-800/80 flex items-center justify-center font-mono"
        >
          ±
        </button>

        <button
          type="button"
          id="btn-0"
          onClick={() => onDigit('0')}
          className="h-13 sm:h-15 rounded-2xl bg-zinc-900 text-zinc-100 font-medium text-xl sm:text-2xl hover:bg-zinc-800 active:scale-95 transition-colors border border-zinc-800/80 flex items-center justify-center font-mono"
        >
          0
        </button>

        <button
          type="button"
          id="btn-decimal"
          onClick={onDecimal}
          className="h-13 sm:h-15 rounded-2xl bg-zinc-900 text-zinc-100 font-bold text-xl hover:bg-zinc-800 active:scale-95 transition-colors border border-zinc-800/80 flex items-center justify-center font-mono"
        >
          .
        </button>

        <button
          type="button"
          id="btn-equals"
          onClick={onEquals}
          className="h-13 sm:h-15 rounded-2xl bg-indigo-600 text-white font-bold text-2xl hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-600/30 border border-indigo-500 flex items-center justify-center"
        >
          =
        </button>
      </div>
    </div>
  );
};
