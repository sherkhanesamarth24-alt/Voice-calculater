import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Mic, 
  Volume2, 
  CheckCircle2, 
  HelpCircle,
  Play
} from 'lucide-react';

interface QuickHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExample: (text: string) => void;
}

interface ExampleCategory {
  title: string;
  lang: string;
  examples: { text: string; output: string; desc: string }[];
}

const VOICE_EXAMPLES: ExampleCategory[] = [
  {
    title: 'Marathi (मराठी)',
    lang: 'MR',
    examples: [
      { text: '500 cha 20 percent', output: '100', desc: 'Percentage (टक्केवारी)' },
      { text: '1500 cha 18 percent kiti', output: '270', desc: 'GST / Tax calculation' },
      { text: '1000 madhun 15 percent kami kar', output: '850', desc: 'Discount (सूट)' },
      { text: 'pachshe cha 20 percent', output: '100', desc: 'Spoken numbers (पाचशे)' },
      { text: '25 cha varg', output: '625', desc: 'Square (वर्ग)' },
      { text: '144 che vargamul', output: '12', desc: 'Square root (वर्गमूळ)' },
      { text: '50 adhik 30 vajah 10', output: '70', desc: 'Basic arithmetic' },
    ],
  },
  {
    title: 'Hindi / Hinglish (हिंदी)',
    lang: 'HI',
    examples: [
      { text: '500 ka 20 percent', output: '100', desc: 'Percentage (प्रतिशत)' },
      { text: '1000 me se 15 percent ghatao', output: '850', desc: 'Discount (कम करो)' },
      { text: '5000 me 18 percent GST jodo', output: '5900', desc: 'GST addition' },
      { text: '25 ka square', output: '625', desc: 'Square (वर्ग)' },
      { text: '144 ka square root', output: '12', desc: 'Square root (वर्गमूल)' },
      { text: 'sau plus pachas guna do', output: '200', desc: 'Hindi numbers & BODMAS' },
    ],
  },
  {
    title: 'English Calculations',
    lang: 'EN',
    examples: [
      { text: '25 plus 35', output: '60', desc: 'Addition' },
      { text: '100 minus 27', output: '73', desc: 'Subtraction' },
      { text: '12 multiplied by 8', output: '96', desc: 'Multiplication' },
      { text: '144 divided by 12', output: '12', desc: 'Division' },
      { text: '2000 plus 500 minus 300', output: '2200', desc: 'Multi-operator expression' },
      { text: '18 percent GST on 5000', output: '5900', desc: 'GST calculation' },
      { text: 'bought for 200 sold for 250 profit', output: '50', desc: 'Profit & Loss calculation' },
    ],
  },
];

export const QuickHelpModal: React.FC<QuickHelpModalProps> = ({
  isOpen,
  onClose,
  onSelectExample,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div 
        className="w-full max-w-md bg-[#0A0A0A] text-white rounded-3xl shadow-2xl border border-zinc-800 flex flex-col max-h-[88vh] overflow-hidden animate-scaleUp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-950/80 border border-indigo-800/80 text-indigo-400">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h2 id="help-title" className="font-semibold text-base text-white tracking-tight">
                How to Speak Calculations
              </h2>
              <p className="text-xs text-zinc-400">
                Natural multilingual speech examples
              </p>
            </div>
          </div>

          <button
            id="close-help-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-900 bg-zinc-950 p-1.5 gap-1">
          {VOICE_EXAMPLES.map((cat, idx) => (
            <button
              key={cat.title}
              onClick={() => setActiveTab(idx)}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
                activeTab === idx
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* Examples List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin">
          <p className="text-xs text-zinc-400 mb-2">
            Tap any example below to immediately calculate it:
          </p>

          {VOICE_EXAMPLES[activeTab].examples.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onSelectExample(ex.text);
                onClose();
              }}
              className="w-full text-left bg-zinc-900/70 hover:bg-zinc-800/90 p-3 rounded-2xl border border-zinc-800/80 transition group flex items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-100 group-hover:text-indigo-300">
                  <Mic className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>"{ex.text}"</span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {ex.desc}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-xs font-bold text-indigo-300 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
                  = {ex.output}
                </span>
                <Play className="w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-400 transition" />
              </div>
            </button>
          ))}
        </div>

        {/* Tips Footer */}
        <div className="p-3.5 bg-zinc-950 border-t border-zinc-900 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            <strong className="text-zinc-200">Pro Tip:</strong> VocaCalc understands natural Indian phrasing like <em className="text-indigo-300">"madhun 15 percent kami kar"</em>, <em className="text-indigo-300">"500 cha 20 percent"</em>, and <em className="text-indigo-300">"18 percent GST on 5000"</em>.
          </p>
        </div>
      </div>
    </div>
  );
};
