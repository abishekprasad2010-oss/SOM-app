import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Repeat, 
  Sparkles, 
  Users, 
  User, 
  Clock, 
  Gauge,
  Loader2
} from 'lucide-react';
import { Question } from '../data/questions';

interface AudioPlayerBarProps {
  currentQuestion: Question | null;
  isPlaying: boolean;
  isLoading: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReplay: () => void;
  autoplay: boolean;
  setAutoplay: (val: boolean) => void;
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
  audioMode: 'single' | 'dialogue';
  setAudioMode: (mode: 'single' | 'dialogue') => void;
  answerDelay: number;
  setAnswerDelay: (sec: number) => void;
  totalQuestions: number;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentQuestion,
  isPlaying,
  isLoading,
  onPlayPause,
  onNext,
  onPrev,
  onReplay,
  autoplay,
  setAutoplay,
  playbackRate,
  setPlaybackRate,
  audioMode,
  setAudioMode,
  answerDelay,
  setAnswerDelay,
  totalQuestions,
  isMuted,
  setIsMuted,
}) => {
  if (!currentQuestion) return null;

  const speeds = [0.8, 1.0, 1.25, 1.5, 2.0];

  const cycleSpeed = () => {
    const currentIndex = speeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackRate(speeds[nextIndex]);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 shadow-2xl backdrop-blur-lg px-4 py-3 sm:py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
        
        {/* Left: Current Question Meta & Spoken Answer */}
        <div className="flex items-center gap-3 w-full md:w-1/3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
            ) : isPlaying ? (
              <div className="flex items-end gap-0.5 h-4 w-4">
                <span className="w-0.5 bg-orange-400 h-2.5 animate-wave-1"></span>
                <span className="w-0.5 bg-orange-400 h-4 animate-wave-2"></span>
                <span className="w-0.5 bg-orange-400 h-2 animate-wave-3"></span>
                <span className="w-0.5 bg-orange-400 h-3.5 animate-wave-4"></span>
              </div>
            ) : (
              <span className="text-xs font-bold text-orange-400">Q{currentQuestion.id}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-orange-400">
                Question {currentQuestion.id} of {totalQuestions}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">
                {currentQuestion.category.split(' ')[0]}
              </span>
            </div>
            <p className="text-xs text-white font-medium truncate mt-0.5" title={currentQuestion.question}>
              {currentQuestion.question}
            </p>
            <p className="text-[11px] text-emerald-400 font-semibold truncate">
              Ans: {currentQuestion.answer}
            </p>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 w-full md:w-auto">
          {/* Previous Question */}
          <button
            onClick={onPrev}
            title="Previous Question (Shift + Left)"
            disabled={currentQuestion.id <= 1}
            className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-lg hover:bg-slate-800"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Replay */}
          <button
            onClick={onReplay}
            title="Replay Current Question"
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800 hidden sm:block"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Big Play / Pause */}
          <button
            onClick={onPlayPause}
            disabled={isLoading}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all transform active:scale-95 shadow-lg ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/30'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          {/* Next Question */}
          <button
            onClick={onNext}
            title="Next Question (Shift + Right)"
            disabled={currentQuestion.id >= totalQuestions}
            className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-lg hover:bg-slate-800"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Autoplay Toggle */}
          <button
            onClick={() => setAutoplay(!autoplay)}
            title={autoplay ? 'Autoplay Marathon: ON (plays sequentially)' : 'Autoplay Marathon: OFF'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              autoplay
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Autoplay</span>
          </button>
        </div>

        {/* Right: Audio Settings (Mode, Speed, Pause Delay, Mute) */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 w-full md:w-1/3">
          
          {/* Dual-Speaker vs Single Speaker Mode Toggle */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-xs">
            <button
              onClick={() => setAudioMode('single')}
              title="Single Speaker (Professor Narrator)"
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
                audioMode === 'single'
                  ? 'bg-orange-500 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Solo</span>
            </button>
            <button
              onClick={() => setAudioMode('dialogue')}
              title="Dialogue Mode (Professor & Student with natural dialogue bursts)"
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
                audioMode === 'dialogue'
                  ? 'bg-orange-500 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Dialogue</span>
            </button>
          </div>

          {/* Speed Selector */}
          <button
            onClick={cycleSpeed}
            title="Playback Speed"
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 border border-slate-700/60 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
          >
            <Gauge className="w-3.5 h-3.5 text-orange-400" />
            <span>{playbackRate}x</span>
          </button>

          {/* Answer Delay in Seconds */}
          <div className="hidden lg:flex items-center gap-1 text-xs text-slate-400 bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-700/50">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={answerDelay}
              onChange={(e) => setAnswerDelay(Number(e.target.value))}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer text-xs"
              title="Recall pause between question & answer"
            >
              <option value={0} className="bg-slate-900">0s pause</option>
              <option value={1} className="bg-slate-900">1s pause</option>
              <option value={2} className="bg-slate-900">2s recall</option>
              <option value={3} className="bg-slate-900">3s recall</option>
              <option value={5} className="bg-slate-900">5s recall</option>
            </select>
          </div>

          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Unmute' : 'Mute'}
            className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

        </div>

      </div>
    </div>
  );
};
