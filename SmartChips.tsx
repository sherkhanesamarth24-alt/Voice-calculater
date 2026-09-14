import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { VoiceSuggestion } from '../types';

interface SmartChipsProps {
  onSelectSuggestion: (text: string) => void;
}

const SUGGESTIONS: VoiceSuggestion[] = [
  { id: '1', text: '500 cha 20 percent', lang: 'MR', category: 'Percent', desc: '500 cha 20%' },
  { id: '2', text: '1500 cha 18 percent kiti', lang: 'MR', category: 'GST/Tax', desc: '1500 cha 18%' },
  { id: '3', text: '1000 madhun 15 percent kami kar', lang: 'MR', category: 'Discount', desc: '1000 - 15%' },
  { id: '4', text: '25 plus 35', lang: 'EN', category: 'Add', desc: '25 + 35' },
  { id: '5', text: '144 divided by 12', lang: 'EN', category: 'Divide', desc: '144 ÷ 12' },
  { id: '6', text: '500 ka 20 percent', lang: 'HI', category: 'Percent', desc: '500 ka 20%' },
  { id: '7', text: '18 percent GST on 5000', lang: 'EN', category: 'GST', desc: '5000 + 18% GST' },
  { id: '8', text: '2000 plus 500 minus 300', lang: 'EN', category: 'Math', desc: '2000+500-300' },
  { id: '9', text: 'square root of 144', lang: 'EN', category: 'Root', desc: '√144' },
  { id: '10', text: '25 cha varg', lang: 'MR', category: 'Square', desc: '25²' },
  { id: '11', text: 'bought for 200 sold for 250 profit', lang: 'EN', category: 'P&L', desc: 'Cost/Sale' },
];

export const SmartChips: React.FC<SmartChipsProps> = ({ onSelectSuggestion }) => {
  return (
    <div className="w-full py-1">
      <div className="flex items-center justify-between px-1 mb-1.5 text-xs text-zinc-400 font-medium">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Try speaking:</span>
        </div>
        <span className="text-[10px] text-zinc-600 font-mono">
          Interactive Examples
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none select-none">
        {SUGGESTIONS.map((item) => (
          <button
            key={item.id}
            id={`voice-chip-${item.id}`}
            onClick={() => onSelectSuggestion(item.text)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 transition active:scale-95 shadow-sm group"
          >
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-indigo-400 group-hover:bg-indigo-950 group-hover:text-indigo-300 transition">
              {item.lang}
            </span>
            <span className="font-normal text-zinc-300 group-hover:text-white truncate max-w-[150px] sm:max-w-[200px]">
              "{item.text}"
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
