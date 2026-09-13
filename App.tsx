/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { DisplayScreen } from './components/DisplayScreen';
import { VoiceMicButton } from './components/VoiceMicButton';
import { SmartChips } from './components/SmartChips';
import { Keypad } from './components/Keypad';
import { HistoryModal } from './components/HistoryModal';
import { QuickHelpModal } from './components/QuickHelpModal';
import { 
  VoiceState, 
  VoiceLanguage, 
  CalculationItem, 
  CalculationCategory,
  ParseResult
} from './types';
import { 
  parseNaturalLanguageCalculation, 
  evaluateMathExpression 
} from './utils/mathParser';
import { 
  isSpeechRecognitionSupported, 
  speakAnswer, 
  playSoundEffect, 
  triggerHaptic 
} from './utils/speech';

export default function App() {
  // Theme & Preferences State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('vocacalc_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem('vocacalc_muted');
    return saved ? saved === 'true' : false;
  });

  const [selectedLanguage, setSelectedLanguage] = useState<VoiceLanguage>(() => {
    const saved = localStorage.getItem('vocacalc_lang') as VoiceLanguage;
    return saved || 'auto';
  });

  // Calculator Active State
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<number | string | null>(null);
  const [spokenQuery, setSpokenQuery] = useState<string>('');
  const [explanation, setExplanation] = useState<string | null>(null);
  const [category, setCategory] = useState<CalculationCategory>('standard');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Voice Interaction State
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');

  // History State
  const [history, setHistory] = useState<CalculationItem[]>(() => {
    try {
      const saved = localStorage.getItem('vocacalc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal Dialogs
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Audio / Speech Recognition Refs
  const recognitionRef = useRef<any>(null);
  const lastSpokenAnswerRef = useRef<string>('');

  // Apply dark mode class to root HTML
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vocacalc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vocacalc_theme', 'light');
    }
  }, [darkMode]);

  // Persist Mute Preference
  useEffect(() => {
    localStorage.setItem('vocacalc_muted', isMuted.toString());
  }, [isMuted]);

  // Persist Selected Language
  useEffect(() => {
    localStorage.setItem('vocacalc_lang', selectedLanguage);
  }, [selectedLanguage]);

  // Persist Calculation History
  useEffect(() => {
    try {
      localStorage.setItem('vocacalc_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to persist history to localStorage', e);
    }
  }, [history]);

  // Add calculation record to history
  const addToHistory = useCallback((item: Omit<CalculationItem, 'id' | 'timestamp'>) => {
    const newItem: CalculationItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 99)]); // Store up to 100 recent calculations
  }, []);

  // Process Speech Calculation (Local Parser + Gemini API fallback)
  const processSpokenInput = useCallback(async (spokenText: string) => {
    if (!spokenText.trim()) {
      setVoiceState('idle');
      setIsListening(false);
      return;
    }

    setVoiceState('processing');
    setSpokenQuery(spokenText);
    setErrorMessage(null);

    // 1. Try ultra-fast, offline local math parser first
    const localResult = parseNaturalLanguageCalculation(spokenText);

    if (localResult.success) {
      // Local parsing succeeded!
      setExpression(localResult.expression);
      setResult(localResult.result);
      setExplanation(localResult.explanation || null);
      setCategory(localResult.category || 'voice');
      setVoiceState('speaking');
      lastSpokenAnswerRef.current = localResult.answerText;

      // Play chime & speak
      playSoundEffect('success', true);
      triggerHaptic('medium');

      speakAnswer(localResult.answerText, {
        isMuted,
        lang: selectedLanguage === 'auto' ? 'en-IN' : selectedLanguage,
        onEnd: () => setVoiceState('idle'),
      });

      addToHistory({
        expression: localResult.expression,
        result: localResult.result,
        spokenQuery: spokenText,
        category: localResult.category || 'voice',
        explanation: localResult.explanation,
        isVoice: true,
      });

      return;
    }

    // 2. If local parsing couldn't parse the complex sentence, try server-side Gemini API
    try {
      const response = await fetch('/api/parse-voice-calculation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: spokenText,
          language: selectedLanguage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.result !== undefined) {
          setExpression(data.expression || spokenText);
          setResult(data.result);
          setExplanation(data.explanation || null);
          setCategory(data.category || 'voice');
          setVoiceState('speaking');
          lastSpokenAnswerRef.current = data.spokenAnswer || `The answer is ${data.result}.`;

          playSoundEffect('success', true);
          triggerHaptic('medium');

          speakAnswer(lastSpokenAnswerRef.current, {
            isMuted,
            lang: selectedLanguage === 'auto' ? 'en-IN' : selectedLanguage,
            onEnd: () => setVoiceState('idle'),
          });

          addToHistory({
            expression: data.expression || spokenText,
            result: data.result,
            spokenQuery: spokenText,
            category: data.category || 'voice',
            explanation: data.explanation,
            isVoice: true,
          });
          return;
        }
      }
    } catch (err) {
      console.warn('Server AI parser failed, falling back', err);
    }

    // 3. If neither parser could understand, show required friendly error
    setVoiceState('error');
    setErrorMessage("Sorry, I couldn't understand that. Please try again.");
    playSoundEffect('error', true);
    triggerHaptic('heavy');
    setTimeout(() => {
      setVoiceState('idle');
    }, 4000);
  }, [isMuted, selectedLanguage, addToHistory]);

  // Start or Stop Microphone Voice Recognition
  const toggleListening = useCallback(() => {
    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      setVoiceState('idle');
      return;
    }

    // Check browser speech support
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setErrorMessage("Speech recognition is not supported in this browser. Please use Google Chrome or Edge.");
      playSoundEffect('error', true);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;

      // Select recognition language
      if (selectedLanguage === 'mr-IN') {
        recognition.lang = 'mr-IN';
      } else if (selectedLanguage === 'hi-IN') {
        recognition.lang = 'hi-IN';
      } else if (selectedLanguage === 'en-US') {
        recognition.lang = 'en-US';
      } else {
        // 'auto' or 'en-IN' recognizes Indian English & Hinglish terms
        recognition.lang = 'en-IN';
      }

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceState('listening');
        setLiveTranscript('');
        setErrorMessage(null);
        playSoundEffect('mic_start', true);
        triggerHaptic('light');
      };

      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript;
          } else {
            interimText += event.results[i][0].transcript;
          }
        }

        const currentSpeech = finalText || interimText;
        setLiveTranscript(currentSpeech);
        if (currentSpeech) {
          setSpokenQuery(currentSpeech);
        }

        if (finalText) {
          setIsListening(false);
          processSpokenInput(finalText);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          setVoiceState('idle');
          setErrorMessage("No speech detected. Please tap and speak clearly.");
        } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setVoiceState('error');
          setErrorMessage("Microphone access was denied. Please allow microphone permission in browser.");
        } else {
          setVoiceState('idle');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setVoiceState('idle');
      setErrorMessage("Could not access microphone. Please try again.");
    }
  }, [isListening, selectedLanguage, processSpokenInput]);

  // Keypad Handlers
  const handleDigit = (digit: string) => {
    playSoundEffect('tap', true);
    triggerHaptic('light');
    setErrorMessage(null);

    // If previous action computed a result and user types a digit, start fresh
    if (result !== null && !expression.match(/[+\-×÷]$/)) {
      setExpression(digit);
      setResult(null);
      setSpokenQuery('');
      setExplanation(null);
      return;
    }

    setExpression((prev) => prev + digit);
  };

  const handleOperator = (op: string) => {
    playSoundEffect('tap', true);
    triggerHaptic('light');
    setErrorMessage(null);

    // If there is a computed result, continue calculation with the result
    if (result !== null && !expression) {
      setExpression(`${result} ${op} `);
      setResult(null);
      return;
    }

    if (!expression && result !== null) {
      setExpression(`${result} ${op} `);
      setResult(null);
      return;
    }

    if (!expression) {
      return;
    }

    // If ends with an operator, replace it
    const trimmed = expression.trim();
    if (/[+−\-×÷]$/.test(trimmed)) {
      setExpression(trimmed.slice(0, -1).trim() + ` ${op} `);
    } else {
      setExpression((prev) => `${prev} ${op} `);
    }
  };

  const handleDecimal = () => {
    playSoundEffect('tap', true);
    triggerHaptic('light');
    setErrorMessage(null);

    if (result !== null && !expression) {
      setExpression('0.');
      setResult(null);
      return;
    }

    // Check if the current number already has a decimal
    const tokens = expression.split(/[\s+−\-×÷]+/);
    const lastToken = tokens[tokens.length - 1];
    if (lastToken.includes('.')) return;

    if (!expression || expression.endsWith(' ')) {
      setExpression((prev) => prev + '0.');
    } else {
      setExpression((prev) => prev + '.');
    }
  };

  const handleToggleSign = () => {
    playSoundEffect('tap', true);
    triggerHaptic('light');
    if (result !== null) {
      const toggled = -Number(result);
      setResult(toggled);
      setExpression(toggled.toString());
      return;
    }
    if (!expression) return;
    try {
      const val = evaluateMathExpression(expression);
      const toggled = -val;
      setExpression(toggled.toString());
    } catch {}
  };

  const handleBackspace = () => {
    playSoundEffect('delete', true);
    triggerHaptic('light');
    setErrorMessage(null);

    if (expression.length > 0) {
      // If ends with space, remove operator padding
      if (expression.endsWith(' ')) {
        setExpression((prev) => prev.slice(0, -3));
      } else {
        setExpression((prev) => prev.slice(0, -1));
      }
    }
  };

  const handleClear = () => {
    playSoundEffect('clear', true);
    triggerHaptic('medium');
    setExpression('');
    setResult(null);
    setSpokenQuery('');
    setExplanation(null);
    setCategory('standard');
    setErrorMessage(null);
    setVoiceState('idle');
  };

  const handleEquals = () => {
    if (!expression.trim()) return;

    try {
      playSoundEffect('tap', true);
      const evaluated = evaluateMathExpression(expression);
      setResult(evaluated);
      setCategory('standard');
      setExplanation(`${expression} = ${evaluated}`);
      setErrorMessage(null);

      const answerText = `The answer is ${evaluated}.`;
      lastSpokenAnswerRef.current = answerText;

      playSoundEffect('success', true);
      triggerHaptic('medium');

      speakAnswer(answerText, {
        isMuted,
        lang: selectedLanguage === 'auto' ? 'en-IN' : selectedLanguage,
      });

      addToHistory({
        expression,
        result: evaluated,
        category: 'standard',
        explanation: `${expression} = ${evaluated}`,
        isVoice: false,
      });
    } catch (err: any) {
      setErrorMessage('Invalid Expression');
      playSoundEffect('error', true);
    }
  };

  const handlePercent = () => {
    playSoundEffect('tap', true);
    triggerHaptic('light');
    if (!expression) return;
    setExpression((prev) => prev + '%');
  };

  const handleSquareRoot = () => {
    playSoundEffect('tap', true);
    triggerHaptic('light');
    const baseVal = result !== null ? Number(result) : expression ? Number(expression) : null;
    if (baseVal !== null && !isNaN(baseVal)) {
      if (baseVal < 0) {
        setErrorMessage('Cannot compute square root of negative number');
        playSoundEffect('error', true);
        return;
      }
      const res = Math.round(Math.sqrt(baseVal) * 1000000) / 1000000;
      setExpression(`√(${baseVal})`);
      setResult(res);
      setCategory('power_root');
      setExplanation(`√${baseVal} = ${res}`);
      lastSpokenAnswerRef.current = `The answer is ${res}.`;

      speakAnswer(lastSpokenAnswerRef.current, {
        isMuted,
        lang: selectedLanguage === 'auto' ? 'en-IN' : selectedLanguage,
      });

      addToHistory({
        expression: `√(${baseVal})`,
        result: res,
        category: 'power_root',
        explanation: `√${baseVal} = ${res}`,
        isVoice: false,
      });
    }
  };

  const handleSquare = () => {
    playSoundEffect('tap', true);
    triggerHaptic('light');
    const baseVal = result !== null ? Number(result) : expression ? Number(expression) : null;
    if (baseVal !== null && !isNaN(baseVal)) {
      const res = baseVal * baseVal;
      setExpression(`${baseVal}²`);
      setResult(res);
      setCategory('power_root');
      setExplanation(`${baseVal}² = ${res}`);
      lastSpokenAnswerRef.current = `The answer is ${res}.`;

      speakAnswer(lastSpokenAnswerRef.current, {
        isMuted,
        lang: selectedLanguage === 'auto' ? 'en-IN' : selectedLanguage,
      });

      addToHistory({
        expression: `${baseVal}²`,
        result: res,
        category: 'power_root',
        explanation: `${baseVal}² = ${res}`,
        isVoice: false,
      });
    }
  };

  const handleQuickGST = (rate: number) => {
    playSoundEffect('tap', true);
    triggerHaptic('light');
    const baseVal = result !== null ? Number(result) : expression ? Number(expression) : 1000;
    const gstAmount = (baseVal * rate) / 100;
    const total = baseVal + gstAmount;
    setExpression(`${baseVal} + ${rate}% GST`);
    setResult(total);
    setCategory('gst');
    setExplanation(`Base: ${baseVal} + GST (${rate}%: ${gstAmount}) = ${total}`);
    lastSpokenAnswerRef.current = `The answer is ${total}. Total with ${rate} percent GST is ${total}.`;

    speakAnswer(lastSpokenAnswerRef.current, {
      isMuted,
      lang: selectedLanguage === 'auto' ? 'en-IN' : selectedLanguage,
    });

    addToHistory({
      expression: `${baseVal} + ${rate}% GST`,
      result: total,
      category: 'gst',
      explanation: `Base: ${baseVal} + GST (${rate}%: ${gstAmount}) = ${total}`,
      isVoice: false,
    });
  };

  const handleQuickDiscount = (rate: number) => {
    playSoundEffect('tap', true);
    triggerHaptic('light');
    const baseVal = result !== null ? Number(result) : expression ? Number(expression) : 1000;
    const discountAmount = (baseVal * rate) / 100;
    const total = baseVal - discountAmount;
    setExpression(`${baseVal} - ${rate}%`);
    setResult(total);
    setCategory('discount');
    setExplanation(`${baseVal} minus ${rate}% discount (${discountAmount}) = ${total}`);
    lastSpokenAnswerRef.current = `The answer is ${total}. After ${rate} percent discount, final amount is ${total}.`;

    speakAnswer(lastSpokenAnswerRef.current, {
      isMuted,
      lang: selectedLanguage === 'auto' ? 'en-IN' : selectedLanguage,
    });

    addToHistory({
      expression: `${baseVal} - ${rate}%`,
      result: total,
      category: 'discount',
      explanation: `${baseVal} minus ${rate}% discount (${discountAmount}) = ${total}`,
      isVoice: false,
    });
  };

  // Physical Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when modals are open
      if (isHistoryOpen || isHelpOpen) return;

      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === '+') {
        handleOperator('+');
      } else if (e.key === '-') {
        handleOperator('−');
      } else if (e.key === '*' || e.key === 'x') {
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === '.' || e.key === ',') {
        handleDecimal();
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        handleClear();
      } else if (e.key === '%') {
        handlePercent();
      } else if (e.key === 'v' || e.key === 'V') {
        // 'v' hotkey for microphone
        if (e.ctrlKey || e.metaKey) return;
        toggleListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHistoryOpen, isHelpOpen, expression, result]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-start transition-colors duration-200">
      {/* Mobile-first centered container */}
      <main className="w-full max-w-md min-h-screen sm:min-h-0 sm:my-4 sm:rounded-3xl sm:border sm:border-zinc-800 bg-[#0A0A0A] shadow-2xl shadow-black/80 flex flex-col justify-between overflow-hidden">
        {/* Top Header */}
        <Header
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          isMuted={isMuted}
          onToggleMute={() => {
            setIsMuted(!isMuted);
            playSoundEffect('tap', true);
          }}
          selectedLanguage={selectedLanguage}
          onChangeLanguage={(lang) => setSelectedLanguage(lang)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          historyCount={history.length}
        />

        {/* Calculator Main Section */}
        <div className="flex-1 flex flex-col justify-between px-3 sm:px-4 py-2 sm:py-3 gap-2 sm:gap-3">
          {/* Top Calculation Display */}
          <DisplayScreen
            expression={expression}
            result={result}
            spokenQuery={spokenQuery}
            voiceState={voiceState}
            errorMessage={errorMessage}
            explanation={explanation}
            category={category}
            onReplayAudio={() => {
              if (lastSpokenAnswerRef.current) {
                speakAnswer(lastSpokenAnswerRef.current, {
                  isMuted: false,
                  lang: selectedLanguage === 'auto' ? 'en-IN' : selectedLanguage,
                });
              }
            }}
            onClear={handleClear}
            onDeleteChar={handleBackspace}
          />

          {/* Center Voice Microphone (The Primary Focus) */}
          <VoiceMicButton
            voiceState={voiceState}
            isListening={isListening}
            onToggleListen={toggleListening}
            statusText={
              isListening
                ? liveTranscript
                  ? `"${liveTranscript}"`
                  : 'Listening... Speak your calculation'
                : undefined
            }
            errorMessage={errorMessage}
          />

          {/* Quick Voice Suggestions Carousel */}
          <SmartChips
            onSelectSuggestion={(phrase) => {
              setSpokenQuery(phrase);
              processSpokenInput(phrase);
            }}
          />

          {/* Standard & Smart Calculator Keypad */}
          <Keypad
            onDigit={handleDigit}
            onOperator={handleOperator}
            onEquals={handleEquals}
            onClear={handleClear}
            onBackspace={handleBackspace}
            onDecimal={handleDecimal}
            onToggleSign={handleToggleSign}
            onSquareRoot={handleSquareRoot}
            onSquare={handleSquare}
            onPercent={handlePercent}
            onQuickGST={handleQuickGST}
            onQuickDiscount={handleQuickDiscount}
          />
        </div>

        {/* Footer Status Indicators */}
        <div className="border-t border-zinc-900 flex justify-center items-center space-x-8 py-2.5 px-4 bg-[#080808]">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Speech Engine Active</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">VocaCalc Core</span>
          </div>
        </div>
      </main>

      {/* History Drawer / Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectCalculation={(item) => {
          setExpression(item.expression);
          setResult(item.result);
          setSpokenQuery(item.spokenQuery || '');
          setExplanation(item.explanation || null);
          setCategory(item.category);
          setErrorMessage(null);
        }}
        onDeleteItem={(id) => {
          setHistory((prev) => prev.filter((h) => h.id !== id));
          playSoundEffect('delete', true);
        }}
        onClearAll={() => {
          setHistory([]);
          playSoundEffect('clear', true);
        }}
      />

      {/* Quick Voice Guide & Help Modal */}
      <QuickHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onSelectExample={(phrase) => {
          setSpokenQuery(phrase);
          processSpokenInput(phrase);
        }}
      />
    </div>
  );
}
