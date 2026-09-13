import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  History as HistoryIcon, 
  Sun, 
  Moon, 
  Globe, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { VoiceLanguage, LanguageOption } from '../types';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  selectedLanguage: VoiceLanguage;
  onChangeLanguage: (lang: VoiceLanguage) => void;
  onOpenHistory: () => void;
  onOpenHelp: () => void;
  historyCount: number;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'auto', name: 'Auto (Hinglish)', nativeName: 'Auto', flag: '🌐' },
  { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'en-IN', name: 'English (India)', nativeName: 'English (IN)', flag: '🇮🇳' },
  { code: 'en-US', name: 'English (US)', nativeName: 'English (US)', flag: '🇺🇸' },
];

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  isMuted,
  onToggleMute,
  selectedLanguage,
  onChangeLanguage,
  onOpenHistory,
  onOpenHelp,
  historyCount,
}) => {
  return (
    <header className="w-full flex items-center justify-between py-3 px-4 sm:px-6 bg-[#0A0A0A] border-b border-zinc-900 sticky top-0 z-30 transition-colors">
      {/* Brand logo & title */}
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white font-bold text-xs tracking-wider">
          <span>VC</span>
        </div>
        <div className="flex items-center space-x-2">
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-white">
            VocaCalc
          </h1>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-400 border border-indigo-800/80">
            Voice
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Language selector */}
        <div className="relative flex items-center">
          <label htmlFor="language-select" className="sr-only">Select Language</label>
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 text-xs font-semibold text-zinc-200 border border-zinc-800 hover:bg-zinc-800 transition">
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <select
              id="language-select"
              value={selectedLanguage}
              onChange={(e) => onChangeLanguage(e.target.value as VoiceLanguage)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer pr-1 text-zinc-200"
            >
              {LANGUAGES.map((lang) => (
                <option 
                  key={lang.code} 
                  value={lang.code}
                  className="bg-zinc-900 text-zinc-100"
                >
                  {lang.flag} {lang.nativeName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TTS Mute Toggle */}
        <button
          id="tts-mute-button"
          onClick={onToggleMute}
          title={isMuted ? "Voice Answer Muted (Click to Unmute)" : "Voice Answer Active (Click to Mute)"}
          className={`p-2 rounded-xl border transition-all ${
            isMuted 
              ? 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:bg-zinc-800' 
              : 'bg-indigo-950/70 text-indigo-400 border-indigo-800/70 hover:bg-indigo-900/60 shadow-sm'
          }`}
          aria-label={isMuted ? "Unmute voice answer" : "Mute voice answer"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Help / Voice Guide button */}
        <button
          id="help-guide-button"
          onClick={onOpenHelp}
          title="Voice Command Examples & Guide"
          className="p-2 rounded-xl bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800 transition"
          aria-label="View voice examples"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* History button */}
        <button
          id="history-drawer-button"
          onClick={onOpenHistory}
          title="Calculation History"
          className="relative p-2 rounded-xl bg-zinc-900 text-zinc-200 border border-zinc-800 hover:bg-zinc-800 transition"
          aria-label="View history"
        >
          <HistoryIcon className="w-4 h-4" />
          {historyCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm shadow-indigo-600/50">
              {historyCount > 99 ? '99+' : historyCount}
            </span>
          )}
        </button>

        {/* Dark/Light mode toggle */}
        <button
          id="theme-toggle-button"
          onClick={onToggleDarkMode}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2 rounded-xl bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800 transition"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>
      </div>
    </header>
  );
};
