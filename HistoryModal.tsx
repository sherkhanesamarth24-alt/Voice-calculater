import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Mic, 
  RotateCcw, 
  Calendar, 
  Clock, 
  Search,
  Sparkles,
  ArrowUpRight,
  AlertTriangle
} from 'lucide-react';
import { CalculationItem } from '../types';
import { formatResultNumber } from '../utils/mathParser';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: CalculationItem[];
  onSelectCalculation: (item: CalculationItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectCalculation,
  onDeleteItem,
  onClearAll,
}) => {
  const [filter, setFilter] = useState<'all' | 'voice' | 'smart'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'voice'
        ? item.isVoice || !!item.spokenQuery
        : item.category !== 'standard';

    const matchesSearch =
      !searchTerm ||
      item.expression.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.result.toString().includes(searchTerm) ||
      (item.spokenQuery && item.spokenQuery.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div 
        className="w-full max-w-md bg-[#0A0A0A] text-white rounded-3xl shadow-2xl border border-zinc-800 flex flex-col max-h-[85vh] overflow-hidden animate-scaleUp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-950/80 border border-indigo-800/80 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="history-title" className="font-semibold text-base text-white tracking-tight">
                Calculation History
              </h2>
              <p className="text-xs text-zinc-400">
                {history.length} {history.length === 1 ? 'record' : 'records'} stored locally
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {history.length > 0 && !confirmClear && (
              <button
                id="clear-all-history-btn"
                onClick={() => setConfirmClear(true)}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 px-2.5 py-1.5 rounded-xl transition border border-rose-900/40"
              >
                Clear All
              </button>
            )}
            <button
              id="close-history-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              aria-label="Close history"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clear confirmation banner */}
        {confirmClear && (
          <div className="p-3 bg-rose-950/60 border-b border-rose-900 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-rose-200 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Clear all calculation history?</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setConfirmClear(false)}
                className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 font-medium hover:bg-zinc-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAll();
                  setConfirmClear(false);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-500 transition"
              >
                Yes, Clear
              </button>
            </div>
          </div>
        )}

        {/* Filters and search */}
        {history.length > 0 && (
          <div className="p-3 bg-zinc-950 border-b border-zinc-900 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 bg-zinc-900 rounded-xl px-2.5 py-1.5 border border-zinc-800">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search expressions or results..."
                className="w-full text-xs bg-transparent text-white focus:outline-none placeholder:text-zinc-500"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="text-zinc-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {(['all', 'voice', 'smart'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition capitalize ${
                    filter === f
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'voice' ? 'Voice Only' : 'Smart Math'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* List of history items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500">
              <RotateCcw className="w-10 h-10 mb-2 opacity-40 text-zinc-600" />
              <p className="text-sm font-semibold text-zinc-300">
                {history.length === 0 ? 'No calculations yet' : 'No matching history found'}
              </p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                Speak or enter calculations to automatically build your history log.
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="group relative bg-zinc-900/70 hover:bg-zinc-800/90 rounded-2xl p-3 border border-zinc-800/80 transition cursor-pointer flex flex-col justify-between gap-1"
                onClick={() => {
                  onSelectCalculation(item);
                  onClose();
                }}
              >
                {/* Spoken query or category & timestamp */}
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                    {item.spokenQuery ? (
                      <span className="inline-flex items-center gap-1 text-indigo-300 font-medium truncate italic">
                        <Mic className="w-3 h-3 text-indigo-400 shrink-0" />
                        "{item.spokenQuery}"
                      </span>
                    ) : (
                      <span className="capitalize font-medium text-zinc-400">
                        {item.category.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono shrink-0 text-zinc-500">
                    <span>{formatDate(item.timestamp)}</span>
                    <span>•</span>
                    <span>{formatTime(item.timestamp)}</span>
                  </div>
                </div>

                {/* Expression & Result */}
                <div className="flex items-baseline justify-between mt-1">
                  <span className="font-mono text-xs sm:text-sm text-zinc-300 font-medium truncate max-w-[60%]">
                    {item.expression}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-indigo-400 font-semibold text-xs">=</span>
                    <span className="font-mono font-bold text-base sm:text-lg text-indigo-300">
                      {formatResultNumber(item.result)}
                    </span>
                  </div>
                </div>

                {/* Optional explanation */}
                {item.explanation && (
                  <div className="text-[11px] text-zinc-400 mt-0.5 truncate">
                    {item.explanation}
                  </div>
                )}

                {/* Delete button on hover / active */}
                <div className="flex items-center justify-between pt-1 border-t border-zinc-800 mt-1">
                  <span className="text-[10px] text-indigo-400 font-semibold group-hover:underline flex items-center gap-0.5">
                    Tap to use <ArrowUpRight className="w-3 h-3" />
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    className="p-1 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                    title="Delete item"
                    aria-label="Delete history item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0A0A0A] border-t border-zinc-900 text-center">
          <p className="text-[11px] text-zinc-400">
            Tap any calculation to load it back onto the calculator.
          </p>
        </div>
      </div>
    </div>
  );
};
