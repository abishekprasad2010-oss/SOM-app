import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Sparkles, 
  Bookmark, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  BookOpen, 
  HelpCircle,
  Loader2,
  Volume2
} from 'lucide-react';
import { Question } from '../data/questions';

interface QuestionCardProps {
  question: Question;
  isCurrentPlaying: boolean;
  isLoadingAudio: boolean;
  onPlay: (q: Question) => void;
  onExplain: (q: Question) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: number) => void;
  revealedByDefault: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isCurrentPlaying,
  isLoadingAudio,
  onPlay,
  onExplain,
  isBookmarked,
  onToggleBookmark,
  revealedByDefault,
}) => {
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(revealedByDefault);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);

  // Sync when master reveal toggle changes
  React.useEffect(() => {
    setIsAnswerRevealed(revealedByDefault);
  }, [revealedByDefault]);

  const handleOptionClick = (opt: string) => {
    setSelectedQuizOption(opt);
    setIsAnswerRevealed(true);
  };

  return (
    <div 
      className={`rounded-2xl border transition-all duration-200 relative overflow-hidden ${
        isCurrentPlaying
          ? 'bg-gradient-to-b from-slate-800/90 to-slate-900 border-orange-500/60 shadow-xl shadow-orange-500/10 ring-1 ring-orange-500/30'
          : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700/80'
      }`}
    >
      {/* Top playing accent bar */}
      {isCurrentPlaying && (
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-400 to-rose-500 animate-pulse" />
      )}

      <div className="p-4 sm:p-5">
        {/* Header row: Question Number, Category, Topic, Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-md font-bold text-xs tracking-wide ${
              isCurrentPlaying 
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30' 
                : 'bg-slate-800 text-slate-300 border border-slate-700/50'
            }`}>
              Q{question.id}
            </span>
            <span className="text-[11px] font-medium text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-800">
              {question.category}
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              • {question.topic}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleBookmark(question.id)}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark for revision'}
              className={`p-1.5 rounded-lg transition-colors ${
                isBookmarked
                  ? 'text-amber-400 bg-amber-400/10'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Question Statement */}
        <div className="mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-slate-100 leading-snug">
            {question.question}
          </h3>

          {/* Formula pill if available */}
          {question.formula && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-950/40 border border-blue-800/40 rounded-lg text-xs font-mono text-cyan-300">
              <span className="text-blue-400 font-sans text-[10px] font-bold uppercase tracking-wider">Formula:</span>
              <span>{question.formula}</span>
            </div>
          )}
        </div>

        {/* Quick Multiple Choice Interactive Self-Test Option Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {question.options.map((option, idx) => {
            const isCorrect = option === question.answer;
            const isSelected = selectedQuizOption === option;

            let btnStyle = "bg-slate-800/40 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white";
            
            if (isAnswerRevealed) {
              if (isCorrect) {
                btnStyle = "bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-semibold";
              } else if (isSelected) {
                btnStyle = "bg-rose-950/40 border-rose-500/60 text-rose-300 line-through";
              } else {
                btnStyle = "bg-slate-800/20 border-slate-800/50 text-slate-500 opacity-60";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(option)}
                className={`text-left px-3 py-2 rounded-xl text-xs sm:text-sm border transition-all flex items-center justify-between ${btnStyle}`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700/60 text-[10px] flex items-center justify-center font-mono text-slate-400 flex-shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="truncate">{option}</span>
                </div>
                {isAnswerRevealed && isCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Answer Reveal Area */}
        <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAnswerRevealed(!isAnswerRevealed)}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              {isAnswerRevealed ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide Answer</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reveal Answer</span>
                </>
              )}
            </button>

            {isAnswerRevealed && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs font-bold text-emerald-400 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{question.answer}</span>
              </div>
            )}
          </div>

          {/* Action Buttons: Listen (Gemini TTS) & AI Professor Explainer (Gemini 3.8 Flash) */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            
            {/* AI Explainer */}
            <button
              onClick={() => onExplain(question)}
              title="Get deep engineering physics breakdown & memory tip"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Explainer</span>
            </button>

            {/* Play Button */}
            <button
              onClick={() => onPlay(question)}
              disabled={isLoadingAudio && isCurrentPlaying}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isCurrentPlaying
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {isLoadingAudio && isCurrentPlaying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : isCurrentPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                  <span>Listen</span>
                </>
              )}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
