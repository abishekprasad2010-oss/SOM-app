import React from 'react';
import { Volume2, Sparkles, BookOpen, CheckCircle2, Bookmark, GraduationCap, Headphones, FileDown, Layers } from 'lucide-react';

export type TabType = 'script' | 'quiz' | 'formulas' | 'playlist' | 'export';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  voice: string;
  setVoice: (voice: string) => void;
  bookmarkedCount: number;
  totalQuestions: number;
  completedQuizCount: number;
  isPlaying: boolean;
  currentQNum: number;
}

const VOICES = [
  { id: 'Kore', label: 'Kore (Warm & Articulate)', desc: 'Female, academic' },
  { id: 'Fenrir', label: 'Fenrir (Authoritative)', desc: 'Deep baritone' },
  { id: 'Puck', label: 'Puck (Dynamic)', desc: 'Energetic tutor' },
  { id: 'Zephyr', label: 'Zephyr (Calm)', desc: 'Paced listener' },
  { id: 'Charon', label: 'Charon (Steady)', desc: 'Clear narrator' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  voice,
  setVoice,
  bookmarkedCount,
  totalQuestions,
  completedQuizCount,
  isPlaying,
  currentQNum,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-0.5 shadow-lg shadow-orange-500/20 flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
              </div>
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  SOM AudioMaster
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  Gemini 3.8 Flash TTS
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate hidden sm:block">
                Strength of Materials • 100 1-Mark Audio Revision Script & Exam Studio
              </p>
            </div>
          </div>

          {/* Quick Stats & Audio Engine Pill */}
          <div className="hidden lg:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg text-slate-300">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Questions: <strong className="text-white">100/100</strong></span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg text-slate-300">
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Saved: <strong className="text-amber-400">{bookmarkedCount}</strong></span>
            </div>

            {/* Voice Quick Switcher */}
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-2.5 py-1.5 rounded-lg">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Voice:</span>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
              >
                {VOICES.map((v) => (
                  <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Audio Playing Indicator Mini */}
          {isPlaying && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs text-amber-400 animate-pulse">
              <div className="flex items-end gap-0.5 h-3 w-4">
                <span className="w-0.5 bg-amber-400 h-2 animate-wave-1"></span>
                <span className="w-0.5 bg-amber-400 h-3 animate-wave-2"></span>
                <span className="w-0.5 bg-amber-400 h-1.5 animate-wave-3"></span>
                <span className="w-0.5 bg-amber-400 h-2.5 animate-wave-4"></span>
              </div>
              <span className="font-semibold">Playing Q{currentQNum}</span>
            </div>
          )}

        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-2 border-t border-slate-800/80 overflow-x-auto py-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'script'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>100 Audio Script</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'quiz'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Interactive Quiz</span>
            {completedQuizCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-white/20 text-white rounded-full text-[10px]">
                {completedQuizCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('formulas')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'formulas'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>High-Yield Formulas</span>
          </button>

          <button
            onClick={() => setActiveTab('playlist')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'playlist'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Marathon Player</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'export'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileDown className="w-4 h-4" />
            <span>Export Script</span>
          </button>
        </div>

      </div>
    </header>
  );
};
